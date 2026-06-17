import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Removed the stray 'await login(...)' that was here outside the function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      
      console.log("Login successful:", response);
      
      // Store the token AND user data
      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Redirect based on role
      // After successful login
      if (response.user?.role === "admin") {
        navigate("/dashboard"); // Changed from /members to /dashboard
      } else {
        navigate("/dashboard");
      }
      
      // Removed the duplicate 'navigate("/members")' that was overriding the logic above

    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else {
          setError(err.response.data?.detail || "Login failed");
        }
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-blue-600 rounded-full p-2.5">
            <LogIn className="text-white" size={22} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-center text-gray-900">Welcome Back!</h2>
        <p className="text-center text-gray-400 text-xs mt-1 mb-5">Login to your account</p>

        {error && (
          <p className="text-red-500 text-xs text-center mb-3 bg-red-50 py-2 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition mt-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;