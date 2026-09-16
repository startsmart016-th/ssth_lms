import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 border border-slate-700/80 shadow-inner'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300/80 shadow-sm'
      } ${size === 'sm' ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs font-medium'} ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="font-semibold select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
