/**
 * Theme Switcher Component
 * Allows users to switch between available themes
 */

import { useTheme } from '../../../themes/ThemeProvider';

export function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/20 backdrop-blur-sm rounded-full p-1 flex gap-1">
        {availableThemes.slice(0, 5).map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`w-8 h-8 rounded-full transition-all duration-200 ${
              currentTheme?.id === theme.id
                ? 'ring-2 ring-white scale-110'
                : 'hover:scale-105'
            }`}
            style={{
              background: theme.colors.primary,
              boxShadow: currentTheme?.id === theme.id
                ? `0 0 10px ${theme.colors.accent}`
                : 'none'
            }}
            title={theme.name}
          />
        ))}
      </div>
    </div>
  );
}