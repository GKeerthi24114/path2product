import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Trash2, Route, PlusCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShoppingList() {
  const { shoppingList, removeFromShoppingList, clearShoppingList, optimizeShoppingRoute, navigateToProduct } = useStore();

  const calculateTotalPrice = () => {
    return shoppingList.reduce((acc, item) => acc + item.price, 0).toFixed(2);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md">
      <div className="flex items-center justify-between border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Shopping List <span className="text-xs text-gray-400 font-semibold bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full ml-1">{shoppingList.length}</span>
          </h4>
        </div>
        {shoppingList.length > 0 && (
          <button
            onClick={clearShoppingList}
            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 font-bold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {shoppingList.length > 0 ? (
        <div className="space-y-4">
          
          {/* Scrollable list */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            <AnimatePresence initial={false}>
              {shoppingList.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-xxs text-gray-400 dark:text-slate-500 font-medium">
                        {item.aisle} • {item.shelf} • ${item.price}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigateToProduct(item)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                      title="Navigate to this product"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromShoppingList(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pricing Stats */}
          <div className="flex items-center justify-between text-sm border-t border-gray-150/50 dark:border-slate-700/50 pt-3 font-semibold">
            <span className="text-slate-400">Total Est. Price:</span>
            <span className="text-slate-700 dark:text-white font-extrabold">${calculateTotalPrice()}</span>
          </div>

          {/* Path Optimization CTA */}
          <button
            onClick={optimizeShoppingRoute}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-bold text-white text-sm shadow-md shadow-blue-500/15 transition-all hover:scale-[1.01]"
          >
            <Route className="h-4.5 w-4.5" /> Optimize Route
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex p-3 rounded-full bg-gray-50 dark:bg-slate-900 text-gray-400 mb-3">
            <PlusCircle className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Your shopping list is empty.
          </p>
          <p className="text-xxs text-gray-400 mt-1">
            Search for products above to start planning your visit.
          </p>
        </div>
      )}
    </div>
  );
}
