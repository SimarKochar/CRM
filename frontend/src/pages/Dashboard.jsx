import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Target,
  Activity,
  Send,
  CheckCircle,
  Plus,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      console.log("Fetching analytics data...");
      const response = await fetch("http://localhost:5001/api/analytics/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Analytics response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Analytics data received:", data);
        setAnalyticsData(data.data);
      } else {
        console.error("Failed to fetch analytics data:", response.status);
        const errorData = await response.text();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "sending":
        return "bg-blue-100 text-blue-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Create some campaigns to see analytics</p>
          <button
            onClick={() => navigate("/campaigns")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Campaign
          </button>
        </div>
      </div>
    );
  }

  const { metrics, charts, topCampaigns } = analyticsData;

  // Transform data for charts
  const deliveryStatsData = charts.deliveryStats.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  }));

  const campaignTypesData = charts.campaignTypes.map(item => ({
    type: item._id.toUpperCase(),
    total: item.count,
    completed: item.completed
  }));

  const recentActivityData = charts.recentActivity.map(item => ({
    date: formatDate(item._id),
    sent: item.sent,
    failed: item.failed,
    pending: item.pending
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Campaign performance insights and metrics</p>
          </div>
          <button
            onClick={() => navigate("/campaigns")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalCampaigns}</p>
              </div>
              <Mail size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.successfulMessages.toLocaleString()}</p>
              </div>
              <Send size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.overallSuccessRate}%</p>
              </div>
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audience Segments</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalAudienceSegments}</p>
              </div>
              <Target size={32} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Grid - Simplified to 2 meaningful charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Delivery Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Message Delivery Status</h3>
              <PieChart size={20} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={deliveryStatsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {deliveryStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Performance Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
              <Activity size={20} className="text-gray-400" />
            </div>
            
            {/* Performance Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalMessages}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.overallSuccessRate}%</p>
                </div>
              </div>
              
              {/* Campaign List */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Campaigns</h4>
                <div className="space-y-3">
                  {topCampaigns.slice(0, 3).map((campaign, index) => (
                    <div key={campaign._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-32">{campaign.name}</p>
                          <p className="text-xs text-gray-500">{campaign.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">{campaign.successRate}%</p>
                        <p className="text-xs text-gray-500">{campaign.totalSent} sent</p>
                      </div>
                    </div>
                  ))}
                  {topCampaigns.length === 0 && (
                    <div className="text-center py-6">
                      <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No campaigns yet</p>
                      <button
                        onClick={() => navigate("/campaigns")}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Create your first campaign
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/campaigns")}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <Plus size={24} className="text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Create Campaign</h4>
                <p className="text-sm text-gray-600">Start a new marketing campaign</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/audience")}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <Users size={24} className="text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Build Audience</h4>
                <p className="text-sm text-gray-600">Create targeted audience segments</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/campaign-history")}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <Activity size={24} className="text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">View History</h4>
                <p className="text-sm text-gray-600">Check campaign performance</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;