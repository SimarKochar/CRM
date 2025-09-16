import React, { useState } from "react";
import {
  MessageSquare,
  Wand2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const NaturalLanguageQuery = ({ onRulesGenerated, isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedRules, setGeneratedRules] = useState(null);
  const [examples] = useState([
    "People who haven't shopped in 6 months and spent over $500",
    "Customers from California who bought electronics in the last 30 days",
    "VIP customers who opened emails but didn't click any links",
    "New users who signed up this month but haven't made a purchase",
    "High-value customers who spent more than $1000 last year",
  ]);

  const parseNaturalLanguage = async (text) => {
    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // AI-powered natural language parsing (simulated)
    const rules = [];
    const lowerText = text.toLowerCase();

    // Parse time-based conditions
    if (lowerText.includes("haven't") && lowerText.includes("month")) {
      const monthMatch = lowerText.match(/(\d+)\s*month/);
      const months = monthMatch ? parseInt(monthMatch[1]) : 6;
      rules.push({
        field: "lastPurchaseDate",
        operator: "before",
        value: `${months} months ago`,
        logic: "and",
      });
    }

    // Parse spending conditions
    if (lowerText.includes("spent") || lowerText.includes("spend")) {
      const amountMatch = lowerText.match(
        /[\$₹]?(\d+(?:,\d{3})*(?:\.\d{2})?)[k]?/
      );
      if (amountMatch) {
        let amount = amountMatch[1].replace(/,/g, "");
        if (lowerText.includes("k")) amount = parseFloat(amount) * 1000;

        const operator =
          lowerText.includes("over") || lowerText.includes("more than")
            ? "greater_than"
            : lowerText.includes("under") || lowerText.includes("less than")
            ? "less_than"
            : "equals";

        rules.push({
          field: "totalSpent",
          operator: operator,
          value: amount.toString(),
          logic: rules.length > 0 ? "and" : "",
        });
      }
    }

    // Parse location conditions
    if (lowerText.includes("from ") || lowerText.includes("in ")) {
      const locationMatch = lowerText.match(
        /(?:from|in)\s+([a-zA-Z\s]+?)(?:\s+who|\s+and|$)/
      );
      if (locationMatch) {
        rules.push({
          field: "location",
          operator: "contains",
          value: locationMatch[1].trim(),
          logic: rules.length > 0 ? "and" : "",
        });
      }
    }

    // Parse category conditions
    if (lowerText.includes("bought") || lowerText.includes("purchased")) {
      const categoryMatch = lowerText.match(
        /(?:bought|purchased)\s+([a-zA-Z\s]+?)(?:\s+in|\s+who|\s+and|$)/
      );
      if (categoryMatch) {
        rules.push({
          field: "category",
          operator: "equals",
          value: categoryMatch[1].trim(),
          logic: rules.length > 0 ? "and" : "",
        });
      }
    }

    // Parse email engagement conditions
    if (lowerText.includes("opened emails") || lowerText.includes("email")) {
      if (
        lowerText.includes("didn't click") ||
        lowerText.includes("no click")
      ) {
        rules.push({
          field: "emailClicks",
          operator: "equals",
          value: "0",
          logic: rules.length > 0 ? "and" : "",
        });
        rules.push({
          field: "emailOpens",
          operator: "greater_than",
          value: "0",
          logic: "and",
        });
      }
    }

    // Parse user status conditions
    if (lowerText.includes("new users") || lowerText.includes("new customer")) {
      rules.push({
        field: "registrationDate",
        operator: "after",
        value: "30 days ago",
        logic: rules.length > 0 ? "and" : "",
      });
    }

    if (lowerText.includes("vip") || lowerText.includes("high-value")) {
      rules.push({
        field: "customerTier",
        operator: "equals",
        value: "VIP",
        logic: rules.length > 0 ? "and" : "",
      });
    }

    // If no rules were parsed, create a default rule
    if (rules.length === 0) {
      rules.push({
        field: "status",
        operator: "equals",
        value: "active",
        logic: "",
      });
    }

    setGeneratedRules(rules);
    setIsProcessing(false);
    return rules;
  };

  const handleGenerate = async () => {
    if (!query.trim()) return;
    await parseNaturalLanguage(query);
  };

  const applyRules = () => {
    if (generatedRules && onRulesGenerated) {
      onRulesGenerated(generatedRules);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <MessageSquare className="text-blue-600 mr-2" size={24} />
            <h2 className="text-xl font-semibold">Natural Language Query</h2>
            <Sparkles className="text-yellow-500 ml-2" size={20} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your audience in plain English
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., People who haven't shopped in 6 months and spent over $500"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Lightbulb className="mr-1" size={16} />
              Example queries:
            </h4>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded border border-blue-200"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!query.trim() || isProcessing}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2" size={16} />
                Generate Rules
              </>
            )}
          </button>

          {isProcessing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                AI is analyzing your query and converting it to rules...
              </div>
            </div>
          )}

          {generatedRules && !isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2" size={20} />
                <span className="font-medium">
                  Rules Generated Successfully!
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  Generated Rules:
                </h4>
                <div className="space-y-2">
                  {generatedRules.map((rule, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {index > 0 && (
                        <span className="text-purple-600 font-medium mr-2 uppercase">
                          {rule.logic}
                        </span>
                      )}
                      <span className="bg-white px-2 py-1 rounded border">
                        {rule.field}
                      </span>
                      <ArrowRight className="mx-2 text-gray-400" size={14} />
                      <span className="bg-white px-2 py-1 rounded border">
                        {rule.operator}
                      </span>
                      <ArrowRight className="mx-2 text-gray-400" size={14} />
                      <span className="bg-white px-2 py-1 rounded border">
                        {rule.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={applyRules}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Apply Rules
                </button>
                <button
                  onClick={() => setQuery("")}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Try Different Query
                </button>
              </div>
            </div>
          )}

          {!generatedRules && !isProcessing && query && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
              <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={16} />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Tips for better results:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>
                    Use specific time periods (e.g., "6 months", "30 days")
                  </li>
                  <li>Include spending amounts with currency symbols</li>
                  <li>Mention specific locations or categories</li>
                  <li>
                    Use clear action words like "bought", "clicked", "opened"
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageQuery;
