import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                localStorage.setItem("userId", data.userId);
                navigate("/");
            } else {
                setMessage(data.message || "Registration failed");
            }
        } catch (err) {
            setMessage("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#0a0a0f] to-[#000000] text-[#e6e6e9] px-6 py-12">
           
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
               
                <div className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-mono">&lt;/&gt;</span>
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        CollabCo
                    </span>
                </div>

                
                <div className="bg-[#141416]/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-[#66666e]/30">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                        <p className="text-[#9999a1]">Join the collaborative coding platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[#e6e6e9]">Username</label>
                            <input 
                                className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" 
                                type='text' 
                                placeholder='Choose a username' 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required
                                disabled={isLoading}
                                minLength={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-[#e6e6e9]">Email Address</label>
                            <input 
                                className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" 
                                type='email' 
                                placeholder='you@example.com' 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-[#e6e6e9]">Password</label>
                            <input 
                                className="w-full bg-[#0b0b0c] text-[#f4f4f6] placeholder-[#9999a1] border border-[#66666e]/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" 
                                type='password' 
                                placeholder='Create a strong password' 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                            <p className="text-xs text-[#66666e] mt-2">Must be at least 6 characters</p>
                        </div>

                        {message && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                                {message}
                            </div>
                        )}

                        <button 
                            type='submit' 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl px-6 py-3 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account →'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#9999a1]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#66666e]/30 text-center">
                        <Link to="/" className="text-sm text-[#9999a1] hover:text-[#e6e6e9] transition">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-[#66666e]">
                    <p>By creating an account, you agree to our Terms of Service</p>
                </div>
            </div>
        </div>
    );
}