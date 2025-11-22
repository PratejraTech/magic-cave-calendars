import { useState, useCallback, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabase } from '../../../../app/providers/SupabaseProvider';

export interface DayEntry {
  dayNumber: number;
  title: string;
  photo: File | null;
  photoUrl: string;
  message: string;
  isValid: boolean;
  isSaved: boolean;
}

interface DayCardProps {
  dayEntry: DayEntry;
  onUpdate: (updates: Partial<DayEntry>) => void;
  onPhotoUpload?: (dayNumber: number, photoUrl: string) => void;
}

export function DayCard({ dayEntry, onUpdate, onPhotoUpload }: DayCardProps) {
  const supabase = useSupabase();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Generate preview when photo changes
  useEffect(() => {
    if (dayEntry.photo) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(dayEntry.photo);
    } else if (dayEntry.photoUrl) {
      setPhotoPreview(dayEntry.photoUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [dayEntry.photo, dayEntry.photoUrl]);

  const validatePhotoFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'Image file must be less than 5MB';
    }

    // Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return 'Please use JPG, PNG, or WebP images';
    }

    return null;
  };

  const uploadPhoto = async (file: File, retryCount = 0): Promise<string> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `day-${dayEntry.dayNumber}-${Date.now()}.${fileExt}`;
      const filePath = `calendar-photos/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: unknown) {
      if (retryCount < maxRetries && (
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.code === 'NETWORK_ERROR'
      )) {
        // TODO: Implement proper logging service
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return uploadPhoto(file, retryCount + 1);
      }
      throw error;
    }
  };

  const handlePhotoSelect = useCallback(async (file: File) => {
    const error = validatePhotoFile(file);
    if (error) {
      setPhotoError(error);
      return;
    }

    setPhotoError(null);
    setIsUploading(true);

    try {
      const photoUrl = await uploadPhoto(file);
      onUpdate({ photo: file, photoUrl });
      onPhotoUpload?.(dayEntry.dayNumber, photoUrl);
    } catch (error: unknown) {
      // TODO: Implement proper logging service
      setPhotoError(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  }, [dayEntry.dayNumber, onUpdate, onPhotoUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handlePhotoSelect(files[0]);
    }
  }, [handlePhotoSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handlePhotoSelect(files[0]);
    }
  }, [handlePhotoSelect]);

  const removePhoto = useCallback(() => {
    onUpdate({ photo: null, photoUrl: '' });
    setPhotoPreview(null);
    setPhotoError(null);
  }, [onUpdate]);

  const handleTitleChange = useCallback((title: string) => {
    onUpdate({ title });
  }, [onUpdate]);

  const handleMessageChange = useCallback((message: string) => {
    const isValid = message.trim().length > 0;
    onUpdate({ message, isValid });
  }, [onUpdate]);

  const isComplete = dayEntry.isValid && (photoPreview || dayEntry.photoUrl);

  return (
    <div
      className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-4 hover:border-pink-300 transition-colors focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2"
      role="region"
      aria-labelledby={`day-${dayEntry.dayNumber}-heading`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-sm">{dayEntry.dayNumber}</span>
          </div>
          <h3
            id={`day-${dayEntry.dayNumber}-heading`}
            className="font-medium text-gray-900"
          >
            Day {dayEntry.dayNumber}
          </h3>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-1" role="status" aria-live="polite">
          {isComplete ? (
            <CheckCircle
              className="w-5 h-5 text-green-500"
              aria-label="Day complete"
              role="img"
            />
          ) : dayEntry.message.trim() ? (
            <AlertCircle
              className="w-5 h-5 text-yellow-500"
              aria-label="Day has message but missing photo"
              role="img"
            />
          ) : null}
        </div>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor={`title-${dayEntry.dayNumber}`} className="block text-sm font-medium text-gray-700">
          Title (Optional)
        </label>
        <input
          id={`title-${dayEntry.dayNumber}`}
          type="text"
          value={dayEntry.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm border-gray-300"
          placeholder={`Day ${dayEntry.dayNumber}`}
          maxLength={100}
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <label
          htmlFor={`photo-upload-${dayEntry.dayNumber}`}
          className="block text-sm font-medium text-gray-700"
        >
          Photo (Optional)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 ${
            isDragOver
              ? 'border-pink-400 bg-pink-50'
              : photoPreview
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const fileInput = document.getElementById(`photo-upload-${dayEntry.dayNumber}`) as HTMLInputElement;
              fileInput?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Upload photo for day ${dayEntry.dayNumber}. ${photoPreview ? 'Photo uploaded' : 'Drop photo here or click to browse'}`}
        >
          {photoPreview ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt={`Day ${dayEntry.dayNumber} photo`}
                  className="w-16 h-16 object-cover rounded-lg mx-auto"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600">Photo uploaded</p>
            </div>
          ) : isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-xs text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-5 h-5 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-600">Drop photo here</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id={`photo-upload-${dayEntry.dayNumber}`}
                disabled={isUploading}
              />
              <label
                htmlFor={`photo-upload-${dayEntry.dayNumber}`}
                className="text-xs text-pink-600 hover:text-pink-700 cursor-pointer"
              >
                or browse
              </label>
            </div>
          )}
        </div>
        {photoError && (
          <p className="text-xs text-red-600">{photoError}</p>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label htmlFor={`message-${dayEntry.dayNumber}`} className="block text-sm font-medium text-gray-700">
          Message <span className="text-red-500" aria-label="required">*</span>
        </label>
        <textarea
          id={`message-${dayEntry.dayNumber}`}
          value={dayEntry.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none text-sm ${
            !dayEntry.isValid && dayEntry.message.trim() === '' ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={`Write a special message for day ${dayEntry.dayNumber}...`}
          rows={3}
          maxLength={1000}
          aria-describedby={`message-error-${dayEntry.dayNumber} message-count-${dayEntry.dayNumber}`}
          aria-invalid={!dayEntry.isValid && dayEntry.message.trim() === ''}
          required
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span
            id={`message-error-${dayEntry.dayNumber}`}
            className={!dayEntry.isValid && dayEntry.message.trim() === '' ? 'text-red-600' : 'sr-only'}
            role={!dayEntry.isValid && dayEntry.message.trim() === '' ? 'alert' : undefined}
            aria-live="polite"
          >
            {!dayEntry.isValid && dayEntry.message.trim() === '' && 'Message is required'}
          </span>
          <span
            id={`message-count-${dayEntry.dayNumber}`}
            className="ml-auto"
            aria-label={`${dayEntry.message.length} of 1000 characters used`}
          >
            {dayEntry.message.length}/1000
          </span>
        </div>
      </div>
    </div>
  );
}
