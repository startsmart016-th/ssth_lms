import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
  BookOpen,
  Settings,
  Users,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, activeTab, setActiveTab }) => {
  const { user, switchDemoRole, logout } = useAuth();
  const { settings } = useSettings();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleStyles: Record<string, { bg: string; text: string; dot: string }> = {
    admin: { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300', text: 'Admin', dot: 'bg-rose-400' },
    facilitator: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'Facilitator', dot: 'bg-emerald-400' },
    student: { bg: 'bg-sky-500/20 border-sky-500/40 text-sky-300', text: 'Student', dot: 'bg-sky-400' },
  };

  const currentRoleStyle = user ? roleStyles[user.role] : roleStyles.student;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Left (Injected from InstitutionSettings) */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-md shadow-sky-950/50 group-hover:border-sky-500/50 transition">
            <img
              src={settings.logoUrl || 'https://i.imgur.com/x45FW8G.png'}
              alt="Logo"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-white font-['Outfit'] uppercase flex items-center gap-1.5 leading-none">
              <span>{settings.name}</span>
            </h1>
            <span className="text-[10px] text-sky-400 font-semibold tracking-wide truncate max-w-[180px] sm:max-w-xs mt-1">
              {settings.tagline}
            </span>
          </div>
        </div>

        {/* Right Section: PWA Install + Role Switcher / Profile */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Role Switcher Pill & Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${currentRoleStyle.dot} animate-pulse`} />
                  <span className="capitalize hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${currentRoleStyle.bg}`}>
                    {user.role}
                  </span>
                </span>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                  }}
                  className="w-7 h-7 rounded-full object-cover border border-sky-400/50"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {/* Role Switcher & Account Dropdown */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-slate-100 animate-in fade-in zoom-in-95">
                    {/* Current User Card */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 mb-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                        }}
                        className="w-10 h-10 rounded-xl object-cover border border-sky-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate font-['Outfit']">{user.name}</p>
                        <p className="text-[10px] text-sky-400 font-mono truncate">{user.idNumber}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                      >
                        <User className="w-4 h-4 text-sky-400" />
                        <span>Edit Profile & Signatures</span>
                      </button>
                    </div>

                    {/* Quick Demo Role Switcher */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="px-2 pb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Role Persona (Demo)
                        </span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            switchDemoRole('admin', 'admin@startsmart.tech');
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                            user.role === 'admin'
                              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold leading-tight">Mr. Seidu Mahamadu</p>
                            <p className="text-[10px] text-slate-400">Principal (SST-ADM-001)</p>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200">
                            Admin
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            switchDemoRole('facilitator', 'sarah.jenkins@startsmart.tech');
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                            user.role === 'facilitator' && user.email === 'sarah.jenkins@startsmart.tech'
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold leading-tight">Engr. Sarah Jenkins</p>
                            <p className="text-[10px] text-slate-400">Excel / Data Lead (SST-FAC-101)</p>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                            Facilitator
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            switchDemoRole('facilitator', 'marcus.adeyemi@startsmart.tech');
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                            user.role === 'facilitator' && user.email === 'marcus.adeyemi@startsmart.tech'
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold leading-tight">Marcus Adeyemi</p>
                            <p className="text-[10px] text-slate-400">Full Stack & Design (SST-FAC-102)</p>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                            Facilitator
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            switchDemoRole('student', 'chinedu.student@startsmart.tech');
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                            user.role === 'student'
                              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold leading-tight">Chinedu Okafor</p>
                            <p className="text-[10px] text-slate-400">Tech Student (SST-STD-2025)</p>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200">
                            Student
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
