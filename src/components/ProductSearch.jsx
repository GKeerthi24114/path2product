import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../utils/graphData';
import { Search, Compass, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const { navigateToProduct, addToShoppingList } = useStore();

  const getFilteredProducts = () => {
    if (!query) return [];
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.aisle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filtered = getFilteredProducts();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-blue-500" />
        <h4 className="text-base font-bold text-gray-900 dark:text-white">Find Products</h4>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search soap, milk, rice..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
        />
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
      </div>

      {/* Results Box */}
      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 max-h-64 overflow-y-auto space-y-2 border border-gray-150 dark:border-slate-700/55 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/30"
          >
            {filtered.length > 0 ? (
              filtered.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/40 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{prod.emoji}</span>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{prod.name}</div>
                      <div className="text-xxs text-gray-400 dark:text-slate-500 font-medium">
                        {prod.category} • {prod.aisle} ({prod.shelf})
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addToShoppingList(prod)}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300 transition-colors"
                      title="Add to shopping list"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        navigateToProduct(prod);
                        setQuery('');
                      }}
                      className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/10"
                    >
                      <Compass className="h-3.5 w-3.5 rotate-45" /> Go
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-gray-400 font-medium">
                No items found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
