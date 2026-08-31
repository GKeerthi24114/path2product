import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Bot, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant() {
  const { assistantMessages, addAssistantMessage } = useStore();
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message to display locally (simulated chatbot feedback)
    addAssistantMessage(userText, 'info');

    setTimeout(() => {
      // Check for simple keywords
      const lower = userText.toLowerCase();
      if (lower.includes('toothpaste') || lower.includes('brush')) {
        addAssistantMessage("Toothpaste is located in Aisle B3, Shelf 2. Simply search for it above to begin navigation routes.", "success");
      } else if (lower.includes('checkout') || lower.includes('billing')) {
        addAssistantMessage("Click the 'Navigate to Checkout' button to draw a route to Billing Counter 2.", "success");
      } else if (lower.includes('oil')) {
        addAssistantMessage("Cooking Oil is in Aisle A2, Shelf 2. Searching for it will show the direct path.", "success");
      } else {
        addAssistantMessage("I can guide you anywhere in the store! Try typing product names like 'Rice' or 'Coffee'.", "info");
      }
    }, 800);
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-gray-150/50 dark:border-slate-800/50';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md flex flex-col justify-between min-h-[350px]">
      <div>
        <div className="flex items-center gap-2 border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
          <Bot className="h-5 w-5 text-blue-500" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">AI Nav Assistant</h4>
        </div>

        {/* Message window */}
        <div className="h-44 overflow-y-auto space-y-2.5 pr-1 mb-4 text-xs">
          <AnimatePresence initial={false}>
            {assistantMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-2xl flex items-start gap-2.5 max-w-[95%] ${getMessageColor(msg.type)}`}
              >
                <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="leading-relaxed font-medium">{msg.text}</div>
                  <span className="text-[9px] text-gray-400 dark:text-slate-500 block mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input panel */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-150/50 dark:border-slate-700/50 pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask assistant something..."
          className="flex-grow px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow shadow-blue-500/10 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
