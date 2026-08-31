import React from 'react';
import { MapPin, Route, Search, Sparkles, RefreshCw, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: MapPin,
    title: 'Indoor Navigation',
    desc: 'Navigate inside stores with precision using our custom SVG floorplan navigation system.'
  },
  {
    icon: Route,
    title: 'AI Route Optimization',
    desc: 'Our AI calculates the most efficient multi-stop path through the store, saving you time.'
  },
  {
    icon: Search,
    title: 'Product Search',
    desc: 'Instantly find any product with search metrics matching precise aisle and shelf nodes.'
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    desc: 'Get highly relevant, rule-based nearby product suggestions tailored to your search.'
  },
  {
    icon: RefreshCw,
    title: 'Dynamic Recalculation',
    desc: 'Routing details update instantly as you change your position marker in real-time.'
  },
  {
    icon: Navigation,
    title: 'Simulated Positioning',
    desc: 'Test your position markers directly within the dashboard to simulate real navigation.'
  }
];

export default function FeaturesSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Intelligent Retail
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Powerful Features for Modern Shopping
          </p>
          <div className="mt-4 h-1 w-12 bg-blue-500 mx-auto rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-150/50 dark:border-slate-700/50 shadow-md shadow-gray-200/20 hover:shadow-xl dark:shadow-none hover:scale-[1.03] transition-all duration-300"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
