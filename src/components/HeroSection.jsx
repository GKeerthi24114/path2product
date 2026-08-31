import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Compass, ShoppingBag, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[90vh] flex items-center pt-8">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-6"
          >
            <Zap className="h-4 w-4 fill-current" /> Next-Gen Indoor Positioning
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
          >
            SmartStore <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Navigator</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto mb-10"
          >
            "Find Products Instantly Inside Any Store"
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-12"
          >
            Optimized pathfinding with Dijkstra's algorithm. Generate the shortest paths across aisles to save time during checkout.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-lg text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Start Shopping <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 font-bold text-lg text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Play className="h-5 w-5 fill-current" /> How It Works
            </a>
          </motion.div>

        </div>

        {/* Floating stats row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md"
        >
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-400 mb-3">
              <Compass className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold">99.9%</div>
            <div className="text-sm text-slate-400 mt-1">Routing Accuracy</div>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold">15+</div>
            <div className="text-sm text-slate-400 mt-1">Smart Products</div>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-purple-500/10 text-purple-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold">10K+</div>
            <div className="text-sm text-slate-400 mt-1">Daily Shoppers</div>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold">&lt; 10ms</div>
            <div className="text-sm text-slate-400 mt-1">Recalculation Speed</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
