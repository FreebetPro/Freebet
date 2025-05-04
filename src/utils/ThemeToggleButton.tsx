// ThemeToggleButton.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './themecontext';

const ThemeToggleButton: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      onClick={toggleDarkMode}
      className={`p-2 ${darkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors`}
      aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggleButton;