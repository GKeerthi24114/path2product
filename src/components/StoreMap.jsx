import React from 'react';
import { useStore } from '../context/StoreContext';
import { NODES } from '../utils/graphData';
import { MapPin, Map, Navigation, CheckCircle } from 'lucide-react';

export default function StoreMap() {
  const { currentPosition, destination, selectedProduct, path } = useStore();

  const getPointsString = () => {
    return path.map(nodeId => {
      const node = NODES[nodeId];
      return node ? `${node.x},${node.y}` : '';
    }).filter(Boolean).join(' ');
  };

  const getAisleColorClass = (nodeId) => {
    if (currentPosition === nodeId) {
      return 'fill-blue-500/25 stroke-blue-500 stroke-2';
    }
    if (destination === nodeId) {
      return 'fill-emerald-500/25 stroke-emerald-500 stroke-2 animate-pulse';
    }
    if (selectedProduct && selectedProduct.nodeId === nodeId) {
      return 'fill-indigo-500/25 stroke-indigo-500 stroke-2';
    }
    return 'fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700';
  };

  const getAisleTextColor = (nodeId) => {
    if (currentPosition === nodeId) return 'text-blue-600 dark:text-blue-400 font-extrabold';
    if (destination === nodeId) return 'text-emerald-600 dark:text-emerald-400 font-extrabold';
    return 'text-slate-700 dark:text-slate-300';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between border-b border-gray-150/50 dark:border-slate-700/50 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">SmartMart Map Floorplan</h3>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-blue-500/25 border border-blue-500" />
            <span className="text-slate-500 dark:text-slate-400">You</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/25 border border-emerald-500 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">Target</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span className="text-slate-500 dark:text-slate-400">Aisle</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full max-w-[700px] overflow-hidden rounded-2xl border border-gray-150 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 p-2 relative shadow-inner">
        <svg
          viewBox="0 0 800 620"
          width="100%"
          height="100%"
          className="select-none transition-colors duration-300"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 1. Walkable Corridors Map Layout */}
          <g opacity="0.3">
            {/* Draw links/paths between aisles */}
            <line x1="400" y1="40" x2="340" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="400" y1="40" x2="460" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="100" y1="160" x2="580" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="100" y1="300" x2="580" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="100" y1="440" x2="580" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="100" y1="160" x2="100" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="220" y1="160" x2="220" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="340" y1="160" x2="340" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="460" y1="160" x2="460" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="580" y1="160" x2="580" y2="440" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          </g>

          {/* 2. Entrance Node */}
          <g>
            <circle cx="400" cy="40" r="14" fill="#10b981" />
            <text x="400" y="44" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">IN</text>
            <text x="400" y="20" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">ENTRANCE</text>
          </g>

          {/* 3. Aisles Grid rendering */}
          {Object.keys(NODES).filter(key => NODES[key].type === 'aisle').map(key => {
            const node = NODES[key];
            return (
              <g key={node.id} className="transition-all duration-300">
                {/* Aisle Block */}
                <rect
                  x={node.x - 35}
                  y={node.y - 30}
                  width="70"
                  height="60"
                  rx="12"
                  className={getAisleColorClass(node.id)}
                />
                
                {/* Visual Shelves Lines */}
                <line x1={node.x - 25} y1={node.y - 12} x2={node.x + 25} y2={node.y - 12} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />
                <line x1={node.x - 25} y1={node.y + 12} x2={node.x + 25} y2={node.y + 12} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />

                {/* Text Label */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  className={getAisleTextColor(node.id)}
                >
                  {node.id}
                </text>
              </g>
            );
          })}

          {/* 4. Billing Counters rendering */}
          {Object.keys(NODES).filter(key => NODES[key].type === 'billing').map(key => {
            const node = NODES[key];
            const isTarget = destination === node.id;
            return (
              <g key={node.id}>
                <rect
                  x={node.x - 35}
                  y={node.y - 20}
                  width="70"
                  height="40"
                  rx="8"
                  className={isTarget ? 'fill-emerald-500/25 stroke-emerald-500 stroke-2 animate-pulse' : 'fill-slate-100 dark:fill-slate-800 stroke-emerald-500/50 stroke-1'}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  className="fill-emerald-600 dark:fill-emerald-400"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* 5. Animated route path pathfinding line */}
          {path.length > 1 && (
            <polyline
              points={getPointsString()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-line"
            />
          )}

          {/* 6. Current location pulsing marker dot */}
          {currentPosition && NODES[currentPosition] && (
            <g>
              {/* Pulse ring overlay */}
              <circle
                cx={NODES[currentPosition].x}
                cy={NODES[currentPosition].y}
                r="18"
                fill="none"
                stroke="#3b82f6"
                className="pulse-ring"
              />
              {/* Inner core */}
              <circle
                cx={NODES[currentPosition].x}
                cy={NODES[currentPosition].y}
                r="6"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* 7. Red Pin Destination Indicator */}
          {destination && NODES[destination] && destination !== currentPosition && (
            <g className="animate-bounce">
              <path
                d={`M ${NODES[destination].x} ${NODES[destination].y - 2} C ${NODES[destination].x - 10} ${NODES[destination].y - 25} ${NODES[destination].x + 10} ${NODES[destination].y - 25} ${NODES[destination].x} ${NODES[destination].y - 2}`}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle
                cx={NODES[destination].x}
                cy={NODES[destination].y - 14}
                r="4.5"
                fill="#ffffff"
              />
            </g>
          )}

        </svg>
      </div>
    </div>
  );
}
