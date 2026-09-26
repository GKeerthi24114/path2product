import React from 'react';
import { useStore } from '../../context/StoreContext';
import MobileBottomNav from './MobileBottomNav';
import MobileHome from './MobileHome';
import MobileOffers from './MobileOffers';
import MobileAssistant from './MobileAssistant';
import MobileShoppingList from './MobileShoppingList';
import MobileNavigation from './MobileNavigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileCustomerShell() {
  const { activeMobileTab } = useStore();

  const renderActiveScreen = () => {
    switch (activeMobileTab) {
      case 'offers':
        return <MobileOffers key="offers" />;
      case 'assistant':
        return <MobileAssistant key="assistant" />;
      case 'list':
        return <MobileShoppingList key="list" />;
      case 'navigation':
        return <MobileNavigation key="navigation" />;
      case 'home':
      default:
        return <MobileHome key="home" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 pt-2 pb-20 overflow-x-hidden md:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMobileTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {renderActiveScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
