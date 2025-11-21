import { useState } from 'react';
import { Eye, Check, Calendar, User, Video, Copy, ExternalLink } from 'lucide-react';
import { createCalendar, updateCalendarDays, publishCalendar, updateSurpriseVideos, createChildProfile } from '../../../lib/api';

export interface PreviewPublishData {
  published: boolean;
  shareUrl?: string;
}

interface PreviewPublishStepProps {
  onComplete: (data: PreviewPublishData) => void;
  wizardData?: {
    childProfile?: {
      name: string;
      persona: string;
      theme: string;
      hasPhoto: boolean;
    };
    dailyEntries?: {
      totalDays: number;
      completedDays: number;
      daysWithPhotos: number;
      daysWithMessages: number;
    } | any[];
    surpriseVideos?: {
      count: number;
      urls: string[];
    } | string[];
    theme?: string;
  };
}

export function PreviewPublishStep({ onComplete, wizardData }: PreviewPublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Mock data - in a real implementation, this would come from the wizard state
  const getDailyEntriesData = () => {
    if (wizardData?.dailyEntries && !Array.isArray(wizardData.dailyEntries)) {
      return wizardData.dailyEntries;
    }
    return {
      totalDays: 24,
      completedDays: 18,
      daysWithPhotos: 12,
      daysWithMessages: 18,
    };
  };

  const getSurpriseVideosData = () => {
    if (wizardData?.surpriseVideos && !Array.isArray(wizardData.surpriseVideos)) {
      return wizardData.surpriseVideos;
    }
    return {
      count: 3,
      urls: [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=oHg5SJYRHA0',
        'https://www.youtube.com/watch?v=9bZkp7q19f0',
      ],
    };
  };

  const previewData = {
    childProfile: wizardData?.childProfile || {
      name: 'Alex',
      persona: 'Daddy',
      theme: 'Snow ❄️',
      hasPhoto: true,
    },
    dailyEntries: getDailyEntriesData(),
    surpriseVideos: getSurpriseVideosData(),
  };

  const handlePublish = async () => {
    if (!wizardData) return;

    setIsPublishing(true);

    try {
      // Step 1: Create or update child profile
      const childProfileData = {
        child_name: wizardData.childProfile.childName,
        chat_persona: wizardData.childProfile.chatPersona,
        custom_chat_prompt: wizardData.childProfile.customPrompt || undefined,
        theme: wizardData.selectedTheme,
        hero_photo_url: wizardData.childProfile.heroPhotoPreview || undefined,
      };

      const childResult = await createChildProfile(childProfileData);

      // Step 2: Create calendar
      const currentYear = new Date().getFullYear();
      const calendarResult = await createCalendar({
        child_id: childResult.child_id,
        year: currentYear,
      });

      // Step 3: Update calendar days
      const calendarDays = wizardData.dailyEntries.map((entry, index) => ({
        day_number: index + 1,
        title: entry.title || `Day ${index + 1}`,
        message: entry.message,
        photo_asset_id: entry.photoPreview || undefined,
        voice_asset_id: undefined, // Not implemented yet
        music_asset_id: undefined, // Not implemented yet
        confetti_type: 'snow' as const, // Default for now
        unlock_effect: 'snowstorm' as const, // Default for now
      }));

      await updateCalendarDays(calendarResult.calendar_id, calendarDays);

      // Step 4: Update surprise videos
      const youtubeUrls = wizardData.surpriseVideos
        .map(video => video.url)
        .filter(url => url && url.trim().length > 0);

      if (youtubeUrls.length > 0) {
        await updateSurpriseVideos(calendarResult.calendar_id, youtubeUrls);
      }

      // Step 5: Publish calendar
      const publishResult = await publishCalendar(calendarResult.calendar_id);

      // Generate share URL
      const shareUrl = `${window.location.origin}/calendar/${publishResult.share_uuid}`;

      setPublished(true);
      setShareUrl(shareUrl);
      onComplete({ published: true, shareUrl });
    } catch (error) {
      console.error('Failed to publish calendar:', error);
      // TODO: Show error message to user
      alert('Failed to publish calendar. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const openCalendar = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Publish</h2>
        <p className="text-gray-600">Review your calendar configuration and publish it for your child to enjoy.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Eye className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Ready to publish?</strong> Once published, your child will be able to access their magical advent calendar.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Calendar Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Child Profile */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Child Profile</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {previewData.childProfile.name}</p>
              <p><span className="font-medium">Persona:</span> {previewData.childProfile.persona}</p>
              <p><span className="font-medium">Theme:</span> {previewData.childProfile.theme}</p>
              <p><span className="font-medium">Photo:</span> {previewData.childProfile.hasPhoto ? '✅ Added' : '❌ Not added'}</p>
            </div>
          </div>

          {/* Daily Entries */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Daily Entries</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Total Days:</span> {previewData.dailyEntries.totalDays}</p>
              <p><span className="font-medium">Completed:</span> {previewData.dailyEntries.completedDays}/24</p>
              <p><span className="font-medium">With Photos:</span> {previewData.dailyEntries.daysWithPhotos}</p>
              <p><span className="font-medium">With Messages:</span> {previewData.dailyEntries.daysWithMessages}</p>
            </div>
          </div>

          {/* Surprise Videos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Video className="w-5 h-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Surprise Videos</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Videos:</span> {previewData.surpriseVideos.count}</p>
              <div className="mt-2 space-y-1">
                {previewData.surpriseVideos.urls.slice(0, 2).map((url, index) => (
                  <p key={index} className="text-xs text-gray-600 truncate" title={url}>
                    • {url.split('v=')[1]?.split('&')[0] || 'Video'}
                  </p>
                ))}
                {previewData.surpriseVideos.urls.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{previewData.surpriseVideos.urls.length - 2} more
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Calendar Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Status</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Profile Complete</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  previewData.dailyEntries.completedDays > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span>Days Configured</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  previewData.surpriseVideos.count > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span>Videos Added</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Theme Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Calendar Completion</span>
            <span>{Math.round((previewData.dailyEntries.completedDays / 24) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(previewData.dailyEntries.completedDays / 24) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Publish Actions */}
        <div className="border-t pt-6">
          {!published ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Ready to Publish?</h4>
                <p className="text-sm text-gray-600">
                  Your child will receive a magical link to access their advent calendar.
                </p>
              </div>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Publish Calendar
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Calendar Published!</h4>
                <p className="text-gray-600 mb-6">
                  Your advent calendar is now live. Share this magical link with your child.
                </p>
              </div>

              {/* Share Link */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm text-gray-600 mb-1">Share Link</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{shareUrl}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={openCalendar}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                🎄 Happy holidays! Your child will love opening their magical advent calendar. 🎄
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {!published && (
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-500 self-center">
            Complete the publishing process above
          </div>
        </div>
      )}
    </div>
  );
}