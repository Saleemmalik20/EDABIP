import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { getEmployeeById } from "../../api/employeeApi";
import { Loader } from "../../components/common/Loader";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const data = await getEmployeeById(id);
      setEmployee(data);
    } catch (err) {
      console.error("Failed to load employee:", err);
      setError("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    };
    const labels = {
      active: "Active",
      inactive: "Inactive",
      on_leave: "On Leave",
    };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
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

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "E";
  };

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">EEMS</h1>
                <p className="text-xs text-gray-500">Enterprise Employee Management</p>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
                Overview
              </button>
              <span className="text-sm text-gray-600">Company A</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/employees")}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employees</span>
          </button>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-600 mt-1">View employee details, attendance, and leave summary.</p>
          </div>

          {/* Employee Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {getInitial(employee.full_name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employee.full_name}</h2>
                <p className="text-gray-600 mt-1">{employee.role}</p>
                <div className="mt-2">
                  {getStatusBadge(employee.status)}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Email</span>
                </div>
                <p className="text-gray-900 font-medium">{employee.email}</p>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Phone Number</span>
                </div>
                <p className="text-gray-900 font-medium">{employee.phone || "N/A"}</p>
              </div>

              {/* Department */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Department</span>
                </div>
                <p className="text-gray-900 font-medium">{employee.department}</p>
              </div>

              {/* Reporting Manager */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Reporting Manager</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {employee.reporting_manager_name || "None"}
                </p>
              </div>

              {/* Joined Date */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Joined</span>
                </div>
                <p className="text-gray-900 font-medium">{formatDate(employee.joined_date)}</p>
              </div>
            </div>
          </div>

          {/* Attendance & Leave Summary */}
          <div className="grid grid-cols-3 gap-6">
            {/* Attendance Summary */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Attendance Summary ({new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, "0")})
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Present</p>
                  <p className="text-2xl font-bold text-green-600">{employee.attendance?.present || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{employee.attendance?.absent || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{employee.attendance?.late || 0}</p>
                </div>
              </div>
            </div>

            {/* Leave Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Leave Summary ({new Date().getFullYear()})
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Total Leave</p>
                  <p className="text-2xl font-bold text-gray-900">{employee.total_leave}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Used Leave</p>
                  <p className="text-2xl font-bold text-gray-900">{employee.used_leave}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Remaining Leave</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {employee.total_leave - employee.used_leave}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDetails;