import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { register } from "../../api/authApi";
 
const Signup = () => {
  const navigate = useNavigate();
 
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("Company A");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Inside the handleSubmit function of Signup.jsx
    const response = await register({
      full_name: fullName,
      email: email,
      company: company,
      role: role,
      password: password,
    });

    console.log("Registration successful:", response);

    // Store the token AND user data
    if (response.access_token) {
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    // Redirect based on role
    if (response.user?.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
 
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
 
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
 
    setLoading(true);
 
    try {
      const response = await register({
        full_name: fullName,
        email: email,
        company: company,
        role: role,
        password: password,
      });
 
      console.log("Registration successful:", response);
      
      // Store the token
      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
      }
      
      // Redirect to members page
      navigate("/members");
    } catch (err) {
      console.error("Registration error:", err);
 
      if (err.response) {
        setError(err.response.data?.detail || "Registration failed");
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
            <UserPlus className="text-white" size={22} />
          </div>
        </div>
 
        {/* Heading */}
        <h2 className="text-xl font-bold text-center text-gray-900">Create Account</h2>
        <p className="text-center text-gray-400 text-xs mt-1 mb-5">Sign up to access EEMS</p>
 
        {error && (
          <p className="text-red-500 text-xs text-center mb-3 bg-red-50 py-2 rounded">{error}</p>
        )}
 
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-300"
              />
            </div>
          </div>
 
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
 
          {/* Company */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="Company A">Company A</option>
              <option value="Company B">Company B</option>
            </select>
          </div>
 
          {/* Account Role */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700"
            >
              <option value="user">User — Dashboard & Employees only</option>
              <option value="admin">Admin — Full system access</option>
            </select>
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
                placeholder="Create a password"
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
 
          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
 
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition mt-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
 
        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
 
export default Signup;