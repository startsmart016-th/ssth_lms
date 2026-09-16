import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  CheckCircle2,
  Tag,
  Code,
  Copy,
  Check,
  Send,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { ForumTopic, ForumReply, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export const ForumsView: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterSolved, setFilterSolved] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // New topic modal
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ForumTopic['category']>('general');
  const [newContent, setNewContent] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [newTags, setNewTags] = useState('');

  // Reply form
  const [replyText, setReplyText] = useState('');
  const [replyCode, setReplyCode] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const initialTopics: ForumTopic[] = [
    {
      id: 'topic-1',
      title: 'How do I resolve "CORS error when calling Express backend from Vite dev server"?',
      category: 'react',
      authorName: 'Ibrahim Alhassan',
      authorRole: 'student',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      content: 'During our SST 301 lab, when executing fetch("/api/students") from localhost:3000, Vite handles the proxy, but when calling a remote endpoint directly, the browser blocks it with a CORS policy error. What is the standard configuration in Express?',
      codeSnippet: `// server.ts Express CORS configuration\nimport cors from 'cors';\n\napp.use(cors({\n  origin: ['http://localhost:3000', 'https://portal.startsmart.tech'],\n  credentials: true,\n}));`,
      tags: ['#react', '#express', '#cors', '#sst301'],
      createdAt: '2 hours ago',
      views: 142,
      upvotes: 18,
      isSolved: true,
      replies: [
        {
          id: 'rep-1',
          authorName: 'Engr. Sarah Jenkins',
          authorRole: 'facilitator',
          authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          content: 'Excellent question, Ibrahim. In development mode, Vite provides middleware proxying directly in the dev server config, avoiding CORS entirely. For standalone Express deployments, mounting the cors() middleware with exact origin matches as shown below solves it cleanly.',
          codeSnippet: `// In vite.config.ts\nexport default defineConfig({\n  server: {\n    proxy: {\n      '/api': 'http://localhost:3000',\n    },\n  },\n});`,
          createdAt: '1 hour ago',
          isSolution: true,
          upvotes: 14,
        },
      ],
    },
    {
      id: 'topic-2',
      title: 'Best practice for building a 3-Statement Financial Cash Flow model in SST 201?',
      category: 'excel',
      authorName: 'Amina Yakubu',
      authorRole: 'student',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      content: 'When linking the Balance Sheet to the Cash Flow statement, what is the best way to ensure the cash balance always reconciles to zero variance without circular references?',
      tags: ['#financial-modeling', '#excel', '#balance-sheet', '#sst201'],
      createdAt: '5 hours ago',
      views: 98,
      upvotes: 12,
      isSolved: true,
      replies: [
        {
          id: 'rep-2',
          authorName: 'David Mensah, FCCA',
          authorRole: 'facilitator',
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          content: 'Always drive the Cash and Cash Equivalents row on the Balance Sheet directly from the ending balance row of your Cash Flow Statement, not the other way around. Keep working capital changes strictly driven by (Prior Period - Current Period) logic for assets.',
          createdAt: '3 hours ago',
          isSolution: true,
          upvotes: 9,
        },
      ],
    },
    {
      id: 'topic-3',
      title: 'Connecting Tamale Microgrid IoT sensors over MQTT with Node.js broker',
      category: 'capstone',
      authorName: 'Kofi Mensah',
      authorRole: 'student',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      content: 'Our SST 401 capstone group is testing ESP32 solar telemetry packets. We want to know if Aedes or Mosquitto is preferred for our local hub deployment in Tamale before forwarding data to Cloud Run.',
      tags: ['#capstone', '#iot', '#mqtt', '#sst401', '#solar'],
      createdAt: '1 day ago',
      views: 210,
      upvotes: 24,
      isSolved: false,
      replies: [
        {
          id: 'rep-3',
          authorName: 'Dr. Kwame Boateng',
          authorRole: 'facilitator',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          content: 'Mosquitto running inside a lightweight Alpine container on the Hub local gateway is rock solid. It has negligible CPU overhead and easily handles reconnection buffers during intermittent internet drops.',
          createdAt: '18 hours ago',
          isSolution: false,
          upvotes: 7,
        },
      ],
    },
  ];

  const [topics, setTopics] = useState<ForumTopic[]>(() => {
    try {
      const stored = localStorage.getItem('sst_forum_topics');
      return stored ? JSON.parse(stored) : initialTopics;
    } catch {
      return initialTopics;
    }
  });

  const saveTopics = (newTopics: ForumTopic[]) => {
    setTopics(newTopics);
    localStorage.setItem('sst_forum_topics', JSON.stringify(newTopics));
  };

  const handleCopyCode = (code: string, id: string) => {
    playClickSound();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleUpvoteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updated = topics.map((t) => {
      if (t.id === topicId) return { ...t, upvotes: t.upvotes + 1 };
      return t;
    });
    saveTopics(updated);
  };

  const handleUpvoteReply = (topicId: string, replyId: string) => {
    playClickSound();
    const updated = topics.map((t) => {
      if (t.id === topicId) {
        return {
          ...t,
          replies: t.replies.map((r) => (r.id === replyId ? { ...r, upvotes: r.upvotes + 1 } : r)),
        };
      }
      return t;
    });
    saveTopics(updated);
  };

  const handleMarkSolution = (topicId: string, replyId: string) => {
    playSuccessSound();
    const updated = topics.map((t) => {
      if (t.id === topicId) {
        return {
          ...t,
          isSolved: true,
          replies: t.replies.map((r) => ({
            ...r,
            isSolution: r.id === replyId,
          })),
        };
      }
      return t;
    });
    saveTopics(updated);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTopicId || !user) return;
    playClickSound();

    const newReply: ForumReply = {
      id: `rep-${Date.now()}`,
      authorName: user.fullName || user.name,
      authorRole: user.role,
      authorAvatar: user.avatarUrl,
      content: replyText,
      codeSnippet: replyCode.trim() || undefined,
      createdAt: 'Just now',
      isSolution: false,
      upvotes: 0,
    };

    const updated = topics.map((t) => {
      if (t.id === activeTopicId) {
        return { ...t, replies: [...t.replies, newReply] };
      }
      return t;
    });

    saveTopics(updated);
    setReplyText('');
    setReplyCode('');
    playSuccessSound();
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user) return;
    playClickSound();

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newTopic: ForumTopic = {
      id: `topic-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      authorName: user.fullName || user.name,
      authorRole: user.role,
      authorAvatar: user.avatarUrl,
      content: newContent,
      codeSnippet: newCodeSnippet.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : [`#${newCategory}`],
      createdAt: 'Just now',
      views: 1,
      upvotes: 1,
      isSolved: false,
      replies: [],
    };

    const updated = [newTopic, ...topics];
    saveTopics(updated);
    setShowNewTopicModal(false);
    setNewTitle('');
    setNewContent('');
    setNewCodeSnippet('');
    setNewTags('');
    setActiveTopicId(newTopic.id);
    playSuccessSound();
  };

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSolved =
      filterSolved === 'all' ||
      (filterSolved === 'solved' && t.isSolved) ||
      (filterSolved === 'unsolved' && !t.isSolved);

    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSolved && matchesSearch;
  });

  const activeTopic = topics.find((t) => t.id === activeTopicId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              Tech Hub Community
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Peer Discussion & Code Troubleshooting
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Community Forums & Code Q&A
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Collaborate with fellow scholars, ask coding questions, review financial models, and receive verified answers from faculty leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setShowNewTopicModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#05286f]/20 dark:shadow-[#4ea836]/20 transition active:scale-95 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Discussion</span>
        </button>
      </div>

      {/* Main Container: Topic List vs Detail View */}
      {activeTopic ? (
        /* Detailed Topic Thread */
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setActiveTopicId(null);
            }}
            className="text-xs font-bold text-[#05286f] dark:text-[#8ee079] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>&larr; Back to All Discussions</span>
          </button>

          {/* Original Question Card */}
          <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#030a1a] text-[#05286f] dark:text-[#8ee079] border border-slate-200 dark:border-[#0e2a66]">
                    #{activeTopic.category}
                  </span>
                  {activeTopic.isSolved && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Solved</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{activeTopic.createdAt}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                  {activeTopic.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={(e) => handleUpvoteTopic(activeTopic.id, e)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] border border-slate-200 dark:border-[#0e2a66] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-blue-600 dark:text-[#8ee079]" />
                <span>{activeTopic.upvotes}</span>
              </button>
            </div>

            {/* Author bar */}
            <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <img
                src={activeTopic.authorAvatar}
                alt={activeTopic.authorName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="font-bold text-slate-900 dark:text-white">{activeTopic.authorName}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#030a1a] font-mono">
                {activeTopic.authorRole}
              </span>
            </div>

            {/* Question Body */}
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {activeTopic.content}
            </p>

            {/* Code Snippet if present */}
            {activeTopic.codeSnippet && (
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeTopic.codeSnippet!, 'question')}
                  className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
                >
                  {copiedCodeId === 'question' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodeId === 'question' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre>{activeTopic.codeSnippet}</pre>
              </div>
            )}

            {/* Tags */}
            <div className="flex items-center gap-1.5 pt-2 flex-wrap">
              {activeTopic.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#030a1a] px-2 py-0.5 rounded border border-slate-200 dark:border-[#0e2a66]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Replies Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#4ea836]" />
              <span>Responses & Solutions ({activeTopic.replies.length})</span>
            </h4>

            {activeTopic.replies.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#071530] rounded-3xl border border-slate-200 dark:border-[#0e2a66] text-xs text-slate-500 dark:text-slate-400">
                No replies yet. Be the first scholar or facilitator to share a solution!
              </div>
            ) : (
              activeTopic.replies.map((reply) => {
                const isFacilitator = reply.authorRole === 'facilitator' || reply.authorRole === 'admin';
                return (
                  <div
                    key={reply.id}
                    className={`p-5 rounded-2xl border space-y-3 transition ${
                      reply.isSolution
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-600/50'
                        : 'bg-white dark:bg-[#071530] border-slate-200 dark:border-[#0e2a66]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={reply.authorAvatar}
                          alt={reply.authorName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {reply.authorName}
                            </span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold ${
                                isFacilitator
                                  ? 'bg-[#4ea836]/20 text-[#245817] dark:text-[#8ee079]'
                                  : 'bg-slate-100 dark:bg-[#030a1a] text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {reply.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {reply.isSolution ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Solution</span>
                          </span>
                        ) : (
                          (user?.role === 'facilitator' || user?.role === 'admin') && (
                            <button
                              type="button"
                              onClick={() => handleMarkSolution(activeTopic.id, reply.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 transition cursor-pointer"
                            >
                              Mark as Solution
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => handleUpvoteReply(activeTopic.id, reply.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3 text-blue-600 dark:text-[#8ee079]" />
                          <span>{reply.upvotes}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {reply.content}
                    </p>

                    {reply.codeSnippet && (
                      <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(reply.codeSnippet!, reply.id)}
                          className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
                        >
                          {copiedCodeId === reply.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeId === reply.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <pre>{reply.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleAddReply}
            className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-5 shadow-xs space-y-3"
          >
            <h5 className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
              Post Your Reply or Code Explanation
            </h5>

            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Explain your approach, diagnosis, or recommendation..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4ea836]"
              required
            />

            <input
              type="text"
              value={replyCode}
              onChange={(e) => setReplyCode(e.target.value)}
              placeholder="Optional: Paste a one-line command or short code snippet..."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] font-mono text-slate-800 dark:text-emerald-400 focus:outline-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Response</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Topics Overview List */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#071530] p-3 rounded-2xl border border-slate-200 dark:border-[#0e2a66]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, questions, or #tags..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  playClickSound();
                  setSelectedCategory(e.target.value);
                }}
                className="text-xs bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="general">#general</option>
                <option value="react">#react-typescript</option>
                <option value="excel">#financial-modeling</option>
                <option value="cloud">#cloud-devops</option>
                <option value="capstone">#capstone</option>
                <option value="career">#career</option>
              </select>

              <select
                value={filterSolved}
                onChange={(e) => {
                  playClickSound();
                  setFilterSolved(e.target.value as any);
                }}
                className="text-xs bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="solved">Solved Only</option>
                <option value="unsolved">Open Discussions</option>
              </select>
            </div>
          </div>

          {/* Topic Cards */}
          <div className="space-y-3">
            {filteredTopics.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#071530] rounded-3xl border border-slate-200 dark:border-[#0e2a66] space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No discussions found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Try adjusting your search query or start a new topic thread above!
                </p>
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTopicId(topic.id);
                  }}
                  className="p-5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#030a1a] text-[#05286f] dark:text-[#8ee079] border border-slate-200 dark:border-[#0e2a66]">
                        #{topic.category}
                      </span>
                      {topic.isSolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">{topic.createdAt}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 font-['Outfit']">
                      {topic.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {topic.content}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {topic.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="flex items-center gap-4 text-xs shrink-0 self-start sm:self-center">
                    <div className="text-center">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {topic.replies.length}
                      </span>
                      <span className="text-[10px] text-slate-400">Replies</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleUpvoteTopic(topic.id, e)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] border border-slate-200 dark:border-[#0e2a66] text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-600 dark:text-[#8ee079]" />
                      <span>{topic.upvotes}</span>
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: New Topic */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowNewTopicModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-3">
              <div>
                <h3 className="text-lg font-bold font-['Outfit']">Start a New Discussion</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask a question or share knowledge with the StartSmart tech community.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTopicModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Discussion Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to optimize SQLite indexes for financial reports?"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="general">#general</option>
                  <option value="react">#react-typescript</option>
                  <option value="excel">#financial-modeling</option>
                  <option value="cloud">#cloud-devops</option>
                  <option value="capstone">#capstone</option>
                  <option value="career">#career</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Details & Problem Description</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe what you are trying to accomplish and what error or outcome occurred..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Optional Code Snippet</label>
                <textarea
                  rows={3}
                  value={newCodeSnippet}
                  onChange={(e) => setNewCodeSnippet(e.target.value)}
                  placeholder="Paste relevant code or bash terminal logs here..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] font-mono text-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. #react, #docker, #sst301"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold shadow"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
