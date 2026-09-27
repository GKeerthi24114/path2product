import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { NODES, PRODUCTS, ADJACENCY_LIST } from '../../utils/graphData';
import { dijkstra, generateDirections } from '../../utils/dijkstra';
import StoreMap from '../StoreMap';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Clock, 
  CornerDownRight, 
  CornerDownLeft,
  ArrowUp, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  X, 
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Check,
  PackageCheck,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNavigation() {
  const { 
    currentPosition, 
    setCurrentPosition,
    destination,
    selectedProduct,
    path,
    setPath,
    directions,
    setDirections,
    activeStepIndex,
    setActiveStepIndex,
    isCalculating,
    routeError,
    clearNavigation,
    navigateToCheckout,
    navigateToProduct,
    shoppingList,
    optimizeShoppingRoute,
    multiStopRoute,
    currentStopIndex,
    markStopCollected,
    toggleProductCollected,
    activeFloor,
    setActiveFloor,
    addAssistantMessage,
    setActiveMobileTab
  } = useStore();

  const [showSimulator, setShowSimulator] = useState(false);

  // Active Multi-Stop calculations
  const isMultiStop = Boolean(multiStopRoute && multiStopRoute.stops && multiStopRoute.stops.length > 0);
  const currentStop = isMultiStop ? multiStopRoute.stops[currentStopIndex] : null;
  const nextStop = isMultiStop && currentStopIndex + 1 < multiStopRoute.stops.length ? multiStopRoute.stops[currentStopIndex + 1] : null;
  const isAllStopsCollected = isMultiStop && (currentStopIndex >= multiStopRoute.stops.length || multiStopRoute.stops.every(s => s.isCollected));
  const collectedCount = isMultiStop ? multiStopRoute.stops.filter(s => s.isCollected).length : 0;
  const remainingStopsCount = isMultiStop ? Math.max(0, multiStopRoute.stops.length - collectedCount) : 0;

  // Single target distance / ETA
  const totalDistance = directions.reduce((acc, step) => acc + (step.distance || 0), 0);
  const etaMinutes = Math.max(1, Math.ceil(totalDistance / (0.8 * 60)));
  const etaFormatted = `${totalDistance} m • ~${etaMinutes} min`;

  const currentNode = currentPosition && NODES[currentPosition] ? NODES[currentPosition] : null;
  const currentStep = directions[activeStepIndex] || directions[0] || null;
  const isLastStep = directions.length > 0 && activeStepIndex >= directions.length - 1;
  const isFirstStep = activeStepIndex === 0;

  // Turn Direction Icon Helper
  const getTurnIcon = (turnType = '', instruction = '') => {
    const lower = instruction.toLowerCase();
    if (turnType === 'arrived' || lower.includes('arrived')) {
      return <CheckCircle2 className="h-6 w-6 text-emerald-400" />;
    }
    if (turnType === 'vertical' || lower.includes('escalator') || lower.includes('floor')) {
      return <ArrowUp className="h-6 w-6 text-indigo-400" />;
    }
    if (turnType === 'right' || lower.includes('right')) {
      return <CornerDownRight className="h-6 w-6 text-blue-400" />;
    }
    if (turnType === 'left' || lower.includes('left')) {
      return <CornerDownLeft className="h-6 w-6 text-blue-400" />;
    }
    return <ArrowUp className="h-6 w-6 text-blue-400" />;
  };

  const handleSimulateMove = (nodeId) => {
    setCurrentPosition(nodeId);
    const nodeObj = NODES[nodeId];
    if (nodeObj && nodeObj.floor) {
      setActiveFloor(nodeObj.floor);
    }
    if (destination && destination !== nodeId) {
      const localResult = dijkstra(ADJACENCY_LIST, nodeId, destination);
      const localDirs = generateDirections(localResult.path, NODES, ADJACENCY_LIST, selectedProduct);
      setPath(localResult.path);
      setDirections(localDirs);
      setActiveStepIndex(0);
    }
  };

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Loading state indicator */}
      {isCalculating && (
        <div className="bg-blue-600 text-white rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold animate-pulse shadow-md">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Calculating optimal indoor path...</span>
        </div>
      )}

      {/* Error state alert */}
      {routeError && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-3 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{routeError}</span>
          </div>
          <button
            onClick={() => clearNavigation()}
            className="text-xxs font-bold uppercase underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          CASE A: MULTI-PRODUCT SHOPPING ROUTE ACTIVE
      ======================================================== */}
      {isMultiStop && (
        <div className="space-y-3">
          
          {/* Multi-Stop Progress HUD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/80 dark:border-slate-700/70 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Shopping Route
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Progress: {collectedCount} / {multiStopRoute.stops.length} products collected
              </span>
            </div>

            {/* Visual Route Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(collectedCount / multiStopRoute.stops.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
              <span>Total Route: {multiStopRoute.totalDistance} m</span>
              <span>Walking Time: {multiStopRoute.estimatedTimeFormatted}</span>
            </div>
          </div>

          {/* ALL ITEMS COLLECTED CELEBRATION CARD */}
          {isAllStopsCollected ? (
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold">🎉 Shopping complete</h2>
                <p className="text-xs text-emerald-100 font-medium">
                  All products collected! Nearest checkout: <strong className="text-white">{multiStopRoute.finalCheckout?.label || 'Billing 2'}</strong>
                </p>
                <div className="text-sm font-extrabold text-white mt-1">
                  {multiStopRoute.finalCheckout?.distanceFromLastProduct || 15} m away
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setActiveMobileTab('list')}
                  className="py-3.5 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 backdrop-blur-md active:scale-98 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add More Items</span>
                </button>

                <button
                  onClick={navigateToCheckout}
                  className="py-3.5 px-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Navigate to Checkout</span>
                </button>
              </div>
            </div>
          ) : (
            /* CURRENT STOP CARD (User-Understandable with Quantity & Next Preview) */
            currentStop && (
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Small circular collection button directly beside active product */}
                    <button
                      type="button"
                      onClick={() => toggleProductCollected(currentStop.product.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 ${
                        currentStop.isCollected
                          ? 'bg-emerald-400 text-slate-900 shadow-md ring-2 ring-emerald-300'
                          : 'border-2 border-white/70 hover:border-white hover:bg-white/20 text-white'
                      }`}
                      title={currentStop.isCollected ? 'Collected - Tap to unmark' : 'Tap to mark collected'}
                    >
                      {currentStop.isCollected ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span className="text-sm font-bold leading-none">○</span>
                      )}
                    </button>

                    <div>
                      <span className="text-xxs font-extrabold uppercase tracking-wider text-blue-200 block">
                        CURRENT STOP (Stop {currentStop.stopNumber} of {multiStopRoute.stops.length})
                      </span>
                      <h1 className="text-xl font-black mt-0.5 flex items-center gap-1.5">
                        <span>{currentStop.product.emoji}</span>
                        <span>{currentStop.product.name} × {currentStop.quantity || currentStop.product.quantity || 1}</span>
                      </h1>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold tracking-wide uppercase">
                    {currentStop.floor}
                  </span>
                </div>

                {/* Location Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                  <span className="px-2.5 py-1 rounded-xl bg-white/15 uppercase tracking-wide">
                    {currentStop.aisle}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/15 uppercase tracking-wide">
                    {currentStop.shelf}
                  </span>
                  <span className="text-blue-200">•</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-blue-100">{currentStop.distanceFromPrev} m</span>
                  <span className="text-blue-200">•</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 text-blue-100">~1 min</span>
                </div>

                {/* Natural Human Instruction */}
                <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md text-xs font-bold leading-relaxed border border-white/20 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 shrink-0">
                    {getTurnIcon(currentStep?.turnType, currentStep?.instruction)}
                  </div>
                  <span className="text-sm">"{currentStep?.instruction || `Walk straight toward ${currentStop.aisle}.`}"</span>
                </div>

                {/* Turn-by-turn cycling if multiple steps */}
                {directions.length > 1 && (
                  <div className="flex items-center justify-between text-xxs font-bold text-blue-200 pt-0.5">
                    <button
                      onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                      disabled={activeStepIndex === 0}
                      className="px-2.5 py-1 rounded-lg bg-white/15 disabled:opacity-30 transition-opacity"
                    >
                      ← Prev Turn
                    </button>
                    <span>Turn {activeStepIndex + 1} of {directions.length}</span>
                    <button
                      onClick={() => setActiveStepIndex(Math.min(directions.length - 1, activeStepIndex + 1))}
                      disabled={activeStepIndex >= directions.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-white/15 disabled:opacity-30 transition-opacity"
                    >
                      Next Turn →
                    </button>
                  </div>
                )}

                {/* NEXT STOP PREVIEW & SHOPPING LIST LINK (No large mark collected button) */}
                {nextStop ? (
                  <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-200 block">NEXT</span>
                      <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        <span>{nextStop.product.emoji}</span>
                        <span>{nextStop.product.name} × {nextStop.quantity || nextStop.product.quantity || 1}</span>
                      </div>
                      <div className="text-[10px] text-blue-200">
                        {nextStop.floor} • {nextStop.aisle}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveMobileTab('list')}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xxs flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>Collect in List</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-200 block">NEXT</span>
                      <div className="font-extrabold text-white">Nearest Checkout ({multiStopRoute.finalCheckout?.label || 'Billing'})</div>
                    </div>
                    <button
                      onClick={() => setActiveMobileTab('list')}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xxs flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>View List</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* COMPLETE SHOPPING ROUTE LIST BREAKDOWN */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/80 dark:border-slate-700/70 shadow-md space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Shopping Route Sequence
            </h3>

            {/* START */}
            <div className="flex items-center gap-3 text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xxs font-extrabold">✓</span>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white">START</span>: Entrance (Floor 1)
              </div>
            </div>

            {/* STOPS */}
            {multiStopRoute.stops.map((stop, idx) => {
              const isCurrent = idx === currentStopIndex;
              const isDone = Boolean(stop.isCollected);
              const prevStop = idx > 0 ? multiStopRoute.stops[idx - 1] : null;
              const prevFloor = prevStop ? prevStop.floor : 'Floor 1';
              const isFloorChange = prevFloor !== stop.floor;

              const prevFloorNum = parseInt((prevFloor || '1').replace(/\D/g, '')) || 1;
              const stopFloorNum = parseInt((stop.floor || '1').replace(/\D/g, '')) || 1;
              const isGoingUp = stopFloorNum > prevFloorNum;
              const transitionLabel = stopFloorNum === 3 ? 'Stairs / Escalator' : 'Escalator';

              return (
                <React.Fragment key={stop.stopNumber}>
                  {/* Explicit Floor Transition between stops */}
                  {isFloorChange && (
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">
                          {isGoingUp ? '↑' : '↓'}
                        </span>
                        <span>
                          Take {transitionLabel} {isGoingUp ? '↑ up to' : '↓ down to'} {stop.floor}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-black">
                        Floor {stopFloorNum}
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => toggleProductCollected(stop.product.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-xs cursor-pointer select-none active:scale-[0.99] ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 font-bold shadow-xs ring-1 ring-blue-400'
                        : isDone
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-800 border-gray-150 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductCollected(stop.product.id);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0 active:scale-90 ${
                          isDone 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : isCurrent 
                            ? 'border-2 border-blue-600 text-blue-600 bg-white dark:bg-slate-800 ring-2 ring-blue-300' 
                            : 'border-2 border-slate-300 dark:border-slate-600 text-slate-400 hover:border-blue-400'
                        }`}
                        title={isDone ? 'Collected - Tap to unmark' : 'Tap to mark collected'}
                      >
                        {isDone ? '✓' : '○'}
                      </button>
                      <span className="text-xl">{stop.product.emoji}</span>
                      <div>
                        <div className={isDone ? 'line-through text-slate-400' : 'font-extrabold'}>
                          STOP {stop.stopNumber}: {stop.product.name} × {stop.quantity || stop.product.quantity || 1}
                        </div>
                        <div className="text-xxs text-slate-400">
                          {stop.aisle} • {stop.floor}
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xxs font-extrabold">
                        Active
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Transition down to Floor 1 Checkout if last stop was on upper floor */}
            {multiStopRoute.stops.length > 0 && (multiStopRoute.stops[multiStopRoute.stops.length - 1]?.floor !== 'Floor 1') && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-extrabold shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-purple-600 text-white text-[11px] font-black flex items-center justify-center">
                    ↓
                  </span>
                  <span>Take Escalator / Elevator ↓ down to Floor 1 (Checkout Area)</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-purple-500 font-black">
                  Floor 1
                </span>
              </div>
            )}

            {/* FINAL */}
            <div className="flex items-center gap-3 text-xs font-semibold p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xxs font-extrabold">F</span>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white">FINAL</span>: Nearest Checkout ({multiStopRoute.finalCheckout?.label || 'Billing 2'})
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          CASE B: SINGLE DESTINATION / CHECKOUT NAVIGATION ACTIVE
      ======================================================== */}
      {!isMultiStop && path.length > 0 && (
        <div className="space-y-3">
          {/* USER-UNDERSTANDABLE NEXT STOP / CHECKOUT CARD */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xxs font-extrabold uppercase tracking-wider text-blue-200">
                  {selectedProduct ? 'NEXT STOP' : 'CHECKOUT DESTINATION'}
                </span>
                <h1 className="text-2xl font-extrabold mt-0.5 flex items-center gap-2">
                  <span>{selectedProduct ? selectedProduct.emoji : '💳'}</span>
                  <span>{selectedProduct ? selectedProduct.name : (NODES[destination]?.label || 'Billing Checkout')}</span>
                </h1>
              </div>
              <button
                onClick={clearNavigation}
                className="p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30"
                title="Cancel navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-100">
              <span className="px-2.5 py-1 rounded-xl bg-white/15">
                {selectedProduct ? (selectedProduct.floor || 'Floor 1') : 'Floor 1'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/15">
                {selectedProduct ? selectedProduct.aisle : 'Checkout Area'}
              </span>
              {selectedProduct?.shelf && (
                <span className="px-2.5 py-1 rounded-xl bg-white/15">
                  {selectedProduct.shelf}
                </span>
              )}
            </div>

            <div className="text-xs text-blue-200 font-medium">
              {etaFormatted}
            </div>

            {/* Clear natural guidance text */}
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md text-xs font-bold leading-relaxed border border-white/20 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
                {getTurnIcon(currentStep?.turnType, currentStep?.instruction)}
              </div>
              <span>"{currentStep?.instruction || (selectedProduct ? `Continue directly to ${selectedProduct.aisle}.` : 'Proceed directly to the checkout counter.')}"</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CASE C: IDLE MODE WITH SHOPPING LIST WAITING FOR OPTIMIZATION
      ======================================================== */}
      {!isMultiStop && path.length === 0 && shoppingList.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-slate-800 dark:to-indigo-950/40 rounded-3xl p-5 border border-blue-200 dark:border-slate-700 shadow-md space-y-3 text-center">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white inline-flex mx-auto shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">Ready to Generate Shopping Route</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              You have {shoppingList.length} items in your list: {shoppingList.map(i => i.name).join(', ')}.
            </p>
          </div>

          <button
            onClick={optimizeShoppingRoute}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 active:scale-98 transition-all"
          >
            <Sparkles className="h-5 w-5" /> ✨ Optimize My Route
          </button>
        </div>
      )}

      {/* ========================================================
          MULTI-FLOOR STORE MAP (Interactive Floorplan)
      ======================================================== */}
      <div className="relative">
        <StoreMap />

        {/* Quick Simulator Drawer Toggle */}
        <div className="absolute top-16 right-4 z-10">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200 dark:border-slate-700 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {/* Collapsible Location Simulator Drawer */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-200 dark:border-slate-700 shadow-md space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Test Movement Position:</span>
              <span className="text-blue-500 font-extrabold">{currentNode?.label || 'Entrance'} (Floor {activeFloor})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['ENT', 'A1', 'A2', 'B2', 'B3', 'ESC', 'C2', 'BILL2'].map((nodeId) => (
                <button
                  key={nodeId}
                  onClick={() => handleSimulateMove(nodeId)}
                  className={`py-2 px-1 rounded-xl text-xxs font-bold border transition-all ${
                    currentPosition === nodeId
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-900 border-gray-150 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {nodeId === 'ENT' ? 'Entrance' : nodeId === 'ESC' ? '↑ Escalator' : nodeId === 'BILL2' ? 'Checkout' : `Aisle ${nodeId}`}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          CASE D: IDLE MODE WITH NO ACTIVE ROUTE & NO SHOPPING LIST
      ======================================================== */}
      {!isMultiStop && path.length === 0 && shoppingList.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/80 dark:border-slate-700/70 shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-slate-900 text-blue-600">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Ready to Navigate</h2>
              <p className="text-xs text-slate-400">Add products to your shopping list to generate an optimized route.</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Items:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTS.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigateToProduct(p)}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-gray-150 dark:border-slate-800 flex items-center justify-between text-left hover:border-blue-400 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div className="text-xxs text-slate-400">{p.aisle}</div>
                    </div>
                  </div>
                  <Navigation className="h-3.5 w-3.5 rotate-45 text-blue-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={navigateToCheckout}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <CreditCard className="h-4 w-4" /> Head to Nearest Checkout
          </button>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      {path.length > 0 && !isAllStopsCollected && (
        <div className={`grid gap-3 pt-1 ${destination && destination.startsWith('BILL') ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {(!destination || !destination.startsWith('BILL')) && (
            <button
              onClick={navigateToCheckout}
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <CreditCard className="h-4 w-4" /> Go to Checkout
            </button>
          )}

          <button
            onClick={clearNavigation}
            className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <X className="h-4 w-4" /> End Navigation
          </button>
        </div>
      )}

    </div>
  );
}
