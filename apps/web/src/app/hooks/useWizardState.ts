import { useState, useEffect, useCallback } from 'react';
import { ProductType, Template } from '../../lib/api';

export interface ChildProfileData {
  childName: string;
  chatPersona: 'mummy' | 'daddy' | 'custom';
  customPrompt: string;
  heroPhoto: File | null;
  heroPhotoPreview: string | null;
  theme: 'snow' | 'warm' | 'candy' | 'forest' | 'starlight';
}

export interface DailyEntry {
  id: number;
  photo: File | null;
  photoPreview: string | null;
  message: string;
  isGenerating: boolean;
}

export interface SurpriseVideo {
  url: string;
  title?: string;
  thumbnail?: string;
}

export interface WizardState {
  currentStep: number;
  // Product selection
  selectedProductType: ProductType | null;
  selectedTemplate: Template | null;
  customData: Record<string, any>;
  // Legacy calendar fields (for backward compatibility)
  childProfile: ChildProfileData;
  dailyEntries: DailyEntry[];
  surpriseVideos: SurpriseVideo[];
  selectedTheme: 'snow' | 'warm' | 'candy' | 'forest' | 'starlight';
  isDirty: boolean;
  lastSaved: Date | null;
}

const WIZARD_STORAGE_KEY = 'advent-calendar-wizard-state';
const WIZARD_EXPIRY_HOURS = 24;

const defaultChildProfile: ChildProfileData = {
  childName: '',
  chatPersona: 'daddy' as const,
  customPrompt: '',
  heroPhoto: null,
  heroPhotoPreview: null,
  theme: 'snow' as const,
};

const createDefaultDailyEntries = (): DailyEntry[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    photo: null,
    photoPreview: null,
    message: '',
    isGenerating: false,
  }));
};

const defaultWizardState: WizardState = {
  currentStep: 0,
  selectedProductType: null,
  selectedTemplate: null,
  customData: {},
  childProfile: defaultChildProfile,
  dailyEntries: createDefaultDailyEntries(),
  surpriseVideos: [],
  selectedTheme: 'snow',
  isDirty: false,
  lastSaved: null,
};

export function useWizardState() {
  const [state, setState] = useState<WizardState>(defaultWizardState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        const storedTime = new Date(parsedState.lastSaved);
        const now = new Date();
        const hoursDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60 * 60);

        // Only load if less than expiry time
        if (hoursDiff < WIZARD_EXPIRY_HOURS) {
          // Restore File objects from URLs (limited - files can't be fully restored)
          const restoredState: WizardState = {
            ...parsedState,
            lastSaved: storedTime,
            isDirty: false,
          };
          setState(restoredState);
        } else {
          // Expired, clean up
          localStorage.removeItem(WIZARD_STORAGE_KEY);
        }
      }
    } catch (error) {
      // Warning handled silently - could implement fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Auto-save to localStorage when state changes
  const saveState = useCallback((newState: WizardState) => {
    try {
      const stateToSave = {
        ...newState,
        lastSaved: new Date(),
        // Don't save File objects or blob URLs
        childProfile: {
          ...newState.childProfile,
          heroPhoto: null,
          heroPhotoPreview: null,
        },
        dailyEntries: newState.dailyEntries.map(entry => ({
          ...entry,
          photo: null,
          photoPreview: null,
        })),
        // Don't save complex objects that can't be serialized
        selectedProductType: newState.selectedProductType,
        selectedTemplate: newState.selectedTemplate,
        customData: newState.customData,
      };
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      // Warning handled silently - could implement retry logic
    }
  }, []);

  // Update state and mark as dirty
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates, isDirty: true };
      // Auto-save after a short delay to avoid excessive saves
      setTimeout(() => saveState(newState), 500);
      return newState;
    });
  }, [saveState]);

  // Clear state (for after successful publish)
  const clearState = useCallback(() => {
    setState(defaultWizardState);
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  }, []);

  // Mark as saved (after successful API call)
  const markSaved = useCallback(() => {
    setState(prevState => {
      const newState = { ...prevState, isDirty: false, lastSaved: new Date() };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  return {
    state,
    isLoaded,
    updateState,
    clearState,
    markSaved,
  };
}