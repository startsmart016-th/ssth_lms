import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  CreditCard,
  GraduationCap,
  FileCheck,
  Award,
} from 'lucide-react';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role, activeTab, setActiveTab }) => {
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Metrics', icon: LayoutDashboard },
          { id: 'catalog', label: 'Catalog', icon: BookOpen },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'my-id', label: 'My ID', icon: CreditCard },
        ];
      case 'facilitator':
        return [
          { id: 'my-courses', label: 'My Courses', icon: BookOpen },
          { id: 'grading', label: 'Grading', icon: FileCheck },
          { id: 'catalog', label: 'All Catalog', icon: GraduationCap },
          { id: 'my-id', label: 'My ID', icon: CreditCard },
        ];
      case 'student':
      default:
        return [
          { id: 'enrolled', label: 'My Classes', icon: BookOpen },
          { id: 'catalog', label: 'Catalog', icon: GraduationCap },
          { id: 'transcripts', label: 'Certs & Grades', icon: Award },
          { id: 'my-id', label: 'Student ID', icon: CreditCard },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition ${isActive ? 'scale-110 text-sky-400' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
