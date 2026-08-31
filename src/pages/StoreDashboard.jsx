import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import StoreMap from '../components/StoreMap';
import ProductSearch from '../components/ProductSearch';
import ShoppingList from '../components/ShoppingList';
import NavigationPanel from '../components/NavigationPanel';
import AIAssistant from '../components/AIAssistant';
import PositionSimulator from '../components/PositionSimulator';
import Recommendations from '../components/Recommendations';
import { Map, Search, Compass, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState('map'); // mobile tabs: map, search, nav, assistant
  const { currentPosition } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      
      {/* Mobile Tab Selectors */}
      <div className="flex md:hidden items-center justify-around bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 rounded-2xl p-1 mb-4 shadow-sm">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl gap-0.5 text-xxs font-bold transition-all ${
            activeTab === 'map' ? 'bg-blue-500 text-white' : 'text-slate-500'
          }`}
        >
          <Map className="h-4 w-4" /> Map
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl gap-0.5 text-xxs font-bold transition-all ${
            activeTab === 'search' ? 'bg-blue-500 text-white' : 'text-slate-500'
          }`}
        >
          <Search className="h-4 w-4" /> Search
        </button>
        <button
          onClick={() => setActiveTab('nav')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl gap-0.5 text-xxs font-bold transition-all ${
            activeTab === 'nav' ? 'bg-blue-500 text-white' : 'text-slate-500'
          }`}
        >
          <Compass className="h-4 w-4" /> Navigate
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center py-2 px-3 rounded-xl gap-0.5 text-xxs font-bold transition-all ${
            activeTab === 'assistant' ? 'bg-blue-500 text-white' : 'text-slate-500'
          }`}
        >
          <Bot className="h-4 w-4" /> AI Chat
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left column (Desktop only, or Search tab on Mobile) */}
        <div className={`space-y-6 md:col-span-1 ${activeTab === 'search' ? 'block' : 'hidden md:block'}`}>
          <ProductSearch />
          <ShoppingList />
        </div>

        {/* Center column (Map & Simulator - Desktop or Map tab on Mobile) */}
        <div className={`space-y-6 md:col-span-2 ${activeTab === 'map' ? 'block' : 'hidden md:block'}`}>
          <StoreMap />
          <PositionSimulator />
        </div>

        {/* Right column (Directions, Recs, Assistant - Desktop or relevant tabs on Mobile) */}
        <div className={`space-y-6 md:col-span-1 md:block`}>
          <div className={activeTab === 'nav' ? 'block' : 'hidden md:block'}>
            <NavigationPanel />
          </div>
          
          <div className={activeTab === 'assistant' ? 'block' : 'hidden md:block'}>
            <AIAssistant />
          </div>

          <div className={activeTab === 'map' || activeTab === 'nav' ? 'block' : 'hidden md:block'}>
            <Recommendations />
          </div>
        </div>

      </div>

    </motion.div>
  );
}
