import React from 'react';
import { useStore } from '../context/StoreContext';
import { NODES } from '../utils/graphData';
import { MapPin, Map, Navigation, CheckCircle, ArrowUpRight, Layers, Sparkles } from 'lucide-react';

export default function StoreMap() {
  const { 
    currentPosition, 
    destination, 
    selectedProduct, 
    path, 
    multiStopRoute,
    currentStopIndex,
    activeFloor, 
    setActiveFloor 
  } = useStore();

  // Extract continuous segments of nodes for the active floor (prevents cross-floor diagonal artifacts)
  const getFloorPathSegments = (nodeList) => {
    if (!nodeList || nodeList.length === 0) return [];
    const segments = [];
    let currentSegment = [];

    for (const nodeId of nodeList) {
      const node = NODES[nodeId];
      if (node && node.floor === activeFloor) {
        currentSegment.push(`${node.x},${node.y}`);
      } else {
        if (currentSegment.length > 1) {
          segments.push(currentSegment.join(' '));
        }
        currentSegment = [];
      }
    }
    if (currentSegment.length > 1) {
      segments.push(currentSegment.join(' '));
    }
    return segments;
  };

  // 1. Full Multi-Stop Tour segments on active floor
  const fullTourSegments = multiStopRoute?.fullPath ? getFloorPathSegments(multiStopRoute.fullPath) : [];

  // 2. Active Stop segment on active floor
  const activeStopSegments = path && path.length > 0 ? getFloorPathSegments(path) : [];

  // Determine if active route crosses to another floor
  const destinationFloor = destination && NODES[destination]?.floor ? NODES[destination].floor : 1;
  const currentPosFloor = currentPosition && NODES[currentPosition]?.floor ? NODES[currentPosition].floor : 1;
  const crossesFloors = destination && currentPosFloor !== destinationFloor;

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

  // Find stop badge info for a node
  const getStopBadge = (nodeId) => {
    if (!multiStopRoute || !multiStopRoute.stops) return null;
    const stop = multiStopRoute.stops.find(s => s.nodeId === nodeId);
    if (!stop) return null;
    return {
      stopNumber: stop.stopNumber,
      isCollected: Boolean(stop.isCollected),
      isCurrent: multiStopRoute.stops[currentStopIndex]?.nodeId === nodeId
    };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg flex flex-col items-center w-full">
      
      {/* Header Info & Floor Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Map className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
              <span>Store Layout — Floor {activeFloor}</span>
              {multiStopRoute && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Full Route Active
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-400">
              {activeFloor === 1 ? 'Entrance, Groceries, Dairy & Checkouts' : activeFloor === 2 ? 'Personal Care, Household & Beverages' : 'Electronics, Audio, Gadgets & Appliances'}
            </span>
          </div>
        </div>

        {/* Compact Floor Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-gray-200 dark:border-slate-700">
          {[1, 2, 3].map((floorNum) => (
            <button
              key={floorNum}
              onClick={() => setActiveFloor(floorNum)}
              className={`px-3 py-1 rounded-xl text-xxs font-extrabold transition-all ${
                activeFloor === floorNum
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Floor {floorNum}
            </button>
          ))}
        </div>
      </div>

      {/* Cross-Floor Route Notice Banner */}
      {crossesFloors && (
        <div className="w-full mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <ArrowUpRight className="h-4 w-4 shrink-0" />
            <span>
              Route connects Floor {currentPosFloor} → Floor {destinationFloor} via Escalator / Stairs
            </span>
          </div>
          <button
            onClick={() => setActiveFloor(destinationFloor)}
            className="text-xxs px-2 py-0.5 rounded-lg bg-blue-600 text-white shrink-0 font-bold ml-2"
          >
            View Floor {destinationFloor}
          </button>
        </div>
      )}

      {/* SVG Container */}
      <div className="w-full max-w-[700px] overflow-hidden rounded-2xl border border-gray-150 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 p-2 relative shadow-inner">
        <svg
          viewBox="0 0 800 620"
          width="100%"
          height="100%"
          className="select-none transition-colors duration-300"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ================= FLOOR 1 RENDERING ================= */}
          {activeFloor === 1 && (
            <>
              {/* Walkable Corridors Map Layout */}
              <g opacity="0.3">
                <line x1="400" y1="40" x2="340" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="400" y1="40" x2="460" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="100" y1="160" x2="580" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="100" y1="300" x2="580" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="100" y1="160" x2="100" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="220" y1="160" x2="220" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="340" y1="160" x2="340" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="460" y1="160" x2="460" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="160" x2="580" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Path to Connectors */}
                <line x1="580" y1="300" x2="700" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="160" x2="700" y2="130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="300" x2="700" y2="330" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Path to Billing */}
                <line x1="100" y1="300" x2="160" y2="560" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="220" y1="300" x2="340" y2="560" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="340" y1="300" x2="340" y2="560" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="460" y1="300" x2="520" y2="560" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
              </g>

              {/* Entrance Node (Explicit Starting Point) */}
              <g>
                <circle cx="400" cy="40" r="16" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="44" fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">IN</text>
                <text x="400" y="18" fill="#10b981" fontSize="11" fontWeight="extrabold" textAnchor="middle">ENTRANCE (START)</text>
              </g>

              {/* Floor 1 Aisles (A1-A5, B1-B5) */}
              {['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5'].map(key => {
                const node = NODES[key];
                if (!node) return null;
                const badge = getStopBadge(node.id);

                return (
                  <g key={node.id} className="transition-all duration-300">
                    <rect
                      x={node.x - 35}
                      y={node.y - 30}
                      width="70"
                      height="60"
                      rx="12"
                      className={getAisleColorClass(node.id)}
                    />
                    <line x1={node.x - 25} y1={node.y - 12} x2={node.x + 25} y2={node.y - 12} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />
                    <line x1={node.x - 25} y1={node.y + 12} x2={node.x + 25} y2={node.y + 12} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />
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

                    {/* Multi-Stop Order Badge */}
                    {badge && (
                      <g transform={`translate(${node.x + 24}, ${node.y - 24})`}>
                        <circle
                          r="11"
                          fill={badge.isCollected ? '#10b981' : badge.isCurrent ? '#2563eb' : '#6366f1'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="black"
                        >
                          {badge.isCollected ? '✓' : badge.stopNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Vertical Connections on Floor 1 */}
              <g>
                <rect x="655" y="195" width="90" height="70" rx="14" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <text x="700" y="225" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill="#4338ca">↑ Escalator</text>
                <text x="700" y="245" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6366f1">To Floor 2</text>
              </g>

              <g>
                <rect x="655" y="105" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="135" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">↑ Stairs</text>
              </g>

              <g>
                <rect x="655" y="305" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="335" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">↑ Lift / Elev</text>
              </g>

              {/* Billing Counters on Floor 1 */}
              {['BILL1', 'BILL2', 'BILL3'].map(key => {
                const node = NODES[key];
                if (!node) return null;
                const isTarget = destination === node.id || (multiStopRoute?.finalCheckout?.nodeId === node.id);
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
                    {isTarget && (
                      <g transform={`translate(${node.x + 25}, ${node.y - 15})`}>
                        <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">F</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* ================= FLOOR 2 RENDERING ================= */}
          {activeFloor === 2 && (
            <>
              {/* Floor 2 Corridors */}
              <g opacity="0.3">
                <line x1="100" y1="240" x2="580" y2="240" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="240" x2="700" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="240" x2="700" y2="130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="580" y1="240" x2="700" y2="330" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
              </g>

              {/* Floor 2 Aisles (C1-C5) */}
              {['C1', 'C2', 'C3', 'C4', 'C5'].map(key => {
                const node = NODES[key];
                if (!node) return null;
                const badge = getStopBadge(node.id);

                return (
                  <g key={node.id} className="transition-all duration-300">
                    <rect
                      x={node.x - 35}
                      y={node.y - 40}
                      width="70"
                      height="80"
                      rx="14"
                      className={getAisleColorClass(node.id)}
                    />
                    <line x1={node.x - 25} y1={node.y - 15} x2={node.x + 25} y2={node.y - 15} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />
                    <line x1={node.x - 25} y1={node.y + 15} x2={node.x + 25} y2={node.y + 15} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2,2" />
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

                    {badge && (
                      <g transform={`translate(${node.x + 24}, ${node.y - 30})`}>
                        <circle
                          r="11"
                          fill={badge.isCollected ? '#10b981' : badge.isCurrent ? '#2563eb' : '#6366f1'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="black"
                        >
                          {badge.isCollected ? '✓' : badge.stopNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Vertical Connections on Floor 2 */}
              <g>
                <rect x="655" y="195" width="90" height="70" rx="14" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <text x="700" y="222" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill="#4338ca">⇅ Escalator</text>
                <text x="700" y="240" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6366f1">F1 ↔ F3</text>
              </g>

              <g>
                <rect x="655" y="105" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="132" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">⇅ Stairs</text>
                <text x="700" y="145" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">F1 ↔ F3</text>
              </g>

              <g>
                <rect x="655" y="305" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="335" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">⇅ Lift</text>
              </g>
            </>
          )}

          {/* ================= FLOOR 3 RENDERING ================= */}
          {activeFloor === 3 && (
            <>
              {/* Floor 3 Corridors */}
              <g opacity="0.3">
                <line x1="160" y1="240" x2="520" y2="240" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="160" y1="380" x2="520" y2="380" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="160" y1="240" x2="160" y2="380" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="340" y1="240" x2="340" y2="380" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="520" y1="240" x2="520" y2="380" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="520" y1="240" x2="700" y2="130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="520" y1="380" x2="700" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="520" y1="380" x2="700" y2="330" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
              </g>

              {/* Floor 3 Departments (D1, D2, D3) */}
              {['D1', 'D2', 'D3'].map(key => {
                const node = NODES[key];
                if (!node) return null;
                const badge = getStopBadge(node.id);

                return (
                  <g key={node.id} className="transition-all duration-300">
                    <rect
                      x={node.x - 45}
                      y={node.y - 35}
                      width="90"
                      height="70"
                      rx="14"
                      className={getAisleColorClass(node.id)}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      className={getAisleTextColor(node.id)}
                    >
                      {node.label}
                    </text>

                    {badge && (
                      <g transform={`translate(${node.x + 30}, ${node.y - 25})`}>
                        <circle
                          r="11"
                          fill={badge.isCollected ? '#10b981' : badge.isCurrent ? '#2563eb' : '#6366f1'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="black"
                        >
                          {badge.isCollected ? '✓' : badge.stopNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Floor 3 Aisles E1, E2, E3 (Electronics & Gadgets) */}
              {['E1', 'E2', 'E3'].map(key => {
                const node = NODES[key];
                if (!node) return null;
                const badge = getStopBadge(node.id);

                return (
                  <g key={node.id} className="transition-all duration-300">
                    <rect
                      x={node.x - 45}
                      y={node.y - 35}
                      width="90"
                      height="70"
                      rx="14"
                      className={getAisleColorClass(node.id)}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      className={getAisleTextColor(node.id)}
                    >
                      {node.label}
                    </text>

                    {badge && (
                      <g transform={`translate(${node.x + 30}, ${node.y - 25})`}>
                        <circle
                          r="11"
                          fill={badge.isCollected ? '#10b981' : badge.isCurrent ? '#2563eb' : '#6366f1'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="black"
                        >
                          {badge.isCollected ? '✓' : badge.stopNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Connectors on Floor 3 */}
              <g>
                <rect x="655" y="195" width="90" height="70" rx="14" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                <text x="700" y="225" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill="#4338ca">↓ Escalator</text>
                <text x="700" y="245" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6366f1">To Floor 2</text>
              </g>

              <g>
                <rect x="655" y="105" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="135" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">↓ Stairs</text>
              </g>

              <g>
                <rect x="655" y="305" width="90" height="50" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="700" y="335" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">↓ Lift</text>
              </g>
            </>
          )}

          {/* 1. Complete Tour Route Lines on active floor (Dashed Indigo) */}
          {fullTourSegments.map((segmentPts, i) => (
            <polyline
              key={`full-tour-${i}`}
              points={segmentPts}
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeDasharray="6,6"
              opacity="0.8"
            />
          ))}

          {/* 2. Active Stop Route Line on active floor (Solid Glowing Blue) */}
          {activeStopSegments.map((segmentPts, i) => (
            <polyline
              key={`active-stop-${i}`}
              points={segmentPts}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-line"
            />
          ))}

          {/* Current location pulsing marker dot (if on active floor) */}
          {currentPosition && NODES[currentPosition] && NODES[currentPosition].floor === activeFloor && (
            <g>
              <circle
                cx={NODES[currentPosition].x}
                cy={NODES[currentPosition].y}
                r="18"
                fill="none"
                stroke="#3b82f6"
                className="pulse-ring"
              />
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

          {/* Destination Pin Indicator (if on active floor) */}
          {destination && NODES[destination] && NODES[destination].floor === activeFloor && destination !== currentPosition && (
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
