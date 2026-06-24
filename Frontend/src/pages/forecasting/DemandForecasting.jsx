import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Download,
  ChevronDown,
  Package,
  Layers,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { Loader } from "../../components/common/Loader";
import {
  getForecastSummary,
  getDemandTrends,
  getDemandByCategory,
  getTopProducts,
  getForecastDetails,
} from "../../api/forecastApi";

const DemandForecasting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState("All Products");

  const [summary, setSummary] = useState({
    totalForecast: 0,
    avgConfidence: 0,
    productsTracked: 0,
    categories: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });

  const [demandTrends, setDemandTrends] = useState([]);
  const [demandByCategory, setDemandByCategory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [forecastDetails, setForecastDetails] = useState([]);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      const [summaryData, trendsData, categoryData, productsData, detailsData] =
        await Promise.all([
          getForecastSummary(),
          getDemandTrends(),
          getDemandByCategory(),
          getTopProducts(10),
          getForecastDetails(50),
        ]);

      setSummary(summaryData);
      setDemandTrends(trendsData);
      setDemandByCategory(categoryData);
      setTopProducts(productsData);
      setForecastDetails(detailsData);
    } catch (err) {
      console.error("Failed to load forecast data:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and products for filters
  const categories = [
    "All Categories",
    ...new Set(demandByCategory.map((c) => c.name)),
  ];
  const products = [
    "All Products",
    ...new Set(topProducts.map((p) => p.name)),
  ];

  // Filter data based on selections
  const filteredDetails = forecastDetails.filter((detail) => {
    const categoryMatch =
      selectedCategory === "All Categories" ||
      detail.category === selectedCategory;
    const productMatch =
      selectedProduct === "All Products" || detail.product === selectedProduct;
    return categoryMatch && productMatch;
  });

  const handleExport = () => {
    const csvContent = [
      ["Date", "Product", "Category", "Predicted Demand", "Confidence"].join(
        ","
      ),
      ...filteredDetails.map((d) =>
        [d.date, d.product, d.category, d.predictedDemand, d.confidence].join(
          ","
        )
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demand_forecast.csv";
    a.click();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Demand Forecasting
              </h1>
              <p className="text-gray-600 mt-1">
                Predict future demand based on {summary.totalTransactions}{" "}
                transactions
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Export</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <div className="relative">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="appearance-none w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {products.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Next 30 Days Forecast</p>
                
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary.totalForecast.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2">Total predicted units</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg. Confidence</p>
                
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary.avgConfidence}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Forecast reliability</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Products Tracked</p>
                
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {summary.productsTracked}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Across {summary.categories} categories
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-4xl font-bold text-gray-900">{summary.categories}</p>
                  <p className="text-xs text-gray-500 mt-2">Product categories</p>
                </div>
                <div className="text-gray-400">
                
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Demand Trends */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Demand Trends
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Historical vs predicted demand over time
              </p>
              {demandTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={demandTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
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
                      type="monotone"
                      dataKey="historical"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Historical"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Forecast"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-500">
                  No trend data available
                </div>
              )}
            </div>

            {/* Demand by Category */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Demand by Category
              </h3>
              {demandByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={demandByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {demandByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top Products by Forecasted Demand
              </h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="demand"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      name="Forecasted Demand"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No product data available
                </div>
              )}
            </div>

            {/* Forecast Details Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Forecast Details
              </h3>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        Qty
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      filteredDetails.slice(0, 20).map((detail, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3 text-gray-900">
                            {detail.date}
                          </td>
                          <td className="py-2 px-3 text-gray-900 font-medium">
                            {detail.product}
                          </td>
                          <td className="py-2 px-3 text-gray-600">
                            {detail.category}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">
                            {detail.predictedDemand}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              {detail.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemandForecasting;