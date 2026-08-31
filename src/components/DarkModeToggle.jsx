import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden relative"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={darkMode ? 'dark' : 'light'}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
