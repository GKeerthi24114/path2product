import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import StoreMap from '../components/StoreMap';
import ProductSearch from '../components/ProductSearch';
import ShoppingList from '../components/ShoppingList';
import NavigationPanel from '../components/NavigationPanel';
import AIAssistant from '../components/AIAssistant';
import PositionSimulator from '../components/PositionSimulator';
import Recommendations from '../components/Recommendations';
import MobileCustomerShell from '../components/mobile/MobileCustomerShell';
import { motion } from 'framer-motion';

export default function StoreDashboard() {
  const { currentPosition } = useStore();

  return (
    <>
      {/* MOBILE-FIRST CUSTOMER EXPERIENCE (Primary Mobile View) */}
      <div className="block md:hidden w-full">
        <MobileCustomerShell />
      </div>

      {/* DESKTOP EXPERIENCE (Preserved Desktop Multi-Column Dashboard) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left column */}
          <div className="space-y-6 md:col-span-1">
            <ProductSearch />
            <ShoppingList />
          </div>

          {/* Center column (Map & Simulator) */}
          <div className="space-y-6 md:col-span-2">
            <StoreMap />
            <PositionSimulator />
          </div>

          {/* Right column (Directions, Recs, Assistant) */}
          <div className="space-y-6 md:col-span-1">
            <NavigationPanel />
            <AIAssistant />
            <Recommendations />
          </div>
        </div>
      </motion.div>
    </>
  );
}
