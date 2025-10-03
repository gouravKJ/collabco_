import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Guest";

 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b0b0c]/80 backdrop-blur-md border-b border-[#66666e]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg group-hover:scale-110 transition-transform">
            <span className="text-white font-mono flex items-center justify-center w-full h-full">&lt;/&gt;</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-200">
            CollabCo
          </span>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#e6e6e9] hover:text-purple-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

      
        <div className="hidden md:flex gap-4 items-center">
          {!token ? (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 transition ${
                  location.pathname === "/login"
                    ? "text-purple-400 font-semibold"
                    : "text-[#e6e6e9] hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
                  location.pathname === "/register"
                    ? "bg-gradient-to-r from-purple-700 to-blue-700"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                }`}
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#9999a1]">
                Welcome,&nbsp;
                <span className="text-purple-400 font-semibold">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#66666e]/50 hover:bg-[#66666e] rounded-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 right-0 w-full bg-[#0b0b0c] border-t border-[#66666e]/20 py-2 px-6 shadow-lg">
            {!token ? (
              <div className="flex flex-col space-y-4 py-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[#e6e6e9] hover:text-purple-400 transition text-right"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium text-center transition transform hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 py-4">
                <span className="text-sm text-[#9999a1]">
                  Welcome,&nbsp;
                  <span className="text-purple-400 font-semibold">{username}</span>
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition w-full"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
