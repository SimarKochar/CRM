import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Send,
  Users,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Target,
  Mail,
} from "lucide-react";

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState({
    name: "",
    subject: "",
    content: "",
    audienceSegment: "",
  });

  const [audienceSegments, setAudienceSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  // Fetch audience segments for dropdown
  useEffect(() => {
    fetchAudienceSegments();
  }, []);

  const fetchAudienceSegments = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching audience segments...");
      const response = await fetch("http://localhost:5001/api/audience", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        // Fix: segments are in data field, not data.data.segments
        setAudienceSegments(data.data || []);
        console.log("Set segments:", data.data || []);
      } else {
        console.error("Failed to fetch segments:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching audience segments:", error);
    } finally {
      setSegmentsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCampaignData({
      ...campaignData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/campaigns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: campaignData.name,
          content: {
            subject: campaignData.subject,
            message: campaignData.content,
          },
          audienceSegment: campaignData.audienceSegment,
          type: "email",
        }),
      });

      if (response.ok) {
        alert("Campaign created successfully!");
        navigate("/campaign-history");
      } else {
        const errorData = await response.json();
        alert(`Error creating campaign: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/campaign-history")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Mail className="mr-3 text-blue-600" size={32} />
                Create New Campaign
              </h1>
              <p className="text-gray-600 mt-2">
                Design and launch your marketing campaign
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={campaignData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign name"
                required
              />
            </div>

            {/* Email Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                name="subject"
                value={campaignData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Campaign Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Message Content
              </label>
              <textarea
                name="content"
                value={campaignData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email message content here..."
                required
              />
            </div>

            {/* Audience Segment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                name="audienceSegment"
                value={campaignData.audienceSegment}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={segmentsLoading}
              >
                <option value="">
                  {segmentsLoading
                    ? "Loading segments..."
                    : "Select audience segment"}
                </option>
                {audienceSegments.map((segment) => {
                  console.log("Rendering segment:", segment);
                  return (
                    <option key={segment._id} value={segment._id}>
                      {segment.name} ({segment.audienceSize || 0} users)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/campaign-history")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>{isLoading ? "Creating..." : "Create Campaign"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
