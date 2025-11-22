import { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ProductType, Template } from '../../../lib/api';
import { httpClient } from '../../../lib/httpClient';
import { isTemplateAIFlowEnabled } from '../../../lib/featureFlags';

interface ContentGenerationStepProps {
  selectedProductType: ProductType | null;
  selectedTemplate: Template | null;
  customData: Record<string, unknown>;
  calendarId?: string;
  onGenerationComplete: () => void;
}

interface GenerationResult {
  calendar_id: string;
  generated_days: number;
  chat_persona_prompt: string;
  surprise_urls: string[];
}

export function ContentGenerationStep({
  selectedProductType,
  selectedTemplate,
  customData,
  calendarId,
  onGenerationComplete
}: ContentGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const handleGenerateContent = async () => {
    if (!selectedTemplate || !calendarId) {
      setError('Template and calendar information is required');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress('Initializing AI generation...');

    const maxRetries = 2;
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        setGenerationProgress(
          currentRetry === 0
            ? 'Generating personalized content...'
            : `Retrying generation (attempt ${currentRetry + 1}/${maxRetries + 1})...`
        );

        const response = await httpClient.post<GenerationResult>(
          `/calendars/${calendarId}/generate-content`,
          {
            template_id: selectedTemplate.id,
            custom_data: customData
          }
        );

        setGenerationResult(response);
        setHasGenerated(true);
        setGenerationProgress('Content generated successfully!');
        onGenerationComplete();
        return;
      } catch (err: any) {
        const isRetryableError = err.response?.status >= 500 || err.code === 'NETWORK_ERROR' || !err.response;

        if (currentRetry < maxRetries && isRetryableError) {
          currentRetry++;
          setGenerationProgress(`Generation failed, retrying in ${currentRetry * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, currentRetry * 2000));
          continue;
        }

        // Final failure
        let userFriendlyError = 'Failed to generate content. Please try again.';

        if (err.response?.status === 400) {
          userFriendlyError = 'Invalid template data. Please check your custom data and try again.';
        } else if (err.response?.status === 429) {
          userFriendlyError = 'AI service is busy. Please wait a moment and try again.';
        } else if (err.response?.status >= 500) {
          userFriendlyError = 'AI service temporarily unavailable. Please try again later.';
        } else if (!err.response) {
          userFriendlyError = 'Network error. Please check your connection and try again.';
        }

        setError(`${userFriendlyError}${currentRetry > 0 ? ` (after ${currentRetry + 1} attempts)` : ''}`);
        setGenerationProgress('');
        break;
      }
    }

    setIsGenerating(false);
  };

  if (!isTemplateAIFlowEnabled()) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Generation</h2>
          <p className="text-gray-600">AI-powered content generation is currently disabled.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              Template-based AI content generation is not enabled. You can proceed to manually create content.
            </p>
          </div>
        </div>
        <button
          onClick={onGenerationComplete}
          className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue to Preview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your Content</h2>
        <p className="text-gray-600">
          Use AI to automatically create personalized content for your {selectedProductType?.name || 'product'} based on your template and custom data.
        </p>
      </div>

      {/* Template Summary */}
      {selectedTemplate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Selected Template</h3>
          <p className="text-sm text-gray-600">{selectedTemplate.name}</p>
          <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
        </div>
      )}

      {/* Custom Data Summary */}
      {Object.keys(customData).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Custom Data</h3>
          <div className="space-y-1">
            {Object.entries(customData).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-700">{key}:</span>{' '}
                <span className="text-gray-600">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Preview */}
      {selectedTemplate && Object.keys(customData).length > 0 && !hasGenerated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">What Your Template Will Generate</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Template:</strong> {selectedTemplate.name} - {selectedTemplate.description}
                </p>
                <p>
                  <strong>Personalization:</strong> Using your custom data to create unique, personalized content for each of the 24 days.
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-300">
                  <p className="font-medium mb-2">Sample Generated Content:</p>
                  <div className="space-y-2 text-xs">
                    <p><strong>Day 1:</strong> "Good morning, {String(customData.child_name || 'your child')}! Today marks the beginning of our magical Christmas adventure..."</p>
                    <p><strong>Day 12:</strong> "Halfway through our journey, {String(customData.child_name || 'your child')}! Remember that special {customData.special_memory ? 'memory of ' + String(customData.special_memory) : 'Christmas memory'}..."</p>
                    <p><strong>Day 24:</strong> "Merry Christmas, {String(customData.child_name || 'your child')}! What a wonderful adventure we've had together..."</p>
                  </div>
                </div>
                <p className="text-blue-700">
                  <strong>AI will create:</strong> 24 unique personalized messages, chat persona settings, and surprise content recommendations based on your template and custom data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Button */}
      {!hasGenerated && (
        <div className="text-center space-y-4">
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating || !selectedTemplate || !calendarId}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                {generationProgress || 'Generating Content...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate AI Content
              </>
            )}
          </button>

          {/* Progress indicator during generation */}
          {isGenerating && generationProgress && (
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-600">{generationProgress}</p>
            </div>
          )}

          {!isGenerating && (
            <p className="text-sm text-gray-500">
              This will create personalized messages and content for all days
            </p>
          )}
        </div>
      )}

      {/* Generation Result */}
      {hasGenerated && generationResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-800">Content Generated Successfully!</h3>
          </div>
          <div className="space-y-2 text-sm text-green-700">
            <p>• Generated content for {generationResult.generated_days} days</p>
            <p>• Chat persona prompt configured</p>
            {generationResult.surprise_urls.length > 0 && (
              <p>• {generationResult.surprise_urls.length} surprise content items prepared</p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {hasGenerated && (
        <div className="text-center">
          <button
            onClick={onGenerationComplete}
            className="w-full bg-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue to Preview
          </button>
        </div>
      )}
    </div>
  );
}