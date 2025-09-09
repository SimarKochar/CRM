import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Target,
  Users,
  Eye,
  Save,
  Play,
  Trash2,
  Filter,
  Search,
} from "lucide-react";

const AudienceBuilder = () => {
  const navigate = useNavigate();
  
  const [currentSegment, setCurrentSegment] = useState({
    name: "",
    description: "",
    rules: [{ field: "totalSpent", operator: ">", value: "", logic: null }],
  });

  const [savedSegments, setSavedSegments] = useState([
    {
      id: 1,
      name: "High Value Customers",
      description: "Customers with high lifetime value",
      rules: [
        { field: "totalSpent", operator: ">", value: "10000", logic: "AND" },
        { field: "orderCount", operator: ">=", value: "5", logic: null },
      ],
      audienceSize: 2847,
      createdAt: "2025-09-08",
    },
    {
      id: 2,
      name: "Inactive Users",
      description: "Users inactive for 90+ days",
      rules: [
        { field: "lastLogin", operator: ">", value: "90", logic: "AND" },
        { field: "totalSpent", operator: "<", value: "500", logic: null },
      ],
      audienceSize: 1205,
      createdAt: "2025-09-05",
    },
  ]);

  const [previewSize, setPreviewSize] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fieldOptions = [
    { value: "totalSpent", label: "Total Spent (INR)" },
    { value: "orderCount", label: "Order Count" },
    { value: "lastPurchase", label: "Days Since Last Purchase" },
    { value: "lastLogin", label: "Days Since Last Login" },
    { value: "visits", label: "Website Visits" },
    { value: "age", label: "Age" },
    { value: "location", label: "Location" },
  ];

  const operatorOptions = [
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
    { value: ">=", label: "Greater than or equal" },
    { value: "<=", label: "Less than or equal" },
    { value: "=", label: "Equal to" },
    { value: "!=", label: "Not equal to" },
    { value: "contains", label: "Contains" },
  ];

  const addRule = () => {
    setCurrentSegment((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          field: "totalSpent",
          operator: ">",
          value: "",
          logic: prev.rules.length > 0 ? "AND" : null,
        },
      ],
    }));
  };

  const removeRule = (index) => {
    setCurrentSegment((prev) => ({
      ...prev,
      rules: prev.rules
        .filter((_, i) => i !== index)
        .map((rule, i) => ({
          ...rule,
          logic: i === 0 ? null : rule.logic,
        })),
    }));
  };

  const updateRule = (index, field, value) => {
    setCurrentSegment((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const previewAudience = async () => {
    setIsPreviewLoading(true);

    // Simulate API call to calculate audience size
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockSize = Math.floor(Math.random() * 5000) + 100;
    setPreviewSize(mockSize);
    setIsPreviewLoading(false);
  };

  const saveSegment = () => {
    if (!currentSegment.name || !currentSegment.description) {
      alert("Please provide both name and description for the segment");
      return;
    }

    const newSegment = {
      id: savedSegments.length + 1,
      ...currentSegment,
      audienceSize: previewSize || Math.floor(Math.random() * 3000) + 500,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSavedSegments((prev) => [newSegment, ...prev]);

    // Reset form
    setCurrentSegment({
      name: "",
      description: "",
      rules: [{ field: "totalSpent", operator: ">", value: "", logic: null }],
    });
    setPreviewSize(null);

    // Redirect to Campaign History page
    navigate("/campaign-history");
  };

  const formatRuleText = (rule) => {
    const field =
      fieldOptions.find((f) => f.value === rule.field)?.label || rule.field;
    const operator =
      operatorOptions.find((o) => o.value === rule.operator)?.label ||
      rule.operator;
    return `${field} ${operator} ${rule.value}`;
  };

  const filteredSegments = savedSegments.filter(
    (segment) =>
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Audience Builder
          </h1>
          <p className="text-gray-600">
            Create and manage customer segments with flexible rule logic
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Segment Builder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Segment
              </h2>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={currentSegment.name}
                  onChange={(e) =>
                    setCurrentSegment((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., High Value Customers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentSegment.description}
                  onChange={(e) =>
                    setCurrentSegment((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Brief description of this segment"
                />
              </div>
            </div>

            {/* Rules Builder */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Segment Rules
                </h3>
                <button
                  onClick={addRule}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-4">
                {currentSegment.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {index > 0 && (
                        <div className="col-span-2">
                          <select
                            value={rule.logic || "AND"}
                            onChange={(e) =>
                              updateRule(index, "logic", e.target.value)
                            }
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}

                      <div className={index > 0 ? "col-span-4" : "col-span-5"}>
                        <select
                          value={rule.field}
                          onChange={(e) =>
                            updateRule(index, "field", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {fieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            updateRule(index, "operator", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {operatorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(index, "value", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Value"
                        />
                      </div>

                      {currentSegment.rules.length > 1 && (
                        <div className="col-span-1">
                          <button
                            onClick={() => removeRule(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Audience Preview</h4>
                <button
                  onClick={previewAudience}
                  disabled={isPreviewLoading || !currentSegment.rules[0].value}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPreviewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      <span>Preview Size</span>
                    </>
                  )}
                </button>
              </div>

              {previewSize && (
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  Estimated audience: {previewSize.toLocaleString()} users
                </div>
              )}

              <div className="text-sm text-gray-600">
                <strong>Rules:</strong>{" "}
                {currentSegment.rules.map((rule, index) => (
                  <span key={index}>
                    {index > 0 && ` ${rule.logic} `}
                    {formatRuleText(rule)}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={saveSegment}
                disabled={!currentSegment.name || !currentSegment.description}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Save Segment</span>
              </button>

              <button
                onClick={() => {
                  /* TODO: Implement campaign creation */
                }}
                disabled={!previewSize}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Play size={16} />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>

          {/* Saved Segments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Saved Segments
                </h2>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search segments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {segment.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {segment.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>
                            {segment.audienceSize.toLocaleString()} users
                          </span>
                        </div>
                        <span>Created: {segment.createdAt}</span>
                      </div>
                    </div>

                    <button className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded text-sm font-medium">
                      Use
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-600">
                      <strong>Rules:</strong>{" "}
                      {segment.rules.map((rule, index) => (
                        <span key={index}>
                          {index > 0 && ` ${rule.logic} `}
                          {formatRuleText(rule)}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceBuilder;
