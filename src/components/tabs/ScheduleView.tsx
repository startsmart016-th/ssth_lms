import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Sparkles,
  ChevronRight,
  Info,
  CalendarCheck,
  Building,
} from 'lucide-react';
import { ScheduleItem } from '../../types';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export const ScheduleView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'agenda' | 'grid'>('agenda');

  // Workstation Booking State
  const [showSeatBooking, setShowSeatBooking] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);
  const [bookedDesk, setBookedDesk] = useState<string | null>(() => {
    return localStorage.getItem('sst_booked_desk') || null;
  });
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const days = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const scheduleData: ScheduleItem[] = [
    {
      id: 'sch-1',
      title: 'Operating Systems & Linux Shell Essentials',
      courseCode: 'SST 101',
      level: 100,
      day: 'Mon',
      startTime: '09:00',
      endTime: '11:30',
      facilitatorName: 'Engr. Sarah Jenkins',
      room: 'Lab Alpha - Main Terminal Hub',
      type: 'lab',
      description: 'Hands-on command-line piping, permission trees, and script automation on Ubuntu workstation nodes.',
      capacity: 32,
      enrolledCount: 28,
    },
    {
      id: 'sch-2',
      title: 'Corporate Excel: Dynamic Arrays & Financial Cash Flows',
      courseCode: 'SST 201',
      level: 200,
      day: 'Mon',
      startTime: '13:00',
      endTime: '15:30',
      facilitatorName: 'David Mensah, FCCA',
      room: 'Executive Analytics Suite B',
      type: 'lecture',
      description: 'Building multi-year discounted cash flow (DCF) models with sensitivity tables and XLOOKUP indexes.',
      capacity: 25,
      enrolledCount: 24,
    },
    {
      id: 'sch-3',
      title: 'Full-Stack Architecture: RESTful Microservices & SQL',
      courseCode: 'SST 301',
      level: 300,
      day: 'Tue',
      startTime: '10:00',
      endTime: '12:30',
      facilitatorName: 'Dr. Kwame Boateng',
      room: 'Innovation Lab 2',
      type: 'lecture',
      description: 'Express routing patterns, relational schemas, database indexing, and JWT authorization pipelines.',
      capacity: 30,
      enrolledCount: 26,
    },
    {
      id: 'sch-4',
      title: 'Open Hardware & IoT Sandbox: Tamale Microgrid Telemetry',
      courseCode: 'SST 401',
      level: 400,
      day: 'Tue',
      startTime: '14:00',
      endTime: '17:00',
      facilitatorName: 'Engr. Sarah Jenkins & Hub Fellows',
      room: 'Makerspace & IoT Workshop',
      type: 'capstone_clinic',
      description: 'Firmware flashing, MQTT payload pipelines, and solar charge sensor integration with live telemetry boards.',
      capacity: 20,
      enrolledCount: 16,
    },
    {
      id: 'sch-5',
      title: 'Computer Architecture: CPU Cycles, Logic Gates & RAM',
      courseCode: 'SST 101',
      level: 100,
      day: 'Wed',
      startTime: '09:30',
      endTime: '11:30',
      facilitatorName: 'Engr. Sarah Jenkins',
      room: 'Lecture Theatre 1',
      type: 'lecture',
      description: 'Binary arithmetic, bus architecture, memory hierarchy, and von Neumann execution model.',
      capacity: 40,
      enrolledCount: 35,
    },
    {
      id: 'sch-6',
      title: 'Advanced Financial Dashboards & Macro Automation',
      courseCode: 'SST 201',
      level: 200,
      day: 'Wed',
      startTime: '13:00',
      endTime: '15:30',
      facilitatorName: 'David Mensah, FCCA',
      room: 'Executive Analytics Suite B',
      type: 'lab',
      description: 'VBA macros, Power Query transformations, and interactive executive C-Suite summary cards.',
      capacity: 25,
      enrolledCount: 22,
    },
    {
      id: 'sch-7',
      title: 'Cloud DevOps: Containerization, Docker & CI/CD Pipelines',
      courseCode: 'SST 301',
      level: 300,
      day: 'Thu',
      startTime: '10:00',
      endTime: '12:30',
      facilitatorName: 'Dr. Kwame Boateng',
      room: 'Cloud Sandbox Lab',
      type: 'lab',
      description: 'Multi-stage Docker builds, Kubernetes pods, automated GitHub Actions testing, and deployment to Cloud Run.',
      capacity: 28,
      enrolledCount: 27,
    },
    {
      id: 'sch-8',
      title: 'Capstone Sprint Reviews & 1-on-1 Mentor Clinics',
      courseCode: 'SST 401',
      level: 400,
      day: 'Fri',
      startTime: '09:00',
      endTime: '13:00',
      facilitatorName: 'StartSmart Faculty Board',
      room: 'Executive Boardroom & Meeting Pods',
      type: 'capstone_clinic',
      description: 'Sprint retrospective, code audit reviews, production security readiness check, and demo rehearsals.',
      capacity: 20,
      enrolledCount: 18,
    },
    {
      id: 'sch-9',
      title: 'Weekend Hackathon & Open Hub Peer Pairing Session',
      courseCode: 'HUB-OPEN',
      level: 100,
      day: 'Sat',
      startTime: '10:00',
      endTime: '16:00',
      facilitatorName: 'Alumni Tech Network & Hub TAs',
      room: 'Tamale Tech Hub Main Atrium',
      type: 'seminar',
      description: 'Open co-working, peer code reviews, open-source sprints, and mentor office hours with high-speed fiber.',
      capacity: 60,
      enrolledCount: 42,
    },
  ];

  const filteredItems = scheduleData.filter((item) => {
    const matchesDay = selectedDay === 'All' || item.day === selectedDay;
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel;
    return matchesDay && matchesLevel;
  });

  // Export .ics calendar file
  const handleExportICS = () => {
    playClickSound();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StartSmart Tech Hub//Academic Timetable//EN',
      'CALSCALE:GREGORIAN',
      ...filteredItems.map((item) => {
        return [
          'BEGIN:VEVENT',
          `SUMMARY:[${item.courseCode}] ${item.title}`,
          `DESCRIPTION:${item.description} (Lead: ${item.facilitatorName})`,
          `LOCATION:${item.room} - StartSmart Tech Hub, Tamale, Ghana`,
          `STATUS:CONFIRMED`,
          'END:VEVENT',
        ].join('\n');
      }),
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'StartSmart_Tech_Hub_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSuccessSound();
  };

  const handleBookWorkstation = (deskId: string) => {
    playClickSound();
    setSelectedDesk(deskId);
    setBookedDesk(deskId);
    localStorage.setItem('sst_booked_desk', deskId);
    playSuccessSound();
    setBookingSuccess(`Workstation ${deskId} successfully reserved for today's lab sprint!`);
    setTimeout(() => {
      setBookingSuccess(null);
      setShowSeatBooking(false);
    }, 2500);
  };

  const workstations = [
    { id: 'WS-01', name: 'Desk A1 (Dual 4K / Linux)', status: 'available' },
    { id: 'WS-02', name: 'Desk A2 (Dual 4K / macOS)', status: 'occupied' },
    { id: 'WS-03', name: 'Desk A3 (Dual 4K / Linux)', status: 'available' },
    { id: 'WS-04', name: 'Desk A4 (Dual 4K / Linux)', status: 'available' },
    { id: 'WS-05', name: 'Desk B1 (Hardware IoT Lab)', status: 'occupied' },
    { id: 'WS-06', name: 'Desk B2 (Hardware IoT Lab)', status: 'available' },
    { id: 'WS-07', name: 'Desk B3 (Financial Modeling Suite)', status: 'available' },
    { id: 'WS-08', name: 'Desk B4 (Financial Modeling Suite)', status: 'available' },
    { id: 'WS-09', name: 'Desk C1 (Quiet Coding Pod)', status: 'occupied' },
    { id: 'WS-10', name: 'Desk C2 (Quiet Coding Pod)', status: 'available' },
    { id: 'WS-11', name: 'Desk C3 (Quiet Coding Pod)', status: 'available' },
    { id: 'WS-12', name: 'Desk C4 (High-Performance GPU)', status: 'available' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              Campus Operations
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Academic Term 2025/2026 • Tamale Hub Node
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Academic Timetable & Lab Schedule
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Live schedule of course lectures, terminal lab sessions, financial modeling workshops, and open innovation co-working hours.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowSeatBooking(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0a1f47] hover:bg-slate-100 dark:hover:bg-[#0e2a66] border border-slate-200 dark:border-[#0e2a66] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-[#4ea836]" />
            <span>
              {bookedDesk ? `Reserved: ${bookedDesk}` : 'Reserve Lab Workstation'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportICS}
            className="px-4 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#05286f]/20 dark:shadow-[#4ea836]/20 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Sync with Calendar (.ics)</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#071530] p-3 rounded-2xl border border-slate-200 dark:border-[#0e2a66]">
        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedDay(day);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#05286f] text-white dark:bg-[#4ea836] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0a1f47]'
                }`}
              >
                {day === 'All' ? 'All Days' : day}
              </button>
            );
          })}
        </div>

        {/* Level & Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLevel}
            onChange={(e) => {
              playClickSound();
              const val = e.target.value;
              setSelectedLevel(val === 'all' ? 'all' : Number(val));
            }}
            className="text-xs bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Academic Levels</option>
            <option value="100">Level 100 - Computer Fundamentals</option>
            <option value="200">Level 200 - MS Excel & Analytics</option>
            <option value="300">Level 300 - Full-Stack Web Eng</option>
            <option value="400">Level 400 - Capstone & Systems</option>
          </select>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#071530] rounded-3xl border border-slate-200 dark:border-[#0e2a66] space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No scheduled sessions found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting the day or level filter to view other academy sessions.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLab = item.type === 'lab';
            const isClinic = item.type === 'capstone_clinic';
            const isLecture = item.type === 'lecture';

            const badgeBg = isLab
              ? 'bg-blue-100 text-blue-800 dark:bg-sky-500/20 dark:text-sky-300 border-blue-200 dark:border-sky-500/30'
              : isClinic
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side: Time & Day Badge + Details */}
                <div className="flex items-start gap-4">
                  {/* Day/Time Pill */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] text-center shrink-0 min-w-[76px]">
                    <span className="text-[11px] font-mono font-bold text-[#05286f] dark:text-[#8ee079] block uppercase">
                      {item.day}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                      {item.startTime}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                      {item.endTime}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#05286f]/10 text-[#05286f] dark:bg-[#0a1f47] dark:text-white border border-[#05286f]/20 dark:border-[#0e2a66]">
                        {item.courseCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeBg}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Level {item.level}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-[#4ea836]" />
                        {item.room}
                      </span>
                      <span>•</span>
                      <span>Lead: {item.facilitatorName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {item.enrolledCount} / {item.capacity} Scholars
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badge */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Confirmed Session</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Lab Workstation Booking */}
      {showSeatBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowSeatBooking(false)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl shadow-2xl p-6 z-10 text-slate-900 dark:text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#0e2a66] pb-3">
              <div>
                <h3 className="text-lg font-bold font-['Outfit'] flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#4ea836]" />
                  <span>Tamale Innovation Lab Workstation Booking</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Reserve a dedicated desk equipped with dual 4K monitors, high-speed fiber internet, and solar battery backup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSeatBooking(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {bookingSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            {/* Workstation Grid Layout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Select a Workstation:</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#05286f] dark:bg-[#4ea836]" /> Your Booking
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {workstations.map((ws) => {
                  const isOccupied = ws.status === 'occupied';
                  const isMine = bookedDesk === ws.id;

                  return (
                    <button
                      key={ws.id}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleBookWorkstation(ws.id)}
                      className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                        isMine
                          ? 'bg-[#05286f] text-white border-[#05286f] shadow-md ring-2 ring-[#4ea836]'
                          : isOccupied
                          ? 'bg-slate-100 dark:bg-[#030a1a]/60 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-[#0e2a66] cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-[#0a1f47]/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#0e2a66] hover:border-[#4ea836] hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs">{ws.id}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isMine ? 'bg-[#4ea836]' : isOccupied ? 'bg-slate-400' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] font-medium truncate">{ws.name}</p>
                      <span className="text-[10px] mt-1 block opacity-80">
                        {isMine ? 'Your Active Desk' : isOccupied ? 'In Use by Scholar' : 'Click to Reserve'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSeatBooking(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
