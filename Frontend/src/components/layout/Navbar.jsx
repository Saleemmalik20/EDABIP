import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  Calendar,
  Building2,
  FileText,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  LayoutGrid,
  UserCog,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.full_name || user.email || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user.role || "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation items for sidebar
  const sidebarNavItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Members", icon: UserCog, path: "/members", adminOnly: true }, // Added for Admin
    { name: "Employees", icon: Users, path: "/employees", adminOnly: true },
    { name: "Attendance", icon: Calendar, path: "/attendance" },
    { name: "Departments", icon: Building2, path: "/departments" },
    { name: "Audit Logs", icon: FileText, path: "/audit" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <>
      {/* Header Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between">
          {/* Left Section: Hamburger Menu + Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu - Visible for ALL users */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">EEMS</h1>
                <p className="text-xs text-gray-500">Enterprise Employee Management</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1 ml-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
              >
                Overview
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                Company A
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {/* Top Nav Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1">
              <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>Attendance</span>
              </button>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                <Building2 className="w-4 h-4" />
                <span>Departments</span>
              </button>
              <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>

              {/* Separator */}
              <div className="h-5 w-px bg-gray-300 mx-2"></div>
            </div>

            {/* Icons */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Moon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {userInitial}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {userName.split(" ")[0].toLowerCase()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">EEMS</h2>
                <p className="text-xs text-gray-500">
                  {userRole === "admin" ? "Admin Panel" : "User Panel"}
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            // Hide admin-only items if user is not admin
            if (item.adminOnly && userRole !== "admin") return null;

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Spacer */}
      <div className="pt-16"></div>
    </>
  );
};

export default Navbar;