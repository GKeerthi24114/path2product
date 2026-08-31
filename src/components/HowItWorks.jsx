import React from 'react';
import { Scan, Map, Search, Compass, ShoppingBag, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Scan,
    title: 'Scan QR',
    desc: 'Scan the navigator QR code at the store entrance to load coordinates.'
  },
  {
    icon: Map,
    title: 'Open Store Map',
    desc: 'The interactive SVG floorplan loads immediately in your browser.'
  },
  {
    icon: Search,
    title: 'Search Product',
    desc: 'Find any item across personal care, staples, fresh produce, and drinks.'
  },
  {
    icon: Compass,
    title: 'Follow AI Path',
    desc: 'Walk along the blue glowing route guidelines mapped onto the store layout.'
  },
  {
    icon: ShoppingBag,
    title: 'Pick Product',
    desc: 'Locate products at exact shelves (Shelf 1, Shelf 2) along the aisle.'
  },
  {
    icon: CreditCard,
    title: 'Checkout',
    desc: 'Trigger automatic routes pointing to the nearest billing counter.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Navigation Flow
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            How SmartStore Works
          </p>
          <div className="mt-4 h-1 w-12 bg-blue-500 mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Horizontal line for desktop */}
          <div className="hidden lg:block absolute top-[70px] left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-slate-800 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  {/* Step bubble */}
                  <div className="mx-auto w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-md group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-400 transition-all duration-300 relative">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-slate-400 text-xs px-2 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
