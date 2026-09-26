import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../utils/graphData';
import { 
  ShoppingCart, 
  Trash2, 
  Sparkles, 
  Plus, 
  Check, 
  Navigation, 
  ArrowRight, 
  PackageOpen, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileShoppingList() {
  const { 
    shoppingList, 
    addToShoppingList, 
    removeFromShoppingList, 
    clearShoppingList, 
    updateItemQuantity,
    toggleProductCollected,
    optimizeShoppingRoute, 
    navigateToProduct,
    isCalculating,
    multiStopRoute,
    currentStopIndex,
    setActiveMobileTab
  } = useStore();

  const [quickSearch, setQuickSearch] = useState('');

  const isMultiStop = Boolean(multiStopRoute && multiStopRoute.stops && multiStopRoute.stops.length > 0);
  
  const totalProducts = shoppingList.length;
  const collectedCount = shoppingList.filter(item => {
    if (isMultiStop) {
      const stop = multiStopRoute.stops.find(s => s.product.id === item.id);
      return stop?.isCollected || item.collected;
    }
    return Boolean(item.collected);
  }).length;

  const totalPrice = shoppingList
    .reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
    .toFixed(2);

  const quickSearchMatches = quickSearch.trim()
    ? PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(quickSearch.toLowerCase())
      )
    : [];

  const popularAdditions = PRODUCTS.slice(0, 5);

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Top Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/15">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Shopping List</h1>
              <span className="text-xs text-blue-100">
                {totalProducts} products • {collectedCount} collected
              </span>
            </div>
          </div>

          {shoppingList.length > 0 && (
            <button
              onClick={clearShoppingList}
              className="text-xs font-bold text-red-200 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Progress bar of collected items */}
        {shoppingList.length > 0 && (
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between text-[11px] text-blue-100">
              <span className="font-bold">Progress: {collectedCount} / {totalProducts} products collected</span>
              <span>{totalProducts > 0 ? Math.round((collectedCount / totalProducts) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${totalProducts > 0 ? (collectedCount / totalProducts) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/15 text-sm font-semibold">
          <span className="text-blue-100">Estimated Total:</span>
          <span className="text-xl font-extrabold">₹{totalPrice}</span>
        </div>
      </div>

      {/* OPTIMIZED ROUTE BANNER & SEQUENCE PREVIEW */}
      {isMultiStop && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                AI Optimized Shopping Route
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {collectedCount} / {multiStopRoute.stops.length} collected
            </span>
          </div>

          {/* Sequence: ✓ Toothpaste → Shampoo → Rice → Checkout */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-slate-300 shrink-0">
              Entrance
            </span>
            {multiStopRoute.stops.map((stop, idx) => {
              const isCollected = Boolean(stop.isCollected);
              const isCurrent = idx === currentStopIndex;

              return (
                <React.Fragment key={stop.stopNumber}>
                  <span className="text-indigo-400 text-xs shrink-0">→</span>
                  <span
                    className={`px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1 transition-all ${
                      isCollected
                        ? 'bg-emerald-500/20 text-emerald-300 line-through'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md'
                        : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {isCollected ? '✓ ' : `${stop.stopNumber}. `}
                    {stop.product.name}
                  </span>
                </React.Fragment>
              );
            })}
            <span className="text-indigo-400 text-xs shrink-0">→</span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              {multiStopRoute.finalCheckout?.label || 'Checkout'}
            </span>
          </div>

          {/* Metrics & Navigation Action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-xs text-indigo-200 font-semibold">
              {multiStopRoute.totalDistance} m • {multiStopRoute.estimatedTimeFormatted}
            </div>
            <button
              onClick={() => setActiveMobileTab('navigation')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>View Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="Quick add item (e.g. Bread, Soap, Rice)..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />

        {/* Search Results Drawer */}
        <AnimatePresence>
          {quickSearch && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-2 max-h-48 overflow-y-auto z-40"
            >
              {quickSearchMatches.length > 0 ? (
                quickSearchMatches.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <span>{prod.emoji}</span>
                      <span className="text-xs font-bold">{prod.name}</span>
                      <span className="text-xxs text-slate-400">(${prod.price})</span>
                    </div>
                    <button
                      onClick={() => {
                        addToShoppingList(prod);
                        setQuickSearch('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xxs font-bold"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">No items found</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shopping List Items */}
      {shoppingList.length > 0 ? (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {shoppingList.map((item) => {
              // Check if item in multiStopRoute
              const stopEntry = isMultiStop 
                ? multiStopRoute.stops.find(s => s.product.id === item.id)
                : null;
              const isPicked = isMultiStop
                ? Boolean(stopEntry?.isCollected || item.collected)
                : Boolean(item.collected);
              const isCurrentStop = isMultiStop && stopEntry && (stopEntry.stopNumber - 1) === currentStopIndex;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isCurrentStop
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-400'
                      : isPicked
                      ? 'bg-slate-100/70 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700/70 shadow-sm'
                  }`}
                >
                  {/* Small Circular Collection Control */}
                  <button
                    onClick={() => toggleProductCollected(item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isPicked
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                    }`}
                    title={isPicked ? 'Collected - Tap to unmark' : 'Tap to mark collected'}
                  >
                    {isPicked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <span className="text-2xl shrink-0">{item.emoji}</span>

                  {/* Product Details with Quantity Display */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold truncate ${isPicked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.name} × {item.quantity || 1}
                      </span>
                      {stopEntry && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                          isCurrentStop ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          STOP {stopEntry.stopNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.floor || 'Floor 1'} • {item.aisle} • ₹{(item.price || 0) * (item.quantity || 1)}
                    </div>
                  </div>

                  {/* Compact Quantity +/- Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => updateItemQuantity(item.id, -1)}
                      disabled={(item.quantity || 1) <= 1}
                      className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-black disabled:opacity-30 active:scale-90 transition-all shadow-xs"
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-extrabold text-xs text-slate-900 dark:text-white">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(item.id, 1)}
                      className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-black active:scale-90 transition-all shadow-xs"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete Item Action */}
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    title="Remove from list"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Prominent Optimize Route Button */}
          <button
            onClick={optimizeShoppingRoute}
            disabled={isCalculating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all mt-4"
          >
            {isCalculating ? (
              <>
                <Sparkles className="h-5 w-5 animate-spin" /> Calculating Shortest Route...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> ✨ Optimize My Route
              </>
            )}
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200/70 dark:border-slate-700/60 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-900 text-blue-500 flex items-center justify-center mx-auto">
            <PackageOpen className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-base font-extrabold">Your list is currently empty</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add products or quick pantry essentials below to plan your shortest store walk.
            </p>
          </div>

          {/* Quick Add Suggestions */}
          <div className="pt-2 text-left">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular essentials to add:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {popularAdditions.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addToShoppingList(prod)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-left hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{prod.emoji}</span>
                    <span className="text-xs font-bold truncate">{prod.name}</span>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
