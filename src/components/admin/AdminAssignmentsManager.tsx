import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { extractErrorMessage } from '../../utils/apiClient';
import {
  FileCheck,
  Plus,
  Calendar,
  Award,
  Trash2,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  BookOpen,
  AlertCircle,
  X,
  Users,
} from 'lucide-react';

interface AssignmentItem {
  _id: string;
  course: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  createdAt?: string;
}

interface AdminAssignmentsManagerProps {
  coursesList: Course[];
  token: string | null;
  currentSiteId?: string;
}

export const AdminAssignmentsManager: React.FC<AdminAssignmentsManagerProps> = ({
  coursesList,
  token,
  currentSiteId,
}) => {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [formCourseId, setFormCourseId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formMaxScore, setFormMaxScore] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-set filter if currentSiteId matches a course
  useEffect(() => {
    if (currentSiteId && currentSiteId !== 'workspace' && coursesList.length > 0) {
      const clean = currentSiteId.toLowerCase().replace(/\s+/g, '');
      const match = coursesList.find(c => c.code.toLowerCase().replace(/\s+/g, '') === clean || c._id === currentSiteId);
      if (match) {
        setSelectedCourseFilter(match._id);
        setFormCourseId(match._id);
      }
    } else if (coursesList.length > 0 && !formCourseId) {
      setFormCourseId(coursesList[0]._id);
    }
  }, [currentSiteId, coursesList]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAssignments(data);
        }
      }
    } catch (e) {
      console.error('Failed to load assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId || !formTitle.trim()) {
      setNotice({ type: 'error', message: 'Please select a course and enter an assignment title.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId: formCourseId,
          title: formTitle.trim(),
          description: formDescription.trim() || 'Complete the assigned practical exercises and submit documentation.',
          dueDate: formDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          maxScore: formMaxScore || 100,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAssignments(prev => [created, ...prev]);
        setShowCreateModal(false);
        setFormTitle('');
        setFormDescription('');
        setNotice({ type: 'success', message: 'Assignment published successfully to course roster.' });
        setTimeout(() => setNotice(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        const rawErr = err?.error || err?.message || 'Failed to create assignment.';
        setNotice({ type: 'error', message: extractErrorMessage(rawErr, 'Failed to create assignment.') });
      }
    } catch (err: any) {
      setNotice({ type: 'error', message: extractErrorMessage(err, 'Error creating assignment.') });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesCourse = selectedCourseFilter === 'all' || a.course === selectedCourseFilter || a.courseId === selectedCourseFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || (a.courseCode && a.courseCode.toLowerCase().includes(q)) || a.description.toLowerCase().includes(q);
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400">
              <FileCheck className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
              Academic Assignments & Assessments
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, schedule, and oversee technical tasks, coursework rubrics, and deliverables across all 25 courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (coursesList.length > 0 && !formCourseId) {
              setFormCourseId(coursesList[0]._id);
            }
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Assignment</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{typeof notice.message === 'string' ? notice.message : extractErrorMessage(notice.message)}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Course Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments or topics..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Courses ({coursesList.length})</option>
            {coursesList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading course assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCourseFilter !== 'all'
              ? 'No assignments match your filter criteria. Try adjusting the search query or course selection.'
              : 'No assignments have been published yet. Click "New Course Assignment" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((asg) => {
            const matchedCourse = coursesList.find(c => c._id === asg.course || c._id === asg.courseId || c.code === asg.courseCode);
            const courseCode = asg.courseCode || matchedCourse?.code || 'SST';
            const courseTitle = asg.courseTitle || matchedCourse?.title || 'Academic Course';

            return (
              <div
                key={asg._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/50 transition space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                      {courseCode}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {asg.dueDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{asg.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Max {asg.maxScore} Pts</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{courseTitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400">
                  <FileCheck className="w-5 h-5" />
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Publish New Course Assignment
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Course
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a Course...</option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code}: {c.title} (Level {c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Lab 03: Building React Hooks & Custom State"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions & Requirements
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide detailed instructions, repository submission link guidelines, rubric metrics, and deadlines."
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Score / Weight
                  </label>
                  <input
                    type="number"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Publish to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
