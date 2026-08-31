import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../utils/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Search, Navigation, Compass, Users, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalSearches: 1247,
    totalNavigations: 892,
    popularProducts: [
      { name: 'Milk', searches: 156 },
      { name: 'Bread', searches: 134 },
      { name: 'Rice', searches: 128 },
      { name: 'Toothpaste', searches: 112 },
      { name: 'Soap', searches: 98 },
      { name: 'Coffee', searches: 94 }
    ],
    popularAisles: [
      { aisle: 'A1', visits: 234 },
      { aisle: 'B3', visits: 198 },
      { aisle: 'A3', visits: 176 },
      { aisle: 'C2', visits: 165 },
      { aisle: 'A5', visits: 143 }
    ],
    navigationSessions: [
      { date: 'Mon', count: 45 },
      { date: 'Tue', count: 52 },
      { date: 'Wed', count: 49 },
      { date: 'Thu', count: 63 },
      { date: 'Fri', count: 78 },
      { date: 'Sat', count: 95 },
      { date: 'Sun', count: 88 }
    ],
    avgRouteLength: 24.5,
    activeUsers: 47
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getAnalytics();
        if (stats) {
          setData(stats);
        }
      } catch (err) {
        console.warn("API analytics load failed, using local mock data:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-4 mb-8">
        <BarChart3 className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Analytics Dashboard</h2>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{data.totalSearches}</div>
            <div className="text-xs text-slate-400 font-medium">Total Searches</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Navigation className="h-6 w-6 rotate-45" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{data.totalNavigations}</div>
            <div className="text-xs text-slate-400 font-medium">Navigations Logged</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{data.avgRouteLength} m</div>
            <div className="text-xs text-slate-400 font-medium">Avg Route Length</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{data.activeUsers}</div>
            <div className="text-xs text-slate-400 font-medium">Active Realtime Users</div>
          </div>
        </div>
      </div>

      {/* Chart Layout 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Most Searched Products */}
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Most Searched Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="searches" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Aisle visits */}
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Aisle Visit Frequencies</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.popularAisles}
                  dataKey="visits"
                  nameKey="aisle"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ aisle, percent }) => `${aisle}: ${(percent * 100).toFixed(0)}%`}
                  style={{ fontSize: 11 }}
                >
                  {data.popularAisles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Navigation Sessions Over Time */}
      <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Navigation Sessions This Week</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.navigationSessions}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" style={{ fontSize: 11 }} />
              <YAxis style={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Sessions" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
}
