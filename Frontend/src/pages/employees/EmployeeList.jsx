import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  Download,
} from "lucide-react";
import axios from "axios";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
} from "../../api/employeeApi";
import AddEmployee from "./AddEmployee";
import { Loader } from "../../components/common/Loader";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [populating, setPopulating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersList, depts] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);
      setEmployees(usersList);
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      const params = {};
      if (term) params.search = term;
      if (selectedDepartment && selectedDepartment !== "All") {
        params.department = selectedDepartment;
      }
      const data = await getEmployees(params);
      setEmployees(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleDepartmentFilter = async (dept) => {
    setSelectedDepartment(dept);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (dept && dept !== "All") params.department = dept;
      const data = await getEmployees(params);
      setEmployees(data);
    } catch (err) {
      console.error("Filter failed:", err);
    }
  };

  const handleAddEmployee = async (formData) => {
    setSubmitting(true);
    try {
      await createEmployee(formData);
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create employee:", err);
      alert(err.response?.data?.detail || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEmployee = async (formData) => {
    setSubmitting(true);
    try {
      await updateEmployee(editingEmployee.id, formData);
      setShowAddModal(false);
      setEditingEmployee(null);
      await loadData();
    } catch (err) {
      console.error("Failed to update employee:", err);
      alert(err.response?.data?.detail || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(employeeId);
        await loadData();
      } catch (err) {
        console.error("Failed to delete employee:", err);
        alert("Failed to delete employee");
      }
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await updateEmployee(employeeId, { status: newStatus });
      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handlePopulateSampleData = async () => {
    if (!window.confirm("This will add 10 sample employees from the API. Continue?")) {
      return;
    }

    setPopulating(true);

    const roles = [
      "Software Engineer", "Senior Developer", "Product Manager",
      "UI/UX Designer", "Data Analyst", "DevOps Engineer",
      "QA Engineer", "HR Manager", "Marketing Lead", "Team Lead",
    ];

    const statuses = ["active", "active", "active", "inactive", "on_leave"];

    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      const users = response.data;

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const randomDate = generateRandomDate();

        try {
          await createEmployee({
            full_name: user.name,
            email: user.email,
            role: roles[i % roles.length],
            department: user.company.name,
            phone: user.phone,
            reporting_manager_id: null,
            reporting_manager_name: null,
            status: statuses[i % statuses.length],
            joined_date: randomDate,
            total_leave: 20,
            used_leave: Math.floor(Math.random() * 10),
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to add ${user.name}:`, err);
          errorCount++;
        }
      }

      alert(`✅ Success: ${successCount}\n Failed: ${errorCount}`);
      await loadData();
    } catch (err) {
      console.error("Failed to populate data:", err);
      alert("Failed to load sample data. Please try again.");
    } finally {
      setPopulating(false);
    }
  };

  const generateRandomDate = () => {
    const start = new Date(2018, 0, 1);
    const end = new Date(2024, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split("T")[0];
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 hover:bg-green-200";
      case "inactive": return "bg-red-100 text-red-700 hover:bg-red-200";
      case "on_leave": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      default: return "bg-gray-100 text-gray-700";
    }
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

  const getInitials = (name) => {
    if (!name) return "E";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // ✅ SORTING LOGIC: Sort employees alphabetically by full_name
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [employees]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 mt-1">Manage your team members, search, and filter by department.</p>
          </div>

          {/* Controls Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Department Filter */}
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700 min-w-[180px]"
                >
                  <option value="All">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons Container */}
              <div className="flex items-center gap-3">
                {employees.length === 0 && (
                  <button
                    onClick={handlePopulateSampleData}
                    disabled={populating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                  >
                    {populating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Load Sample Data</span>
                      </>
                    )}
                  </button>
                )}

                {/* Add Employee Button */}
                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Employee
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Role
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Department
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Joined
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                      <div className="flex items-center gap-1">
                        Actions
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium mb-2">No employees found</p>
                          <p className="text-sm">Click "Load Sample Data" to add employees from the API</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // ✅ Use sortedEmployees instead of employees here
                    sortedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        {/* Employee Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 shrink-0">
                              {getInitials(employee.full_name)}
                            </div>
                            <div>
                              <button
                                onClick={() => navigate(`/employees/${employee.id}`)}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {employee.full_name}
                              </button>
                              <p className="text-xs text-gray-500 mt-0.5">{employee.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.role}
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={employee.status}
                            onChange={(e) => handleStatusChange(employee.id, e.target.value)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-6 bg-no-repeat bg-[right_0.5rem_center] ${getStatusStyle(employee.status)}`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundSize: "1.25em",
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                          </select>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(employee.joined_date)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEmployee(employee);
                                setShowAddModal(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AddEmployee
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEmployee(null);
        }}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        initialData={editingEmployee}
        loading={submitting}
      />
    </div>
  );
};

export default EmployeeList;