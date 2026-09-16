import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  CreditCard,
  Award,
  Calendar,
  Layers,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  GraduationCap,
  ArrowRight,
  School,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playClickSound, isSoundEnabled, setSoundEnabled } from '../utils/soundEffects';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Academic' | 'System' | 'Tools';
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectSite?: (siteId: string) => void;
  userRole?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onSelectSite,
  userRole = 'student',
}) => {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const toggleSoundState = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const commands: CommandItem[] = [
    {
      id: 'nav-overview',
      title: 'Workspace Overview & Hub Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      keywords: ['home', 'dashboard', 'stats', 'analytics'],
      action: () => {
        onSelectTool(userRole === 'admin' ? 'overview' : userRole === 'facilitator' ? 'my-courses' : 'home');
        onClose();
      },
    },
    {
      id: 'nav-id-card',
      title: 'Digital Credential & Official ID Card',
      category: 'Tools',
      shortcut: 'I',
      icon: CreditCard,
      keywords: ['badge', 'qr', 'verify', 'card', 'identity'],
      action: () => {
        onSelectTool('id-card');
        onClose();
      },
    },
    {
      id: 'nav-schedule',
      title: 'Academic Timetable & Lab Schedule',
      category: 'Academic',
      shortcut: 'T',
      icon: Calendar,
      keywords: ['timetable', 'calendar', 'sessions', 'hours', 'labs', 'room'],
      action: () => {
        onSelectTool('schedule');
        onClose();
      },
    },
    {
      id: 'nav-quizzes',
      title: 'Tests & Quizzes Evaluator',
      category: 'Academic',
      shortcut: 'Q',
      icon: HelpCircle,
      keywords: ['exam', 'test', 'quiz', 'knowledge', 'assessment', 'questions'],
      action: () => {
        onSelectTool('quizzes');
        onClose();
      },
    },
    {
      id: 'nav-forums',
      title: 'Tech Community Forums & Code Q&A',
      category: 'Academic',
      shortcut: 'F',
      icon: MessageSquare,
      keywords: ['discussion', 'questions', 'answers', 'community', 'code', 'help'],
      action: () => {
        onSelectTool('forums');
        onClose();
      },
    },
    {
      id: 'nav-projects',
      title: 'Capstone Projects & Innovation Showcase',
      category: 'Academic',
      shortcut: 'P',
      icon: Sparkles,
      keywords: ['portfolio', 'capstone', 'projects', 'demos', 'showcase', 'apps'],
      action: () => {
        onSelectTool('projects');
        onClose();
      },
    },
    {
      id: 'nav-attendance',
      title: 'Lab Access & Attendance Hub Pass',
      category: 'Tools',
      icon: ShieldCheck,
      keywords: ['attendance', 'checkin', 'workstation', 'lab', 'hours'],
      action: () => {
        onSelectTool('attendance');
        onClose();
      },
    },
    {
      id: 'nav-catalog',
      title: 'Course Catalog & Levels 100–400',
      category: 'Academic',
      shortcut: 'C',
      icon: School,
      keywords: ['courses', 'catalog', 'enroll', 'tracks', 'classes'],
      action: () => {
        onSelectTool('catalog');
        onClose();
      },
    },
    {
      id: 'nav-sessions',
      title: 'Course Sessions & Learning Materials',
      category: 'Academic',
      icon: Layers,
      keywords: ['sessions', 'lectures', 'slides', 'resources', 'curriculum'],
      action: () => {
        onSelectTool('sessions');
        onClose();
      },
    },
    {
      id: 'nav-certificates',
      title: 'Official Certificates & Transcripts',
      category: 'Academic',
      icon: Award,
      keywords: ['certificates', 'diploma', 'grades', 'transcripts', 'verified'],
      action: () => {
        onSelectTool('certificates');
        onClose();
      },
    },
    {
      id: 'nav-preferences',
      title: 'Security PIN & Preferences',
      category: 'Tools',
      icon: ShieldCheck,
      keywords: ['pin', 'security', 'settings', 'password', 'notifications', 'profile'],
      action: () => {
        onSelectTool('preferences');
        onClose();
      },
    },
    {
      id: 'sys-theme',
      title: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'System',
      icon: theme === 'dark' ? Sun : Moon,
      keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'contrast'],
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'sys-sound',
      title: `${soundOn ? 'Mute' : 'Enable'} Interface Audio Feedback`,
      category: 'System',
      icon: soundOn ? VolumeX : Volume2,
      keywords: ['sound', 'audio', 'effects', 'volume', 'chimes', 'feedback'],
      action: () => {
        toggleSoundState();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const categoryMatch = cmd.category.toLowerCase().includes(q);
    const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || categoryMatch || keywordMatch;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        playClickSound();
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-[#0e2a66]">
          <Search className="w-5 h-5 text-blue-600 dark:text-[#8ee079] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, course, or shortcut..."
            className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0a1f47] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#0e2a66]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-1">
              <Search className="w-6 h-6 mx-auto opacity-40" />
              <p className="text-xs font-semibold">No matching tools or actions found</p>
              <p className="text-[11px] text-slate-400">Try searching for "quiz", "schedule", "ID", "sound", or "forums".</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    playClickSound();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#05286f] text-white shadow-sm font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-[#0a1f47]/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-[#0a1f47] text-[#05286f] dark:text-[#8ee079]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="truncate font-medium">{cmd.title}</p>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {cmd.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-slate-100 dark:bg-[#030a1a] border-slate-200 dark:border-[#0e2a66] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-white' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#030a1a] border-t border-slate-200 dark:border-[#0e2a66] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">StartSmart Tech Hub v3.4</span>
        </div>
      </div>
    </div>
  );
};
