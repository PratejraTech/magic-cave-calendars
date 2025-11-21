import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, Calendar, Video, Palette, Eye } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Profile</h2>
        <p className="text-gray-600">Tell us about your child to personalize their advent calendar experience.</p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child's Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your child's name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat Persona
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="mummy">Mummy</option>
            <option value="daddy">Daddy</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Drag and drop a photo here, or click to browse</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Choose File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyEntriesStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Entries</h2>
        <p className="text-gray-600">Create 24 magical days for your child's advent calendar.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Pro tip:</strong> You can use the AI generator to quickly create personalized messages for all 24 days.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Grid Coming Soon</h3>
          <p className="text-gray-600">This will show a 24-day grid where you can add photos and messages for each day.</p>
        </div>
      </div>
    </div>
  );
}

function SurpriseVideosStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Surprise Videos</h2>
        <p className="text-gray-600">Add YouTube videos that will surprise and delight your child.</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video Manager Coming Soon</h3>
          <p className="text-gray-600">This will allow you to add and manage YouTube video URLs for surprises.</p>
        </div>
      </div>
    </div>
  );
}

function ThemeStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Theme & Style</h2>
        <p className="text-gray-600">Choose the visual theme for your advent calendar.</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-12">
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Theme Selector Coming Soon</h3>
          <p className="text-gray-600">This will show different theme options like Snow, Warm Lights, Candy, Forest, etc.</p>
        </div>
      </div>
    </div>
  );
}

function PreviewStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Publish</h2>
        <p className="text-gray-600">Review your calendar and publish it for your child to enjoy.</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Preview Coming Soon</h3>
          <p className="text-gray-600 mb-6">This will show a preview of your complete advent calendar.</p>

          <button
            onClick={onComplete}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            Publish Calendar
          </button>
        </div>
      </div>
    </div>
  );
}