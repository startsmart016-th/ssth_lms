import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  BookOpen,
  Check,
  Zap,
} from 'lucide-react';
import { Quiz, QuizQuestion } from '../../types';
import { playClickSound, playSuccessSound } from '../../utils/soundEffects';

export const QuizzesView: React.FC = () => {
  const quizzes: Quiz[] = [
    {
      id: 'quiz-sst101',
      courseCode: 'SST 101',
      courseTitle: 'Computer Fundamentals & Terminal Operations',
      level: 100,
      title: 'Linux Shell & Computer Architecture Evaluator',
      description: 'Test your understanding of file permissions, process tree management, memory cycles, and bash automation.',
      durationMinutes: 10,
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'What octal permission value grants the owner Read/Write/Execute, and read-only access to group and others?',
          options: ['chmod 777 script.sh', 'chmod 755 script.sh', 'chmod 644 script.sh', 'chmod 700 script.sh'],
          correctIndex: 1,
          explanation: 'In Unix permissions, 7 = 4+2+1 (rwx), and 5 = 4+0+1 (r-x). Therefore 755 grants owner full access while group and others can read and execute.',
        },
        {
          id: 'q2',
          question: 'Which component in the CPU is specifically responsible for arithmetic calculations and logical decision trees?',
          options: ['Control Unit (CU)', 'Arithmetic Logic Unit (ALU)', 'Instruction Register (IR)', 'Memory Buffer Register (MBR)'],
          correctIndex: 1,
          explanation: 'The ALU (Arithmetic Logic Unit) executes all integer addition, subtraction, bitwise comparisons, and logic checks.',
        },
        {
          id: 'q3',
          question: 'In Bash terminal piping, which command redirects standard error (stderr) alongside standard output (stdout) to a file?',
          codeSnippet: 'npm run build > build.log 2>&1',
          options: [
            '2>&1 redirects file descriptor 2 (stderr) to file descriptor 1 (stdout)',
            '&> is purely for background processes',
            '1>2 writes to error console only',
            'None of the above',
          ],
          correctIndex: 0,
          explanation: 'File descriptor 1 is stdout and descriptor 2 is stderr. "2>&1" merges stream 2 into stream 1 so all terminal output is written to the log file.',
        },
        {
          id: 'q4',
          question: 'What is the primary operational difference between volatile RAM and non-volatile NVMe storage?',
          options: [
            'RAM retains data across power outages',
            'RAM loses all stored state when electrical power is interrupted',
            'NVMe is volatile and operates at register clock speeds',
            'RAM is used exclusively for long-term cold archives',
          ],
          correctIndex: 1,
          explanation: 'RAM is volatile high-speed memory; when power is lost, its charge dissipates and stored data is lost.',
        },
        {
          id: 'q5',
          question: 'Which Linux signal is sent by default when you issue "kill <PID>" without specifying flags?',
          options: ['SIGKILL (Signal 9)', 'SIGTERM (Signal 15)', 'SIGHUP (Signal 1)', 'SIGSTOP (Signal 19)'],
          correctIndex: 1,
          explanation: 'Standard kill transmits SIGTERM (Signal 15), requesting a graceful shutdown and cleanup of open file handles.',
        },
      ],
    },
    {
      id: 'quiz-sst201',
      courseCode: 'SST 201',
      courseTitle: 'MS Excel & Corporate Financial Modeling',
      level: 200,
      title: 'Financial Analysis & Dynamic Array Formulas',
      description: 'Evaluate your mastery of DCF projections, XLOOKUP mechanics, sensitivity matrices, and financial ratios.',
      durationMinutes: 10,
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'Which Excel dynamic array formula looks up a value and returns corresponding values without requiring sorted tables?',
          codeSnippet: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])',
          options: ['VLOOKUP', 'HLOOKUP', 'XLOOKUP', 'INDEX/MATCH exclusively'],
          correctIndex: 2,
          explanation: 'XLOOKUP is bi-directional, defaults to exact match, handles missing values cleanly with [if_not_found], and requires no index sorting.',
        },
        {
          id: 'q2',
          question: 'When computing Net Present Value (NPV) in discounted cash flow valuation, why do we discount future cash flows?',
          options: [
            'Because money in the future has greater purchasing power',
            'To account for the time value of money, inflation, and opportunity cost of capital',
            'Because taxation only applies to initial year zero investments',
            'To increase the gross nominal profit margin',
          ],
          correctIndex: 1,
          explanation: 'A dollar received today is worth more than a dollar tomorrow due to its earning capacity, inflation, and underlying risk.',
        },
        {
          id: 'q3',
          question: 'Which formula calculates the Weighted Average Cost of Capital (WACC)?',
          options: [
            'WACC = (E/V * Re) + (D/V * Rd * (1 - T))',
            'WACC = Gross Revenue - Cost of Goods Sold',
            'WACC = EBITDA / Total Debt',
            'WACC = Free Cash Flow * (1 + Growth Rate)',
          ],
          correctIndex: 0,
          explanation: 'WACC weights the cost of equity (Re) and after-tax cost of debt (Rd * (1-T)) relative to total firm capital structure (V = E + D).',
        },
        {
          id: 'q4',
          question: 'What is the keyboard shortcut in Excel to create a Data Table for sensitivity analysis?',
          options: ['Alt + A + W + T', 'Ctrl + Shift + L', 'Alt + F4', 'Ctrl + Alt + V'],
          correctIndex: 0,
          explanation: 'In Excel for Windows, Alt + A + W + T navigates: Data tab > What-If Analysis > Data Table.',
        },
        {
          id: 'q5',
          question: 'Which ratio measures a company’s ability to cover short-term liabilities without selling inventory?',
          options: ['Current Ratio', 'Quick / Acid-Test Ratio', 'Debt-to-Equity Ratio', 'Operating Margin'],
          correctIndex: 1,
          explanation: 'Quick Ratio = (Cash + Marketable Securities + Receivables) / Current Liabilities, strictly omitting illiquid inventory.',
        },
      ],
    },
    {
      id: 'quiz-sst301',
      courseCode: 'SST 301',
      courseTitle: 'Full-Stack Web Engineering & Cloud Architecture',
      level: 300,
      title: 'Modern Web Architecture & Cloud DevOps Knowledge Check',
      description: 'Assess full-stack principles: React state lifecycles, REST vs GraphQL, token security, and microservices.',
      durationMinutes: 10,
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          question: 'In React, why must state updates never directly mutate existing state objects?',
          codeSnippet: '// Avoid:\nstate.user.name = "Alice";\n// Use:\nsetState(prev => ({ ...prev, user: { ...prev.user, name: "Alice" } }));',
          options: [
            'Direct mutation breaks shallow comparison in React’s reconciliation engine',
            'JavaScript forbids modifying objects after instantiation',
            'Mutation causes immediate browser process restarts',
            'React compiler removes mutated objects automatically',
          ],
          correctIndex: 0,
          explanation: 'React compares references (shallow equality). If the object reference doesn’t change, React skips re-rendering and leaves stale UI.',
        },
        {
          id: 'q2',
          question: 'Where should sensitive JWT secret keys and database credentials be stored?',
          options: [
            'In client-side localStorage for offline access',
            'Inside public Git repository README notes',
            'In server-side environment variables (.env) that are never exposed to browser bundles',
            'In URL query parameters with base64 encoding',
          ],
          correctIndex: 2,
          explanation: 'Environment secrets must live on protected server runtimes. Any token placed on the client is public to dev tools and reverse engineering.',
        },
        {
          id: 'q3',
          question: 'What HTTP status code should a REST API return when a resource creation succeeds?',
          options: ['200 OK', '201 Created', '204 No Content', '304 Not Modified'],
          correctIndex: 1,
          explanation: 'HTTP 201 Created signifies that the request succeeded and resulted in the generation of a new persistent resource.',
        },
        {
          id: 'q4',
          question: 'Which indexing strategy drastically accelerates equality lookups on user email fields in relational SQL databases?',
          options: ['B-Tree Index with UNIQUE constraint', 'Sequential Table Scan', 'Foreign Key Cascade', 'Trigger Hook'],
          correctIndex: 0,
          explanation: 'B-Tree indexes reduce lookup time complexity from O(N) linear table scans to O(log N) balanced tree traversals.',
        },
        {
          id: 'q5',
          question: 'In Docker multi-stage builds, why do we separate the build stage from the production runner stage?',
          options: [
            'To drastically minimize the final production image size and attack surface by omitting compilers and dev dependencies',
            'Docker requires multiple stages to execute bash scripts',
            'To allow running on 32-bit machines only',
            'Multi-stage builds are purely for CSS compression',
          ],
          correctIndex: 0,
          explanation: 'Multi-stage builds leave bloated compilers, TypeScript build tools, and node_modules behind, shipping only runtime artifacts.',
        },
      ],
    },
  ];

  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0);
  const currentQuiz = quizzes[activeQuizIndex];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [examMode, setExamMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(currentQuiz.durationMinutes * 60);

  // Load highest scores from local storage
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sst_quiz_scores') || '{}');
    } catch {
      return {};
    }
  });

  // Timer countdown for exam mode
  useEffect(() => {
    if (!examMode || quizCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examMode, quizCompleted]);

  // Reset quiz state when switching quiz
  const handleSelectQuiz = (idx: number) => {
    playClickSound();
    setActiveQuizIndex(idx);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setTimeLeft(quizzes[idx].durationMinutes * 60);
  };

  const handleSelectOption = (optionIndex: number) => {
    playClickSound();
    if (quizCompleted && examMode) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Keyboard shortcut listener for option keys 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const opt = parseInt(e.key, 10) - 1;
        const currentQ = currentQuiz.questions[currentQuestionIndex];
        if (currentQ && opt < currentQ.options.length) {
          handleSelectOption(opt);
        }
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < currentQuiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, currentQuiz]);

  const finishQuiz = () => {
    setQuizCompleted(true);
    let correctCount = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / currentQuiz.questions.length) * 100);
    if (scorePct >= currentQuiz.passingScore) {
      playSuccessSound();
    }

    // Save to local storage
    const updated = { ...highScores, [currentQuiz.id]: Math.max(scorePct, highScores[currentQuiz.id] || 0) };
    setHighScores(updated);
    localStorage.setItem('sst_quiz_scores', JSON.stringify(updated));
  };

  const currentQ = currentQuiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isCurrentAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  // Calculate score
  let correctTotal = 0;
  currentQuiz.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) correctTotal += 1;
  });
  const finalPercentage = Math.round((correctTotal / currentQuiz.questions.length) * 100);
  const hasPassed = finalPercentage >= currentQuiz.passingScore;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-[#071530] dark:to-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-[#0e2a66] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#05286f]/10 text-[#05286f] dark:bg-[#4ea836]/20 dark:text-[#8ee079] border border-[#05286f]/20 dark:border-[#4ea836]/30">
              Interactive Assessment
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Academic Knowledge Check & Evaluator
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Tests & Quizzes Evaluator
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Test and validate your technical competency across Terminal Operations, Corporate Financial Modeling, Full-Stack Architecture, and Cloud Systems.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-white dark:bg-[#030a1a] border border-slate-200 dark:border-[#0e2a66] rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setExamMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                !examMode
                  ? 'bg-[#05286f] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Practice Mode
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setExamMode(true);
                setTimeLeft(currentQuiz.durationMinutes * 60);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                examMode
                  ? 'bg-[#4ea836] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Exam Sprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Quiz Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quizzes.map((quiz, idx) => {
          const isSelected = activeQuizIndex === idx;
          const bestScore = highScores[quiz.id];

          return (
            <div
              key={quiz.id}
              onClick={() => handleSelectQuiz(idx)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-[#071530] border-[#05286f] dark:border-[#4ea836] shadow-md ring-1 ring-[#05286f]/20 dark:ring-[#4ea836]/40'
                  : 'bg-white dark:bg-[#071530]/50 border-slate-200 dark:border-[#0e2a66] hover:bg-slate-50 dark:hover:bg-[#0a1f47]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-[#05286f] dark:text-[#8ee079] bg-slate-100 dark:bg-[#030a1a] px-2 py-0.5 rounded border border-slate-200 dark:border-[#0e2a66]">
                  {quiz.courseCode}
                </span>
                {bestScore !== undefined && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Best: {bestScore}%
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 font-['Outfit']">
                {quiz.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {quiz.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Quiz Card */}
      <div className="bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] rounded-3xl p-6 shadow-xs space-y-6">
        {/* Progress & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#0e2a66] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono text-[#05286f] dark:text-[#8ee079]">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {answeredCount} of {currentQuiz.questions.length} Answered
            </span>
          </div>

          {examMode && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} remaining
              </span>
            </div>
          )}
        </div>

        {/* Question Stepper Indicator */}
        <div className="flex items-center gap-1.5">
          {currentQuiz.questions.map((_, qIdx) => {
            const isAnswered = selectedAnswers[qIdx] !== undefined;
            const isCurrent = currentQuestionIndex === qIdx;
            return (
              <button
                key={qIdx}
                type="button"
                onClick={() => {
                  playClickSound();
                  setCurrentQuestionIndex(qIdx);
                }}
                className={`flex-1 h-2 rounded-full transition cursor-pointer ${
                  isCurrent
                    ? 'bg-[#05286f] dark:bg-[#4ea836]'
                    : isAnswered
                    ? 'bg-blue-300 dark:bg-sky-600'
                    : 'bg-slate-200 dark:bg-[#0e2a66]'
                }`}
                title={`Jump to Question ${qIdx + 1}`}
              />
            );
          })}
        </div>

        {/* Question Display */}
        {!quizCompleted ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {currentQ.codeSnippet && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 overflow-x-auto">
                  <pre className="text-emerald-400">{currentQ.codeSnippet}</pre>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;
                const showInstantFeedback = !examMode && isCurrentAnswered;

                let optionStyles = 'bg-slate-50 dark:bg-[#030a1a] border-slate-200 dark:border-[#0e2a66] hover:bg-slate-100 dark:hover:bg-[#0a1f47]/50';

                if (showInstantFeedback) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-200';
                  }
                } else if (isSelected) {
                  optionStyles = 'bg-[#05286f]/10 dark:bg-[#0a1f47] border-[#05286f] dark:border-[#4ea836] ring-1 ring-[#05286f] dark:ring-[#4ea836]';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between text-xs font-medium cursor-pointer ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white dark:bg-[#071530] border border-slate-200 dark:border-[#0e2a66] font-mono text-xs flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {optIdx + 1}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">{option}</span>
                    </div>

                    {showInstantFeedback && (
                      <div className="shrink-0 ml-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box for Practice Mode */}
            {!examMode && isCurrentAnswered && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0a1f47]/50 border border-blue-200 dark:border-[#0e2a66] text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-[#05286f] dark:text-[#8ee079]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Curriculum Explanation:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Navigation Steppers */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#0e2a66]">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  playClickSound();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrentQuestionIndex((prev) => prev + 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishQuiz}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Quiz & View Score</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Report Card */
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-tr from-[#05286f] to-[#4ea836] text-white">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  hasPassed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                }`}
              >
                {hasPassed ? 'Assessment Passed' : 'Review Needed'}
              </span>

              <h3 className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-2">
                Score: {finalPercentage}%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You correctly answered {correctTotal} out of {currentQuiz.questions.length} questions.
              </p>
            </div>

            {/* Quick Answer Review Table */}
            <div className="max-w-md mx-auto space-y-2 text-left pt-2">
              {currentQuiz.questions.map((q, qIdx) => {
                const isCorrect = selectedAnswers[qIdx] === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <span className="truncate max-w-[280px] font-medium">
                      Q{qIdx + 1}: {q.question}
                    </span>
                    <span className="font-bold shrink-0 ml-2">
                      {isCorrect ? '+100%' : 'Missed'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                  setQuizCompleted(false);
                  setTimeLeft(currentQuiz.durationMinutes * 60);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f47] dark:hover:bg-[#0e2a66] text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  handleSelectQuiz((activeQuizIndex + 1) % quizzes.length);
                }}
                className="px-4 py-2 rounded-xl bg-[#05286f] hover:bg-[#071530] dark:bg-[#4ea836] dark:hover:bg-[#3b8827] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Track Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
