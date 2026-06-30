'use client';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addTransaction } from '@/lib/api/finance';
import { addTask } from '@/lib/api/calendar';
import { pushDailyLog } from '@/lib/api/capacities';

export default function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;
    setIsLoading(true);
    setFeedback('');

    const text = input.trim();
    const lower = text.toLowerCase();

    try {
      // 1. FINANCE DETECTION (Rp, angka, k, bayar, beli)
      const moneyRegex = /(Rp\s*|IDR\s*)?([\d,\.]+)\s*[kK]?/;
      const match = text.match(moneyRegex);
      if (match || lower.includes('bayar') || lower.includes('beli') || lower.includes('cash')) {
        const amount = parseFloat(text.replace(/[^0-9.]/g, '')) * (text.includes('k') ? 1000 : 1);
        await addTransaction({
          description: text,
          amount: isNaN(amount) ? 0 : amount,
          category: 'Uncategorized',
          type: 'Expense',
          date: new Date().toISOString(),
          userId: user.uid
        });
        setFeedback('💰 Expense logged!');
      } 
      // 2. CALENDAR / TASK DETECTION (tomorrow, at, remind, due)
      else if (lower.includes('tomorrow') || lower.includes('at ') || lower.includes('due') || lower.includes('remind')) {
        await addTask({
          title: text,
          userId: user.uid,
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        });
        setFeedback('📅 Task added! Auto-scheduling triggered.');
      } 
      // 3. DEFAULT: 2nd Brain / Capacities Note
      else {
        await pushDailyLog({
          content: `📝 Quick Capture: ${text}`,
          userId: user.uid,
          date: new Date().toISOString().split('T')[0]
        });
        setFeedback('🧠 Saved to 2nd Brain & Capacities!');
      }

      setInput('');
      setTimeout(() => setIsOpen(false), 1200);
    } catch (error) {
      setFeedback('❌ Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 w-16 h-16 rounded-2xl glass-card flex items-center justify-center transition-all duration-500 hover:scale-105 group ${
          isOpen ? 'rotate-45 bg-red-500/20 border-red-500/30' : 'bg-purple-500/20 border-purple-500/30 animate-pulse-glow'
        }`}
      >
        {isOpen ? <X className="text-white w-8 h-8" /> : <Sparkles className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-50 w-[90vw] max-w-lg glass-card p-4 animate-slide-in border-purple-500/20">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 focus-within:ring-2 ring-purple-500/50 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. "Lunch 35k", "Call Mom tomorrow", or "Idea: dark mode"'
              className="flex-1 bg-transparent text-white py-4 outline-none placeholder:text-gray-500 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="text-white animate-spin" /> : <Send size={18} className="text-white" />}
            </button>
          </div>
          
          {/* Feedback & Tags */}
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-gray-400 px-3 py-1 rounded-full bg-white/5 whitespace-nowrap">💰 Detects money</span>
              <span className="text-[10px] text-gray-400 px-3 py-1 rounded-full bg-white/5 whitespace-nowrap">📅 Detects dates</span>
              <span className="text-[10px] text-gray-400 px-3 py-1 rounded-full bg-white/5 whitespace-nowrap">🧠 Saves to Capacities</span>
            </div>
            {feedback && (
              <span className={`text-xs ${feedback.includes('Error') ? 'text-red-400' : 'text-green-400'} font-medium`}>
                {feedback}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}