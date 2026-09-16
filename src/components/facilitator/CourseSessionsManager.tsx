import React, { useState } from 'react';
import { Course, CourseSession, CourseMaterial } from '../../types';
import {
  Layers,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  FolderKanban,
  Clock,
  Video,
  FileText,
  FileSpreadsheet,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface CourseSessionsManagerProps {
  course: Course;
  token: string | null;
  onCourseUpdated: (updatedCourse: Course) => void;
}

export const CourseSessionsManager: React.FC<CourseSessionsManagerProps> = ({
  course,
  token,
  onCourseUpdated,
}) => {
  // Course Description Editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState(course.description || '');
  const [savingDescription, setSavingDescription] = useState(false);

  // Create Session Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionNumber, setSessionNumber] = useState<number>((course.sessions?.length || 0) + 1);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [initialMatTitle, setInitialMatTitle] = useState('');
  const [initialMatType, setInitialMatType] = useState<'pdf' | 'video' | 'sheet' | 'link'>('pdf');
  const [initialMatUrl, setInitialMatUrl] = useState('');
  const [initialMatDesc, setInitialMatDesc] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // Add Material to Specific Session Modal
  const [targetSession, setTargetSession] = useState<CourseSession | null>(null);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatType, setNewMatType] = useState<'pdf' | 'video' | 'sheet' | 'link'>('pdf');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatDesc, setNewMatDesc] = useState('');
  const [addingMaterial, setAddingMaterial] = useState(false);

  // Helper for material icon
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'sheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  // 1. Save Course Description
  const handleSaveDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDescription(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/description`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ description: descriptionInput }),
      });
      if (res.ok) {
        const updated = await res.json();
        onCourseUpdated(updated);
        setIsEditingDescription(false);
      }
    } catch (err) {
      console.error('Error updating course description:', err);
    } finally {
      setSavingDescription(false);
    }
  };

  // 2. Create Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;
    setCreatingSession(true);
    try {
      const materials = initialMatTitle.trim()
        ? [
            {
              title: initialMatTitle.trim(),
              type: initialMatType,
              url: initialMatUrl.trim() || 'https://startsmart.tech/resources/guide.pdf',
              description: initialMatDesc.trim() || 'Session reference and study guide.',
            },
          ]
        : [];

      const res = await fetch(`/api/courses/${course._id}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: sessionTitle.trim(),
          sessionNumber: Number(sessionNumber) || (course.sessions?.length || 0) + 1,
          date: sessionDate.trim() || `Week ${(course.sessions?.length || 0) + 1}`,
          description: sessionDescription.trim(),
          materials,
        }),
      });

      if (res.ok) {
        const newSession = await res.json();
        const updatedCourse = {
          ...course,
          sessions: [...(course.sessions || []), newSession],
        };
        onCourseUpdated(updatedCourse);
        setShowCreateModal(false);
        setSessionTitle('');
        setSessionDescription('');
        setSessionDate('');
        setInitialMatTitle('');
        setInitialMatUrl('');
        setInitialMatDesc('');
      }
    } catch (err) {
      console.error('Error creating session:', err);
    } finally {
      setCreatingSession(false);
    }
  };

  // 3. Add Material to Session
  const handleAddMaterialToSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSession || !newMatTitle.trim()) return;
    setAddingMaterial(true);
    try {
      const res = await fetch(
        `/api/courses/${course._id}/sessions/${targetSession.id}/materials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: newMatTitle.trim(),
            type: newMatType,
            url: newMatUrl.trim() || 'https://startsmart.tech/resources/reading.pdf',
            description: newMatDesc.trim(),
          }),
        }
      );

      if (res.ok) {
        const addedMat = await res.json();
        const updatedSessions = (course.sessions || []).map((s) => {
          if (s.id === targetSession.id) {
            return {
              ...s,
              materials: [...(s.materials || []), addedMat],
            };
          }
          return s;
        });

        const updatedCourse = { ...course, sessions: updatedSessions };
        onCourseUpdated(updatedCourse);
        setTargetSession(null);
        setNewMatTitle('');
        setNewMatUrl('');
        setNewMatDesc('');
      }
    } catch (err) {
      console.error('Error adding material:', err);
    } finally {
      setAddingMaterial(false);
    }
  };

  // 4. Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Delete this session and all its associated materials?')) return;
    try {
      const res = await fetch(`/api/courses/${course._id}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const updatedCourse = {
          ...course,
          sessions: (course.sessions || []).filter((s) => s.id !== sessionId),
        };
        onCourseUpdated(updatedCourse);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const sessions = course.sessions || [];

  return (
    <div className="space-y-6">
      {/* 1. COURSE DESCRIPTION CARD (With Edit Capabilities) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-['Outfit']">
              Official Course Description & Overview
            </h4>
          </div>
          {!isEditingDescription ? (
            <button
              onClick={() => {
                setDescriptionInput(course.description || '');
                setIsEditingDescription(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Description</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingDescription(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {isEditingDescription ? (
          <form onSubmit={handleSaveDescription} className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-300">
              Provide thorough syllabus overview, prerequisites, and learning goals:
            </label>
            <textarea
              rows={3}
              required
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="e.g. This course introduces modern data-driven architectures and hands-on laboratory exercises..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingDescription(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDescription}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingDescription ? 'Saving...' : 'Save Description'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {course.description || 'No description added yet. Click "Edit Description" to provide an overview for students.'}
            </p>
          </div>
        )}
      </div>

      {/* 2. SESSIONS HEADER & CREATE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-['Outfit']">
              Course Sessions & Modules ({sessions.length})
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize lectures into chronological sessions, provide detailed topic descriptions, and attach lecture slide decks, spreadsheets, or code links.
          </p>
        </div>

        <button
          onClick={() => {
            setSessionNumber(sessions.length + 1);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Session</span>
        </button>
      </div>

      {/* 3. SESSIONS LIST */}
      {sessions.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Layers className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
          <p className="text-sm font-bold text-white">No Sessions Created Yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You haven't added any sessions to this course yet. Click "Create New Session" to define session topics, descriptions, and publish study materials for students.
          </p>
          <button
            onClick={() => {
              setSessionNumber(1);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition"
          >
            Create Session 1
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={session.id || index}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700/80 transition"
            >
              {/* Session Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Session {session.sessionNumber || index + 1}
                    </span>
                    {session.date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {session.date}
                      </span>
                    )}
                  </div>
                  <h5 className="text-base font-bold text-white font-['Outfit']">
                    {session.title}
                  </h5>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetSession(session);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Material</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Session Description Box */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Session Description & Objectives
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {session.description || 'No specific description added.'}
                </p>
              </div>

              {/* Session Attached Materials */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Session Materials & Downloads ({session.materials?.length || 0})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Available to all enrolled students</span>
                </div>

                {(!session.materials || session.materials.length === 0) ? (
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center">
                    <p className="text-xs text-slate-400">No materials attached to this session yet.</p>
                    <button
                      onClick={() => setTargetSession(session)}
                      className="text-xs font-semibold text-emerald-400 hover:underline mt-1 inline-block"
                    >
                      + Attach Slide Deck, Sheet, or Video Link
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {session.materials.map((mat, mIdx) => (
                      <div
                        key={mat.id || mIdx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                            {getMaterialIcon(mat.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{mat.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="uppercase font-mono font-semibold text-emerald-400">
                                {mat.type}
                              </span>
                              {mat.description && (
                                <span className="truncate max-w-[140px]">{mat.description}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <a
                          href={mat.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs shrink-0 transition"
                          title="Open Resource"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NEW SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Create New Course Session
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              For <strong className="text-white">{course.code}: {course.title}</strong>. This session and its attached resources will be instantly visible on student dashboards.
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Session #</label>
                  <input
                    type="number"
                    min={1}
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date / Schedule Tag</label>
                  <input
                    type="text"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    placeholder="e.g. Week 3: Oct 14 - Oct 20"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Relational Data Modeling & Normalization"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Session Description & Learning Directions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  placeholder="Provide lecture notes, agenda, discussion questions, and instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Optional Initial Material Attachment */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Attach Initial Material (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resource Title</label>
                    <input
                      type="text"
                      value={initialMatTitle}
                      onChange={(e) => setInitialMatTitle(e.target.value)}
                      placeholder="e.g. Session 3 Slide Deck"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resource Type</label>
                    <select
                      value={initialMatType}
                      onChange={(e) => setInitialMatType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="pdf">PDF Slide Deck / Doc</option>
                      <option value="video">Video Lecture Recording</option>
                      <option value="sheet">Excel / Spreadsheet Dataset</option>
                      <option value="link">Web Resource / Repo Link</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Material URL / Link</label>
                  <input
                    type="text"
                    value={initialMatUrl}
                    onChange={(e) => setInitialMatUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSession}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition"
                >
                  {creatingSession ? 'Publishing...' : 'Publish Session to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTACH MATERIAL MODAL */}
      {targetSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Add Material to Session
                </h3>
              </div>
              <button
                onClick={() => setTargetSession(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Session: <strong className="text-white">Session {targetSession.sessionNumber}: {targetSession.title}</strong>
            </p>

            <form onSubmit={handleAddMaterialToSession} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="e.g. Lab Exercise 3 Starter Code"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={newMatType}
                    onChange={(e) => setNewMatType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video Recording</option>
                    <option value="sheet">Excel Sheet</option>
                    <option value="link">Resource Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL / Link *</label>
                  <input
                    type="text"
                    required
                    value={newMatUrl}
                    onChange={(e) => setNewMatUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description (Optional)</label>
                <input
                  type="text"
                  value={newMatDesc}
                  onChange={(e) => setNewMatDesc(e.target.value)}
                  placeholder="e.g. Complete before next seminar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMaterial}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition"
                >
                  {addingMaterial ? 'Attaching...' : 'Attach Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
