import { useState } from "react";
import {
  Users,
  Mail,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  Eye,
  MousePointer,
  Send,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const [stats] = useState({
    totalCustomers: 15847,
    activeCampaigns: 12,
    audienceSegments: 8,
    monthlyRevenue: 89430,
    emailsSent: 156789,
    openRate: 24.5,
    clickRate: 3.2,
    conversionRate: 1.8,
  });

  const [monthlyData] = useState([
    { month: 'Jan', revenue: 65000, customers: 12400, campaigns: 8 },
    { month: 'Feb', revenue: 72000, customers: 13100, campaigns: 10 },
    { month: 'Mar', revenue: 68000, customers: 13800, campaigns: 9 },
    { month: 'Apr', revenue: 78000, customers: 14200, campaigns: 11 },
    { month: 'May', revenue: 85000, customers: 14900, campaigns: 13 },
    { month: 'Jun', revenue: 89430, customers: 15847, campaigns: 12 },
  ]);

  const [topCampaigns] = useState([
    { name: 'Summer Sale 2025', sent: 8945, opened: 4782, clicked: 892, revenue: 12450 },
    { name: 'Welcome Series', sent: 3421, opened: 2103, clicked: 567, revenue: 8900 },
    { name: 'Product Launch', sent: 5678, opened: 2839, clicked: 423, revenue: 6700 },
    { name: 'Newsletter #24', sent: 12340, opened: 3456, clicked: 234, revenue: 3400 },
  ]);

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  // Simple chart component
  const BarChart = ({ data, dataKey, color = "bg-blue-500" }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    return (
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`${color} w-full rounded-t transition-all duration-500 hover:opacity-80`}
              style={{ 
                height: `${(item[dataKey] / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{item.month}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 text-blue-600" size={32} />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your CRM.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={28} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUp className="text-green-500 mr-1" size={16} />
              <span className="text-green-500 text-sm font-medium">+12.5%</span>
              <span className="text-gray-600 text-sm ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={28} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUp className="text-green-500 mr-1" size={16} />
              <span className="text-green-500 text-sm font-medium">+8.2%</span>
              <span className="text-gray-600 text-sm ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="text-purple-600" size={28} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Activity className="text-blue-500 mr-1" size={16} />
              <span className="text-blue-500 text-sm font-medium">3 scheduled</span>
              <span className="text-gray-600 text-sm ml-1">for this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audience Segments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.audienceSegments}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="text-yellow-600" size={28} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUp className="text-green-500 mr-1" size={16} />
              <span className="text-green-500 text-sm font-medium">2 new</span>
              <span className="text-gray-600 text-sm ml-1">this month</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emailsSent.toLocaleString()}</p>
              </div>
              <Send className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
              </div>
              <Eye className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clickRate}%</p>
              </div>
              <MousePointer className="text-purple-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <CheckCircle className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Monthly Revenue</h3>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <BarChart data={monthlyData} dataKey="revenue" color="bg-green-500" />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Last 6 months performance</p>
            </div>
          </div>

          {/* Customer Growth Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Customer Growth</h3>
              <Users className="text-blue-500" size={20} />
            </div>
            <BarChart data={monthlyData} dataKey="customers" color="bg-blue-500" />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">New customers acquired monthly</p>
            </div>
          </div>
        </div>

        {/* Top Campaigns Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Campaigns</h2>
            <Mail className="text-blue-500" size={24} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Sent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Opened</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Clicked</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((campaign, index) => {
                  const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                  const clickRate = ((campaign.clicked / campaign.sent) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{campaign.name}</td>
                      <td className="py-3 px-4 text-gray-600">{campaign.sent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{campaign.opened.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{campaign.clicked.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">${campaign.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {openRate}% open
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {clickRate}% click
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;