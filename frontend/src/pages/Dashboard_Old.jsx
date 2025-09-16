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
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCampaigns: 0,
    completedCampaigns: 0,
    audienceSegments: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const campaignsResponse = await fetch(
        "http://localhost:5001/api/campaigns",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const audienceResponse = await fetch(
        "http://localhost:5001/api/audience",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const customersResponse = await fetch(
        "http://localhost:5001/api/customers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (campaignsResponse.ok && audienceResponse.ok && customersResponse.ok) {
        const campaigns = await campaignsResponse.json();
        const audience = await audienceResponse.json();
        const customers = await customersResponse.json();

        console.log("Dashboard campaigns API response:", campaigns);

        const campaignData = Array.isArray(campaigns)
          ? campaigns
          : campaigns.data?.campaigns || [];
        console.log("Dashboard processed campaign data:", campaignData);
        const audienceData = Array.isArray(audience)
          ? audience
          : audience.data?.segments || [];
        const customerData = Array.isArray(customers)
          ? customers
          : customers.data?.customers || [];

        setStats({
          totalCustomers: customerData.length,
          totalCampaigns: campaignData.length,
          completedCampaigns: campaignData.filter(
            (c) => c.status === "completed"
          ).length,
          audienceSegments: audienceData.length,
        });

        setRecentCampaigns(campaignData.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your CRM activities and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCampaigns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Completed Campaigns
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedCampaigns}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Audience Segments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.audienceSegments}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Campaigns
            </h2>
            <button
              onClick={() => navigate("/campaigns")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New Campaign</span>
            </button>
          </div>

          <div className="p-6">
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created: {formatDate(campaign.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {campaign.type?.toUpperCase() || "EMAIL"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first campaign to get started
                </p>
                <button
                  onClick={() => navigate("/campaigns")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/campaigns")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Send className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Create Campaign</span>
              </button>
              <button
                onClick={() => navigate("/audience")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Build Audience</span>
              </button>
              <button
                onClick={() => navigate("/customers")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Manage Customers</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  System running smoothly
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  All campaigns up to date
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Navigation
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/campaign-history")}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">Campaign History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
