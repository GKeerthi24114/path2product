import React from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../utils/graphData';
import { getRecommendations } from '../utils/recommendations';
import { Sparkles, Compass, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Recommendations() {
  const { selectedProduct, navigateToProduct, addToShoppingList } = useStore();

  const getRecs = () => {
    if (!selectedProduct) return [];
    return getRecommendations(selectedProduct.name, PRODUCTS);
  };

  const recommendations = getRecs();

  if (!selectedProduct) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md text-center py-8">
        <Sparkles className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-400 font-medium">Select a product to view nearby recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md">
      <div className="flex items-center gap-2 border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h4 className="text-base font-bold text-gray-900 dark:text-white">Recommended Nearby</h4>
      </div>

      <div className="space-y-2.5">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{rec.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{rec.name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500">
                    Aisle {rec.aisle} • ${rec.price}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => addToShoppingList(rec)}
                  className="p-1 rounded bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-150 dark:border-slate-700 text-gray-500 dark:text-slate-300 transition-colors"
                  title="Add to list"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => navigateToProduct(rec)}
                  className="p-1 rounded bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors"
                  title="Navigate here"
                >
                  <Compass className="h-3.5 w-3.5 rotate-45" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 font-medium py-4 text-center">No nearby suggestions.</p>
        )}
      </div>
    </div>
  );
}
