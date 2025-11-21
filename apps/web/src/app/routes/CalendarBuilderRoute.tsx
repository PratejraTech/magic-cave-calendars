import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, Calendar, Video, Palette, Eye, Upload, X } from 'lucide-react';

const STEPS = [
  { id: 'profile', title: 'Child Profile', icon: User, description: 'Set up your child\'s information' },
  { id: 'entries', title: 'Daily Entries', icon: Calendar, description: 'Create 24 magical days' },
  { id: 'surprises', title: 'Surprise Videos', icon: Video, description: 'Add YouTube video surprises' },
  { id: 'theme', title: 'Theme & Style', icon: Palette, description: 'Choose the visual theme' },
  { id: 'preview', title: 'Preview & Publish', icon: Eye, description: 'Review and share your calendar' },
];

export function CalendarBuilderRoute() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Navigate to child calendar view with the created calendar
    navigate('/calendar/demo-share-uuid');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ChildProfileStep />;
      case 1:
        return <DailyEntriesStep />;
      case 2:
        return <SurpriseVideosStep />;
      case 3:
        return <ThemeStep />;
      case 4:
        return <PreviewStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/parent')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Calendar Builder</h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-20">
                      {step.description}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-4 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Publish Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function ChildProfileStep() {
  const [formData, setFormData] = useState({
    childName: '',
    chatPersona: 'daddy' as 'mummy' | 'daddy' | 'custom',
    customPrompt: '',
    heroPhoto: null as File | null,
    heroPhotoPreview: null as string | null,
    theme: 'snow' as 'snow' | 'warm' | 'candy' | 'forest' | 'starlight',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, heroPhoto: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, heroPhoto: 'File size must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        heroPhoto: file,
        heroPhotoPreview: URL.createObjectURL(file)
      }));

      if (errors.heroPhoto) {
        setErrors(prev => ({ ...prev, heroPhoto: '' }));
      }
    }
  };

  const removePhoto = () => {
    if (formData.heroPhotoPreview) {
      URL.revokeObjectURL(formData.heroPhotoPreview);
    }
    setFormData(prev => ({
      ...prev,
      heroPhoto: null,
      heroPhotoPreview: null
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.childName.trim()) {
      newErrors.childName = 'Child name is required';
    }

    if (formData.chatPersona === 'custom' && !formData.customPrompt.trim()) {
      newErrors.customPrompt = 'Custom prompt is required when using custom persona';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate on form changes
  useState(() => {
    validateForm();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Profile</h2>
        <p className="text-gray-600">Tell us about your child to personalize their advent calendar experience.</p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child's Name *
          </label>
          <input
            type="text"
            value={formData.childName}
            onChange={(e) => handleInputChange('childName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.childName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your child's name"
          />
          {errors.childName && (
            <p className="mt-1 text-sm text-red-600">{errors.childName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat Persona *
          </label>
          <select
            value={formData.chatPersona}
            onChange={(e) => handleInputChange('chatPersona', e.target.value as 'mummy' | 'daddy' | 'custom')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daddy">Daddy</option>
            <option value="mummy">Mummy</option>
            <option value="custom">Custom</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose how the AI should speak to your child
          </p>
        </div>

        {formData.chatPersona === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Chat Prompt *
            </label>
            <textarea
              value={formData.customPrompt}
              onChange={(e) => handleInputChange('customPrompt', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customPrompt ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe how you want the AI to interact with your child (e.g., 'Speak like a friendly pirate' or 'Be encouraging and use simple words')"
            />
            {errors.customPrompt && (
              <p className="mt-1 text-sm text-red-600">{errors.customPrompt}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="snow">Snow ❄️</option>
            <option value="warm">Warm Lights ✨</option>
            <option value="candy">Candy 🍬</option>
            <option value="forest">Forest 🌲</option>
            <option value="starlight">Starlight ⭐</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose the visual theme for your advent calendar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Photo (Optional)
          </label>
          {formData.heroPhotoPreview ? (
            <div className="relative">
              <img
                src={formData.heroPhotoPreview}
                alt="Hero photo preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">Drag and drop a photo here, or click to browse</p>
              <p className="text-sm text-gray-400 mb-4">PNG, JPG up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="hero-photo-input"
              />
              <label
                htmlFor="hero-photo-input"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer inline-block"
              >
                Choose File
              </label>
            </div>
          )}
          {errors.heroPhoto && (
            <p className="mt-1 text-sm text-red-600">{errors.heroPhoto}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyEntriesStep() {
  const [days, setDays] = useState<Array<{
    id: number;
    photo: File | null;
    photoPreview: string | null;
    message: string;
    isGenerating: boolean;
  }>>(() => Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    photo: null,
    photoPreview: null,
    message: '',
    isGenerating: false,
  })));

  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handlePhotoUpload = (dayId: number, file: File) => {
    if (!file.type.startsWith('image/')) return;

    setDays(prev => prev.map(day =>
      day.id === dayId
        ? {
            ...day,
            photo: file,
            photoPreview: URL.createObjectURL(file)
          }
        : day
    ));
  };

  const removePhoto = (dayId: number) => {
    setDays(prev => prev.map(day => {
      if (day.id === dayId && day.photoPreview) {
        URL.revokeObjectURL(day.photoPreview);
        return { ...day, photo: null, photoPreview: null };
      }
      return day;
    }));
  };

  const handleMessageChange = (dayId: number, message: string) => {
    setDays(prev => prev.map(day =>
      day.id === dayId ? { ...day, message } : day
    ));
  };

  const generateMessageForDay = async (dayId: number) => {
    setDays(prev => prev.map(day =>
      day.id === dayId ? { ...day, isGenerating: true } : day
    ));

    try {
      // TODO: Call AI service to generate message
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sampleMessages = [
        "Today is a special day! Can you guess what surprise awaits you?",
        "Hello my little adventurer! I've been thinking about you all day.",
        "What a wonderful day to be excited! Your smile lights up my world.",
        "I hope you're having the most magical day imaginable!",
        "Every day with you is a treasure. Can't wait to see your reaction!",
        "You're growing up so fast! Remember when you were this small? ❤️",
        "I love watching you discover new things every single day.",
        "Your laughter is the best music I could ever hear.",
        "Today holds something extra special just for you!",
        "I can't wait to hear all about your adventures today!",
        "You're my favorite person in the whole wide world.",
        "What amazing things will you discover today?",
        "I love you more than all the stars in the sky!",
        "Your creativity and imagination amaze me every day.",
        "Can't wait to see what you'll create next!",
        "You're growing into such a wonderful person.",
        "Every moment with you is a blessing.",
        "Your kindness makes the world a better place.",
        "I love watching you learn and grow.",
        "You're my sunshine on cloudy days.",
        "What a joy it is to be your parent!",
        "Your enthusiasm for life is contagious.",
        "I love seeing the world through your eyes.",
        "You're making so many beautiful memories."
      ];

      setDays(prev => prev.map(day =>
        day.id === dayId
          ? { ...day, message: sampleMessages[dayId - 1] || `Day ${dayId} message`, isGenerating: false }
          : day
      ));
    } catch (error) {
      console.error('Failed to generate message:', error);
      setDays(prev => prev.map(day =>
        day.id === dayId ? { ...day, isGenerating: false } : day
      ));
    }
  };

  const generateAllMessages = async () => {
    setIsGeneratingAll(true);

    try {
      // Generate messages for all days that don't have messages yet
      const daysToGenerate = days.filter(day => !day.message);

      for (const day of daysToGenerate) {
        await generateMessageForDay(day.id);
        // Small delay between generations to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Failed to generate all messages:', error);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const completedDays = days.filter(day => day.message.trim() || day.photo).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Entries</h2>
        <p className="text-gray-600">Create 24 magical days for your child's advent calendar.</p>
        <div className="mt-2 text-sm text-gray-500">
          {completedDays} of 24 days completed
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Pro tip:</strong> Use the AI generator to quickly create personalized messages for all 24 days, or generate them individually.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Quick Setup</h3>
            <p className="text-sm text-gray-600">Generate AI messages for all empty days</p>
          </div>
          <button
            onClick={generateAllMessages}
            disabled={isGeneratingAll || days.every(day => day.message.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isGeneratingAll ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                🤖 Generate All Messages
              </>
            )}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {days.map((day) => (
            <div
              key={day.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedDay === day.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDay(selectedDay === day.id ? null : day.id)}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">Day {day.id}</div>

                {/* Photo Preview */}
                <div className="mb-2">
                  {day.photoPreview ? (
                    <div className="relative">
                      <img
                        src={day.photoPreview}
                        alt={`Day ${day.id}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(day.id);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Message Preview */}
                <div className="text-xs text-gray-600 mb-2 h-8 overflow-hidden">
                  {day.message ? (
                    <p className="line-clamp-2">{day.message}</p>
                  ) : (
                    <p className="text-gray-400 italic">No message yet</p>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="flex justify-center space-x-1">
                  {day.photo && <div className="w-2 h-2 bg-green-500 rounded-full" title="Has photo"></div>}
                  {day.message && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has message"></div>}
                  {day.isGenerating && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Generating"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day Editor Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Day {selectedDay}</h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo (Optional)
                  </label>
                  {days.find(d => d.id === selectedDay)?.photoPreview ? (
                    <div className="relative mb-4">
                      <img
                        src={days.find(d => d.id === selectedDay)?.photoPreview!}
                        alt={`Day ${selectedDay}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removePhoto(selectedDay)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(selectedDay, file);
                    }}
                    className="hidden"
                    id={`photo-input-${selectedDay}`}
                  />
                  <label
                    htmlFor={`photo-input-${selectedDay}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {days.find(d => d.id === selectedDay)?.photo ? 'Change Photo' : 'Add Photo'}
                  </label>
                </div>

                {/* Message Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <button
                      onClick={() => generateMessageForDay(selectedDay)}
                      disabled={days.find(d => d.id === selectedDay)?.isGenerating}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                    >
                      {days.find(d => d.id === selectedDay)?.isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Generating...
                        </>
                      ) : (
                        <>🤖 Generate</>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={days.find(d => d.id === selectedDay)?.message || ''}
                    onChange={(e) => handleMessageChange(selectedDay, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a magical message for this day..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SurpriseVideosStep() {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
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

    setVideoUrls(prev => [...prev, trimmedUrl]);
    setNewUrl('');
    setUrlError('');
  };

  const removeVideoUrl = (urlToRemove: string) => {
    setVideoUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addVideoUrl();
    }
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
    </div>
  );
}

function ThemeStep() {
  const [selectedTheme, setSelectedTheme] = useState<'snow' | 'warm' | 'candy' | 'forest' | 'starlight'>('snow');

  const themes = [
    {
      id: 'snow' as const,
      name: 'Snow ❄️',
      description: 'Winter wonderland with snowflakes and cool blues',
      preview: 'bg-gradient-to-br from-blue-100 to-blue-200',
      accentColor: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      id: 'warm' as const,
      name: 'Warm Lights ✨',
      description: 'Cozy holiday lights and warm golden tones',
      preview: 'bg-gradient-to-br from-yellow-100 to-orange-200',
      accentColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
    },
    {
      id: 'candy' as const,
      name: 'Candy 🍬',
      description: 'Sweet and colorful with candy cane patterns',
      preview: 'bg-gradient-to-br from-pink-100 to-red-200',
      accentColor: 'bg-pink-500',
      textColor: 'text-pink-700',
    },
    {
      id: 'forest' as const,
      name: 'Forest 🌲',
      description: 'Natural greens and woodland creatures',
      preview: 'bg-gradient-to-br from-green-100 to-emerald-200',
      accentColor: 'bg-green-500',
      textColor: 'text-green-700',
    },
    {
      id: 'starlight' as const,
      name: 'Starlight ⭐',
      description: 'Magical night sky with twinkling stars',
      preview: 'bg-gradient-to-br from-purple-100 to-indigo-200',
      accentColor: 'bg-purple-500',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Theme & Style</h2>
        <p className="text-gray-600">Choose the visual theme for your advent calendar.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Palette className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Theme affects:</strong> Background colors, animations, and overall visual style of your calendar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
              selectedTheme === theme.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* Selection Indicator */}
            {selectedTheme === theme.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Theme Preview */}
            <div className={`w-full h-24 rounded-lg mb-4 ${theme.preview} flex items-center justify-center`}>
              <div className="text-2xl">{theme.name.split(' ')[1]}</div>
            </div>

            {/* Theme Info */}
            <div>
              <h3 className={`font-semibold text-lg mb-2 ${theme.textColor}`}>
                {theme.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {theme.description}
              </p>

              {/* Color Swatches */}
              <div className="flex space-x-2">
                <div className={`w-4 h-4 rounded-full ${theme.accentColor}`}></div>
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Theme Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Theme</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg ${themes.find(t => t.id === selectedTheme)?.preview} flex items-center justify-center`}>
            <span className="text-lg">{themes.find(t => t.id === selectedTheme)?.name.split(' ')[1]}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {themes.find(t => t.id === selectedTheme)?.name}
            </p>
            <p className="text-sm text-gray-600">
              {themes.find(t => t.id === selectedTheme)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStep({ onComplete }: { onComplete: () => void }) {
  const [isPublishing, setIsPublishing] = useState(false);

  // Mock data - in a real implementation, this would come from the wizard state
  const previewData = {
    childProfile: {
      name: 'Alex',
      persona: 'Daddy',
      theme: 'Snow ❄️',
      hasPhoto: true,
    },
    dailyEntries: {
      totalDays: 24,
      completedDays: 18,
      daysWithPhotos: 12,
      daysWithMessages: 18,
    },
    surpriseVideos: {
      count: 3,
      urls: [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=oHg5SJYRHA0',
        'https://www.youtube.com/watch?v=9bZkp7q19f0',
      ],
    },
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      // TODO: Implement actual publishing logic
      // This would save all the wizard data to the backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      onComplete();
    } catch (error) {
      console.error('Failed to publish calendar:', error);
      // Handle error - show error message to user
    } finally {
      setIsPublishing(false);
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
        </div>
      </div>
    </div>
  );
}