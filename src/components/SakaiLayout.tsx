import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ThemeToggle } from './ThemeToggle';
import { MockEmailNotification } from '../types';
import {
  fetchMockEmails,
  triggerCourseEnrollmentMockEmail,
  triggerCertificateMockEmail,
} from '../services/notificationService';
import { EmailNotificationModal } from './EmailNotificationModal';
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileCheck,
  Award,
  Calendar,
  MessageSquare,
  FileText,
  HelpCircle,
  Search,
  School,
  ExternalLink,
  ShieldCheck,
  FolderKanban,
  CheckCircle2,
  GraduationCap,
  Layers,
  ChevronDown,
  Home,
  Grid,
  UserCog,
  Mail,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Megaphone,
  Activity,
  BarChart3,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../utils/soundEffects';

export interface PortalToolItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export type SakaiToolItem = PortalToolItem;

export interface PortalLayoutProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  children: React.ReactNode;
  activeSiteTitle?: string;
  onSelectSite?: (siteId: string) => void;
  sitesList?: Array<{ id: string; title: string; code?: string }>;
  currentSiteId?: string;
}

export type SakaiLayoutProps = PortalLayoutProps;

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  activeTool,
  onSelectTool,
  children,
  activeSiteTitle = 'My Workspace',
  onSelectSite,
  sitesList = [
    { id: 'workspace', title: 'My Workspace' },
    { id: 'sst101', title: 'SST 101: Intro to Computers', code: 'SST 101' },
    { id: 'sst201', title: 'SST 201: MS Excel Intermediate', code: 'SST 201' },
    { id: 'sst301', title: 'SST 301: Advanced Financial Modeling', code: 'SST 301' },
    { id: 'sst401', title: 'SST 401: Capstone Project', code: 'SST 401' },
  ],
  currentSiteId = 'workspace',
}) => {
  const { user, logout, token } = useAuth();
  const { settings } = useSettings();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sitesDropdownOpen, setSitesDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  // Mock Email Notifications State
  const [mockEmails, setMockEmails] = useState<MockEmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<MockEmailNotification | null>(null);
  const [notificationTab, setNotificationTab] = useState<'emails' | 'announcements'>('emails');
  const [isTriggeringTest, setIsTriggeringTest] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const loadEmails = async () => {
    try {
      const data = await fetchMockEmails(token || undefined);
      if (Array.isArray(data)) {
        setMockEmails(data);
      }
    } catch {
      // Ignored gracefully
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSafe = async () => {
      try {
        const data = await fetchMockEmails(token || undefined);
        if (isMounted && Array.isArray(data)) {
          setMockEmails(data);
        }
      } catch {
        // Ignored gracefully
      }
    };

    fetchSafe();
    const interval = setInterval(fetchSafe, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, user]);

  const unreadCount = mockEmails.filter((e) => !e.read).length;

  const handleTriggerTestEmail = async (type: 'enrollment' | 'certificate') => {
    if (!user) return;
    setIsTriggeringTest(true);
    setTestSuccessMessage(null);

    try {
      if (type === 'enrollment') {
        await triggerCourseEnrollmentMockEmail(
          user,
          {
            code: 'SST 201',
            title: 'Modern Full-Stack Cloud Architecture & Systems',
            level: 200,
            credits: 4,
            facilitatorName: 'Engr. Sarah Jenkins',
          },
          token || undefined
        );
        setTestSuccessMessage('New Course Enrollment Email dispatched!');
      } else {
        await triggerCertificateMockEmail(
          user,
          {
            code: 'SST 201',
            title: 'Modern Full-Stack Cloud Architecture & Systems',
          },
          {
            certificateId: `CERT-SST-SST201-${user.idNumber || 'STU-001'}`,
            grade: 'A',
            score: 96,
            facilitatorName: 'Engr. Sarah Jenkins',
          },
          token || undefined
        );
        setTestSuccessMessage('Verified Certificate Award Email dispatched!');
      }

      await loadEmails();
      setTimeout(() => setTestSuccessMessage(null), 4000);
    } catch (e) {
      console.error('Failed to trigger mock email:', e);
    } finally {
      setIsTriggeringTest(false);
    }
  };

  // Role & Context-specific Portal Tool Suites arranged in institutional hierarchy
  const getToolsForRole = (): PortalToolItem[] => {
    if (!user) return [];

    // When inside a specific Course Site (e.g. SST 101, SST 201, SST 301, SST 401)
    if (currentSiteId && currentSiteId !== 'workspace') {
      const courseTools: PortalToolItem[] = [
        { id: 'announcements', name: 'Announcements', icon: Bell },
        { id: 'sessions', name: 'Course Sessions & Materials', icon: Layers },
        { id: 'materials', name: 'Syllabus & Course Materials', icon: FolderKanban },
        { id: 'assignments', name: 'Assignments', icon: FileCheck },
        { id: 'quizzes', name: 'Tests & Quizzes', icon: HelpCircle },
        { id: 'gradebook', name: 'Gradebook / Report Card', icon: Award },
        { id: 'forums', name: 'Forums / Discussion', icon: MessageSquare },
      ];

      // Site Info / Roster (Hidden from students; visible to Facilitator/Admin)
      if (user.role === 'admin' || user.role === 'facilitator') {
        courseTools.push({ id: 'roster', name: 'Site Info / Roster', icon: Users });
      }

      return courseTools;
    }

    // When inside 'My Workspace' (Default Top-Level Tab)
    if (user.role === 'admin') {
      return [
        { id: 'overview', name: 'Overview & Hub Analytics', icon: LayoutDashboard },
        { id: 'system-overview', name: 'System Overview & Telemetry', icon: BarChart3 },
        { id: 'schedule', name: 'Academic Timetable & Labs', icon: Calendar },
        { id: 'quizzes', name: 'Tests & Quizzes Evaluator', icon: HelpCircle },
        { id: 'forums', name: 'Community Forums & Q&A', icon: MessageSquare },
        { id: 'projects', name: 'Capstone Projects Showcase', icon: Sparkles },
        { id: 'attendance', name: 'Lab Access & Attendance', icon: ShieldCheck },
        { id: 'certificates', name: 'Certificate Approvals & Registry', icon: Award },
        { id: 'profile', name: 'Admin Profile & Avatar', icon: UserCog },
        { id: 'admissions', name: 'Admissions & Approvals', icon: GraduationCap },
        { id: 'users', name: 'User Management & Security', icon: Users },
        { id: 'broadcasts', name: 'Campus Broadcasts & Alerts', icon: Megaphone },
        { id: 'audit-logs', name: 'System Health & Audit Trail', icon: Activity },
        { id: 'settings', name: 'Institution Settings & Logo', icon: Settings },
        { id: 'catalog', name: 'Course Catalog & Levels (100–400)', icon: BookOpen },
        { id: 'id-card', name: 'Digital ID Card & Badges', icon: CreditCard },
        { id: 'preferences', name: 'Security PIN & Preferences', icon: ShieldCheck },
      ];
    }

    if (user.role === 'facilitator') {
      return [
        { id: 'sessions', name: 'Course Sessions & Materials', icon: Layers },
        { id: 'my-courses', name: 'Assigned Courses & Roster', icon: BookOpen },
        { id: 'schedule', name: 'Academic Timetable & Labs', icon: Calendar },
        { id: 'quizzes', name: 'Tests & Quizzes Evaluator', icon: HelpCircle },
        { id: 'forums', name: 'Discussion Forums & Q&A', icon: MessageSquare },
        { id: 'projects', name: 'Capstone Projects Showcase', icon: Sparkles },
        { id: 'attendance', name: 'Lab Access & Attendance', icon: ShieldCheck },
        { id: 'announcements', name: 'Announcements', icon: Bell },
        { id: 'assignments', name: 'Assignments & Grading', icon: FileCheck },
        { id: 'gradebook', name: 'Gradebook & Sign-Off', icon: Award },
        { id: 'certificates', name: 'Student Certificates & Grades', icon: Award },
        { id: 'materials', name: 'Resources & Library', icon: FolderKanban },
        { id: 'id-card', name: 'Facilitator ID Card', icon: CreditCard },
        { id: 'preferences', name: 'Preferences & Security PIN', icon: ShieldCheck },
      ];
    }

    // Default: Student in Workspace
    return [
      { id: 'home', name: 'Overview', icon: LayoutDashboard },
      { id: 'id-card', name: 'Profile & Digital ID Card', icon: CreditCard },
      { id: 'schedule', name: 'Timetable & Lab Schedule', icon: Calendar },
      { id: 'quizzes', name: 'Tests & Quizzes Evaluator', icon: HelpCircle },
      { id: 'forums', name: 'Community Forums & Q&A', icon: MessageSquare },
      { id: 'projects', name: 'Capstone Projects & Demos', icon: Sparkles },
      { id: 'attendance', name: 'Lab Access & Attendance Pass', icon: ShieldCheck },
      { id: 'admission-letter', name: 'Admission Letter / Documents', icon: FileText },
      { id: 'sessions', name: 'Course Sessions & Materials', icon: Layers },
      { id: 'courses', name: 'My Enrolled Courses', icon: BookOpen },
      { id: 'assignments', name: 'Assignments', icon: FileCheck },
      { id: 'transcripts', name: 'Gradebook & Transcripts', icon: Award },
      { id: 'catalog', name: 'Course Catalog (100–400)', icon: School },
      { id: 'certificates', name: 'Official Certificates', icon: Award },
      { id: 'preferences', name: 'Preferences & Security PIN', icon: ShieldCheck },
    ];
  };

  const tools = getToolsForRole();
  const currentToolObj = tools.find((t) => t.id === activeTool) || tools[0];

  const roleBadgeStyles: Record<string, string> = {
    admin: 'bg-[#05286f]/10 text-[#05286f] border-[#05286f]/30 dark:bg-[#071530] dark:text-[#8ee079] dark:border-[#4ea836]/40',
    facilitator: 'bg-[#4ea836]/15 text-[#245817] border-[#4ea836]/30 dark:bg-[#071530] dark:text-[#8ee079] dark:border-[#4ea836]/40',
    student: 'bg-[#05286f]/10 text-[#05286f] border-[#05286f]/25 dark:bg-[#0a1f47] dark:text-sky-300 dark:border-sky-800/80',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030a1a] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-[#05286f]/20 selection:text-[#05286f] dark:selection:bg-[#4ea836]/25 dark:selection:text-[#8ee079]">
      {/* 1. TOP SITE NAVIGATION BAR (Institutional Academic Banner) */}
      <header id="sakai-header" className="bg-white dark:bg-[#071530] border-b border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white z-40 sticky top-0 shadow-xs dark:shadow-md transition-colors no-print print:hidden">
        {/* Upper Brand & Utility Bar */}
        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200/80 dark:border-[#0e2a66]/80">
          {/* Left: Hamburger & Institution Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0a1f47] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-8 h-8 rounded-lg object-contain p-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#05286f] flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  SST
                </div>
              )}
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                    {settings?.name || 'StartSmart Tech Hub'}
                  </span>
                  <span className="text-[9px] uppercase font-bold bg-[#05286f]/10 text-[#05286f] border border-[#05286f]/20 dark:bg-[#05286f]/40 dark:text-[#8ee079] dark:border-[#4ea836]/30 px-1.5 py-0.5 rounded">
                    Academic Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {settings?.tagline || 'Excellence in Technology Education'}
                </p>
              </div>
            </div>
          </div>

          {/* Center/Right: Quick Search, Sound Toggle, Theme Toggle, Notifications, User Menu, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setShowCommandPalette(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] border border-slate-200 dark:border-[#0e2a66] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Command Palette & Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
              <span className="hidden md:inline">Quick Search</span>
              <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 rounded bg-white dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundOn
                  ? 'bg-slate-100 text-[#4ea836] dark:bg-[#0a1f47] border-slate-200 dark:border-[#0e2a66]'
                  : 'bg-slate-100 text-slate-400 dark:bg-[#0a1f47]/50 border-slate-200 dark:border-[#0e2a66]'
              }`}
              title={soundOn ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle size="sm" />

            {/* Notifications & Mock Email Center */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#05286f] dark:hover:text-[#8ee079] hover:bg-[#05286f]/5 dark:hover:bg-[#0a1f47] transition-colors relative cursor-pointer"
                title="Notifications & Academic Emails"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#4ea836] text-white text-[10px] font-bold font-mono border-2 border-white dark:border-[#030a1a] animate-pulse">
                    {unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4ea836]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-2xl shadow-2xl z-50 overflow-hidden text-xs text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  {/* Popover Header */}
                  <div className="bg-[#05286f] text-white p-3.5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#8ee079]" />
                      <span className="font-bold text-sm font-['Outfit']">Official Notifications</span>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#4ea836] text-white text-[10px] font-bold">
                        {unreadCount} Unread Email{unreadCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-200">All caught up</span>
                    )}
                  </div>

                  {/* Tabs: Emails vs Announcements */}
                  <div className="flex border-b border-slate-200 dark:border-[#0e2a66] bg-slate-50 dark:bg-[#030a1a]">
                    <button
                      type="button"
                      onClick={() => setNotificationTab('emails')}
                      className={`flex-1 py-2 font-semibold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        notificationTab === 'emails'
                          ? 'text-[#05286f] dark:text-[#8ee079] border-b-2 border-[#05286f] dark:border-[#4ea836] bg-white dark:bg-[#071530]'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Mock Email Receipts ({mockEmails.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationTab('announcements')}
                      className={`flex-1 py-2 font-semibold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        notificationTab === 'announcements'
                          ? 'text-[#05286f] dark:text-[#8ee079] border-b-2 border-[#05286f] dark:border-[#4ea836] bg-white dark:bg-[#071530]'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Bulletins (2)</span>
                    </button>
                  </div>

                  {/* Tab Body: Mock Emails */}
                  {notificationTab === 'emails' && (
                    <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                      {/* Success Toast */}
                      {testSuccessMessage && (
                        <div className="p-2 rounded-xl bg-[#4ea836]/15 dark:bg-[#4ea836]/20 border border-[#4ea836]/30 text-[#183e10] dark:text-[#8ee079] text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4ea836] shrink-0" />
                          <span>{testSuccessMessage}</span>
                        </div>
                      )}

                      {/* Quick Trigger Bar for Testing */}
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                            Simulate Service Triggers
                          </span>
                          <span className="text-[10px] text-[#4ea836] font-semibold">Live Service</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            disabled={isTriggeringTest}
                            onClick={() => handleTriggerTestEmail('enrollment')}
                            className="px-2 py-1.5 rounded-lg bg-[#05286f] hover:bg-[#071530] text-white font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Trigger mock course enrollment email"
                          >
                            <GraduationCap className="w-3 h-3" />
                            <span>+ Course Email</span>
                          </button>
                          <button
                            type="button"
                            disabled={isTriggeringTest}
                            onClick={() => handleTriggerTestEmail('certificate')}
                            className="px-2 py-1.5 rounded-lg bg-[#4ea836] hover:bg-[#3b8827] text-white font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Trigger mock certificate award email"
                          >
                            <Award className="w-3 h-3" />
                            <span>+ Cert Award Email</span>
                          </button>
                        </div>
                      </div>

                      {/* List of Mock Emails */}
                      {mockEmails.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 dark:text-slate-500 space-y-1">
                          <Mail className="w-6 h-6 mx-auto opacity-40" />
                          <p className="text-xs">No email notifications received yet.</p>
                          <p className="text-[10px]">Enroll in a course or mint a certificate to receive official email receipts.</p>
                        </div>
                      ) : (
                        mockEmails.map((email) => {
                          const isEnr = email.category === 'course_enrollment';
                          const isCert = email.category === 'certificate_awarded';
                          return (
                            <div
                              key={email._id}
                              onClick={() => {
                                setSelectedEmail(email);
                                setShowNotifications(false);
                              }}
                              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                                !email.read
                                  ? 'bg-[#05286f]/5 dark:bg-[#0a1f47]/50 border-[#05286f]/25 dark:border-[#4ea836]/40'
                                  : 'bg-white dark:bg-[#071530] border-slate-200 dark:border-[#0e2a66] hover:bg-slate-50 dark:hover:bg-[#0a1f47]/30'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isEnr && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-[#05286f] text-white font-mono text-[9px] font-bold flex items-center gap-0.5">
                                      <GraduationCap className="w-2.5 h-2.5" />
                                      <span>ENROLLMENT</span>
                                    </span>
                                  )}
                                  {isCert && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-[#4ea836] text-white font-mono text-[9px] font-bold flex items-center gap-0.5">
                                      <Award className="w-2.5 h-2.5" />
                                      <span>AWARD</span>
                                    </span>
                                  )}
                                  {!email.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ea836]" />
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(email.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1 text-xs">
                                {email.subject}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {email.previewText || email.bodyText}
                              </p>
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#05286f] dark:text-[#8ee079] font-semibold">
                                <span>Click to inspect official receipt &rarr;</span>
                                <span className="font-mono text-[9px] text-slate-400">{email.to}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Tab Body: Announcements */}
                  {notificationTab === 'announcements' && (
                    <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">Term 2025/2026 Academic Calendar</span>
                          <span className="text-[9px] font-mono text-[#4ea836] font-bold">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Lectures, automated certificate minting, and grade sign-off window is now active campus-wide.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">Security Verification Active</span>
                          <span className="text-[9px] font-mono text-[#05286f] dark:text-sky-400 font-bold">Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Dual-factor security PIN and 2FA credential issuance running with full cryptographic ledger backing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0a1f47]/60 dark:hover:bg-[#0a1f47] border border-slate-200 dark:border-[#0e2a66] text-left transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                    }}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                  />
                  <div className="hidden md:block">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                      {user.fullName || user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {user.idNumber}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      roleBadgeStyles[user.role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="px-2.5 py-2 border-b border-slate-200 dark:border-[#0e2a66]">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{user.fullName || user.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email}</p>
                      <p className="text-[10px] text-[#05286f] dark:text-[#8ee079] font-mono mt-0.5">ID: {user.idNumber}</p>
                    </div>

                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTool('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#05286f]/5 dark:hover:bg-[#0a1f47]/60 text-[#05286f] dark:text-[#8ee079] transition-colors flex items-center gap-2 font-medium"
                      >
                        <UserCog className="w-3.5 h-3.5 text-[#05286f] dark:text-[#4ea836]" />
                        <span>Edit Profile & Photo</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTool('id-card');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0a1f47]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#4ea836]" />
                      <span>View Digital ID Card</span>
                    </button>

                    {/* Theme switcher inside menu */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between border-t border-slate-200 dark:border-[#0e2a66] text-slate-700 dark:text-slate-300">
                      <span className="text-xs">Theme Mode</span>
                      <ThemeToggle size="sm" showLabel />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors flex items-center gap-2 border-t border-slate-200 dark:border-[#0e2a66]/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Session</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Direct Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 dark:bg-[#0a1f47]/60 dark:hover:bg-rose-950/80 dark:hover:text-rose-300 border border-slate-200 dark:border-[#0e2a66] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Lower Site Navigation Tabs (Canonical Academic Portal Bar) */}
        <div className="px-3 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none bg-slate-100/70 dark:bg-[#030a1a] border-b border-slate-200 dark:border-[#0e2a66]">
          <div className="flex items-center gap-1.5 pt-1.5">
            {sitesList.map((site) => {
              const isActive = currentSiteId === site.id;
              const isWorkspace = site.id === 'workspace';
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => onSelectSite && onSelectSite(site.id)}
                  className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all rounded-t-lg flex items-center gap-2 border-t-2 ${
                    isActive
                      ? 'border-[#05286f] text-[#05286f] dark:border-[#4ea836] dark:text-white bg-white dark:bg-[#071530] shadow-xs border-x border-slate-200 dark:border-[#0e2a66]'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#071530]/60'
                  }`}
                >
                  {isWorkspace ? (
                    <Home className={`w-3.5 h-3.5 ${isActive ? 'text-[#05286f] dark:text-[#8ee079]' : 'text-slate-400'}`} />
                  ) : (
                    <School className={`w-3.5 h-3.5 ${isActive ? 'text-[#05286f] dark:text-[#8ee079]' : 'text-slate-400'}`} />
                  )}
                  <span>{site.title}</span>
                  {site.code && !isWorkspace && (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200/80 dark:bg-[#0a1f47] text-slate-700 dark:text-[#8ee079] border border-slate-300/60 dark:border-[#0e2a66] hidden sm:inline">
                      {site.code}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sites Switcher Drawer Button (Sites Grid) */}
          <div className="relative pl-3 py-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSitesDropdownOpen(!sitesDropdownOpen)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#071530] hover:bg-slate-100 dark:hover:bg-[#0a1f47] border border-slate-200 dark:border-[#0e2a66] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-semibold shadow-xs"
              title="All Available Course & Workspace Sites"
            >
              <Grid className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
              <span>Sites</span>
              <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            </button>

            {sitesDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-1.5">
                <div className="font-bold text-slate-500 dark:text-slate-400 px-2 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079]" />
                    <span>Sites Directory</span>
                  </div>
                  <span className="text-[10px] text-[#05286f] dark:text-[#8ee079] font-semibold">{sitesList.length} Sites</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {sitesList.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => {
                        if (onSelectSite) onSelectSite(site.id);
                        setSitesDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        currentSiteId === site.id
                          ? 'bg-[#05286f]/10 dark:bg-[#0a1f47] text-[#05286f] dark:text-[#8ee079] font-semibold border border-[#05286f]/20 dark:border-[#4ea836]/40'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a1f47]/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {site.id === 'workspace' ? (
                          <Home className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079] shrink-0" />
                        ) : (
                          <School className="w-3.5 h-3.5 text-[#05286f] dark:text-[#8ee079] shrink-0" />
                        )}
                        <span className="truncate">{site.title}</span>
                      </div>
                      {currentSiteId === site.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#4ea836] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. PORTAL MAIN BODY (Sidebar Tool Menu + Active Content Frame) */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible">
        {/* LEFT COLLAPSIBLE TOOL MENU (Desktop Sidebar) */}
        <aside
          id="sakai-sidebar"
          className={`hidden lg:flex flex-col bg-white dark:bg-[#071530] border-r border-slate-200 dark:border-[#0e2a66] transition-all duration-200 shrink-0 no-print print:hidden ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Tool Menu Header with Collapse Toggle */}
          <div className="p-3 border-b border-slate-200 dark:border-[#0e2a66]/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
            {!sidebarCollapsed && <span>Tools Menu</span>}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0a1f47] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
              title={sidebarCollapsed ? 'Expand Tool Menu' : 'Collapse Tool Menu'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Tool Items Navigation List */}
          <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-none">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onSelectTool(tool.id)}
                  title={sidebarCollapsed ? tool.name : undefined}
                  className={`w-full text-left rounded-lg transition-all flex items-center gap-3 px-3 py-2 text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-[#05286f] text-white shadow-md shadow-[#05286f]/30 font-semibold ring-1 ring-[#4ea836]/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[#05286f]/5 dark:hover:bg-[#0a1f47]/50 hover:text-[#05286f] dark:hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{tool.name}</span>
                  )}
                  {!sidebarCollapsed && tool.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-[#4ea836] text-white font-bold' : 'bg-slate-100 dark:bg-[#030a1a] text-[#245817] dark:text-[#8ee079]'}`}>
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer of Tool Menu: Institutional Accreditation Info */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-200 dark:border-[#0e2a66] text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-[#030a1a]/60">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ea836]" />
                <span>Verified Academic Node</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Dual-Credential 2FA Enforced • High Security
              </p>
            </div>
          )}
        </aside>

        {/* MOBILE DRAWER TOOL MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#071530] border-r border-slate-200 dark:border-[#0e2a66] flex flex-col z-50 text-slate-900 dark:text-white">
              <div className="p-4 border-b border-slate-200 dark:border-[#0e2a66] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-[#05286f] dark:text-[#8ee079]" />
                  <span className="font-bold text-sm">Academic Tools</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0a1f47] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User overview in mobile drawer */}
              {user && (
                <div className="p-3 bg-slate-50 dark:bg-[#030a1a] border-b border-slate-200 dark:border-[#0e2a66] flex items-center gap-2.5">
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/admin-avatar.png';
                    }}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.fullName || user.name}</p>
                    <p className="text-[10px] text-[#05286f] dark:text-[#8ee079] font-mono">{user.idNumber}</p>
                  </div>
                </div>
              )}

              {/* Tools List */}
              <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        onSelectTool(tool.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left rounded-lg transition-colors flex items-center gap-3 px-3 py-2 text-xs font-medium ${
                        isActive
                          ? 'bg-[#05286f] text-white font-semibold shadow-md shadow-[#05286f]/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a1f47]/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#05286f] dark:text-[#8ee079]'}`} />
                      <span className="truncate">{tool.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Theme toggle & Sign out in mobile drawer */}
              <div className="p-3 border-t border-slate-200 dark:border-[#0e2a66] space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Appearance</span>
                  <ThemeToggle size="sm" showLabel />
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PORTAL MAIN TOOL CANVAS (Active Tool Content View) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-[#030a1a] text-slate-900 dark:text-slate-100 print:overflow-visible print:bg-white">
          {/* Academic Portal Breadcrumbs Bar */}
          <div id="sakai-breadcrumbs" className="px-4 sm:px-8 py-2.5 bg-white/80 dark:bg-[#071530]/80 border-b border-slate-200 dark:border-[#0e2a66] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 no-print print:hidden">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="hover:text-slate-900 dark:hover:text-slate-200 cursor-default">{activeSiteTitle}</span>
              <span>&gt;</span>
              <span className="font-semibold text-[#05286f] dark:text-[#8ee079] flex items-center gap-1">
                {currentToolObj && <currentToolObj.icon className="w-3.5 h-3.5" />}
                <span>{currentToolObj?.name || 'Workspace'}</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span>Academic Year 2025/2026</span>
              <span>•</span>
              <span className="text-[#4ea836] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>

          {/* Tool Viewport Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
            {children}
          </main>
        </div>
      </div>

      {/* Official Mock Email Notification Modal */}
      {selectedEmail && (
        <EmailNotificationModal
          email={selectedEmail}
          token={token || undefined}
          onClose={() => setSelectedEmail(null)}
          onEmailUpdated={loadEmails}
          onNavigateToCourse={(courseId) => {
            if (onSelectSite) onSelectSite(courseId);
            else onSelectTool('catalog');
          }}
          onNavigateToCertificates={() => {
            onSelectTool('certificates');
          }}
        />
      )}

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTool={onSelectTool}
        onSelectSite={onSelectSite}
        userRole={user.role}
      />
    </div>
  );
};

export const SakaiLayout = PortalLayout;
