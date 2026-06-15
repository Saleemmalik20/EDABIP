import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Login from "../pages/auth/Login";
import Members from "../pages/members/Members";
import Dashboard from "../pages/dashboard/Dashboard";
import EmployeeList from "../pages/employees/EmployeeList";
import EmployeeDetails from "../pages/employees/EmployeeDetails";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard - Accessible to all logged-in users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Members - Admin only */}
        <Route
          path="/members"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Members />
            </ProtectedRoute>
          }
        />

        {/* Employees - Admin only */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute requireAdmin={true}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        {/* Employee Details - Admin only */}
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requireAdmin={true}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />

        {/* Default redirect to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;