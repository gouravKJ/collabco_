import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { BACKEND_URL } from "../config";

const SOCKET_URL = BACKEND_URL;

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const JUDGE0_KEY = "0e8e0e32aemsh841cf6225b9c284p19e003jsn57caf3e4fa4f";
const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";

export default function EditorPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("// start coding here...");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [cursors, setCursors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [suggestMode, setSuggestMode] = useState(false);
  const [languageId, setLanguageId] = useState(52);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const isOwnerRef = useRef(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Please login to access the editor");
      navigate("/login");
      return;
    }

    const initializeEditor = async () => {
      try {
        // Step 1: Get current user info
        console.log("Step 1: Fetching current user info...");
        const userRes = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userRes.ok) {
          alert("Your session has expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userId");
          navigate("/login");
          return;
        }

        const userData = await userRes.json();
        console.log("User data received:", userData);
        
        // Backend returns userId, id, or _id - try all of them
        let fetchedUserId = userData.userId || userData.id || userData._id;
        let fetchedUsername = userData.username;
        
        if (!fetchedUserId) {
          alert("Could not determine user identity. Please login again.");
          localStorage.clear();
          navigate("/login");
          return;
        }
        
        // IMPORTANT: Always use the fresh userId and username from the API
        const userIdStr = String(fetchedUserId).trim();
        localStorage.setItem("userId", userIdStr);
        
        if (fetchedUsername) {
          localStorage.setItem("username", fetchedUsername);
          setCurrentUsername(fetchedUsername);
        }
        
        setCurrentUserId(userIdStr);
        console.log("Current User ID (fresh from API):", userIdStr);
        console.log("Current Username (fresh from API):", fetchedUsername);

        // Step 2: Get project info
        console.log("Step 2: Fetching project info...");
        const projectRes = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const projectData = await projectRes.json();
        console.log("Project data received:", projectData);
        
        if (!projectRes.ok) {
          if (["token not valid", "no token", "invalid token"].includes(projectData.message)) {
            alert("Your session has expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            navigate("/login");
          } else if (projectData.message === "project not found") {
            alert("Project not found. Redirecting...");
            navigate("/");
          }
          return;
        }

        // Step 3: Determine ownership
        let projectOwnerId = projectData.project?.owner || projectData.project?.ownerId || projectData.owner;
        
        // Handle if owner is an object with _id
        if (typeof projectOwnerId === 'object' && projectOwnerId !== null) {
          projectOwnerId = projectOwnerId._id || projectOwnerId.id;
        }

        console.log("Project Owner ID:", projectOwnerId);
        console.log("Current User ID:", currentUserId);

        // Convert both to strings and compare
        const ownerIdStr = String(projectOwnerId).trim();
        const userIdFromApi = String(fetchedUserId).trim();
        const ownerStatus = ownerIdStr === userIdFromApi;

        console.log("Ownership comparison:", {
          projectOwner: ownerIdStr,
          currentUser: userIdFromApi,
          isOwner: ownerStatus,
          areEqual: ownerIdStr === userIdFromApi
        });

        // Set debug info for display
        setDebugInfo({
          projectOwner: ownerIdStr,
          currentUser: userIdFromApi,
          isOwner: ownerStatus
        });

        // Set ownership in both state and ref to prevent changes
        setIsOwner(ownerStatus);
        isOwnerRef.current = ownerStatus;
        
        console.log("✅ Ownership locked:", ownerStatus ? "OWNER" : "COLLABORATOR");

        // Load the saved code from the database
        if (projectData.project && projectData.project.code) {
          console.log("Loading saved code from database");
          setCode(projectData.project.code);
        }

        setLoading(false);

        // Step 4: Initialize socket connection
        console.log("Step 3: Initializing socket connection...");
        const socket = io(SOCKET_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        const username = fetchedUsername || localStorage.getItem("username") || "Guest";
        socket.on("connect", () => {
          console.log("Socket connected");
          socket.emit("joinproject", { projectId, username });
        });

        socket.on("receivecode", ({ code: incomingCode }) => {
          console.log("Received code update via socket");
          
          if (editorRef.current) {
            const model = editorRef.current.getModel();
            const currentCode = model.getValue();
            
            // Only update if the code is actually different
            if (currentCode !== incomingCode) {
              // Save cursor position and selection
              const position = editorRef.current.getPosition();
              const selection = editorRef.current.getSelection();
              
              // Update the code
              model.setValue(incomingCode);
              
              // Restore cursor position and selection
              if (position) {
                editorRef.current.setPosition(position);
              }
              if (selection) {
                editorRef.current.setSelection(selection);
              }
            }
          }
          setCode(incomingCode);
        });

        socket.on("receivemessage", ({ username: from, message, time }) => {
          setMessages((msgs) => [...msgs, { from, message, time }]);
        });

        socket.on("receivecursor", ({ username: from, position }) => {
          setCursors((prev) => ({ ...prev, [from]: { username: from, position } }));
        });

        socket.on("receivesuggestion", ({ username: from, suggestion, time }) => {
          setSuggestions((s) => [...s, { from, suggestion, time }]);
        });

        console.log("Initialization complete!");

      } catch (err) {
        console.error("Error initializing editor:", err);
        alert("Failed to load editor. Please try again.");
        navigate("/");
      }
    };

    initializeEditor();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receivemessage");
        socketRef.current.off("receivecode");
        socketRef.current.off("receivecursor");
        socketRef.current.off("receivesuggestion");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [projectId, navigate, token]);

  // Monitor ownership changes and prevent unauthorized changes
  useEffect(() => {
    if (!loading && isOwnerRef.current !== isOwner) {
      console.warn("⚠️ Ownership state mismatch detected!");
      console.warn("Ref value:", isOwnerRef.current);
      console.warn("State value:", isOwner);
      console.warn("Restoring from ref...");
      
      // Restore from ref if there's a mismatch
      setIsOwner(isOwnerRef.current);
    }
  }, [isOwner, loading]);

  const debounce = (func, delay) => {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, arguments), delay);
    };
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    // Debounce code change emissions to reduce socket traffic
    const debouncedCodeChange = debounce((code) => {
      if (suggestMode && !isOwner) return;
      const username = localStorage.getItem("username") || "Guest";
      socketRef.current?.emit("codechange", { projectId, code, username });
    }, 300); // Wait 300ms after user stops typing

    editor.onDidChangeModelContent(() => {
      const current = editor.getValue();
      setCode(current);
      debouncedCodeChange(current);
    });

    const debouncedCursorUpdate = debounce((sel) => {
      const position = { startLineNumber: sel.startLineNumber, startColumn: sel.startColumn };
      const username = localStorage.getItem("username") || "Guest";
      socketRef.current?.emit("cursorchange", { projectId, username, position });
    }, 100);

    editor.onDidChangeCursorSelection(() => {
      const sel = editor.getSelection();
      debouncedCursorUpdate(sel);
    });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const username = localStorage.getItem("username") || "Guest";
    socketRef.current?.emit("chatmessage", { projectId, username, message: chatInput });
    setChatInput("");
  };

  const handleSuggest = () => {
    if (!editorRef.current) return;
    const selection = editorRef.current.getSelection();
    const text = editorRef.current.getModel().getValueInRange(selection);
    if (!text.trim()) return alert("Select some code to suggest");

    const username = localStorage.getItem("username") || "Guest";
    socketRef.current?.emit("suggestion", { projectId, username, suggestion: { selection, text } });
    alert("Suggestion sent!");
  };

  const acceptSuggestion = (i) => {
    const s = suggestions[i];
    if (!s || !editorRef.current) return;
    const { selection, text } = s.suggestion;
    editorRef.current.executeEdits("suggest", [{ range: selection, text }]);
    setSuggestions((arr) => arr.filter((_, idx) => idx !== i));
  };

  const rejectSuggestion = (i) => {
    setSuggestions((arr) => arr.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    console.log("Save button clicked. isOwner:", isOwner, "isOwnerRef:", isOwnerRef.current);
    
    // Use ref value as source of truth
    if (!isOwnerRef.current && !isOwner) {
      alert("Only owner can save");
      return;
    }
    
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      
      if (res.ok) {
        const username = localStorage.getItem("username") || "Guest";
        socketRef.current?.emit("codechange", { projectId, code, username });
        alert("✅ Project saved successfully");
      } else {
        const errorData = await res.json();
        alert("Failed to save: " + (errorData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save project");
    }
  };

  const handleRun = async () => {
    setOutput("⏳ Running...");
    try {
      const res = await fetch(JUDGE0_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_KEY,
          "X-RapidAPI-Host": JUDGE0_HOST,
        },
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      });
      const data = await res.json();
      if (data.stdout) setOutput(data.stdout);
      else if (data.stderr) setOutput("❌ Error:\n" + data.stderr);
      else if (data.compile_output) setOutput("⚠️ Compilation Error:\n" + data.compile_output);
      else setOutput("Unknown response");
    } catch (err) {
      setOutput("Server error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000] text-[#e6e6e9]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="text-xl">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#e6e6e9]">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between bg-[#0b0b0c] text-[#e6e6e9] p-3 sm:p-2 border-b border-[#66666e]/30 gap-2">
        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm">
          <span className="truncate max-w-[150px] sm:max-w-none">Project: {projectId}</span>
          <span>User: <b>{currentUsername || localStorage.getItem("username") || "Guest"}</b></span>
          <span className={`font-bold ${isOwner ? 'text-green-400' : 'text-yellow-400'}`}>
            {isOwner ? "🔑 Owner" : "👥 Collaborator"}
          </span>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm">Suggest Mode</label>
          <input type="checkbox" checked={suggestMode} onChange={() => setSuggestMode(!suggestMode)} className="w-4 h-4" />
          {(isOwner || isOwnerRef.current) && (
            <button 
              onClick={handleSave} 
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold text-sm"
            >
              💾 Save
            </button>
          )}
          <button 
            onClick={() => navigate("/")} 
            className="bg-[#66666e] hover:bg-[#9999a1] text-[#0b0b0c] px-3 py-2 rounded text-sm"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Editor + Sidebar */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-2 p-2 bg-[#141416] text-[#e6e6e9] border-b border-[#66666e]/30 flex-wrap">
            <select 
              value={languageId} 
              onChange={(e) => setLanguageId(Number(e.target.value))} 
              className="bg-[#0b0b0c] text-[#f4f4f6] border border-[#66666e]/30 rounded px-3 py-2 text-sm"
            >
              <option value={52}>JavaScript (Node.js)</option>
              <option value={71}>Python 3</option>
              <option value={62}>Java</option>
              <option value={50}>C</option>
              <option value={54}>C++</option>
            </select>
            <button 
              onClick={handleRun} 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm"
            >
              ▶ Run
            </button>
          </div>
          <div className="flex-1 min-h-[300px] lg:min-h-0">
            <Editor 
              height="100%" 
              defaultLanguage="javascript" 
              value={code} 
              theme="vs-dark" 
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                minimap: { enabled: window.innerWidth > 768 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: window.innerWidth > 768,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3
              }}
            />
          </div>
          <div className="bg-black text-green-400 p-3 h-32 sm:h-40 overflow-y-auto border-t border-[#66666e]/30">
            <pre className="text-xs sm:text-sm">{output}</pre>
          </div>
        </div>

        {/* Sidebar - Collapsible on mobile */}
        <div className="w-full lg:w-80 bg-[#0b0b0c] text-[#e6e6e9] flex flex-col border-t lg:border-t-0 lg:border-l border-[#66666e]/30 max-h-[50vh] lg:max-h-none overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Chat */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2">💬 Chat</h3>
              <div className="h-32 sm:h-40 overflow-y-auto bg-[#141416] p-2 mb-2 rounded border border-[#66666e]/30">
                {messages.length === 0 ? (
                  <p className="text-[#9999a1] text-xs sm:text-sm">No messages yet</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className="text-xs sm:text-sm mb-1">
                      <b className="text-blue-400">{m.from}</b>: {m.message}
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Type a message..." 
                  className="flex-1 bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 p-2 rounded text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Send</button>
              </form>
            </div>

            {/* Cursors */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2">🖱️ Active Cursors</h3>
              <div className="bg-[#141416] p-2 rounded border border-[#66666e]/30 min-h-[60px]">
                {Object.values(cursors).length === 0 ? (
                  <p className="text-[#9999a1] text-xs sm:text-sm">No active cursors</p>
                ) : (
                  Object.values(cursors).map((c, i) => (
                    <div key={i} className="text-xs sm:text-sm text-purple-400">
                      {c.username} @ Line {c.position?.startLineNumber}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2">💡 Suggestions</h3>
              <div className="space-y-2">
                {suggestions.length === 0 ? (
                  <p className="text-[#9999a1] text-xs sm:text-sm">No pending suggestions</p>
                ) : (
                  suggestions.map((s, i) => (
                    <div key={i} className="bg-[#141416] p-3 border border-[#66666e]/30 rounded">
                      <p className="text-xs sm:text-sm mb-2">
                        <b className="text-yellow-400">{s.from}</b>: <code className="text-green-400">{s.suggestion.text}</code>
                      </p>
                      {(isOwner || isOwnerRef.current) && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => acceptSuggestion(i)} 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs sm:text-sm"
                          >
                            ✓ Accept
                          </button>
                          <button 
                            onClick={() => rejectSuggestion(i)} 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs sm:text-sm"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {(!isOwner && !isOwnerRef.current) && (
                <button 
                  onClick={handleSuggest} 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 mt-2 rounded font-semibold text-sm"
                >
                  📝 Send Suggestion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}