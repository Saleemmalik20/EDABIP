import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  Building2,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getEmployees } from "../../api/employeeApi";
import { getCurrentUser } from "../../api/authApi";
import { Loader } from "../../components/common/Loader";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [user, empList] = await Promise.all([
        getCurrentUser(),
        getEmployees(),
      ]);
      setCurrentUser(user);
      setEmployees(empList);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Stats calculations (for regular users)
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length;
  const onLeaveEmployees = employees.filter((e) => e.status === "on_leave").length;
  const departments = [...new Set(employees.map((e) => e.department))];
  const totalDepartments = departments.length;

  // Department distribution data
  const departmentData = useMemo(() => {
    const deptMap = {};
    employees.forEach((e) => {
      if (e.department) {
        deptMap[e.department] = (deptMap[e.department] || 0) + 1;
      }
    });
    return Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  // Role distribution data
  const roleData = useMemo(() => {
    const roles = [...new Set(employees.map((e) => e.role))];
    return roles.map((role) => ({
      name: role,
      count: employees.filter((e) => e.role === role).length,
    }));
  }, [employees]);

  // Status pie chart data
  const statusData = [
    { name: "Active", value: activeEmployees, color: "#10b981" },
    { name: "Inactive", value: inactiveEmployees, color: "#ef4444" },
    { name: "On Leave", value: onLeaveEmployees, color: "#f59e0b" },
  ];

  // Mock attendance data
  const attendanceData = [
    { date: "06-10", present: 16, absent: 3, onLeave: 4 },
    { date: "06-11", present: 13, absent: 4, onLeave: 6 },
    { date: "06-12", present: 15, absent: 4, onLeave: 4 },
    { date: "06-13", present: 17, absent: 2, onLeave: 4 },
    { date: "06-14", present: 14, absent: 4, onLeave: 5 },
    { date: "06-15", present: 13, absent: 4, onLeave: 6 },
    { date: "06-16", present: 17, absent: 2, onLeave: 4 },
  ];

  // Recent employees
  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => new Date(b.joined_date) - new Date(a.joined_date))
      .slice(0, 4);
  }, [employees]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loader fullScreen />;

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // ============================================
  // ADMIN VIEW - Show "Analytics not available"
  // ============================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {currentUser?.full_name?.split(" ")[0] || "User"}! Viewing analytics for Company A.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Analytics Not Available Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analytics not available on your plan
                  </h3>
                  <p className="text-gray-600">
                    Upgrade to Professional or Enterprise in{" "}
                    <button
                      onClick={() => navigate("/settings")}
                      className="text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      Settings
                    </button>{" "}
                    to unlock dashboard analytics, charts, and KPIs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // REGULAR USER VIEW - Full dashboard with charts
  // ============================================
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {currentUser?.full_name?.split(" ")[0] || "User"}! Viewing analytics for Company A.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Employees */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-2">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-xs text-green-600 mt-2">Company workforce</p>
            </div>

            {/* Active Employees */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-2">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
              <p className="text-xs text-green-600 mt-2">Currently active</p>
            </div>

            {/* Total Departments */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-2">Total Departments</p>
              <p className="text-3xl font-bold text-gray-900">{totalDepartments}</p>
              <p className="text-xs text-gray-500 mt-2">Organization units</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-2">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
              <p className="text-xs text-gray-500 mt-2">Role change approvals</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Employee Distribution by Department */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Employee Distribution by Department
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Hover a bar to view department details
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart 
                  data={departmentData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 12 }}
                    interval={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value} employees`, "Count"]}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Employee Count by Role */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Employee Count by Role
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart 
                  data={roleData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    interval={2}
                    angle={-15}
                    textAnchor="end"
                    height={30}
                  />
                  <YAxis 
                    allowDecimals={false}
                    domain={[0, Math.max(...roleData.map(r => r.count), 4)]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name, props) => [
                      `count : ${value}`,
                      props.payload.name,
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#3b82f6",
                            "#8b5cf6",
                            "#06b6d4",
                            "#ec4899",
                            "#f97316",
                            "#10b981",
                            "#6366f1",
                            "#14b8a6",
                            "#f43f5e",
                            "#eab308",
                          ][index % 10]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Employee Status Overview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Employee Status Overview
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Analytics */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Attendance Analytics
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="stepAfter"
                    dataKey="absent"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", stroke: "#ef4444", strokeWidth: 2 }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="onLeave"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", stroke: "#f59e0b", strokeWidth: 2 }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="present"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "white", stroke: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Employees */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Employees</h3>
                <button
                  onClick={() => navigate("/employees")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentEmployees.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No employees yet</p>
                ) : (
                  recentEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(emp.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {emp.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{emp.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{emp.department}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(emp.joined_date)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;