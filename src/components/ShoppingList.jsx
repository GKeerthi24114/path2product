import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Trash2, Route, PlusCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShoppingList() {
  const { 
    shoppingList, 
    removeFromShoppingList, 
    clearShoppingList, 
    updateItemQuantity,
    toggleProductCollected,
    optimizeShoppingRoute, 
    navigateToProduct,
    multiStopRoute,
    currentStopIndex
  } = useStore();

  const isMultiStop = Boolean(multiStopRoute && multiStopRoute.stops && multiStopRoute.stops.length > 0);
  const collectedCount = shoppingList.filter(item => {
    if (isMultiStop) {
      const stop = multiStopRoute.stops.find(s => s.product.id === item.id);
      return stop?.isCollected || item.collected;
    }
    return Boolean(item.collected);
  }).length;

  const calculateTotalPrice = () => {
    return shoppingList.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0).toFixed(2);
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
          
          {/* Progress Indicator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Progress: {collectedCount} / {shoppingList.length} products collected</span>
              <span>{Math.round((collectedCount / shoppingList.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(collectedCount / shoppingList.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            <AnimatePresence initial={false}>
              {shoppingList.map((item) => {
                const stopEntry = isMultiStop ? multiStopRoute.stops.find(s => s.product.id === item.id) : null;
                const isPicked = isMultiStop ? Boolean(stopEntry?.isCollected || item.collected) : Boolean(item.collected);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isPicked 
                        ? 'bg-slate-50 dark:bg-slate-900/30 border-gray-100 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-900/60 border-gray-150 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Small Circular Collection Control */}
                      <button
                        onClick={() => toggleProductCollected(item.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isPicked
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                        }`}
                        title={isPicked ? 'Collected - Tap to unmark' : 'Tap to mark collected'}
                      >
                        {isPicked ? '✓' : ''}
                      </button>

                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <div className={`text-sm font-bold ${isPicked ? 'line-through text-slate-400' : 'text-gray-900 dark:text-white'}`}>
                          {item.name} × {item.quantity || 1}
                        </div>
                        <div className="text-xxs text-gray-400 dark:text-slate-500 font-medium">
                          {item.floor || 'Floor 1'} • {item.aisle} ({item.shelf}) • ₹{(item.price || 0) * (item.quantity || 1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Compact Quantity +/- Controls */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                          onClick={() => updateItemQuantity(item.id, -1)}
                          disabled={(item.quantity || 1) <= 1}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-black disabled:opacity-30"
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-4 text-center font-extrabold text-xs text-slate-900 dark:text-white">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, 1)}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-black"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => navigateToProduct(item)}
                        className="p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                        title="Navigate to this product"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
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
