import { useState } from 'react';
import { Sparkles, Trash2, Save } from 'lucide-react';
import { httpClient } from '../../../../lib/httpClient';
import { isAiContentGenerationEnabled } from '../../../../lib/featureFlags';
import { DayEntry } from './DayCard';

interface BulkActionsProps {
  dayEntries: DayEntry[];
  onBulkUpdate: (updates: { [dayNumber: number]: Partial<DayEntry> }) => void;
  onSaveAll: () => Promise<void>;
  calendarId: string;
  templateId?: string;
  customData?: Record<string, any>;
}

export function BulkActions({ dayEntries, onBulkUpdate, onSaveAll, calendarId, templateId, customData }: BulkActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateAllMessages = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Use template-based generation if template info is available, otherwise fall back to legacy endpoint
      if (templateId && customData) {
        // Call new AI content generation endpoint
        const response = await httpClient.post(`/calendars/${calendarId}/generate-content`, {
          template_id: templateId,
          custom_data: customData
        }) as { data: { generated_days: number; chat_persona_prompt: string; surprise_urls: string[] } };

        // Refresh the calendar data to get the newly generated content
        // The backend has already updated the calendar days, so we need to reload
        window.location.reload(); // Simple approach - in production, we'd fetch and update the data
      } else {
        // Fallback to legacy generation (if still available)
        setGenerationError('Template information not available. Please ensure you have selected a template.');
      }
    } catch (error: any) {
      // TODO: Implement proper logging service
      setGenerationError(error.response?.data?.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAllPhotos = () => {
    const updates: { [dayNumber: number]: Partial<DayEntry> } = {};
    dayEntries.forEach(entry => {
      if (entry.photo || entry.photoUrl) {
        updates[entry.dayNumber] = {
          photo: null,
          photoUrl: ''
        };
      }
    });
    onBulkUpdate(updates);
  };

  const handleResetAllMessages = () => {
    const updates: { [dayNumber: number]: Partial<DayEntry> } = {};
    dayEntries.forEach(entry => {
      if (entry.message.trim()) {
        updates[entry.dayNumber] = {
          message: '',
          isValid: false
        };
      }
    });
    onBulkUpdate(updates);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveAll();
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyPhotos = dayEntries.some(entry => entry.photo || entry.photoUrl);
  const hasAnyMessages = dayEntries.some(entry => entry.message.trim());
  const hasUnsavedChanges = dayEntries.some(entry => !entry.isSaved && (entry.message.trim() || entry.photo || entry.photoUrl));

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4" role="region" aria-labelledby="bulk-actions-heading">
      <h3 id="bulk-actions-heading" className="text-lg font-medium text-gray-900">Bulk Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* AI Generate Messages */}
        {isAiContentGenerationEnabled() && (
          <button
          onClick={handleGenerateAllMessages}
          disabled={isGenerating}
          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-describedby="generate-messages-description"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
              Generating...
            </>
          ) : (
            <>
               <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
               Generate All Messages
             </>
           )}
         </button>
        )}

        {/* Clear All Photos */}
        <button
          onClick={handleClearAllPhotos}
          disabled={!hasAnyPhotos}
          className="flex items-center justify-center px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-describedby="clear-photos-description"
        >
          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
          Clear All Photos
        </button>

        {/* Reset All Messages */}
        <button
          onClick={handleResetAllMessages}
          disabled={!hasAnyMessages}
          className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-describedby="reset-messages-description"
        >
          <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
          Reset All Messages
        </button>

        {/* Save All Changes */}
        <button
          onClick={handleSaveAll}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center justify-center px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-describedby="save-all-description"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{generationError}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 space-y-1">
        {isAiContentGenerationEnabled() && (
          <p id="generate-messages-description"><strong>AI Generation:</strong> Automatically create personalized messages for all 24 days based on your child's profile and selected template.</p>
        )}
        <p id="clear-photos-description"><strong>Clear Photos:</strong> Remove all uploaded photos from calendar days.</p>
        <p id="reset-messages-description"><strong>Reset Messages:</strong> Clear all message text from calendar days.</p>
        <p id="save-all-description"><strong>Save All:</strong> Manually save all pending changes to the server.</p>
        <p><strong>Auto-save:</strong> Changes are automatically saved after 2 seconds of inactivity.</p>
      </div>
    </div>
  );
}
