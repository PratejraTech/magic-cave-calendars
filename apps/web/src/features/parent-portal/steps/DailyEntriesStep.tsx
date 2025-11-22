import { useState, useCallback, useEffect, useRef } from 'react';
import { DayCard, DayEntry } from './components/DayCard';
import { BulkActions } from './components/BulkActions';
import { httpClient } from '../../../lib/httpClient';

export interface DailyEntriesData {
  calendarId: string;
  dayEntries: DayEntry[];
}

interface DailyEntriesStepProps {
  calendarId: string;
  onNext: (data: DailyEntriesData) => void;
  onDataChange?: (data: DailyEntriesData) => void;
  initialData?: Partial<DailyEntriesData>;
}

export function DailyEntriesStep({ calendarId, onNext, onDataChange, initialData }: DailyEntriesStepProps) {
  // Initialize 24 day entries
  const initializeDayEntries = useCallback((): DayEntry[] => {
    const entries: DayEntry[] = [];
    for (let i = 1; i <= 24; i++) {
      const existingEntry = initialData?.dayEntries?.find(entry => entry.dayNumber === i);
      entries.push({
        dayNumber: i,
        title: existingEntry?.title || `Day ${i}`,
        photo: null,
        photoUrl: existingEntry?.photoUrl || '',
        message: existingEntry?.message || '',
        isValid: (existingEntry?.message || '').trim().length > 0,
        isSaved: existingEntry?.isSaved || false
      });
    }
    return entries;
  }, [initialData]);

  const [dayEntries, setDayEntries] = useState<DayEntry[]>(initializeDayEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<any>(null);

  // Debounced auto-save refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Set<number>>(new Set());

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update parent component when data changes
  useEffect(() => {
    onDataChange?.({ calendarId, dayEntries });
  }, [calendarId, dayEntries, onDataChange]);

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!calendarId) return;

      setIsLoading(true);
      try {
        // Load calendar metadata and days
        const [calendarResponse, daysResponse] = await Promise.all([
          httpClient.get(`/calendars/${calendarId}`),
          httpClient.get(`/calendars/${calendarId}/days`)
        ]);

        const calendar = calendarResponse.data;
        const existingDays = daysResponse.data.days || [];

        setCalendarData(calendar);

        setDayEntries(prevEntries =>
          prevEntries.map(entry => {
            const existingDay = existingDays.find((day: any) => day.day_number === entry.dayNumber);
            if (existingDay) {
              return {
                ...entry,
                title: existingDay.title || entry.title,
                photoUrl: existingDay.photo_asset_id || '',
                message: existingDay.text_content || '',
                isValid: (existingDay.text_content || '').trim().length > 0,
                isSaved: true
              };
            }
            return entry;
          })
        );
      } catch (error: any) {
        // TODO: Implement proper logging service
        // Don't show error for loading - just use initial state
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [calendarId]);

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(async () => {
    if (pendingChangesRef.current.size === 0) return;

    try {
      const changedDays = Array.from(pendingChangesRef.current);
      const payload = {
        days: dayEntries
          .filter(entry => changedDays.includes(entry.dayNumber))
          .map(entry => ({
            day_number: entry.dayNumber,
            title: entry.title,
            photo_asset_id: entry.photoUrl || null,
            text_content: entry.message.trim()
          }))
      };

      await httpClient.put(`/calendars/${calendarId}/days`, payload);

      // Mark changed days as saved
      setDayEntries(prevEntries =>
        prevEntries.map(entry =>
          changedDays.includes(entry.dayNumber)
            ? { ...entry, isSaved: true }
            : entry
        )
      );

      pendingChangesRef.current.clear();
      setSaveError(null);
    } catch (error: any) {
      // TODO: Implement proper logging service
      // Don't show error for auto-save failures, just retry later
    }
  }, [calendarId, dayEntries]);

  // Schedule auto-save with debounce
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedAutoSave();
    }, 2000); // 2 second debounce
  }, [debouncedAutoSave]);

  const handleDayUpdate = useCallback((dayNumber: number, updates: Partial<DayEntry>) => {
    setDayEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.dayNumber === dayNumber
          ? { ...entry, ...updates, isSaved: false }
          : entry
      )
    );

    // Track pending changes for auto-save
    pendingChangesRef.current.add(dayNumber);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleBulkUpdate = useCallback((updates: { [dayNumber: number]: Partial<DayEntry> }) => {
    setDayEntries(prevEntries =>
      prevEntries.map(entry => {
        const update = updates[entry.dayNumber];
        return update ? { ...entry, ...update, isSaved: false } : entry;
      })
    );
  }, []);

  const handlePhotoUpload = useCallback((dayNumber: number, photoUrl: string) => {
    // Mark as saved since photo upload happens immediately
    setDayEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.dayNumber === dayNumber
          ? { ...entry, photoUrl, isSaved: true }
          : entry
      )
    );
  }, []);

  const handleSaveAll = useCallback(async () => {
    setSaveError(null);

    try {
      const payload = {
        days: dayEntries.map(entry => ({
          day_number: entry.dayNumber,
          title: entry.title,
          photo_asset_id: entry.photoUrl || null,
          text_content: entry.message.trim()
        }))
      };

      await httpClient.put(`/calendars/${calendarId}/days`, payload);

      // Mark all entries as saved
      setDayEntries(prevEntries =>
        prevEntries.map(entry => ({ ...entry, isSaved: true }))
      );
    } catch (error: any) {
      // TODO: Implement proper logging service
      setSaveError(error.response?.data?.message || 'Failed to save changes. Please try again.');
      throw error; // Re-throw to let BulkActions handle the error state
    }
  }, [calendarId, dayEntries]);

  const handleNext = async () => {
    // Ensure all changes are saved before proceeding
    if (dayEntries.some(entry => !entry.isSaved)) {
      await handleSaveAll();
    }

    onNext({ calendarId, dayEntries });
  };

  // Calculate completion stats
  const completedDays = dayEntries.filter(entry => entry.isValid).length;
  const totalDays = dayEntries.length;
  const isFormValid = completedDays === totalDays;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Daily Entries</h2>
        <p className="text-gray-600 mb-4">
          Fill in each of the 24 days with a special message and optional photo for your child.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-pink-50 rounded-lg">
          <span className="text-sm font-medium text-pink-800">
            {completedDays} of {totalDays} days completed
          </span>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        dayEntries={dayEntries}
        onBulkUpdate={handleBulkUpdate}
        onSaveAll={handleSaveAll}
        calendarId={calendarId}
        templateId={calendarData?.template_id}
        customData={calendarData?.custom_data}
      />

      {/* Error Display */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{saveError}</p>
        </div>
      )}

      {/* Day Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {dayEntries.map((entry) => (
          <DayCard
            key={entry.dayNumber}
            dayEntry={entry}
            onUpdate={(updates) => handleDayUpdate(entry.dayNumber, updates)}
            onPhotoUpload={handlePhotoUpload}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Child Profile
        </button>

        <div className="flex items-center space-x-4">
          {!isFormValid && (
            <p className="text-sm text-red-600">
              Please complete all {totalDays - completedDays} remaining days
            </p>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Next: Choose Theme</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
