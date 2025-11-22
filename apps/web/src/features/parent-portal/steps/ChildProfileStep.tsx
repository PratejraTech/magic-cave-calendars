import { useState, useCallback, useEffect } from 'react';
import { Upload, User, Heart, Sparkles, X } from 'lucide-react';
import { useSupabase } from '../../../app/providers/SupabaseProvider';
import { httpClient } from '../../../lib/httpClient';

export interface ChildProfileData {
  childName: string;
  heroPhoto: File | null;
  heroPhotoUrl: string;
  chatPersona: 'mummy' | 'daddy' | 'custom';
  customPersonaPrompt: string;
}

interface ChildProfileStepProps {
  onNext: (data: ChildProfileData) => void;
  onDataChange?: (data: ChildProfileData) => void;
  initialData?: Partial<ChildProfileData>;
}

const personaOptions = [
  {
    id: 'mummy' as const,
    name: 'Mummy',
    description: 'A warm, nurturing mother figure',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'daddy' as const,
    name: 'Daddy',
    description: 'A strong, playful father figure',
    icon: User,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'custom' as const,
    name: 'Custom',
    description: 'Create your own unique persona',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-500'
  }
];

export function ChildProfileStep({ onNext, onDataChange, initialData }: ChildProfileStepProps) {
  const supabase = useSupabase();

  const [formData, setFormData] = useState<ChildProfileData>({
    childName: initialData?.childName || '',
    heroPhoto: null,
    heroPhotoUrl: initialData?.heroPhotoUrl || '',
    chatPersona: initialData?.chatPersona || 'mummy',
    customPersonaPrompt: initialData?.customPersonaPrompt || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update parent component when data changes
  useEffect(() => {
    onDataChange?.(formData);
  }, [formData, onDataChange]);

  // Generate preview when photo changes
  useEffect(() => {
    if (formData.heroPhoto) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(formData.heroPhoto);
    } else if (formData.heroPhotoUrl) {
      setPhotoPreview(formData.heroPhotoUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [formData.heroPhoto, formData.heroPhotoUrl]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Child name validation
    if (!formData.childName.trim()) {
      newErrors.childName = 'Child name is required';
    } else if (formData.childName.length < 1 || formData.childName.length > 100) {
      newErrors.childName = 'Child name must be between 1 and 100 characters';
    }

    // Persona validation
    if (!formData.chatPersona) {
      newErrors.chatPersona = 'Please select a chat persona';
    }

    // Custom prompt validation
    if (formData.chatPersona === 'custom' && !formData.customPersonaPrompt.trim()) {
      newErrors.customPersonaPrompt = 'Custom persona prompt is required';
    } else if (formData.customPersonaPrompt.length > 1000) {
      newErrors.customPersonaPrompt = 'Custom prompt must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handlePhotoSelect = useCallback((file: File) => {
    const error = validatePhotoFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, heroPhoto: error }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      heroPhoto: file,
      heroPhotoUrl: '' // Clear URL when new file is selected
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.heroPhoto;
      return newErrors;
    });
  }, []);

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
    setFormData(prev => ({
      ...prev,
      heroPhoto: null,
      heroPhotoUrl: ''
    }));
    setPhotoPreview(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.heroPhoto;
      return newErrors;
    });
  }, []);

  const uploadPhoto = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;
    const filePath = `hero-photos/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let photoUrl = formData.heroPhotoUrl;

      // Upload photo if a new file was selected
      if (formData.heroPhoto) {
        photoUrl = await uploadPhoto(formData.heroPhoto);
      }

      // Prepare API payload
      const payload = {
        child_name: formData.childName.trim(),
        hero_photo_url: photoUrl,
        chat_persona: formData.chatPersona,
        custom_persona_prompt: formData.chatPersona === 'custom' ? formData.customPersonaPrompt.trim() : undefined
      };

      // Create child profile
      await httpClient.post('/child', payload);

      // Update form data with uploaded photo URL
      const updatedData = {
        ...formData,
        heroPhotoUrl: photoUrl
      };

      onNext(updatedData);
    } catch (error: any) {
      // TODO: Implement proper logging service
      setErrors({
        submit: error.response?.data?.message || error.message || 'Failed to create child profile'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.childName.trim() &&
                     formData.chatPersona &&
                     (formData.chatPersona !== 'custom' || formData.customPersonaPrompt.trim());

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your child's profile</h2>
        <p className="text-gray-600">Tell us about your child so we can create a personalized advent calendar experience.</p>
      </div>

      {/* Child Name */}
      <div className="space-y-2">
        <label htmlFor="childName" className="block text-sm font-medium text-gray-700">
          Child's Name *
        </label>
        <input
          id="childName"
          type="text"
          value={formData.childName}
          onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
            errors.childName ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your child's name"
          maxLength={100}
        />
        {errors.childName && (
          <p className="text-sm text-red-600">{errors.childName}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Hero Photo (Optional)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-pink-400 bg-pink-50'
              : photoPreview
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {photoPreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Hero photo preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
                <button
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Photo uploaded successfully!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Upload a hero photo</p>
                <p className="text-gray-600">Drag and drop an image here, or click to browse</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, or WebP up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}
        </div>
        {errors.heroPhoto && (
          <p className="text-sm text-red-600">{errors.heroPhoto}</p>
        )}
      </div>

      {/* Chat Persona Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Chat Persona *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personaOptions.map((persona) => {
            const Icon = persona.icon;
            const isSelected = formData.chatPersona === persona.id;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, chatPersona: persona.id }))}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${persona.color} mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">{persona.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
              </button>
            );
          })}
        </div>
        {errors.chatPersona && (
          <p className="text-sm text-red-600">{errors.chatPersona}</p>
        )}
      </div>

      {/* Custom Persona Prompt */}
      {formData.chatPersona === 'custom' && (
        <div className="space-y-2">
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">
            Custom Persona Prompt *
          </label>
          <textarea
            id="customPrompt"
            value={formData.customPersonaPrompt}
            onChange={(e) => setFormData(prev => ({ ...prev, customPersonaPrompt: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none ${
              errors.customPersonaPrompt ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe how you want the AI to interact with your child..."
            rows={4}
            maxLength={1000}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{errors.customPersonaPrompt && <span className="text-red-600">{errors.customPersonaPrompt}</span>}</span>
            <span>{formData.customPersonaPrompt.length}/1000</span>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Profile...</span>
            </>
          ) : (
            <>
              <span>Next: Daily Entries</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}