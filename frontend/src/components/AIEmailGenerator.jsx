import React, { useState } from 'react';
import { 
  Wand2, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  MessageSquare,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

const AIEmailGenerator = ({ isOpen, onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('general');
  const [goal, setGoal] = useState('engagement');
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const tones = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'urgent', label: 'Urgent', icon: '⚡' },
    { value: 'casual', label: 'Casual', icon: '👋' }
  ];

  const audiences = [
    { value: 'general', label: 'General Audience', icon: '👥' },
    { value: 'new_customers', label: 'New Customers', icon: '🆕' },
    { value: 'vip', label: 'VIP Customers', icon: '⭐' },
    { value: 'inactive', label: 'Inactive Users', icon: '💤' }
  ];

  const goals = [
    { value: 'engagement', label: 'Increase Engagement', icon: '❤️' },
    { value: 'sales', label: 'Drive Sales', icon: '💰' },
    { value: 'retention', label: 'Improve Retention', icon: '🔒' },
    { value: 'awareness', label: 'Brand Awareness', icon: '📢' }
  ];

  const generateEmailContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-generated content based on inputs
    const templates = {
      professional: {
        engagement: {
          subject: "Exciting updates from our team",
          body: `Dear Valued Customer,

We hope this email finds you well. We wanted to share some exciting updates about our latest features and improvements.

${prompt}

We've been working tirelessly to enhance your experience, and we believe these updates will add significant value to your daily operations.

Key highlights:
• Enhanced user interface for better navigation
• Improved performance and reliability
• New analytics dashboard for better insights

We'd love to hear your thoughts and feedback on these improvements.

Best regards,
The Team`
        },
        sales: {
          subject: "Exclusive offer just for you",
          body: `Dear Valued Customer,

We have an exclusive opportunity that we believe aligns perfectly with your needs.

${prompt}

This limited-time offer includes:
• 25% discount on premium features
• Priority customer support
• Extended trial period

This offer is valid until the end of this month. We believe this will provide excellent value for your business.

To take advantage of this offer, simply click the link below or contact our sales team.

Best regards,
Sales Team`
        }
      },
      friendly: {
        engagement: {
          subject: "Hey! We've got some awesome news 🎉",
          body: `Hi there!

Hope you're having a great day! We've been cooking up something special and can't wait to share it with you.

${prompt}

Here's what's new:
🚀 Lightning-fast performance improvements
📊 Beautiful new analytics dashboard  
🎨 Fresh, modern design updates

We think you're going to love these changes! Give them a try and let us know what you think.

Cheers!
Your friends at the team`
        },
        sales: {
          subject: "Something special for you! 🎁",
          body: `Hey!

We've got something super exciting to share with you today!

${prompt}

Here's what you get:
🎯 25% off premium features
⚡ Lightning-fast support
🚀 Early access to new features

This deal won't last long, so don't miss out! 

Ready to upgrade? Just hit the button below!

Talk soon!
The Team`
        }
      }
    };

    const template = templates[tone]?.[goal] || templates.professional.engagement;
    
    setGeneratedEmail({
      subject: template.subject,
      body: template.body,
      tone,
      audience,
      goal
    });
    
    setIsGenerating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const applyGenerated = () => {
    if (generatedEmail && onApply) {
      onApply({
        subject: generatedEmail.subject,
        content: { body: generatedEmail.body }
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Wand2 className="text-purple-600 mr-2" size={24} />
            <h2 className="text-xl font-semibold">AI Email Generator</h2>
            <Sparkles className="text-yellow-500 ml-2" size={20} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your email about?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your email content... (e.g., 'Announcing our new product launch with special pricing')"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      tone === t.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{t.icon}</div>
                    <div className="text-sm font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {audiences.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAudience(a.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      audience === a.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{a.icon}</div>
                    <div className="text-sm font-medium">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      goal === g.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{g.icon}</div>
                    <div className="text-sm font-medium">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateEmailContent}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={16} />
                  Generate Email
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Generated Email
            </h3>

            {isGenerating && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="text-center mt-4 text-purple-600">
                  AI is crafting your perfect email...
                </div>
              </div>
            )}

            {generatedEmail && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Subject Line</label>
                    <button
                      onClick={() => copyToClipboard(generatedEmail.subject)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="font-medium">{generatedEmail.subject}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Email Body</label>
                    <button
                      onClick={() => copyToClipboard(generatedEmail.body)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 max-h-64 overflow-y-auto">
                    {generatedEmail.body}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={applyGenerated}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Apply to Campaign
                  </button>
                  <button
                    onClick={generateEmailContent}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    <RefreshCw className="mr-2" size={16} />
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {!generatedEmail && !isGenerating && (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                <Wand2 className="mx-auto mb-4 text-gray-400" size={48} />
                <p>Enter your email details and click "Generate Email" to see AI-powered content suggestions!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmailGenerator;
