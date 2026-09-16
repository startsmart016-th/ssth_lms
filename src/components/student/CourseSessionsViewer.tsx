import React from 'react';
import { Course, CourseSession, CourseMaterial } from '../../types';
import {
  Layers,
  Clock,
  Video,
  FileText,
  FileSpreadsheet,
  Link as LinkIcon,
  ExternalLink,
  BookOpen,
  FolderKanban,
  Download,
  Info,
} from 'lucide-react';

interface CourseSessionsViewerProps {
  course: Course;
}

export const CourseSessionsViewer: React.FC<CourseSessionsViewerProps> = ({ course }) => {
  const sessions = course.sessions || [];

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

  return (
    <div className="space-y-6">
      {/* 1. Official Course Description Provided by Facilitator */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs transition-colors">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
            Course Description & Objectives
          </h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {course.description || 'No detailed course description provided yet.'}
          </p>
        </div>
      </div>

      {/* 2. Sessions Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              Published Course Sessions & Materials ({sessions.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access lecture guides, learning objectives, and materials posted by {course.facilitatorName || 'your facilitator'}.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Sessions List */}
      {sessions.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-xs transition-colors">
          <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No Sessions Published Yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your instructor has not published any lecture sessions for this course yet. Check back soon for scheduled modules and downloads.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div
              key={session.id || idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs transition-colors"
            >
              {/* Session Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30 font-mono">
                    Session {session.sessionNumber || idx + 1}
                  </span>
                  <h5 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {session.title}
                  </h5>
                </div>
                {session.date && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {session.date}
                  </span>
                )}
              </div>

              {/* Session Description */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Session Description & Learning Goals
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {session.description || 'No detailed instructions for this session.'}
                </p>
              </div>

              {/* Attached Materials */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  <span>Session Downloads & Learning Materials ({session.materials?.length || 0})</span>
                </span>

                {(!session.materials || session.materials.length === 0) ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-1">
                    No files or links attached to this session.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {session.materials.map((mat, mIdx) => (
                      <div
                        key={mat.id || mIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-750 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                            {getMaterialIcon(mat.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{mat.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="uppercase font-mono font-semibold text-blue-600 dark:text-sky-400">
                                {mat.type}
                              </span>
                              {mat.description && (
                                <span className="truncate max-w-[150px]">{mat.description}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <a
                          href={mat.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-transparent text-xs font-medium flex items-center gap-1 transition shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Access</span>
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
    </div>
  );
};
