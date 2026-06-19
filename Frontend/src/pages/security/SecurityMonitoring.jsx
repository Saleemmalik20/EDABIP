import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  User,
  Building2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { Loader } from "../../components/common/Loader";
import axios from "axios";

const SecurityMonitoring = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    alerts_today: 0,
    open_alerts: 0,
    resolved_alerts: 0,
    critical_alerts: 0,
  });
  const [topRiskUsers, setTopRiskUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSecurityData(false); // Don't show loading spinner on auto-refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      };

      // Load all data in parallel
      const [summaryRes, usersRes, eventsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/v1/security/summary", config),           // Added /v1/
        axios.get("http://localhost:8000/api/v1/security/top-risk-users?limit=10", config),  // Added /v1/
        axios.get("http://localhost:8000/api/v1/security/events?limit=20&is_resolved=false", config),  // Added /v1/
      ]);

      setSummary(summaryRes.data);
      setTopRiskUsers(usersRes.data);
      setRecentEvents(eventsRes.data);
    } catch (err) {
      console.error("Failed to load security data:", err);
      setError(err.response?.data?.detail || "Failed to load security data");
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSecurityData(true);
  };

  const getRiskLevelColor = (score) => {
    if (score <= 29) return "text-green-600 bg-green-50 border border-green-200";
    if (score <= 59) return "text-yellow-600 bg-yellow-50 border border-yellow-200";
    if (score <= 99) return "text-red-600 bg-red-50 border border-red-200";
    return "text-purple-600 bg-purple-50 border border-purple-200";
  };

  const getRiskLevelText = (score) => {
    if (score <= 29) return "LOW RISK";
    if (score <= 59) return "MEDIUM RISK";
    if (score <= 99) return "HIGH RISK";
    return "CRITICAL";
  };

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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case "failed_login":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "unauthorized_access":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "data_export":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Security Monitoring
              </h1>
              <p className="text-gray-600 mt-1">
                Track alerts, risk scores, and recent security events for your
                organization.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium text-gray-700">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Security Alerts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Security Alerts Today */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Security Alerts Today</p>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary.alerts_today}
              </p>
              <p className="text-xs text-gray-500 mt-2">Generated today</p>
            </div>

            {/* Open Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Open Alerts</p>
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {summary.open_alerts}
              </p>
              <p className="text-xs text-gray-500 mt-2">Needs attention</p>
            </div>

            {/* Resolved Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Resolved Alerts</p>
                <CheckCircle className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary.resolved_alerts}
              </p>
              <p className="text-xs text-gray-500 mt-2">Closed incidents</p>
            </div>

            {/* Critical Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {summary.critical_alerts}
              </p>
              <p className="text-xs text-gray-500 mt-2">Open critical issues</p>
            </div>
          </div>

          {/* Top Risk Users and Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Risk Users */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top Risk Users
              </h3>
              <div className="space-y-4">
                {topRiskUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No risk data available</p>
                  </div>
                ) : (
                  topRiskUsers.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.user_name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {user.total_score}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskLevelColor(
                            user.total_score
                          )}`}
                        >
                          {getRiskLevelText(user.total_score)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Risk Companies */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top Risk Companies
              </h3>
              <div className="space-y-4">
                {/* Group users by company */}
                {(() => {
                  const companyData = {};
                  topRiskUsers.forEach((user) => {
                    // Extract company from email or use a default
                    const company = user.user_email?.split('@')[1] || 'Unknown';
                    if (!companyData[company]) {
                      companyData[company] = { users: [], totalScore: 0 };
                    }
                    companyData[company].users.push(user);
                    companyData[company].totalScore += user.total_score;
                  });

                  const companies = Object.entries(companyData).map(([name, data]) => ({
                    name,
                    userCount: data.users.length,
                    totalScore: data.totalScore,
                  })).sort((a, b) => b.totalScore - a.totalScore);

                  if (companies.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No company data available</p>
                      </div>
                    );
                  }

                  return companies.map((company) => (
                    <div
                      key={company.name}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {company.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company.userCount} users tracked
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {company.totalScore}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskLevelColor(
                            company.totalScore
                          )}`}
                        >
                          {getRiskLevelText(company.totalScore)}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Security Events
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No security events found</p>
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getEventTypeIcon(event.event_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {event.event_type.replace("_", " ").toUpperCase()}
                            </h4>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRiskLevelColor(
                                event.risk_score
                              )}`}
                            >
                              {getRiskLevelText(event.risk_score)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          {event.ip_address && (
                            <p className="text-xs text-gray-500 mt-1">
                              IP: {event.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
                          {formatDate(event.created_at)}
                        </p>
                        {event.is_resolved === 0 && (
                          <span className="text-xs text-red-600 font-medium mt-1 inline-block">
                            Open
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityMonitoring;