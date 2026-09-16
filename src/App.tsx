/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalLayout } from './components/SakaiLayout';
import { LoginScreen } from './components/LoginScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AutoMobileInstallPrompt } from './components/AutoMobileInstallPrompt';
import { DigitalIdCard } from './components/DigitalIdCard';
import { DualSidedIdCard } from './components/DualSidedIdCard';
import { VerifyView } from './components/VerifyView';
import { ProfileModal } from './components/ProfileModal';

import { AdminDashboard } from './views/AdminDashboard';
import { FacilitatorDashboard } from './views/FacilitatorDashboard';
import { StudentDashboard } from './views/StudentDashboard';
import { CatalogView } from './views/CatalogView';
import { RegistrationForm } from './components/RegistrationForm';
import { AdmissionLetter } from './components/AdmissionLetter';
import { ScheduleView } from './components/tabs/ScheduleView';
import { QuizzesView } from './components/tabs/QuizzesView';
import { ForumsView } from './components/tabs/ForumsView';
import { ProjectsShowcaseView } from './components/tabs/ProjectsShowcaseView';
import { AttendanceLabView } from './components/tabs/AttendanceLabView';
import { PreferencesView } from './components/tabs/PreferencesView';
import { ErrorBoundary } from './components/ErrorBoundary';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [showProfile, setShowProfile] = useState(false);
  const [verifyUserId, setVerifyUserId] = useState<string | null>(null);
  const [idFormat, setIdFormat] = useState<'vertical' | 'horizontal'>('vertical');
  const [currentSiteId, setCurrentSiteId] = useState<string>('workspace');
  const [isRegistering, setIsRegistering] = useState<boolean>(() => {
    return window.location.pathname === '/register';
  });

  // Check URL pathname for direct verification routing (e.g. /verify-id/:userId or /register)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify-id/')) {
      const id = path.replace('/verify-id/', '').trim();
      if (id) {
        setVerifyUserId(id);
      }
    } else if (path === '/register') {
      setIsRegistering(true);
    }
  }, []);

  // Sync default tab with role whenever user changes or logs in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') setActiveTab('overview');
      else if (user.role === 'facilitator') setActiveTab('my-courses');
      else setActiveTab('home');
    }
  }, [user?.role]);

  if (verifyUserId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-center p-4">
        <VerifyView
          userId={verifyUserId}
          onClose={() => {
            setVerifyUserId(null);
            window.history.pushState({}, '', '/');
          }}
        />
      </div>
    );
  }

  // Public candidate registration view
  if (isRegistering) {
    return (
      <>
        <AutoMobileInstallPrompt />
        <RegistrationForm
          onBackToLogin={() => {
            setIsRegistering(false);
            window.history.pushState({}, '', '/');
          }}
          onRegistrationComplete={() => {
            // Keep showing confirmation card inside RegistrationForm
          }}
        />
      </>
    );
  }

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono tracking-wider uppercase">
          Initializing Academic Portal Workspace...
        </p>
      </div>
    );
  }

  // If no user is authenticated, display the Universal Dual-Factor Login Screen
  if (!user) {
    return (
      <>
        <OfflineIndicator />
        <AutoMobileInstallPrompt />
        <LoginScreen
          onOpenRegister={() => {
            setIsRegistering(true);
            window.history.pushState({}, '', '/register');
          }}
          onLoginSuccess={(role, redirectUrl) => {
            if (role === 'admin') setActiveTab('overview');
            else if (role === 'facilitator') setActiveTab('my-courses');
            else setActiveTab('home');
          }}
        />
      </>
    );
  }

  const sitesList = [
    { id: 'workspace', title: 'My Workspace' },
    { id: 'sst101', title: 'SST 101: Computer Fundamentals', code: 'SST 101' },
    { id: 'sst201', title: 'SST 201: Excel Financial Modeling', code: 'SST 201' },
    { id: 'sst301', title: 'SST 301: Full-Stack Web Eng.', code: 'SST 301' },
    { id: 'sst401', title: 'SST 401: Capstone Project', code: 'SST 401' },
  ];

  const activeSite = sitesList.find((s) => s.id === currentSiteId) || sitesList[0];

  const renderActiveView = () => {
    // Direct Digital ID Card Tool for any role
    if (activeTab === 'id-card' || activeTab === 'my-id') {
      return (
        <div className="py-4 space-y-6 print:py-0 print:space-y-0">
          <div className="text-center space-y-1 no-print print:hidden">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Official Digital Credential & Badge
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Institutional Pass with cryptographic verification QR, Director signature, and authentic seal.
            </p>
            {/* Format Toggle */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={() => setIdFormat('vertical')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    idFormat === 'vertical'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Official ID Card
                </button>
                <button
                  type="button"
                  onClick={() => setIdFormat('horizontal')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    idFormat === 'horizontal'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Dual-Sided View
                </button>
              </div>
            </div>
          </div>
          {idFormat === 'vertical' ? (
            <DigitalIdCard user={user as any} settings={settings} onOpenVerify={(id) => setVerifyUserId(id)} />
          ) : (
            <DualSidedIdCard user={user as any} onOpenVerify={(id) => setVerifyUserId(id)} />
          )}
        </div>
      );
    }

    // Catalog view (accessible to all roles)
    if (activeTab === 'catalog') {
      return (
        <CatalogView
          onEnrollSuccess={() => {
            if (user.role === 'student') setActiveTab('home');
          }}
        />
      );
    }

    // Professional Hub Tabs (Universal accessibility across roles)
    if (activeTab === 'schedule') {
      return <ScheduleView />;
    }

    if (activeTab === 'quizzes') {
      return <QuizzesView />;
    }

    if (activeTab === 'forums') {
      return <ForumsView />;
    }

    if (activeTab === 'projects') {
      return <ProjectsShowcaseView />;
    }

    if (activeTab === 'attendance') {
      return <AttendanceLabView />;
    }

    if (activeTab === 'preferences') {
      return <PreferencesView />;
    }

    // Role-specific workspaces
    if (user.role === 'admin') {
      return (
        <AdminDashboard
          onOpenIDCard={() => setActiveTab('id-card')}
          activeSubtab={activeTab as any}
          onSelectSubtab={(tab) => setActiveTab(tab)}
        />
      );
    }

    if (user.role === 'facilitator') {
      return (
        <FacilitatorDashboard
          onOpenIDCard={() => setActiveTab('id-card')}
          activeSubtab={activeTab as any}
        />
      );
    }

    // Student role
    return (
      <StudentDashboard
        onOpenIDCard={() => setActiveTab('id-card')}
        onBrowseCatalog={() => setActiveTab('catalog')}
        activeSubtab={activeTab as any}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-white">
      {/* Offline Status Beacon & Automated Mobile Install Prompt */}
      <OfflineIndicator />
      <AutoMobileInstallPrompt />

      {/* Academic LMS Shell Layout */}
      <PortalLayout
        activeTool={activeTab}
        onSelectTool={setActiveTab}
        activeSiteTitle={activeSite.title}
        currentSiteId={currentSiteId}
        onSelectSite={setCurrentSiteId}
        sitesList={sitesList}
      >
        <ErrorBoundary fallbackTitle="Subsystem View Notice" fallbackMessage="This tab view encountered an issue. Switch to another tab or reload to restore state.">
          {renderActiveView()}
        </ErrorBoundary>
      </PortalLayout>

      {/* Profile & Signature Modal */}
      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="StartSmart Tech Hub Error Boundary" fallbackMessage="The application layout encountered an unexpected error. Please reload to restore session.">
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
