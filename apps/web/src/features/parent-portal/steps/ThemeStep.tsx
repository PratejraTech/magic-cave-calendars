import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

export interface ThemeData {
  selectedTheme: 'snow' | 'warm' | 'candy' | 'forest' | 'starlight';
}

interface ThemeStepProps {
  onNext: (data: ThemeData) => void;
  onDataChange?: (data: ThemeData) => void;
  initialData?: Partial<ThemeData>;
}

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

export function ThemeStep({ onNext, onDataChange, initialData }: ThemeStepProps) {
  const [selectedTheme, setSelectedTheme] = useState<'snow' | 'warm' | 'candy' | 'forest' | 'starlight'>(
    initialData?.selectedTheme || 'snow'
  );

  const handleThemeSelect = (themeId: typeof selectedTheme) => {
    setSelectedTheme(themeId);
    onDataChange?.({ selectedTheme: themeId });
  };

  const handleNext = () => {
    onNext({ selectedTheme });
  };

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
            onClick={() => handleThemeSelect(theme.id)}
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

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          Next: Preview & Publish
        </button>
      </div>
    </div>
  );
}