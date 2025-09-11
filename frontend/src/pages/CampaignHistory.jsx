import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Mail,
} from "lucide-react";

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data.campaigns || []);
      } else {
        console.error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate sending a campaign
  const simulateSendCampaign = async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      
      // First update status to 'sending'
      setCampaigns(prev => prev.map(camp => 
        camp._id === campaignId 
          ? { ...camp, status: 'sending' }
          : camp
      ));

      // Simulate the sending process
      setTimeout(async () => {
        // Generate realistic stats based on audience size
        const campaign = campaigns.find(c => c._id === campaignId);
        const audienceSize = campaign?.audienceSegment?.audienceSize || 100;
        
        const sent = audienceSize;
        const failed = Math.floor(audienceSize * 0.05); // 5% failure rate
        const delivered = sent - failed;
        const opened = Math.floor(delivered * 0.25); // 25% open rate
        const clicked = Math.floor(opened * 0.15); // 15% click rate

        // Update campaign with completed status and stats
        setCampaigns(prev => prev.map(camp => 
          camp._id === campaignId 
            ? { 
                ...camp, 
                status: 'completed',
                sentAt: new Date().toISOString(),
                stats: {
                  sent,
                  failed,
                  delivered,
                  opened,
                  clicked
                }
              }
            : camp
        ));

        alert(`Campaign sent! ${delivered} emails delivered successfully.`);
      }, 3000); // 3 second simulation

    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  // Pause a sending campaign
  const pauseCampaign = async (campaignId) => {
    setCampaigns(prev => prev.map(camp => 
      camp._id === campaignId 
        ? { ...camp, status: 'paused' }
        : camp
    ));
    alert('Campaign paused');
  };

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
    const sent = campaign.stats?.sent || 0;
    const delivered = campaign.stats?.delivered || 0;
    if (sent === 0) return 0;
    return ((delivered / sent) * 100).toFixed(1);
  };

  const getOpenRate = (campaign) => {
    const delivered = campaign.stats?.delivered || 0;
    const opened = campaign.stats?.opened || 0;
    if (delivered === 0) return 0;
    return ((opened / delivered) * 100).toFixed(1);
  };

  const getClickRate = (campaign) => {
    const opened = campaign.stats?.opened || 0;
    const clicked = campaign.stats?.clicked || 0;
    if (opened === 0) return 0;
    return ((clicked / opened) * 100).toFixed(1);
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
        (campaign.audienceSegment?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
          <button 
            onClick={() => navigate('/campaigns')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Status Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 Campaign Status Guide:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div><span className="font-medium text-gray-700">Draft:</span> <span className="text-gray-600">Not sent yet</span></div>
            <div><span className="font-medium text-blue-700">Scheduled:</span> <span className="text-gray-600">Will send later</span></div>
            <div><span className="font-medium text-yellow-700">Sending:</span> <span className="text-gray-600">Currently sending</span></div>
            <div><span className="font-medium text-green-700">Completed:</span> <span className="text-gray-600">Successfully sent</span></div>
            <div><span className="font-medium text-red-700">Failed:</span> <span className="text-gray-600">Had delivery errors</span></div>
            <div><span className="font-medium text-orange-700">Paused:</span> <span className="text-gray-600">Stopped by user</span></div>
          </div>
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
                <p className="text-sm font-medium text-blue-600">
                  Total Messages Sent
                </p>
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
                <p className="text-sm font-medium text-purple-600">
                  Total Audience Size
                </p>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading campaigns...</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
                <button
                  onClick={() => navigate("/campaigns")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
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
                      <span className="font-medium">
                        {campaign.audienceSegment?.name || 'Unknown Segment'}
                      </span> •
                      Audience:{" "}
                      <span className="font-medium">
                        {(campaign.audienceSegment?.audienceSize || campaign.stats?.sent || 0).toLocaleString()}
                      </span>{" "}
                      users
                    </p>

                    {/* Core Metrics - Sent, Failed, Audience Size */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">
                          {campaign.status === 'draft' ? '-' : (campaign.stats?.sent || 0).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          Messages Sent
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-2xl font-bold text-red-700">
                          {campaign.status === 'draft' ? '-' : (campaign.stats?.failed || 0).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-red-600">
                          Failed
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-2xl font-bold text-purple-700">
                          {(campaign.audienceSegment?.audienceSize || 0).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-purple-600">
                          Target Audience
                        </p>
                      </div>
                    </div>

                    {/* Additional Stats (Secondary) */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">
                          {campaign.status === 'draft' ? '-' : (campaign.stats?.delivered || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Delivered {campaign.status === 'draft' ? '' : `(${getDeliveryRate(campaign)}%)`}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">
                          {campaign.status === 'draft' ? '-' : (campaign.stats?.opened || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Opened {campaign.status === 'draft' ? '' : `(${getOpenRate(campaign)}%)`}
                        </p>
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
                    {campaign.status === 'draft' && (
                      <button 
                        onClick={() => simulateSendCampaign(campaign._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <Send size={14} />
                        <span>Send</span>
                      </button>
                    )}
                    {campaign.status === 'sending' && (
                      <button 
                        onClick={() => pauseCampaign(campaign._id)}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                      >
                        Pause
                      </button>
                    )}
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="View Campaign Details"
                    >
                      <Eye size={16} className="text-gray-400" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="More Actions"
                    >
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignHistory;
