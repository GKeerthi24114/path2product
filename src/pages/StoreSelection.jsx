import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Store, Star, Clock, MapPin, Sparkles, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreSelection() {
  const navigate = useNavigate();
  const { setCurrentPosition, addAssistantMessage, setPath, setDirections, setDestination, setSelectedProduct } = useStore();

  const handleEnterStore = () => {
    // Reset any previous navigation states
    setPath([]);
    setDirections([]);
    setDestination(null);
    setSelectedProduct(null);

    // Initial position starts at Entrance
    setCurrentPosition('ENT');
    addAssistantMessage("Welcome to SmartMart Super Store! Your position is initialized at the Entrance. Search for a product to calculate a route.", "success");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[90vh] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4">
      {/* Background radial effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl p-8 md:p-10 relative z-10"
      >
        
        {/* Header Store Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8">
          <Store className="h-10 w-10" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            SmartMart Super Store
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium ml-1">
              4.8 (1.2K ratings)
            </span>
          </div>
          <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            123 Market Street, Downtown. Fully equipped with AI-powered indoor shelf tracking nodes.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-150/20 dark:border-slate-800/20 flex flex-col items-center">
            <Clock className="h-5 w-5 text-blue-500 mb-2" />
            <span className="text-xs text-gray-400">Store Hours</span>
            <span className="text-sm font-bold text-gray-700 dark:text-white mt-0.5">Open 24/7</span>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-150/20 dark:border-slate-800/20 flex flex-col items-center">
            <MapPin className="h-5 w-5 text-indigo-500 mb-2" />
            <span className="text-xs text-gray-400">Aisles Configured</span>
            <span className="text-sm font-bold text-gray-700 dark:text-white mt-0.5">15 (A1 - C5)</span>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">✓</div>
            <span>High precision SVG Map rendering</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">✓</div>
            <span>Dijkstra Shortest Path Calculations</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">✓</div>
            <span>Multi-stop shopping path optimizations</span>
          </div>
        </div>

        {/* CTA Enter Button */}
        <button
          onClick={handleEnterStore}
          className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-lg text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          Enter Store <Navigation className="h-5 w-5 rotate-45" />
        </button>

      </motion.div>
    </div>
  );
}
