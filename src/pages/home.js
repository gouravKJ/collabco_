import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [joinId, setJoinId] = useState("");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          if (Array.isArray(data)) {
            setProjects(data);
          } else if (data.projects && Array.isArray(data.projects)) {
            setProjects(data.projects);
          } else {
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]);
      }
    };
    fetchProjects();
  }, [token]);

  const handleCreate = async () => {
    if (!token) {
      alert("Please login first");
      return;
    }
    if (!name.trim()) {
      alert("Please enter a project name");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code: "" }),
      });
      const data = await res.json();
      
      if (res.ok && (data.project?._id || data._id)) {
        const projectId = data.project?._id || data._id;
        navigate(`/editor/${projectId}`);
      } else {
        alert(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleJoin = () => {
    if (!joinId.trim()) {
      alert("Please enter a project ID");
      return;
    }
    if (!token) {
      alert("Please login first to join a project");
      navigate("/login");
      return;
    }
    navigate(`/editor/${joinId}`);
  };

   const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== projectId));
        alert("Project deleted successfully");
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#000000] via-[#0a0a0f] to-[#000000] text-[#e6e6e9]">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-[#0b0b0c]/80 backdrop-blur-md border-b border-[#66666e]/20 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"></div>
              <span  className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">CollabCo</span>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="px-4 py-2 text-[#e6e6e9] hover:text-white transition">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8 inline-block">
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
                ✨ Real-time Collaboration
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Code Together,
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Build Better
              </span>
            </h1>
            
            <p className="text-xl text-[#9999a1] mb-12 max-w-2xl mx-auto">
              A powerful real-time collaborative code editor with live chat, smart suggestions, 
              and instant code execution. Work together seamlessly, from anywhere.
            </p>

            {/* Join Project Card */}
            <div className="max-w-md mx-auto mb-16">
              <div className="bg-[#141416]/50 backdrop-blur-sm p-8 rounded-2xl border border-[#66666e]/30 shadow-2xl">
                <h3 className="text-xl font-semibold mb-4">Join a Project</h3>
                <input
                  type="text"
                  placeholder="Enter Project ID"
                  className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 transition"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                />
                <button
                  onClick={handleJoin}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl px-6 py-3 transition transform hover:scale-105"
                >
                  Join as Guest →
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              <div className="bg-[#141416]/30 backdrop-blur-sm p-6 rounded-xl border border-[#66666e]/20 hover:border-purple-500/50 transition">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
                <p className="text-sm text-[#9999a1]">See changes instantly as your team codes together in perfect harmony</p>
              </div>
              
              <div className="bg-[#141416]/30 backdrop-blur-sm p-6 rounded-xl border border-[#66666e]/20 hover:border-blue-500/50 transition">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-[#9999a1]">Communicate seamlessly without leaving your coding environment</p>
              </div>
              
              <div className="bg-[#141416]/30 backdrop-blur-sm p-6 rounded-xl border border-[#66666e]/20 hover:border-cyan-500/50 transition">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">▶️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Code Execution</h3>
                <p className="text-sm text-[#9999a1]">Run code instantly in multiple languages with real-time output</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12 mb-16 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-400">5+</div>
                <div className="text-sm text-[#9999a1]">Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">∞</div>
                <div className="text-sm text-[#9999a1]">Collaborators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">100%</div>
                <div className="text-sm text-[#9999a1]">Free</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0b0b0c]/50 backdrop-blur-sm border-t border-[#66666e]/20 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded"></div>
                <span className="font-semibold">CollabCo</span>
              </div>
              <div className="text-sm text-[#9999a1]">
                Built with ❤️ by <span className="text-purple-400 font-semibold">gouravKJ</span>
              </div>
              <div className="flex gap-6 text-sm text-[#9999a1]">
                <a href="#" className="hover:text-purple-400 transition">About</a>
                <a href="#" className="hover:text-purple-400 transition">Docs</a>
                <a href="https://github.com/gouravKJ" className="hover:text-purple-400 transition">GitHub</a>
              </div>
            </div>
            <div className="text-center text-xs text-[#66666e] mt-4">
              © {new Date().getFullYear()} CollabCo. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Logged-in Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0f] to-[#000000] text-[#e6e6e9]">
     

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{username}</span>
          </h1>
          <p className="text-[#9999a1]">Manage your projects and start collaborating</p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create Project Card */}
          <div className="bg-[#141416]/50 backdrop-blur-sm p-8 rounded-2xl border border-[#66666e]/30 shadow-xl hover:border-purple-500/50 transition">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-2xl font-semibold">Create Project</h2>
            </div>
            <p className="text-[#9999a1] mb-6">Start a new collaborative coding project</p>
            <input
              type="text"
              placeholder="Enter project name..."
              className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl px-6 py-3 transition transform hover:scale-105"
            >
              Create New Project
            </button>
          </div>

          {/* Join Project Card */}
          <div className="bg-[#141416]/50 backdrop-blur-sm p-8 rounded-2xl border border-[#66666e]/30 shadow-xl hover:border-blue-500/50 transition">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-2xl font-semibold">Join Project</h2>
            </div>
            <p className="text-[#9999a1] mb-6">Collaborate on an existing project</p>
            <input
              type="text"
              placeholder="Enter project ID..."
              className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl px-6 py-3 transition transform hover:scale-105"
            >
              Join Existing Project
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-[#141416]/50 backdrop-blur-sm p-8 rounded-2xl border border-[#66666e]/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
              <h2 className="text-2xl font-semibold">Your Projects</h2>
            </div>
            <span className="text-sm text-[#9999a1] bg-[#0b0b0c] px-3 py-1 rounded-full">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {Array.isArray(projects) && projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((p) => (
                <div key={p._id} className="bg-[#0b0b0c]/50 p-5 rounded-xl border border-[#66666e]/30 hover:border-[#66666e]/50 transition group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#e6e6e9] group-hover:text-purple-400 transition">{p.name}</h3>
                      <p className="text-xs text-[#9999a1] mt-1 font-mono">ID: {p._id}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p._id);
                          alert("Project ID copied!");
                        }}
                        className="px-3 py-2 bg-[#1a1a1f] hover:bg-[#66666e]/30 text-[#e6e6e9] rounded-lg text-sm transition"
                        title="Copy Project ID"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => navigate(`/editor/${p._id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition transform hover:scale-105"
                      >
                        Open →
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition"
                        title="Delete Project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-[#9999a1]">
                    <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#66666e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-[#9999a1] mb-4">No projects yet</p>
              <p className="text-sm text-[#66666e]">Create your first project to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b0b0c]/50 backdrop-blur-sm border-t border-[#66666e]/20 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded"></div>
              <span className="font-semibold">CollabCo</span>
            </div>
            <div className="text-sm text-[#9999a1]">
              Built with ❤️ by <span className="text-purple-400 font-semibold">gouravKJ</span>
            </div>
            <div className="flex gap-6 text-sm text-[#9999a1]">
              <a href="#" className="hover:text-purple-400 transition">About</a>
              <a href="#" className="hover:text-purple-400 transition">Docs</a>
              <a href="https://github.com/gouravKJ" className="hover:text-purple-400 transition">GitHub</a>
            </div>
          </div>
          <div className="text-center text-xs text-[#66666e] mt-4">
            © {new Date().getFullYear()} CollabCo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}