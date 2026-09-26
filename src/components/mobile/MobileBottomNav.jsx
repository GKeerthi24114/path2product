import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Store, Bot, Tag, ShoppingCart, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const { activeMobileTab, setActiveMobileTab, shoppingList, path } = useStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Store },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'offers', label: 'Offers', icon: Tag, badge: 'Deals' },
    { id: 'list', label: 'List', icon: ShoppingCart, count: shoppingList.length },
    { id: 'navigation', label: 'Navigate', icon: Navigation, isLive: path.length > 0 }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 select-none md:hidden"
      aria-label="Mobile Navigation Bar"
    >
      <div className="grid grid-cols-5 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMobileTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveMobileTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl min-h-[50px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileTabIndicator"
                  className="absolute inset-0 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  } ${item.id === 'navigation' ? 'rotate-45' : ''}`}
                />

                {/* Shopping List Count Badge */}
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                    {item.count}
                  </span>
                )}

                {/* Live Navigation Pulse Indicator */}
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}

                {/* Offer tag badge */}
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-rose-500 text-white text-[8px] font-extrabold leading-none py-0.5">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 leading-tight tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
