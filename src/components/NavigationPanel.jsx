import React from 'react';
import { useStore } from '../context/StoreContext';
import { Compass, CreditCard, ChevronRight, CornerDownRight, Check } from 'lucide-react';
import { NODES } from '../utils/graphData';

export default function NavigationPanel() {
  const { directions, path, selectedProduct, navigateToCheckout, currentPosition, destination, endNavigation } = useStore();

  const calculateTotalDistance = () => {
    if (directions.length === 0) return 0;
    return directions.reduce((acc, step) => acc + (step.distance || 0), 0);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md flex flex-col justify-between min-h-[350px]">
      <div>
        <div className="flex items-center gap-2 border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
          <Compass className="h-5 w-5 text-blue-500" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">AI Path Directions</h4>
        </div>

        {directions.length > 0 ? (
          <div className="space-y-4">
            {/* Top destination badge */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-900/30 border border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-medium">Target Destination:</span>
                <div className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {selectedProduct ? `${selectedProduct.emoji} ${selectedProduct.name}` : 'Billing Checkout'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-medium">Walking Dist:</span>
                <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {calculateTotalDistance()} meters
                </div>
              </div>
            </div>

            {/* Instruction list */}
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {directions.map((step, idx) => {
                const isArrived = idx === directions.length - 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl text-xs ${
                      isArrived
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isArrived ? (
                        <span className="text-emerald-500">✔</span>
                      ) : (
                        <CornerDownRight className="h-4.5 w-4.5 text-blue-500/70" />
                      )}
                    </div>
                    <div>
                      <div>{step.instruction}</div>
                      {!isArrived && step.distance > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                          ({step.distance} meters)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-3.5 rounded-full bg-gray-50 dark:bg-slate-900 text-gray-400 mb-3">
              <Compass className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              No active navigation route.
            </p>
            <p className="text-xxs text-gray-400 mt-1 max-w-[200px] mx-auto">
              Search for products or enter the store to generate route directions.
            </p>
          </div>
        )}
      </div>

      {/* Checkout / End Navigation Actions */}
      {path.length > 0 && (
        <div className="space-y-2 mt-4">
          {destination && destination.startsWith('BILL') ? (
            <button
              onClick={() => endNavigation(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/15 transition-colors"
            >
              <Check className="h-4.5 w-4.5 stroke-[3]" /> Complete & End Navigation
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={navigateToCheckout}
                className="inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <CreditCard className="h-4 w-4" /> Go to Checkout
              </button>
              <button
                onClick={() => endNavigation(false)}
                className="inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                End Route
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
