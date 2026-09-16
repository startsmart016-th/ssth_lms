import React, { useState, useEffect } from 'react';
import { Course, CourseSession, CourseSessionMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Video,
  FileText,
  Link,
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  FolderKanban,
  Download,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface AdminCatalogManagerProps {
  onCatalogChanged?: () => void;
}

export const AdminCatalogManager: React.FC<AdminCatalogManagerProps> = ({ onCatalogChanged }) => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [courseModalMode, setCourseModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingSessionsCourse, setManagingSessionsCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Course Form fields
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formLevel, setFormLevel] = useState<100 | 200 | 300 | 400>(100);
  const [formCategory, setFormCategory] = useState('Foundation');
  const [formCredits, setFormCredits] = useState(3);
  const [formDurationWeeks, setFormDurationWeeks] = useState(8);
  const [formFacilitatorName, setFormFacilitatorName] = useState('Engr. Sarah Jenkins');
  const [formDescription, setFormDescription] = useState('');
  const [formPrerequisites, setFormPrerequisites] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);

  // Session Form fields
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionWeek, setSessionWeek] = useState(1);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('10:00 AM GMT');
  const [sessionDuration, setSessionDuration] = useState('90 mins');
  const [sessionMeetingLink, setSessionMeetingLink] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  // Add Material Form fields
  const [addingMaterialToSessionId, setAddingMaterialToSessionId] = useState<string | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'pdf' | 'video' | 'sheet' | 'link'>('pdf');
  const [matUrl, setMatUrl] = useState('');
  const [matDescription, setMatDescription] = useState('');
  const [savingMaterial, setSavingMaterial] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];
        setCourses(safeData);
        if (managingSessionsCourse) {
          const updated = safeData.find((c: Course) => c._id === managingSessionsCourse._id);
          if (updated) setManagingSessionsCourse(updated);
        }
      }
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const showNotificationMessage = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreateCourseModal = () => {
    setFormCode('');
    setFormTitle('');
    setFormLevel(100);
    setFormCategory('Foundation');
    setFormCredits(3);
    setFormDurationWeeks(8);
    setFormFacilitatorName('Engr. Sarah Jenkins');
    setFormDescription('');
    setFormPrerequisites('');
    setCourseModalMode('create');
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setFormCode(course.code);
    setFormTitle(course.title);
    setFormLevel(course.level);
    setFormCategory(course.category || 'Foundation');
    setFormCredits(course.credits || 3);
    setFormDurationWeeks(course.durationWeeks || 8);
    setFormFacilitatorName(course.facilitatorName || 'Engr. Sarah Jenkins');
    setFormDescription(course.description || '');
    setFormPrerequisites(Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : (course.prerequisites || ''));
    setCourseModalMode('edit');
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle) {
      showNotificationMessage('error', 'Course code and title are required.');
      return;
    }

    setSavingCourse(true);
    try {
      const payload: any = {
        code: formCode.trim().toUpperCase(),
        title: formTitle.trim(),
        level: Number(formLevel) as 100 | 200 | 300 | 400,
        category: formCategory.trim(),
        credits: Number(formCredits),
        durationWeeks: Number(formDurationWeeks),
        facilitatorName: formFacilitatorName.trim(),
        description: formDescription.trim(),
        prerequisites: formPrerequisites ? formPrerequisites.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      let res: Response;
      if (courseModalMode === 'edit' && editingCourse) {
        res = await fetch(`/api/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showNotificationMessage('success', `Course ${formCode} ${courseModalMode === 'edit' ? 'updated' : 'created'} successfully.`);
        setCourseModalMode(null);
        setEditingCourse(null);
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to save course.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'An error occurred.');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      const res = await fetch(`/api/courses/${deletingCourse._id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        showNotificationMessage('success', `Course ${deletingCourse.code} removed from catalog.`);
        setDeletingCourse(null);
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to delete course.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'Failed to delete course.');
    }
  };

  // Sessions Management
  const openAddSessionForm = () => {
    if (!managingSessionsCourse) return;
    const existingCount = managingSessionsCourse.sessions?.length || 0;
    setEditingSessionId(null);
    setSessionWeek(Math.floor(existingCount / 2) + 1);
    setSessionNumber(existingCount + 1);
    setSessionTitle('');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionTime('10:00 AM GMT');
    setSessionDuration('90 mins');
    setSessionMeetingLink('https://meet.startsmarttech.org/lab');
    setSessionDescription('');
    setShowSessionForm(true);
  };

  const openEditSessionForm = (session: CourseSession) => {
    setEditingSessionId(session.id);
    setSessionWeek(session.week || 1);
    setSessionNumber(session.sessionNumber || 1);
    setSessionTitle(session.title || '');
    setSessionDate(session.date || '');
    setSessionTime(session.time || '10:00 AM GMT');
    setSessionDuration(session.duration || '90 mins');
    setSessionMeetingLink(session.meetingLink || '');
    setSessionDescription(session.description || '');
    setShowSessionForm(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSessionsCourse || !sessionTitle) {
      showNotificationMessage('error', 'Session title is required.');
      return;
    }

    setSavingSession(true);
    try {
      const payload = {
        week: Number(sessionWeek),
        sessionNumber: Number(sessionNumber),
        title: sessionTitle.trim(),
        date: sessionDate,
        time: sessionTime,
        duration: sessionDuration,
        meetingLink: sessionMeetingLink,
        description: sessionDescription.trim(),
      };

      let res: Response;
      if (editingSessionId) {
        res = await fetch(`/api/courses/${managingSessionsCourse._id}/sessions/${editingSessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/courses/${managingSessionsCourse._id}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showNotificationMessage('success', `Session ${editingSessionId ? 'updated' : 'created'} successfully.`);
        setShowSessionForm(false);
        setEditingSessionId(null);
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to save session.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'Failed to save session.');
    } finally {
      setSavingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!managingSessionsCourse) return;
    try {
      const res = await fetch(`/api/courses/${managingSessionsCourse._id}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        showNotificationMessage('success', 'Session deleted.');
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to delete session.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'Failed to delete session.');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSessionsCourse || !addingMaterialToSessionId || !matTitle || !matUrl) {
      showNotificationMessage('error', 'Material title and URL are required.');
      return;
    }

    setSavingMaterial(true);
    try {
      const res = await fetch(`/api/courses/${managingSessionsCourse._id}/sessions/${addingMaterialToSessionId}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: matTitle.trim(),
          type: matType,
          url: matUrl.trim(),
          description: matDescription.trim(),
        }),
      });

      if (res.ok) {
        showNotificationMessage('success', 'Material added to session.');
        setAddingMaterialToSessionId(null);
        setMatTitle('');
        setMatUrl('');
        setMatDescription('');
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to add material.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'Failed to add material.');
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (sessionId: string, materialId: string) => {
    if (!managingSessionsCourse) return;
    try {
      const res = await fetch(`/api/courses/${managingSessionsCourse._id}/sessions/${sessionId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        showNotificationMessage('success', 'Material removed.');
        await loadCourses();
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const err = await res.json();
        showNotificationMessage('error', err.error || 'Failed to delete material.');
      }
    } catch (e: any) {
      showNotificationMessage('error', e.message || 'Failed to delete material.');
    }
  };

  const safeCourses = Array.isArray(courses) ? courses : [];
  const filteredCourses = safeCourses.filter((c) => {
    if (!c) return false;
    const matchesLevel = selectedLevel === 'all' ? true : c.level === selectedLevel;
    const code = (c.code || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    const fac = (c.facilitatorName || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      code.includes(q) ||
      title.includes(q) ||
      fac.includes(q) ||
      desc.includes(q);
    return matchesLevel && matchesSearch;
  });

  const getLevelColor = (level: number) => {
    switch (level) {
      case 100:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 200:
        return 'bg-blue-500/10 text-blue-700 dark:text-sky-400 border-blue-500/30';
      case 300:
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30';
      case 400:
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case 'sheet':
        return <FolderKanban className="w-3.5 h-3.5 text-emerald-500" />;
      case 'link':
        return <Link className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                Official Course Catalog Management (100–400 Levels)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create, edit, and organize all courses, scheduled weeks, and live sessions across the institution.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateCourseModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </section>

      {/* Search & Level Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {(['all', 100, 200, 300, 400] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#05286f] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lvl === 'all' ? 'All Levels' : `${lvl} Level`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, title, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading course catalog...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No courses match your filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your level filter or search keywords, or add a new course to this level.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition shadow-xs group"
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${getLevelColor(course.level)}`}>
                    {course.level} Level • {course.category || 'Foundation'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {course.code}
                  </span>
                </div>

                {/* Course Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {course.description || 'Comprehensive technology curriculum designed for industry mastery.'}
                  </p>
                </div>

                {/* Course Specs */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Credits</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{course.credits || 3} Units</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Duration</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{course.durationWeeks || 8} Wks</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Sessions</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{course.sessions?.length || 0} Built</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">Instructor: <strong className="text-slate-700 dark:text-slate-300">{course.facilitatorName || 'Engr. Sarah Jenkins'}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setManagingSessionsCourse(course)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-800/80 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Weeks & Sessions ({course.sessions?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditCourseModal(course)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="Edit Course Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingCourse(course)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition cursor-pointer"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CREATE / EDIT COURSE MODAL */}
      {/* ======================================================== */}
      {courseModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {courseModalMode === 'edit' ? `Edit Course: ${formCode}` : 'Add New Course to Catalog'}
              </h3>
              <button
                onClick={() => setCourseModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SST 201"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catalog Level *
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value={100}>100 Level (Foundations)</option>
                    <option value={200}>200 Level (Intermediate)</option>
                    <option value={300}>300 Level (Specialization Tracks)</option>
                    <option value={400}>400 Level (Advanced & Capstone)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Full-Stack Cloud Architecture & Systems"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Foundation"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weeks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={formDurationWeeks}
                    onChange={(e) => setFormDurationWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Facilitator / Instructor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engr. Sarah Jenkins"
                  value={formFacilitatorName}
                  onChange={(e) => setFormFacilitatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Syllabus Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Course scope, learning objectives, and core technologies covered..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prerequisites (comma-separated, optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SST 101, SST 102"
                  value={formPrerequisites}
                  onChange={(e) => setFormPrerequisites(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCourseModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition cursor-pointer"
                >
                  {savingCourse ? 'Saving Course...' : courseModalMode === 'edit' ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MANAGE WEEKS & SESSIONS DRAWER / MODAL */}
      {/* ======================================================== */}
      {managingSessionsCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8 text-slate-900 dark:text-white max-h-[90vh] flex flex-col transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300">
                    {managingSessionsCourse.code} • {managingSessionsCourse.level} Level
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {managingSessionsCourse.durationWeeks || 8} Weeks Program
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
                  Manage Weeks & Sessions: {managingSessionsCourse.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sessions created here automatically appear on student, facilitator, and catalog pages.
                </p>
              </div>

              <button
                onClick={() => {
                  setManagingSessionsCourse(null);
                  setShowSessionForm(false);
                  setAddingMaterialToSessionId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {/* Top Controls: Add Session button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Scheduled Curriculum Sessions ({managingSessionsCourse.sessions?.length || 0})</span>
                </span>

                {!showSessionForm && (
                  <button
                    onClick={openAddSessionForm}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Week / Session</span>
                  </button>
                )}
              </div>

              {/* Sub-form: Add / Edit Session Form */}
              {showSessionForm && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 dark:border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {editingSessionId ? 'Edit Session' : 'New Academic Week & Session'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSessionForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveSession} className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Week Number
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={52}
                          required
                          value={sessionWeek}
                          onChange={(e) => setSessionWeek(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Session #
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          required
                          value={sessionNumber}
                          onChange={(e) => setSessionNumber(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={sessionDate}
                          onChange={(e) => setSessionDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Duration
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 90 mins"
                          value={sessionDuration}
                          onChange={(e) => setSessionDuration(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Session Topic / Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cloud Foundations & Microservices"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Virtual Classroom / Meeting Link
                        </label>
                        <input
                          type="text"
                          placeholder="https://meet.jit.si/... or virtual classroom link"
                          value={sessionMeetingLink}
                          onChange={(e) => setSessionMeetingLink(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Session Agenda & Learning Outcomes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Key concepts, lab assignments, and goals for this session..."
                        value={sessionDescription}
                        onChange={(e) => setSessionDescription(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSessionForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingSession}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        {savingSession ? 'Saving...' : editingSessionId ? 'Update Session' : 'Save Session'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sessions List */}
              {(!managingSessionsCourse.sessions || managingSessionsCourse.sessions.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No sessions published yet</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Click &quot;Create Week / Session&quot; above to schedule the academic curriculum for this course.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {managingSessionsCourse.sessions.map((session, idx) => (
                    <div
                      key={session.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      {/* Session Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono uppercase border border-emerald-300 dark:border-emerald-800">
                            Week {session.week || Math.ceil((session.sessionNumber || idx + 1) / 2)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-sky-950 text-blue-800 dark:text-sky-300 text-[10px] font-bold font-mono uppercase border border-blue-300 dark:border-sky-800">
                            Session {session.sessionNumber || idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {session.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {session.date && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {session.date}
                            </span>
                          )}
                          {session.duration && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditSessionForm(session)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                            title="Edit Session Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 dark:hover:text-rose-400"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meeting Link & Description */}
                      {session.meetingLink && (
                        <div className="flex items-center gap-2 text-xs">
                          <Video className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-sky-400 hover:underline font-mono text-[11px] truncate flex items-center gap-1"
                          >
                            <span>{session.meetingLink}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {session.description && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {session.description}
                        </p>
                      )}

                      {/* Materials section */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FolderKanban className="w-3 h-3" />
                            Materials ({session.materials?.length || 0})
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setAddingMaterialToSessionId(session.id);
                              setMatTitle('');
                              setMatType('pdf');
                              setMatUrl('');
                              setMatDescription('');
                            }}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Material</span>
                          </button>
                        </div>

                        {/* Sub-form: Add Material to this session */}
                        {addingMaterialToSessionId === session.id && (
                          <form onSubmit={handleAddMaterial} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-400/50 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="Material title (e.g. Lecture Slides / Lab Sheet)"
                                  value={matTitle}
                                  onChange={(e) => setMatTitle(e.target.value)}
                                  className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <select
                                  value={matType}
                                  onChange={(e) => setMatType(e.target.value as any)}
                                  className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                                >
                                  <option value="pdf">PDF Document</option>
                                  <option value="video">Lecture Video</option>
                                  <option value="sheet">Spreadsheet / Lab</option>
                                  <option value="link">External Resource</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                required
                                placeholder="Download / Access URL (e.g. https://...)"
                                value={matUrl}
                                onChange={(e) => setMatUrl(e.target.value)}
                                className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                              />
                              <input
                                type="text"
                                placeholder="Optional description / notes"
                                value={matDescription}
                                onChange={(e) => setMatDescription(e.target.value)}
                                className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setAddingMaterialToSessionId(null)}
                                className="px-2 py-1 text-[11px] text-slate-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={savingMaterial}
                                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                              >
                                {savingMaterial ? 'Adding...' : 'Add File'}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List of materials */}
                        {session.materials && session.materials.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {session.materials.map((mat, mIdx) => (
                              <div
                                key={mat.id || mIdx}
                                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {getMaterialIcon(mat.type)}
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                      {mat.title}
                                    </p>
                                    <span className="text-[9px] uppercase font-mono text-slate-400 block">
                                      {mat.type}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={mat.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-blue-600 dark:text-sky-400 hover:text-blue-800"
                                    title="Open file"
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(session.id, mat.id)}
                                    className="p-1 text-rose-500 hover:text-rose-700"
                                    title="Remove material"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No materials attached yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setManagingSessionsCourse(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONFIRM DELETE COURSE MODAL */}
      {/* ======================================================== */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white transition-colors">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold font-['Outfit']">Remove Course from Catalog?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{deletingCourse.code} ({deletingCourse.title})</strong>? This will remove all associated syllabus modules and scheduled sessions.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
