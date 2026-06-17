import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CreditCard,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getCurrentUser } from "../../api/authApi";
import { getEmployees } from "../../api/employeeApi";
import { Loader } from "../../components/common/Loader";

const Subscription = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");

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
      setCurrentPlan(user.plan || "free");
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planKey) => {
    if (
      window.confirm(
        `Are you sure you want to switch to the ${
          planKey.charAt(0).toUpperCase() + planKey.slice(1)
        } plan?`
      )
    ) {
      setCurrentPlan(planKey);
      alert(
        `Successfully switched to ${
          planKey.charAt(0).toUpperCase() + planKey.slice(1)
        } plan!`
      );
    }
  };

  const plans = {
    free: { maxEmployees: 10, maxAdmins: 1 },
    professional: { maxEmployees: 50, maxAdmins: 3 },
    enterprise: { maxEmployees: Infinity, maxAdmins: Infinity },
  };

  const currentLimits = plans[currentPlan];
  const employeeCount = employees.length;
  const adminCount = 13;

  const formatLimit = (max) => {
    if (max === Infinity) return "Unlimited";
    return max;
  };

  const getUsagePercent = (current, max) => {
    if (max === Infinity) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const isOverLimit = (current, max) => {
    if (max === Infinity) return false;
    return current > max;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Subscription & Plan Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">
                Subscription & Plan
              </h2>
            </div>

            {/* Current Plan */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentPlan.charAt(0).toUpperCase() +
                      currentPlan.slice(1)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {currentPlan.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Usage Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Usage</h3>

              {/* Employees Usage */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Employees
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isOverLimit(
                        employeeCount,
                        currentLimits.maxEmployees
                      )
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {employeeCount} /{" "}
                    {formatLimit(currentLimits.maxEmployees)}
                  </span>
                </div>
                {currentLimits.maxEmployees !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit(
                          employeeCount,
                          currentLimits.maxEmployees
                        )
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getUsagePercent(
                          employeeCount,
                          currentLimits.maxEmployees
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Admins Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Admins
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isOverLimit(adminCount, currentLimits.maxAdmins)
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {adminCount} /{" "}
                    {formatLimit(currentLimits.maxAdmins)}
                  </span>
                </div>
                {currentLimits.maxAdmins !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit(adminCount, currentLimits.maxAdmins)
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getUsagePercent(
                          adminCount,
                          currentLimits.maxAdmins
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Change Plan Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Change Plan
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Select a plan for your admin account. Other admins in your
                company keep their own plans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div
                  className={`rounded-lg border-2 p-5 bg-white transition-all ${
                    currentPlan === "free"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gray-700" />
                      <h4 className="font-bold text-gray-900">Free</h4>
                    </div>
                    {currentPlan === "free" && (
                      <span className="text-xs font-semibold text-blue-600">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Employees: <strong>10</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Admins: <strong>1</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Analytics Access: <strong>No</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Audit Log Access: <strong>No</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Export Access: <strong>No</strong>
                      </span>
                    </li>
                  </ul>

                  {currentPlan !== "free" && (
                    <button
                      onClick={() => handlePlanChange("free")}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Free
                    </button>
                  )}
                </div>

                {/* Professional Plan */}
                <div
                  className={`rounded-lg border-2 p-5 bg-white transition-all ${
                    currentPlan === "professional"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-gray-700" />
                      <h4 className="font-bold text-gray-900">
                        Professional
                      </h4>
                    </div>
                    {currentPlan === "professional" && (
                      <span className="text-xs font-semibold text-blue-600">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Employees: <strong>50</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Admins: <strong>3</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Analytics Access: <strong>Yes</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Audit Log Access: <strong>Yes</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Export Access: <strong>Yes</strong>
                      </span>
                    </li>
                  </ul>

                  {currentPlan !== "professional" && (
                    <button
                      onClick={() => handlePlanChange("professional")}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Professional
                    </button>
                  )}
                </div>

                {/* Enterprise Plan */}
                <div
                  className={`rounded-lg border-2 p-5 bg-white transition-all ${
                    currentPlan === "enterprise"
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-gray-700" />
                      <h4 className="font-bold text-gray-900">Enterprise</h4>
                    </div>
                    {currentPlan === "enterprise" && (
                      <span className="text-xs font-semibold text-blue-600">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Employees: <strong>Unlimited</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Max Admins: <strong>Unlimited</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Analytics Access: <strong>Yes</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Audit Log Access: <strong>Yes</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>
                        Export Access: <strong>Yes</strong>
                      </span>
                    </li>
                  </ul>

                  {currentPlan !== "enterprise" && (
                    <button
                      onClick={() => handlePlanChange("enterprise")}
                      className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Enterprise
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;