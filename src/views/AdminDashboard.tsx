import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { InstitutionSettings, Course, User } from '../types';
import { AdminAdmissions } from '../components/AdminAdmissions';
import { AdminProfileEditor } from '../components/AdminProfileEditor';
import { AdminCertificateRegistry } from '../components/AdminCertificateRegistry';
import { SchoolLogoUploader } from '../components/SchoolLogoUploader';
import { AdminCatalogManager } from '../components/admin/AdminCatalogManager';
import { AdminAnalyticsOverview } from '../components/admin/AdminAnalyticsOverview';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminBroadcasts } from '../components/admin/AdminBroadcasts';
import { AdminAuditLogs } from '../components/admin/AdminAuditLogs';
import { AdminSystemOverview } from '../components/admin/AdminSystemOverview';
import { MongoAtlasStatusCard } from '../components/MongoAtlasStatusCard';
import {
  Settings,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Plus,
  RefreshCw,
  Building,
  Phone,
  Mail,
  Globe,
  PenTool,
  Stamp,
  GraduationCap,
  UserCog,
  IdCard,
  LayoutDashboard,
  Megaphone,
  Activity,
  FileSpreadsheet,
  Upload,
  X,
  Send,
  BarChart3,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenIDCard: () => void;
  activeSubtab?: 'overview' | 'system-overview' | 'catalog' | 'users' | 'settings' | 'admissions' | 'profile' | 'certificates' | 'broadcasts' | 'audit-logs' | string;
  onSelectSubtab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenIDCard,
  activeSubtab: propActiveSubtab = 'overview',
  onSelectSubtab,
}) => {
  const { settings, updateSettings, refreshSettings, uploadLogo } = useSettings();
  const { token, user } = useAuth();

  const [internalSubtab, setInternalSubtab] = useState<string | null>(null);
  const activeSubtab = internalSubtab || propActiveSubtab;

  const setSubtab = (tab: string) => {
    if (tab === 'id-card') {
      onOpenIDCard();
      return;
    }
    if (onSelectSubtab) {
      onSelectSubtab(tab);
    } else {
      setInternalSubtab(tab);
    }
  };

  useEffect(() => {
    setInternalSubtab(null);
  }, [propActiveSubtab]);

  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form state
  const [formSettings, setFormSettings] = useState<InstitutionSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Global Quick Action: Add User Modal
  const [showGlobalAddUser, setShowGlobalAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'facilitator' | 'student'>('student');
  const [newUserDept, setNewUserDept] = useState('School of Technology');
  const [newUserLevel, setNewUserLevel] = useState(100);
  const [creatingUser, setCreatingUser] = useState(false);

  // Global Quick Action: Post Broadcast Modal
  const [showGlobalBroadcast, setShowGlobalBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'info' | 'important' | 'urgent'>('info');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'students' | 'facilitators' | 'level100'>('all');
  const [publishingBroadcast, setPublishingBroadcast] = useState(false);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const loadData = async () => {
    setLoading(true);
    try {
      const authHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [mRes, uRes, cRes] = await Promise.all([
        fetch('/api/metrics', { headers: authHeaders }),
        fetch('/api/users', { headers: authHeaders }),
        fetch('/api/courses', { headers: { Accept: 'application/json' } }),
      ]);

      const parseJsonSafe = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            return await res.json();
          } catch {
            return null;
          }
        }
        return null;
      };

      const [metricsData, usersData, coursesData] = await Promise.all([
        parseJsonSafe(mRes),
        parseJsonSafe(uRes),
        parseJsonSafe(cRes),
      ]);

      if (metricsData) setMetrics(metricsData);
      if (usersData) setUsersList(usersData);
      if (coursesData) setCoursesList(coursesData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Save Institution Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings(formSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 4000);
      await refreshSettings();
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Global Add User Handler
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Name and Email are required.');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          fullName: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
          department: newUserDept.trim(),
          programLevel: newUserLevel,
        }),
      });

      if (res.ok) {
        setShowGlobalAddUser(false);
        setNewUserName('');
        setNewUserEmail('');
        await loadData();
        setSubtab('users');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create user account.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setCreatingUser(false);
    }
  };

  // Global Broadcast Publish Handler
  const handlePublishBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      alert('Title and content are required.');
      return;
    }

    setPublishingBroadcast(true);
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          content: broadcastContent.trim(),
          priority: broadcastPriority,
          target: broadcastTarget,
        }),
      });

      if (res.ok) {
        setShowGlobalBroadcast(false);
        setBroadcastTitle('');
        setBroadcastContent('');
        setSubtab('broadcasts');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to publish broadcast.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setPublishingBroadcast(false);
    }
  };

  // Export Full Executive System Report (.CSV)
  const handleExportSystemReport = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const reportLines = [
      'STARTSMART ACADEMY - EXECUTIVE INSTITUTIONAL REPORT',
      `Generated On,${new Date().toISOString()}`,
      `Authorized By,"${user?.name || 'Chief Administrator'}"`,
      '',
      'CAMPUS EXECUTIVE TELEMETRY',
      `Total Students Enrolled,${metrics?.totalStudents || usersList.filter(u => u.role === 'student').length}`,
      `Active Students,${metrics?.activeStudents || usersList.filter(u => u.role === 'student' && u.status === 'active').length}`,
      `Instructional Facilitators,${metrics?.totalFacilitators || usersList.filter(u => u.role === 'facilitator').length}`,
      `Executive Administrators,${metrics?.totalAdmins || usersList.filter(u => u.role === 'admin').length}`,
      `Total Catalog Courses,${metrics?.totalCourses || coursesList.length}`,
      `Dual-Signed Certificates Issued,${metrics?.certificatesIssued || 2}`,
      `Average Completion Rate,${metrics?.avgCompletionRate || 92}%`,
      `Pending Admission Applicants,${metrics?.pendingApplicants || usersList.filter(u => u.status === 'pending').length}`,
      '',
      'CURRICULUM LEVEL BREAKDOWN',
      `Level 100 Foundation,${coursesList.filter(c => c.level === 100).length} Courses`,
      `Level 200 Intermediate,${coursesList.filter(c => c.level === 200).length} Courses`,
      `Level 300 Advanced,${coursesList.filter(c => c.level === 300).length} Courses`,
      `Level 400 Capstone,${coursesList.filter(c => c.level === 400).length} Courses`,
      '',
      'USER REGISTRY SNAPSHOT',
      'User ID,Full Name,Email,Role,Department,Status',
      ...usersList.map(u => `"${u.idNumber}","${u.fullName || u.name}","${u.email}","${u.role.toUpperCase()}","${u.department || 'School of Technology'}","${u.status.toUpperCase()}"`),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + reportLines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StartSmart_Executive_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingAdmissionsCount = metrics?.pendingApplicants ?? usersList.filter(u => u.status === 'pending').length;

  const cockpitTabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'system-overview', label: 'System Overview', icon: BarChart3, badge: 'Live', badgeColor: 'bg-emerald-500 text-white' },
    { id: 'users', label: 'User Directory & RBAC', icon: Users, badge: usersList.length },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap, badge: pendingAdmissionsCount, badgeColor: 'bg-amber-500 text-white' },
    { id: 'catalog', label: 'Course Catalog (100–400)', icon: BookOpen, badge: coursesList.length },
    { id: 'certificates', label: 'Certificate Registry', icon: Award },
    { id: 'broadcasts', label: 'Campus Broadcasts', icon: Megaphone },
    { id: 'audit-logs', label: 'System Health & Audit', icon: Activity },
    { id: 'settings', label: 'Institution Settings & Seal', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: UserCog },
  ];

  return (
    <div className="space-y-6">
      {/* Top Executive Subtab Cockpit Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {cockpitTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeSubtab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubtab(t.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                      t.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300')
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Shortcut to Digital ID Card */}
        <div className="pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onOpenIDCard}
            className="px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Inspect Official Digital ID Badge"
          >
            <IdCard className="w-4 h-4" />
            <span className="hidden sm:inline">My ID Card</span>
          </button>
        </div>
      </div>

      {/* Render Active Subtab Content */}
      {activeSubtab === 'overview' && (
        <AdminAnalyticsOverview
          metrics={metrics}
          usersList={usersList}
          coursesList={coursesList}
          loading={loading}
          onRefresh={loadData}
          onSelectSubtab={setSubtab}
          onOpenAddUser={() => setShowGlobalAddUser(true)}
          onOpenBroadcast={() => setShowGlobalBroadcast(true)}
          onExportReport={handleExportSystemReport}
        />
      )}

      {activeSubtab === 'system-overview' && (
        <AdminSystemOverview
          metrics={metrics}
          loading={loading}
          onRefresh={loadData}
        />
      )}

      {activeSubtab === 'users' && (
        <AdminUserManagement
          usersList={usersList}
          token={token}
          onRefreshUsers={loadData}
        />
      )}

      {activeSubtab === 'admissions' && (
        <AdminAdmissions
          onApproved={() => {
            loadData();
          }}
        />
      )}

      {activeSubtab === 'catalog' && (
        <AdminCatalogManager />
      )}

      {activeSubtab === 'certificates' && (
        <AdminCertificateRegistry />
      )}

      {activeSubtab === 'broadcasts' && (
        <AdminBroadcasts token={token} />
      )}

      {activeSubtab === 'audit-logs' && (
        <AdminAuditLogs token={token} metrics={metrics} />
      )}

      {activeSubtab === 'profile' && (
        <AdminProfileEditor
          onProfileSaved={() => {
            refreshSettings();
            loadData();
          }}
        />
      )}

      {/* Institution Settings & Seal Editor */}
      {activeSubtab === 'settings' && (
        <div className="space-y-6">
          {/* MongoDB Atlas Cloud Database Status Card */}
          <MongoAtlasStatusCard />

          {/* Interactive School Logo Uploader Component */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors">
            <SchoolLogoUploader
              currentLogoUrl={formSettings.logoUrl}
              onLogoUpdated={(newUrl) => {
                setFormSettings(prev => ({ ...prev, logoUrl: newUrl }));
              }}
            />
          </section>

          {/* Core Institutional & Endorsement Parameters */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 text-slate-900 dark:text-slate-100 shadow-xs transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Global Institution Settings (Singleton Configuration)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updates instantly propagate across App Header, Digital ID Cards, Certificates, and Transcripts
                  </p>
                </div>
              </div>
              {settingsSaved && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" /> Propagated Globally!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={formSettings.name}
                    onChange={e => setFormSettings({ ...formSettings, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline & Vision
                  </label>
                  <input
                    type="text"
                    value={formSettings.tagline}
                    onChange={e => setFormSettings({ ...formSettings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Admissions Administrator / Registrar Name
                    </label>
                    <input
                      type="text"
                      value={formSettings.adminName || ''}
                      onChange={e => setFormSettings({ ...formSettings, adminName: e.target.value })}
                      placeholder="e.g. Mr. Seidu Mahamadu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Principal & Chief Executive Officer Name
                    </label>
                    <input
                      type="text"
                      value={formSettings.principalName || 'Mr. Seidu Mahamadu'}
                      onChange={e => setFormSettings({ ...formSettings, principalName: e.target.value })}
                      placeholder="e.g. Mr. Seidu Mahamadu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Logo URL or Image File
                    </label>
                    <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const res = await uploadLogo(e.target.files[0]);
                            if (res.success && res.logoUrl) {
                              setFormSettings(prev => ({ ...prev, logoUrl: res.logoUrl! }));
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formSettings.logoUrl}
                    onChange={e => setFormSettings({ ...formSettings, logoUrl: e.target.value })}
                    placeholder="URL or use file uploader"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Website</label>
                  <input
                    type="text"
                    value={formSettings.websiteUrl}
                    onChange={e => setFormSettings({ ...formSettings, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formSettings.contactPhone}
                    onChange={e => setFormSettings({ ...formSettings, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus Location / Address</label>
                  <input
                    type="text"
                    value={formSettings.location}
                    onChange={e => setFormSettings({ ...formSettings, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Registrar Contact Email</label>
                  <input
                    type="email"
                    value={formSettings.contactEmail}
                    onChange={e => setFormSettings({ ...formSettings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Official Endorsement Branding Assets (Admin Signature, Principal Signature & Official Stamp) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Admin Signature */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Admin Signature
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormSettings({ ...formSettings, adminSignatureUrl: '/admin-signature.png' })}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSettings.adminSignatureUrl}
                    onChange={e => setFormSettings({ ...formSettings, adminSignatureUrl: e.target.value })}
                    placeholder="/admin-signature.png"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden"
                  />
                  <div className="h-14 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={formSettings.adminSignatureUrl || '/admin-signature.png'}
                      alt="Admin Signature Preview"
                      className="max-h-full max-w-[150px] object-contain dark:invert opacity-95"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/admin-signature.png')) {
                          target.src = '/admin-signature.png';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Principal Signature */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Principal Signature
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormSettings({ ...formSettings, principalSignatureUrl: '/principal-signature.svg' })}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSettings.principalSignatureUrl || '/principal-signature.svg'}
                    onChange={e => setFormSettings({ ...formSettings, principalSignatureUrl: e.target.value })}
                    placeholder="/principal-signature.svg"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden"
                  />
                  <div className="h-14 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={formSettings.principalSignatureUrl || '/principal-signature.svg'}
                      alt="Principal Signature Preview"
                      className="max-h-full max-w-[150px] object-contain dark:invert opacity-95"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/principal-signature.svg')) {
                          target.src = '/principal-signature.svg';
                        } else if (!target.src.includes('/signature.png')) {
                          target.src = '/signature.png';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Official Institutional Seal / Stamp */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Stamp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Institutional Stamp / Seal
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormSettings({ ...formSettings, sealOrStampUrl: 'https://i.imgur.com/BrpD2i3.png' })}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSettings.sealOrStampUrl}
                    onChange={e => setFormSettings({ ...formSettings, sealOrStampUrl: e.target.value })}
                    placeholder="/official-stamp.png"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-hidden"
                  />
                  <div className="h-14 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={formSettings.sealOrStampUrl || '/official-stamp.png'}
                      alt="Stamp Preview"
                      className="max-h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/official-stamp.png')) {
                          target.src = '/official-stamp.png';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save & Publish Singleton Config'}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Global Quick Action: Add User Modal */}
      {showGlobalAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Provision Academic User
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register new student, faculty, or admin account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGlobalAddUser(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Mensah"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="john.mensah@startsmart.tech"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="facilitator">Facilitator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Level
                  </label>
                  <select
                    value={newUserLevel}
                    onChange={(e) => setNewUserLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value={100}>100 Foundation</option>
                    <option value={200}>200 Intermediate</option>
                    <option value={300}>300 Advanced</option>
                    <option value={400}>400 Capstone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGlobalAddUser(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {creatingUser ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Quick Action: Post Broadcast Modal */}
      {showGlobalBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-sky-500" />
                  Dispatch Campus Broadcast
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmit an urgent announcement or schedule directive
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGlobalBroadcast(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Capstone Presentations Scheduled"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="info">General Info</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audience
                  </label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="all">All Campus</option>
                    <option value="students">Students Only</option>
                    <option value="facilitators">Facilitators Only</option>
                    <option value="level100">Level 100 Foundation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed campus announcement instructions..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGlobalBroadcast(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishingBroadcast}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publishingBroadcast ? 'Dispatching...' : 'Dispatch Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
