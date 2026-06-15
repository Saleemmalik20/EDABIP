import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const AddEmployee = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    reporting_manager_id: null,
    status: "active",
    joined_date: new Date().toISOString().split("T")[0],
    total_leave: 20,
    used_leave: 0,
  });

  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      if (initialData) {
        setFormData({
          full_name: initialData.full_name || "",
          email: initialData.email || "",
          role: initialData.role || "",
          department: initialData.department || "",
          phone: initialData.phone || "",
          reporting_manager_id: initialData.reporting_manager?.id || null,
          status: initialData.status || "active",
          joined_date: initialData.joined_date || new Date().toISOString().split("T")[0],
          total_leave: initialData.total_leave || 20,
          used_leave: initialData.used_leave || 0,
        });
      } else {
        setFormData({
          full_name: "",
          email: "",
          role: "",
          department: "",
          phone: "",
          reporting_manager_id: null,
          status: "active",
          joined_date: new Date().toISOString().split("T")[0],
          total_leave: 20,
          used_leave: 0,
        });
      }
      setError("");
    }
  }, [isOpen, initialData]);

  // Fetch managers from JSONPlaceholder API
  const fetchManagers = async () => {
    setLoadingManagers(true);
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      const users = response.data;

      // Transform API data to manager format
      const managerList = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company.name,
        label: `${user.name} (${user.company.name})`,
      }));

      setManagers(managerList);
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError("Failed to load managers. Please try again.");
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "reporting_manager_id" ? (value ? parseInt(value) : null) : value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  setError("");

  if (!formData.full_name || !formData.email || !formData.role || !formData.department) {
    setError("Please fill in all required fields");
    return;
  }

  // Find the selected manager's name
  const selectedManager = managers.find(m => m.id === formData.reporting_manager_id);
  
  const submitData = {
    ...formData,
    reporting_manager_id: selectedManager ? selectedManager.id : null,
    reporting_manager_name: selectedManager ? selectedManager.name : null, // Store name
  };

  onSubmit(submitData);
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? "Edit Employee" : "Add Employee"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Employee name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="IT Department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="123-456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Reporting Manager - FROM API */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Manager
                </label>
                {loadingManagers ? (
                  <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                    Loading managers...
                  </div>
                ) : (
                  <select
                    name="reporting_manager_id"
                    value={formData.reporting_manager_id || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">None</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="on_leave">on_leave</option>
                </select>
              </div>

              {/* Joined Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Date
                </label>
                <input
                  type="date"
                  name="joined_date"
                  value={formData.joined_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : initialData ? "Update Employee" : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;