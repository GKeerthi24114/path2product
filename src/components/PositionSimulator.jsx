import React from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Navigation } from 'lucide-react';
import { NODES, ADJACENCY_LIST } from '../utils/graphData';
import { dijkstra, generateDirections } from '../utils/dijkstra';
import { navigatePath } from '../utils/api';

export default function PositionSimulator() {
  const { currentPosition, setCurrentPosition, destination, setPath, setDirections, selectedProduct, addAssistantMessage } = useStore();

  const simulatorButtons = [
    { label: "Move to A1", id: "A1" },
    { label: "Move to A2", id: "A2" },
    { label: "Move to B1", id: "B1" },
    { label: "Move to B2", id: "B2" },
    { label: "Move to B3", id: "B3" },
    { label: "Checkout", id: "BILL2" }
  ];

  const handleSimulateMove = async (nodeId) => {
    setCurrentPosition(nodeId);

    // If there is an active destination, recalculate route path immediately
    if (destination && destination !== nodeId) {
      try {
        const data = await navigatePath(nodeId, destination);
        setPath(data.path);
        setDirections(data.directions);
      } catch (err) {
        // Local pathfinding fallback
        const localResult = dijkstra(ADJACENCY_LIST, nodeId, destination);
        const localDirs = generateDirections(localResult.path, NODES);
        setPath(localResult.path);
        setDirections(localDirs);
      }
    } else if (destination === nodeId) {
      setPath([]);
      setDirections([]);
      const targetLabel = NODES[nodeId] ? NODES[nodeId].label : nodeId;
      addAssistantMessage(`Arrival check: You have arrived at ${targetLabel}! Navigation path completed.`, "success");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md w-full">
      <div className="flex items-center justify-between border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">Simulate Positioning</h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400">
          Current: {currentPosition ? NODES[currentPosition]?.label : 'Not Set'}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {simulatorButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleSimulateMove(btn.id)}
            className={`py-2 px-1 rounded-xl font-bold text-xxs transition-all border ${
              currentPosition === btn.id
                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-gray-150 dark:border-slate-800 text-gray-700 dark:text-slate-300'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
