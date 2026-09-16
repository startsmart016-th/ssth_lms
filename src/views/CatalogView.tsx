import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdminCatalogManager } from '../components/admin/AdminCatalogManager';
import {
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle,
  Layers,
  Clock,
  Award,
  ChevronRight,
  Filter,
  X,
  UserCheck,
  Calendar,
  Video,
  ExternalLink,
  FolderKanban,
  Download,
  Edit,
  Plus,
  ShieldAlert,
} from 'lucide-react';

interface CatalogViewProps {
  onEnrollSuccess?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onEnrollSuccess }) => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [myEnrollments, setMyEnrollments] = useState<string[]>([]);
  const [adminControlActive, setAdminControlActive] = useState(false);

  async function loadCatalog() {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (res.ok) setCourses(await res.json());

      if (user && user.role === 'student') {
        const enrRes = await fetch(`/api/enrollments/student/${user._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (enrRes.ok) {
          const list = await enrRes.json();
          setMyEnrollments(list.map((e: any) => e.course?._id || e.course));
        }
      }
    } catch (e) {
      console.error('Failed to load catalog:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setEnrolling(true);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          student: user._id,
          course: courseId,
        }),
      });

      if (res.ok) {
        setEnrollSuccess(true);
        setMyEnrollments([...myEnrollments, courseId]);
        setTimeout(() => {
          setEnrollSuccess(false);
          setSelectedCourse(null);
          if (onEnrollSuccess) onEnrollSuccess();
        }, 1600);
      }
    } catch (e) {
      console.error('Enrollment error:', e);
    } finally {
      setEnrolling(false);
    }
  };

  const filtered = courses.filter(c => {
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const levelDescriptions: Record<number, string> = {
    100: 'Foundation Courses: Core computing, digital literacy, and logic fundamentals',
    200: 'Intermediate Tech Tracks: Full-stack, mobile, frontend, and backend foundations',
    300: 'Specialization Programs: Cloud, DevOps, Cyber Defense, AI, Data Systems',
    400: 'Advanced Executive & Capstone: Deep learning, Distributed Systems, Architecture',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Admin Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            Official Course Catalog (100–400 Levels)
          </h2>
          <p className="text-xs text-slate-400">
            Curated industry curriculum across Software Engineering, Cloud, Artificial Intelligence, and Product Design.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setAdminControlActive(!adminControlActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md active:scale-95 cursor-pointer shrink-0 ${
              adminControlActive
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>{adminControlActive ? 'Exit Admin Editor' : 'Admin: Edit Catalog, Add & Manage Sessions'}</span>
          </button>
        )}
      </div>

      {adminControlActive && user?.role === 'admin' ? (
        <AdminCatalogManager onCatalogChanged={loadCatalog} />
      ) : (
        <>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search courses by code (e.g., SST 101, SST 301) or tech topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['all', 100, 200, 300, 400] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 ${
                levelFilter === lvl
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'All 25 Courses' : `${lvl} Level`}
            </button>
          ))}
        </div>

        {levelFilter !== 'all' && (
          <p className="text-[11px] text-sky-400/90 font-medium px-1">
            {levelDescriptions[levelFilter]}
          </p>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading catalog modules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => {
            const isEnrolled = myEnrollments.includes(course._id);

            return (
              <div
                key={course._id}
                onClick={() => setSelectedCourse(course)}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition space-y-3 group shadow-lg hover:shadow-sky-950/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    {course.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Level {course.level}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-sky-300 transition">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{course.category}</span>
                  {isEnrolled ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  ) : (
                    <span className="text-sky-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 my-auto text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {selectedCourse.code}
                  </span>
                  <span className="text-xs text-slate-400">Level {selectedCourse.level} Program</span>
                </div>
                <h3 className="text-lg font-black text-white font-['Outfit']">{selectedCourse.title}</h3>
                <p className="text-xs text-sky-300 font-medium">{selectedCourse.category}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedCourse.description}</p>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Academic Credits</span>
                <span className="font-semibold text-white">{selectedCourse.credits || 3} Credit Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                <span className="font-semibold text-white">{selectedCourse.durationWeeks || 8} Weeks Intensive</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Lead Instructor</span>
                <span className="font-semibold text-emerald-400">{selectedCourse.facilitatorName || 'Engr. Sarah Jenkins'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Credential Earned</span>
                <span className="font-semibold text-amber-400">Verified Certificate</span>
              </div>
            </div>

            {/* Course Syllabus / Modules */}
            {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Weekly Syllabus & Topics
                </h5>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {selectedCourse.syllabus.map((mod, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[10px] font-mono text-sky-400 font-bold block">
                        Week {mod.week}: {mod.title}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">{mod.topics?.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Weeks & Scheduled Sessions Created by Admin / Facilitators */}
            {selectedCourse.sessions && selectedCourse.sessions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Curriculum Weeks & Scheduled Sessions</span>
                  </h5>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {selectedCourse.sessions.length} Live Sessions
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                  {selectedCourse.sessions.map((sess, idx) => (
                    <div key={sess.id || idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Week {sess.week || Math.ceil((sess.sessionNumber || idx + 1) / 2)} • Session {sess.sessionNumber || idx + 1}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          {sess.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {sess.date}
                            </span>
                          )}
                          {sess.duration && <span>({sess.duration})</span>}
                        </div>
                      </div>

                      <h6 className="font-bold text-white text-xs">{sess.title}</h6>
                      {sess.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed">{sess.description}</p>
                      )}

                      {sess.meetingLink && (
                        <div className="flex items-center gap-1 text-[11px] text-sky-400 pt-0.5">
                          <Video className="w-3 h-3 text-sky-400 shrink-0" />
                          <a
                            href={sess.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline font-mono truncate"
                          >
                            Classroom: {sess.meetingLink}
                          </a>
                        </div>
                      )}

                      {sess.materials && sess.materials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
                          {sess.materials.map((m, mIdx) => (
                            <a
                              key={m.id || mIdx}
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 hover:text-white flex items-center gap-1"
                            >
                              <Download className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="truncate max-w-[140px]">{m.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {enrollSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enrolled! ✉️ Official enrollment email receipt sent to {user?.email}.</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              {user?.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    setAdminControlActive(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Admin: Edit Course & Weeks</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>

                {user?.role === 'student' && (
                  <button
                    onClick={() => handleEnroll(selectedCourse._id)}
                    disabled={enrolling || myEnrollments.includes(selectedCourse._id)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50 ${
                      myEnrollments.includes(selectedCourse._id)
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white'
                    }`}
                  >
                    {enrollSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Enrolled!
                      </>
                    ) : myEnrollments.includes(selectedCourse._id) ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Already Enrolled
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4" />
                        <span>{enrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
