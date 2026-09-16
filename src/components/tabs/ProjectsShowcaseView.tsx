import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Github,
  Heart,
  Tag,
  Users,
  Award,
  Filter,
  CheckCircle2,
  Code,
  Layers,
  ArrowUpRight,
  Plus,
  X,
  Send,
  Zap,
} from 'lucide-react';
import { CapstoneProject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export const ProjectsShowcaseView: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<CapstoneProject | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCategory, setNewCategory] = useState<CapstoneProject['category']>('agritech');
  const [newSummary, setNewSummary] = useState('');
  const [newTechStack, setNewTechStack] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const initialProjects: CapstoneProject[] = [
    {
      id: 'proj-1',
      title: 'AgriSmart Grain Market USSD & Telemetry',
      tagline: 'Offline-capable USSD exchange linking Northern smallholder maize & soybean farmers directly to regional commodity buyers.',
      category: 'agritech',
      authors: [
        { name: 'Ibrahim Alhassan', role: 'Full-Stack Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { name: 'Amina Yakubu', role: 'Data & Financial Analyst', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      ],
      cohortYear: '2025/2026',
      level: 400,
      summary: 'Smallholder grain farmers in northern Ghana frequently face 30% harvest markdowns due to intermediary opacity. AgriSmart provides real-time local price discovery via SMS/USSD (*920*44#) backed by an Express/Postgres inventory engine and automated mobile money escrow.',
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Africa’s Talking USSD API', 'Tailwind CSS'],
      metrics: [
        { label: 'Registered Farmers', value: '4,280+' },
        { label: 'Volume Traded', value: 'GH₵ 840,000' },
        { label: 'Avg Price Gain', value: '+22%' },
      ],
      demoUrl: 'https://agrismart-demo.startsmart.tech',
      repoUrl: 'https://github.com/startsmart-hub/agrismart-platform',
      likes: 42,
      featured: true,
    },
    {
      id: 'proj-2',
      title: 'Tamale Savanna Solar Microgrid IoT Monitor',
      tagline: 'Edge IoT telemetry hardware and dashboard optimizing solar PV battery charging across decentralized community mini-grids.',
      category: 'cleantech',
      authors: [
        { name: 'Kofi Mensah', role: 'IoT & Firmware Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
        { name: 'Suleiman Issah', role: 'Cloud DevOps', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
      ],
      cohortYear: '2025/2026',
      level: 400,
      summary: 'Monitors battery state-of-charge, inverter temperature, and kilowatt-hour draw across 8 rural community solar installations in the Savanna region. Custom ESP32 firmware transmits MQTT telemetry over 2G/LoRa to a lightweight broker with automated low-battery alerts.',
      techStack: ['ESP32 C++', 'MQTT / Mosquitto', 'Node.js', 'React', 'TimescaleDB', 'Docker'],
      metrics: [
        { label: 'Active Microgrids', value: '8 Sites' },
        { label: 'Uptime Reliability', value: '99.8%' },
        { label: 'Battery Lifespan Gain', value: '+35%' },
      ],
      demoUrl: 'https://solar-telemetry.startsmart.tech',
      repoUrl: 'https://github.com/startsmart-hub/savanna-solar-iot',
      likes: 38,
      featured: true,
    },
    {
      id: 'proj-3',
      title: 'HealthClinic Offline-First Digital Triage EMR',
      tagline: 'Zero-latency local electronic medical record and patient queue manager designed for rural clinic connectivity outages.',
      category: 'healthtech',
      authors: [
        { name: 'Fatima Zohra', role: 'Product Lead', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { name: 'Daniel Antwi', role: 'Systems Engineer', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
      ],
      cohortYear: '2025/2026',
      level: 300,
      summary: 'Provides district health centers with an offline SQLite PWA capable of registering patient vitals, medication dispensing, and maternal health immunization records without live internet. Bi-directional cryptographic sync activates automatically whenever 3G connectivity resumes.',
      techStack: ['React PWA', 'IndexedDB', 'SQLite Sync', 'Tailwind CSS', 'Web Crypto API'],
      metrics: [
        { label: 'Patient Charts', value: '12,400+' },
        { label: 'Wait Time Drop', value: '-45 mins' },
        { label: 'Offline Sync Rate', value: '100%' },
      ],
      demoUrl: 'https://clinic-emr.startsmart.tech',
      repoUrl: 'https://github.com/startsmart-hub/rural-clinic-emr',
      likes: 31,
      featured: false,
    },
    {
      id: 'proj-4',
      title: 'FinEdge Micro-Lending & Cash Flow Scoring Engine',
      tagline: 'Automated credit appraisal algorithm assessing informal market trader transaction health for microfinance institutions.',
      category: 'fintech',
      authors: [
        { name: 'Mohammed Seidu', role: 'Financial Modeler', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        { name: 'Engr. Sarah Jenkins', role: 'Faculty Advisor', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
      ],
      cohortYear: '2025/2026',
      level: 400,
      summary: 'Traditional credit bureaus exclude 80% of informal women traders in Tamale Central Market. FinEdge inputs digitized stall ledger transactions and mobile money turnover, producing an objective credit score and repayment risk tier for local credit unions.',
      techStack: ['MS Excel Macros', 'Python FastAPI', 'React', 'Chart.js', 'Docker'],
      metrics: [
        { label: 'Disbursed Capital', value: 'GH₵ 320,000' },
        { label: 'Default Rate', value: '< 1.4%' },
        { label: 'Women Traders', value: '620+' },
      ],
      demoUrl: 'https://finedge.startsmart.tech',
      repoUrl: 'https://github.com/startsmart-hub/finedge-credit',
      likes: 29,
      featured: false,
    },
  ];

  const [projects, setProjects] = useState<CapstoneProject[]>(() => {
    try {
      const stored = localStorage.getItem('sst_capstone_projects');
      return stored ? JSON.parse(stored) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const saveProjects = (updated: CapstoneProject[]) => {
    setProjects(updated);
    localStorage.setItem('sst_capstone_projects', JSON.stringify(updated));
  };

  const handleLikeProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSuccessSound();
    const updated = projects.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    saveProjects(updated);
    if (activeProject && activeProject.id === id) {
      setActiveProject({ ...activeProject, likes: activeProject.likes + 1 });
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !user) return;
    playClickSound();

    const techArray = newTechStack
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newProj: CapstoneProject = {
      id: `proj-${Date.now()}`,
      title: newTitle,
      tagline: newTagline || 'Student Capstone Innovation Project at StartSmart Tech Hub.',
      category: newCategory,
      authors: [
        {
          name: user.fullName || user.name,
          role: 'Lead Architect',
          avatar: user.avatarUrl,
        },
      ],
      cohortYear: '2025/2026',
      level: user.programLevel || 400,
      summary: newSummary,
      techStack: techArray.length > 0 ? techArray : ['React', 'TypeScript', 'Tailwind CSS'],
      metrics: [
        { label: 'Status', value: 'Faculty Review' },
        { label: 'Milestone', value: 'Sprint Alpha' },
      ],
      likes: 1,
      featured: false,
    };

    const updated = [newProj, ...projects];
    saveProjects(updated);
    playSuccessSound();
    setSubmitSuccess('Your capstone project was submitted successfully to the innovation registry!');
    setTimeout(() => {
      setSubmitSuccess(null);
      setShowSubmitModal(false);
      setNewTitle('');
      setNewTagline('');
      setNewSummary('');
      setNewTechStack('');
    }, 2000);
  };

  const filteredProjects = projects.filter((p) => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              Innovation Showcase
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              StartSmart Tech Hub Scholar Capstones
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Capstone Projects & Innovation Showcase
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Real-world software and IoT solutions engineered by scholars at StartSmart Tech Hub, tackling agriculture, solar energy, healthcare, and fintech.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setShowSubmitModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#05286f]/20 dark:shadow-[#4ea836]/20 transition active:scale-95 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Capstone Project</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'All Projects' },
          { id: 'agritech', label: '🌾 Agritech' },
          { id: 'cleantech', label: '☀️ Solar & IoT' },
          { id: 'healthtech', label: '🏥 Healthcare EMR' },
          { id: 'fintech', label: '💳 Financial Systems' },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-[#05286f] text-white dark:bg-[#4ea836] dark:text-white shadow-xs'
                  : 'bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              playClickSound();
              setActiveProject(project);
            }}
            className="p-5 rounded-3xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#030a1a] text-[#05286f] dark:text-[#8ee079] border border-slate-200 dark:border-[#0e2a66]">
                    {project.category.toUpperCase()}
                  </span>
                  {project.featured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Level {project.level} • {project.cohortYear}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#8ee079] transition font-['Outfit']">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {project.tagline}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#030a1a] p-2.5 rounded-2xl border border-slate-200 dark:border-[#0e2a66]">
                {project.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="text-center">
                    <span className="font-mono font-black text-xs text-slate-900 dark:text-white block">
                      {m.value}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tech Stack Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {project.techStack.slice(0, 4).map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0a1f47]/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#0e2a66]"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="text-[10px] text-slate-400">
                    +{project.techStack.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Footer Bar: Authors + Like Button */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#0e2a66]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {project.authors.map((a, idx) => (
                    <img
                      key={idx}
                      src={a.avatar}
                      alt={a.name}
                      referrerPolicy="no-referrer"
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#071530] object-cover"
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {project.authors.map((a) => a.name.split(' ')[0]).join(' & ')}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleLikeProject(project.id, e)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#0a1f47] dark:hover:bg-rose-950/50 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{project.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Project Details */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setActiveProject(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#05286f] dark:text-[#8ee079]">
                  {activeProject.category.toUpperCase()} • LEVEL {activeProject.level} CAPSTONE
                </span>
                <h3 className="text-xl font-black font-['Outfit'] mt-1">
                  {activeProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {activeProject.summary}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-[#030a1a] p-3 rounded-2xl border border-slate-200 dark:border-[#0e2a66]">
              {activeProject.metrics.map((m, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-sm font-black font-mono text-[#05286f] dark:text-[#8ee079] block">
                    {m.value}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Architecture Tech Stack */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit'] block">
                Technical Stack & Architecture:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {activeProject.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0a1f47] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#0e2a66]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Authors Roster */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#0e2a66]">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit'] block">
                Engineering Team:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {activeProject.authors.map((author, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] flex items-center gap-2.5"
                  >
                    <img
                      src={author.avatar}
                      alt={author.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {author.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {author.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#0e2a66]">
              <button
                type="button"
                onClick={(e) => handleLikeProject(activeProject.id, e)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2 transition"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Applaud ({activeProject.likes})</span>
              </button>

              <div className="flex items-center gap-2">
                {activeProject.repoUrl && (
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}

                {activeProject.demoUrl && (
                  <a
                    href={activeProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <span>Launch Live Demo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Capstone */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowSubmitModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-3">
              <div>
                <h3 className="text-lg font-bold font-['Outfit']">Submit Capstone Project</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register your capstone software or hardware artifact to the StartSmart Innovation Gallery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Project Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Northern Cold-Chain IoT Logger"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">One-Line Elevator Tagline</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Real-time temperature and location dispatch for agricultural perishables."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Category Track</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="agritech">Agritech</option>
                  <option value="cleantech">Solar & Clean Energy IoT</option>
                  <option value="healthtech">Healthcare Digital EMR</option>
                  <option value="fintech">Financial Systems & Modeling</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Executive Summary & Problem Solved</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Explain the local problem in Tamale/Ghana and your technical solution..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, Docker, SQLite, MQTT"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold shadow"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
