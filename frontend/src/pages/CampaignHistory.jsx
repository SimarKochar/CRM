import { useState } from "react";
import {
  Plus,
  Send,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Filter,
  Search,
  AlertCircle,
  Target,
} from "lucide-react";

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Black Friday Sale 2025",
      segment: "High Value Customers",
      audienceSize: 2847,
      sent: 2847,
      delivered: 2720,
      failed: 127,
      opened: 1564,
      clicked: 423,
      status: "completed",
      createdAt: "2025-09-08T10:30:00Z",
      sentAt: "2025-09-08T14:00:00Z",
      type: "email",
    },
    {
      id: 2,
      name: "Welcome Back Campaign",
      segment: "Inactive Users",
      audienceSize: 1205,
      sent: 1205,
      delivered: 1180,
      failed: 25,
      opened: 590,
      clicked: 118,
      status: "completed",
      createdAt: "2025-09-05T09:15:00Z",
      sentAt: "2025-09-05T11:00:00Z",
      type: "email",
    },
    {
      id: 3,
      name: "Product Launch Teaser",
      segment: "All Active Users",
      audienceSize: 5432,
      sent: 5432,
      delivered: 5201,
      failed: 231,
      opened: 2980,
      clicked: 834,
      status: "completed",
      createdAt: "2025-09-01T16:45:00Z",
      sentAt: "2025-09-02T10:00:00Z",
      type: "email",
    },
    {
      id: 4,
      name: "Weekend Flash Sale",
      segment: "Recent Buyers",
      audienceSize: 890,
      sent: 0,
      delivered: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      status: "draft",
      createdAt: "2025-09-09T08:20:00Z",
      sentAt: null,
      type: "sms",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "sending":
        return "bg-blue-100 text-blue-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDeliveryRate = (campaign) => {
    if (campaign.sent === 0) return 0;
    return ((campaign.delivered / campaign.sent) * 100).toFixed(1);
  };

  const getOpenRate = (campaign) => {
    if (campaign.delivered === 0) return 0;
    return ((campaign.opened / campaign.delivered) * 100).toFixed(1);
  };

  const getClickRate = (campaign) => {
    if (campaign.opened === 0) return 0;
    return ((campaign.clicked / campaign.opened) * 100).toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not sent";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCampaigns = campaigns
    .filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.segment.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (campaign) => statusFilter === "all" || campaign.status === statusFilter
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Campaign History
            </h1>
            <p className="text-gray-600 mt-2">
              Track performance and delivery statistics for all campaigns
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={20} />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="sending">Sending</option>
              <option value="draft">Draft</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Core Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Messages Sent</p>
                <p className="text-3xl font-bold text-blue-700">
                  {campaigns
                    .reduce((sum, c) => sum + c.sent, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Send size={28} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Failed</p>
                <p className="text-3xl font-bold text-red-700">
                  {campaigns
                    .reduce((sum, c) => sum + c.failed, 0)
                    .toLocaleString()}
                </p>
              </div>
              <AlertCircle size={28} className="text-red-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Audience Size</p>
                <p className="text-3xl font-bold text-purple-700">
                  {campaigns
                    .reduce((sum, c) => sum + c.audienceSize, 0)
                    .toLocaleString()}
                </p>
              </div>
              <Users size={28} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.length}
                </p>
              </div>
              <Target size={24} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(
                    campaigns
                      .filter((c) => c.sent > 0)
                      .reduce(
                        (sum, c) => sum + parseFloat(getDeliveryRate(c)),
                        0
                      ) / campaigns.filter((c) => c.sent > 0).length || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Campaigns
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {campaign.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Segment:{" "}
                      <span className="font-medium">{campaign.segment}</span> •
                      Audience:{" "}
                      <span className="font-medium">
                        {campaign.audienceSize.toLocaleString()}
                      </span>{" "}
                      users
                    </p>

                    {/* Core Metrics - Sent, Failed, Audience Size */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">{campaign.sent.toLocaleString()}</p>
                        <p className="text-sm font-medium text-blue-600">Messages Sent</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-2xl font-bold text-red-700">{campaign.failed.toLocaleString()}</p>
                        <p className="text-sm font-medium text-red-600">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-2xl font-bold text-purple-700">{campaign.audienceSize.toLocaleString()}</p>
                        <p className="text-sm font-medium text-purple-600">Audience Size</p>
                      </div>
                    </div>

                    {/* Additional Stats (Secondary) */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">{campaign.delivered.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Delivered ({getDeliveryRate(campaign)}%)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">{campaign.opened.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Opened ({getOpenRate(campaign)}%)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created: {formatDate(campaign.createdAt)}</span>
                        <span>•</span>
                        <span>Sent: {formatDate(campaign.sentAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye size={16} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Send size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first campaign
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignHistory;
