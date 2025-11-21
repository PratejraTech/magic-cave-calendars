import { useState } from 'react';
import { Video, Upload, X } from 'lucide-react';

export interface SurpriseData {
  youtubeUrls: string[];
}

interface SurpriseStepProps {
  onNext: (data: SurpriseData) => void;
  onDataChange?: (data: SurpriseData) => void;
  initialData?: Partial<SurpriseData>;
}

export function SurpriseStep({ onNext, onDataChange, initialData }: SurpriseStepProps) {
  const [videoUrls, setVideoUrls] = useState<string[]>(initialData?.youtubeUrls || []);
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/,
      /(?:https?:\/\/)?kids\.youtube\.com\/watch\?v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    if (!url.startsWith('https://')) {
      return false;
    }

    const videoId = extractYouTubeId(url);
    return videoId !== null;
  };

  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const addVideoUrl = () => {
    const trimmedUrl = newUrl.trim();

    if (!trimmedUrl) {
      setUrlError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(trimmedUrl)) {
      setUrlError('Please enter a valid YouTube or YouTube Kids URL (must start with https://)');
      return;
    }

    if (videoUrls.includes(trimmedUrl)) {
      setUrlError('This video has already been added');
      return;
    }

    const updatedUrls = [...videoUrls, trimmedUrl];
    setVideoUrls(updatedUrls);
    setNewUrl('');
    setUrlError('');
    onDataChange?.({ youtubeUrls: updatedUrls });
  };

  const removeVideoUrl = (urlToRemove: string) => {
    const updatedUrls = videoUrls.filter(url => url !== urlToRemove);
    setVideoUrls(updatedUrls);
    onDataChange?.({ youtubeUrls: updatedUrls });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addVideoUrl();
    }
  };

  const handleNext = () => {
    onNext({ youtubeUrls: videoUrls });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Surprise Videos</h2>
        <p className="text-gray-600">Add YouTube videos that will surprise and delight your child.</p>
        <div className="mt-2 text-sm text-gray-500">
          {videoUrls.length} video{videoUrls.length !== 1 ? 's' : ''} added
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Video className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Supported platforms:</strong> YouTube and YouTube Kids videos only. URLs must start with https://
            </p>
          </div>
        </div>
      </div>

      {/* Add Video Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add YouTube Video URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (urlError) setUrlError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  urlError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                onClick={addVideoUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            {urlError && (
              <p className="mt-1 text-sm text-red-600">{urlError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      {videoUrls.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Added Videos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoUrls.map((url, index) => {
              const videoId = extractYouTubeId(url);
              const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : null;

              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`Video ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          // Fallback to lower quality thumbnail if maxresdefault fails
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('maxresdefault')) {
                            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => removeVideoUrl(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 truncate" title={url}>
                      {url}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {videoUrls.length === 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos added yet</h3>
            <p className="text-gray-600">Add YouTube videos above to create surprise moments for your child.</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          Next: Choose Theme
        </button>
      </div>
    </div>
  );
}