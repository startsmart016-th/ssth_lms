import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Bell,
  CheckCircle2,
  Users,
  Send,
  Calendar,
  X,
  Radio,
} from 'lucide-react';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  priority: 'info' | 'important' | 'urgent';
  target: 'all' | 'students' | 'facilitators' | 'level100';
  authorName: string;
  createdAt: string;
  active: boolean;
}

interface AdminBroadcastsProps {
  token: string | null;
}

export const AdminBroadcasts: React.FC<AdminBroadcastsProps> = ({ token }) => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'info' | 'important' | 'urgent'>('info');
  const [target, setTarget] = useState<'all' | 'students' | 'facilitators' | 'level100'>('all');
  const [publishing, setPublishing] = useState(false);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/broadcasts', {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch broadcasts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, [token]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPublishing(true);
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
          target,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setPriority('info');
        setTarget('all');
        setShowCompose(false);
        await fetchBroadcasts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to publish broadcast.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campus broadcast?')) return;
    try {
      const res = await fetch(`/api/admin/broadcasts/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setBroadcasts((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete broadcast:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Campus Broadcasts & Emergency Alerts Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dispatch announcements, institutional notifications, and lab directives to faculty and student portals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Campus Broadcast</span>
        </button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-500 animate-pulse" />
                  Compose Campus Broadcast
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transmits live to student portals and notification centers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Broadcast Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab Hardware Maintenance & NVMe Upgrades"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="info">General Info (Standard)</option>
                    <option value="important">Important (High Priority)</option>
                    <option value="urgent">Urgent Alert (Emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="all">Entire Campus (All Users)</option>
                    <option value="students">Students Only</option>
                    <option value="facilitators">Facilitators & Faculty Only</option>
                    <option value="level100">Level 100 Foundation Cohort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Body & Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed message, operational hours, room numbers, or requirements..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publishing ? 'Broadcasting...' : 'Publish Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Loading campus broadcasts...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-2">
            <Megaphone className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No campus broadcasts currently active
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Publish an announcement to notify students and faculty.
            </p>
          </div>
        ) : (
          broadcasts.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition shadow-xs ${
                b.priority === 'urgent'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  : b.priority === 'important'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        b.priority === 'urgent'
                          ? 'bg-rose-500 text-white border-rose-600'
                          : b.priority === 'important'
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                      }`}
                    >
                      {b.priority === 'urgent'
                        ? 'Urgent Alert'
                        : b.priority === 'important'
                        ? 'Important Notice'
                        : 'General Bulletin'}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      Target: {b.target}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(b.createdAt).toLocaleDateString()} at{' '}
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {b.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {b.content}
                  </p>

                  <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Issued by: <span className="font-semibold text-slate-700 dark:text-slate-200">{b.authorName}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    title="Delete Broadcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
