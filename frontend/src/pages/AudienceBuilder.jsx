import { useState, useEffect } from "react";
import { Plus, Search, Users, Trash2, Edit3, Save, X } from "lucide-react";
import NaturalLanguageQuery from "../components/NaturalLanguageQuery";

const AudienceBuilder = () => {
  const [segments, setSegments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAIQuery, setShowAIQuery] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audiencePreview, setAudiencePreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rules: [{ field: "", operator: "", value: "", logic: "AND" }],
  });

  // Load segments on component mount
  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/audience", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSegments(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to load segments:", response.status);
        setSegments([]);
      }
    } catch (error) {
      console.error("Error loading segments:", error);
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const url = editingSegment
        ? `http://localhost:5001/api/audience/${editingSegment.id}`
        : "http://localhost:5001/api/audience";

      const method = editingSegment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadSegments();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving segment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preview audience size before saving
  const handlePreviewAudience = async () => {
    try {
      setIsPreviewLoading(true);
      setAudiencePreview(null);

      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5001/api/audience/preview",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rules: formData.rules }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAudiencePreview(data.data);
      } else {
        // Fallback to demo data calculation
        const demoSize = calculateDemoAudienceSize(formData.rules);
        setAudiencePreview({
          audienceSize: demoSize,
          isDemo: true,
          message: "Preview based on demo data",
        });
      }
    } catch (error) {
      console.error("Error previewing audience:", error);
      // Fallback to demo calculation
      const demoSize = calculateDemoAudienceSize(formData.rules);
      setAudiencePreview({
        audienceSize: demoSize,
        isDemo: true,
        message: "Preview based on demo data (API unavailable)",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Demo audience size calculation
  const calculateDemoAudienceSize = (rules) => {
    // Base audience size
    let baseSize = 500; // Simulated total customers

    // Simulate filtering based on rules
    rules.forEach((rule) => {
      if (rule.field && rule.operator && rule.value) {
        // Simulate different filtering effects
        switch (rule.field) {
          case "totalSpent":
            baseSize = Math.floor(baseSize * 0.6); // 60% match spending criteria
            break;
          case "lastPurchaseDate":
            baseSize = Math.floor(baseSize * 0.4); // 40% match date criteria
            break;
          case "orders":
            baseSize = Math.floor(baseSize * 0.7); // 70% match order criteria
            break;
          case "status":
            baseSize = Math.floor(baseSize * 0.8); // 80% match status criteria
            break;
          default:
            baseSize = Math.floor(baseSize * 0.5); // 50% for other fields
        }
      }
    });

    // Minimum audience size
    return Math.max(baseSize, 10);
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm("Are you sure you want to delete this segment?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/audience/${segmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadSegments();
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
    }
  };

  const handleEditSegment = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      rules:
        segment.rules.length > 0
          ? segment.rules
          : [{ field: "", operator: "", value: "", logic: "AND" }],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rules: [{ field: "", operator: "", value: "", logic: "AND" }],
    });
    setEditingSegment(null);
    setShowForm(false);
    setShowAIQuery(false);
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        { field: "", operator: "", value: "", logic: "AND" },
      ],
    }));
  };

  const updateRule = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const removeRule = (index) => {
    if (formData.rules.length > 1) {
      setFormData((prev) => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAIQueryResult = (rules) => {
    setFormData((prev) => ({
      ...prev,
      rules: rules,
    }));
    setShowAIQuery(false);
  };

  const filteredSegments = (segments || []).filter(
    (segment) =>
      segment.name &&
      segment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateEstimatedSize = () => {
    // Mock calculation - in real app, this would call the backend
    return Math.floor(Math.random() * 2000) + 100;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Audience Builder
        </h1>
        <p className="text-gray-600">
          Create and manage customer segments using advanced rule-based logic.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAIQuery(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Users size={20} />
            Ask AI
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Segment
          </button>
        </div>
      </div>

      {/* AI Query Modal */}
      {showAIQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Audience Query</h2>
              <button
                onClick={() => setShowAIQuery(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <NaturalLanguageQuery onResult={handleAIQueryResult} />
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingSegment ? "Edit Segment" : "Create New Segment"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Segment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., High Value Customers"
                required
              />
            </div>

            {/* Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segment Rules
              </label>

              {formData.rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 mb-2 p-3 bg-gray-50 rounded-lg"
                >
                  {index > 0 && (
                    <select
                      value={rule.logic}
                      onChange={(e) =>
                        updateRule(index, "logic", e.target.value)
                      }
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}

                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(index, "field", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Field</option>
                    <option value="totalSpent">Total Spent</option>
                    <option value="orderCount">Order Count</option>
                    <option value="lastPurchase">Last Purchase</option>
                    <option value="lastLogin">Last Login</option>
                    <option value="visits">Visits</option>
                    <option value="age">Age</option>
                    <option value="location">Location</option>
                    <option value="signupDate">Signup Date</option>
                    <option value="customerLifetimeValue">Customer Lifetime Value</option>
                  </select>

                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(index, "operator", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Operator</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">=</option>
                    <option value="!=">!=</option>
                  </select>

                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateRule(index, "value", e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Value"
                    required
                  />

                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addRule}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Add Rule
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={20} />
                {isLoading
                  ? "Saving..."
                  : editingSegment
                  ? "Update"
                  : "Create"}{" "}
                Segment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Segments List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Audience Segments</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading segments...</p>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No segments found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "No segments match your search."
                : "Get started by creating your first audience segment."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Segment
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSegments.map((segment) => (
              <div
                key={segment._id || segment.id}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {segment.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {segment.rules?.length || 0} rule(s) • Est.{" "}
                      {segment.estimatedSize?.toLocaleString() || "0"} customers
                    </p>

                    {/* Rules Preview */}
                    <div className="text-xs text-gray-500">
                      {segment.rules?.map((rule, index) => (
                        <span key={index}>
                          {index > 0 && ` ${rule.logic} `}
                          {rule.field} {rule.operator} {rule.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditSegment(segment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteSegment(segment._id || segment.id)
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceBuilder;
