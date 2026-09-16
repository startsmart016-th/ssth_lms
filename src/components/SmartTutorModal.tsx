import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, RefreshCw, User as UserIcon, BookOpen, Code, Lightbulb } from 'lucide-react';
import { Course } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface SmartTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse?: Course | null;
  studentName?: string;
}

const SAMPLE_PROMPTS = [
  'Explain async/await with a simple real-world JavaScript example.',
  'What are the core best practices for REST API error handling?',
  'Give me 3 practice interview questions for this course topic.',
  'Help me break down and plan my next course project.',
];

export const SmartTutorModal: React.FC<SmartTutorModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
  studentName = 'Student',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello ${studentName}! I am **SmartTutor AI**, your dedicated academic learning tutor for StartSmart Tech Hub. ${
        selectedCourse
          ? `How can I assist you with **${selectedCourse.title}** today?`
          : 'Ask me any programming question, curriculum advice, or technical doubt!'
      }`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const questionText = (textToSend || input).trim();
    if (!questionText || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          courseTitle: selectedCourse?.title,
          studentName,
          conversationHistory: newHistory.map(m => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: data.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            text: data.error || 'Sorry, I encountered an issue generating a response. Please try again.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Network error connecting to the SmartTutor engine. Please ensure your connection is active.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'model',
        text: `Conversation cleared. Ready for your next tech or coursework question!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        id="smart-tutor-modal"
        className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[700px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-['Outfit']">
                  SmartTutor AI
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    Academic Intelligence
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {selectedCourse ? selectedCourse.title : 'StartSmart Tech Hub AI Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      isUser ? 'text-sky-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 pl-1">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                Analyzing with SmartTutor...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 flex gap-2 overflow-x-auto no-scrollbar">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span className="truncate max-w-[220px]">{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask SmartTutor AI about ${selectedCourse?.title || 'technology, code, or assignments'}...`}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
