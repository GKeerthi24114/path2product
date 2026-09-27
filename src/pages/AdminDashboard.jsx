import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { NODES } from '../utils/graphData';
import { getAnalytics } from '../utils/api';
import StoreMap from '../components/StoreMap';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Search, 
  Navigation, 
  Compass, 
  Users, 
  Map, 
  Boxes, 
  SlidersHorizontal, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Layers, 
  Store, 
  Sparkles, 
  X,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AdminDashboard() {
  const { products, updateProduct, activeFloor, setActiveFloor } = useStore();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'floorplan' | 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');

  // Inline Price Editing State
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [inlinePriceValue, setInlinePriceValue] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    floor: 'Floor 1',
    aisle: 'Aisle A1',
    shelf: 'Shelf 1',
    nodeId: 'A1'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalSearches: 1247,
    totalNavigations: 892,
    popularProducts: [
      { name: 'Rice', searches: 156 },
      { name: 'Shampoo', searches: 142 },
      { name: 'Headphones', searches: 128 },
      { name: 'Toothpaste', searches: 112 },
      { name: 'Cooking Oil', searches: 98 },
      { name: 'Coffee', searches: 94 }
    ],
    popularAisles: [
      { aisle: 'A1', visits: 234 },
      { aisle: 'B3', visits: 198 },
      { aisle: 'E2', visits: 176 },
      { aisle: 'C2', visits: 165 },
      { aisle: 'C4', visits: 143 }
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
        if (stats) setAnalyticsData(stats);
      } catch (err) {
        console.warn("Analytics fetch fallback:", err);
      }
    }
    loadStats();
  }, []);

  // Filtered Products List
  const filteredProducts = (products || []).filter(prod => {
    // 1. Search term match
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || 
      prod.name.toLowerCase().includes(q) ||
      prod.category.toLowerCase().includes(q) ||
      prod.aisle.toLowerCase().includes(q) ||
      (prod.floor && prod.floor.toLowerCase().includes(q));

    // 2. Floor filter match
    const matchesFloor = selectedFloorFilter === 'ALL' || prod.floor === selectedFloorFilter;

    // 3. Category filter match
    const matchesCategory = selectedCategoryFilter === 'ALL' || prod.category === selectedCategoryFilter;

    // 4. Stock filter match
    const matchesStock = selectedStockFilter === 'ALL' ||
      (selectedStockFilter === 'IN_STOCK' && prod.stock > 0 && prod.inStock !== false) ||
      (selectedStockFilter === 'OUT_OF_STOCK' && (prod.stock <= 0 || prod.inStock === false));

    return matchesSearch && matchesFloor && matchesCategory && matchesStock;
  });

  // Unique categories list for filtering
  const allCategories = ['ALL', ...new Set((products || []).map(p => p.category))];

  // Stock summary KPIs
  const totalCount = (products || []).length;
  const inStockCount = (products || []).filter(p => p.stock > 0 && p.inStock !== false).length;
  const outOfStockCount = totalCount - inStockCount;
  const floor1Count = (products || []).filter(p => p.floor === 'Floor 1').length;
  const floor2Count = (products || []).filter(p => p.floor === 'Floor 2').length;
  const floor3Count = (products || []).filter(p => p.floor === 'Floor 3').length;

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock !== undefined ? product.stock : (product.inStock ? 20 : 0),
      floor: product.floor || 'Floor 1',
      aisle: product.aisle || 'Aisle A1',
      shelf: product.shelf || 'Shelf 1',
      nodeId: product.nodeId || 'A1'
    });
    setSaveSuccess(false);
  };

  // Save Product Updates
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    await updateProduct(editingProduct.id, {
      name: editForm.name,
      category: editForm.category,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      floor: editForm.floor,
      aisle: editForm.aisle,
      shelf: editForm.shelf,
      nodeId: editForm.nodeId
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setEditingProduct(null);
      setSaveSuccess(false);
    }, 600);
  };

  // Quick Stock Step (+ / -)
  const handleQuickStockChange = async (productId, delta) => {
    const prod = (products || []).find(p => p.id === productId);
    if (!prod) return;
    const currentStock = prod.stock !== undefined ? prod.stock : (prod.inStock ? 10 : 0);
    const newStock = Math.max(0, currentStock + delta);
    await updateProduct(productId, { stock: newStock });
  };

  // Inline Price Editing Handlers
  const handleStartEditPrice = (prod) => {
    setEditingPriceId(prod.id);
    setInlinePriceValue(String(prod.price || ''));
  };

  const handleSaveInlinePrice = async (productId) => {
    const val = Number(inlinePriceValue);
    if (!isNaN(val) && val >= 0) {
      await updateProduct(productId, { price: val });
    }
    setEditingPriceId(null);
  };

  // Nodes for node dropdown based on chosen floor
  const getNodeOptionsForFloor = (floorStr) => {
    const floorNum = parseInt(floorStr.replace(/\D/g, '')) || 1;
    return Object.values(NODES).filter(n => n.floor === floorNum && n.type === 'aisle');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* 1. SHOPKEEPER HERO HEADER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
              <Store className="h-3.5 w-3.5" />
              <span>Path2Product</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Shopkeeper Dashboard
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl font-medium">
              Manage product placement across Floor 1, Floor 2, and Floor 3. Adjust stock quantities and update prices in real-time. Customer search and navigation instantly reflect these exact supermarket locations.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 self-start md:self-auto shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-extrabold text-white">{totalCount}</div>
              <div className="text-[10px] text-blue-200 font-bold uppercase">Products</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xl font-extrabold text-emerald-300">{inStockCount}</div>
              <div className="text-[10px] text-blue-200 font-bold uppercase">In Stock</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xl font-extrabold text-amber-300">{outOfStockCount}</div>
              <div className="text-[10px] text-blue-200 font-bold uppercase">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Product Catalog & Placement</span>
        </button>

        <button
          onClick={() => setActiveTab('floorplan')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'floorplan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Supermarket Floorplan & Aisles</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Footfall & Analytics</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: INVENTORY & PRODUCT PLACEMENT TABLE
      ======================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Floor & Stock Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xxs font-bold uppercase text-slate-400">Floor 1 Items</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{floor1Count}</div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Groceries & Dairy</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Store className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xxs font-bold uppercase text-slate-400">Floor 2 Items</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{floor2Count}</div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Personal Care & Snacks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xxs font-bold uppercase text-slate-400">Floor 3 Items</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{floor3Count}</div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">Electronics & Audio</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Boxes className="h-5 w-5" />
              </div>
            </div>

            <div 
              onClick={() => setSelectedStockFilter(selectedStockFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center justify-between select-none ${
                selectedStockFilter === 'OUT_OF_STOCK'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400'
                  : 'bg-white dark:bg-slate-800 border-gray-200/80 dark:border-slate-700/60 hover:border-amber-400'
              }`}
              title="Click to toggle out of stock filter"
            >
              <div>
                <span className="text-xxs font-bold uppercase text-slate-400">Stock Alerts</span>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{outOfStockCount}</div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {selectedStockFilter === 'OUT_OF_STOCK' ? 'Filtering: Out of Stock' : 'Click to filter out of stock'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Search & Filters Row */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, category, or aisle (e.g. Rice, Shampoo, E2)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Floor Filter */}
              <select
                value={selectedFloorFilter}
                onChange={(e) => setSelectedFloorFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Floors</option>
                <option value="Floor 1">Floor 1 (Groceries/Dairy)</option>
                <option value="Floor 2">Floor 2 (Personal Care/Household)</option>
                <option value="Floor 3">Floor 3 (Electronics/Audio)</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              {/* Stock Filter (Requirement 7 & 8: Dynamic Actual Out of Stock Count) */}
              <select
                value={selectedStockFilter}
                onChange={(e) => setSelectedStockFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Availability ({totalCount})</option>
                <option value="IN_STOCK">✓ Available ({inStockCount})</option>
                <option value="OUT_OF_STOCK">⚠ Out of Stock ({outOfStockCount})</option>
              </select>
            </div>

            {/* Quick Filter Clickable Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-150 dark:border-slate-700/60 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Quick Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedStockFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedStockFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Products ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStockFilter('IN_STOCK')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedStockFilter === 'IN_STOCK'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ✓ Available ({inStockCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedStockFilter(selectedStockFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedStockFilter === 'OUT_OF_STOCK'
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                }`}
              >
                ⚠ Out of Stock ({outOfStockCount})
              </button>
            </div>
          </div>

          {/* PRODUCT INVENTORY TABLE */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200/80 dark:border-slate-700/60">
                  <tr>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Price</th>
                    <th className="py-3.5 px-4 text-center">Stock Quantity</th>
                    <th className="py-3.5 px-3">Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-slate-700/40">
                  {filteredProducts.map((prod) => {
                    const currentStock = prod.stock !== undefined ? prod.stock : (prod.inStock ? 10 : 0);
                    const isAvailable = currentStock > 0 && prod.inStock !== false;

                    return (
                      <tr 
                        key={prod.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        {/* Product Name & Emoji */}
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{prod.emoji}</span>
                            <div>
                              <div className="font-extrabold text-sm leading-tight">{prod.name}</div>
                              <span className="text-[10px] text-slate-400">ID #{prod.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xxs font-bold">
                            {prod.category}
                          </span>
                        </td>

                        {/* Location: Floor, Aisle, Shelf */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {prod.floor || 'Floor 1'} • {prod.aisle}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {prod.shelf} (Node: {prod.nodeId})
                          </div>
                        </td>

                        {/* Price (Requirement 5: Owner Can Edit Price) */}
                        <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                          {editingPriceId === prod.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={inlinePriceValue}
                                onChange={(e) => setInlinePriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlinePrice(prod.id);
                                  if (e.key === 'Escape') setEditingPriceId(null);
                                }}
                                autoFocus
                                className="w-16 px-1.5 py-1 rounded-lg border border-blue-500 bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInlinePrice(prod.id)}
                                className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                                title="Save price"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPriceId(null)}
                                className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span>₹{prod.price}</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditPrice(prod)}
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-colors"
                                title="Edit price"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Quick Stock Controls (Requirement 3 & 4: Stock [ - ] 25 [ + ]) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-0.5">Stock</span>
                            <button
                              onClick={() => handleQuickStockChange(prod.id, -1)}
                              disabled={currentStock <= 0}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 disabled:opacity-30 active:scale-90 transition-all"
                              title="Decrease stock"
                            >
                              <Minus className="h-3 w-3 stroke-[3]" />
                            </button>
                            <span className={`w-8 text-center font-black text-xs ${isAvailable ? 'text-slate-900 dark:text-white' : 'text-red-500 font-black'}`}>
                              {currentStock}
                            </span>
                            <button
                              onClick={() => handleQuickStockChange(prod.id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 active:scale-90 transition-all"
                              title="Increase stock"
                            >
                              <Plus className="h-3 w-3 stroke-[3]" />
                            </button>
                          </div>
                        </td>

                        {/* Availability Status Badge */}
                        <td className="py-3 px-3">
                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xxs font-extrabold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ✓ Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xxs font-extrabold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              ⚠ Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-700 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-bold transition-all text-xs"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit Location</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  {selectedStockFilter === 'OUT_OF_STOCK' ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                        ✓
                      </div>
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        🎉 All products are in stock!
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        There are currently zero out-of-stock items in the supermarket.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedStockFilter('ALL')}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all"
                      >
                        View All Products
                      </button>
                    </>
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold">
                      No products found matching the selected filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: SUPERMARKET FLOORPLAN & AISLE OVERVIEW
      ======================================================== */}
      {activeTab === 'floorplan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Supermarket Aisle Product Placement
                </h3>
                <p className="text-xs text-slate-400">
                  Select a floor to see how products are arranged across aisles and shelves.
                </p>
              </div>

              {/* Floor Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700">
                {[1, 2, 3].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFloor(f)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeFloor === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Floor {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Aisle Breakdown Cards for the selected floor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Object.values(NODES)
                .filter(node => node.floor === activeFloor && node.type === 'aisle')
                .map(aisleNode => {
                  const aisleProds = (products || []).filter(p => p.nodeId === aisleNode.id);

                  return (
                    <div 
                      key={aisleNode.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-gray-200/70 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                            {aisleNode.id}
                          </span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {aisleNode.label}
                            </div>
                            <span className="text-[10px] text-slate-400">Floor {aisleNode.floor}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {aisleProds.length} products
                        </span>
                      </div>

                      <div className="space-y-1.5 min-h-[60px]">
                        {aisleProds.length > 0 ? (
                          aisleProds.map(prod => (
                            <div 
                              key={prod.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span>{prod.emoji}</span>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{prod.name}</div>
                                  <div className="text-[10px] text-slate-400">{prod.shelf} • ₹{prod.price}</div>
                                </div>
                              </div>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                prod.stock > 0 
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-red-500/15 text-red-600 dark:text-red-400'
                              }`}>
                                Stock: {prod.stock !== undefined ? prod.stock : (prod.inStock ? 10 : 0)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-xxs text-slate-400 font-medium">
                            No products currently assigned to this aisle.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Live Interactive Map Preview for Admin */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Visual Supermarket Map — Floor {activeFloor}
            </h4>
            <StoreMap />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: STORE ANALYTICS & FOOTFALL
      ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{analyticsData.totalSearches}</div>
                <div className="text-xs text-slate-400 font-medium">Total Searches</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Navigation className="h-6 w-6 rotate-45" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{analyticsData.totalNavigations}</div>
                <div className="text-xs text-slate-400 font-medium">Navigations Logged</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{analyticsData.avgRouteLength} m</div>
                <div className="text-xs text-slate-400 font-medium">Avg Route Length</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{analyticsData.activeUsers}</div>
                <div className="text-xs text-slate-400 font-medium">Active Realtime Users</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Most Searched Products</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.popularProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="searches" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Aisle Visit Frequencies</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.popularAisles}
                      dataKey="visits"
                      nameKey="aisle"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ aisle, percent }) => `${aisle}: ${(percent * 100).toFixed(0)}%`}
                      style={{ fontSize: 11 }}
                    >
                      {analyticsData.popularAisles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT PRODUCT PLACEMENT & STOCK MODAL
      ======================================================== */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-gray-200 dark:border-slate-700 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{editingProduct.emoji}</span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      Edit Placement: {editingProduct.name}
                    </h3>
                    <span className="text-xxs text-slate-400">ID #{editingProduct.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
                
                {/* Product Name & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Stock Quantity (0 = Out of Stock)</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Floor Assignment */}
                <div>
                  <label className="block text-slate-500 mb-1">Supermarket Floor</label>
                  <select
                    value={editForm.floor}
                    onChange={(e) => {
                      const newFloor = e.target.value;
                      const validNodes = getNodeOptionsForFloor(newFloor);
                      const defaultNode = validNodes[0]?.id || 'A1';
                      setEditForm({
                        ...editForm,
                        floor: newFloor,
                        nodeId: defaultNode,
                        aisle: `Aisle ${defaultNode}`
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="Floor 1">Floor 1 (Groceries, Dairy, Staples)</option>
                    <option value="Floor 2">Floor 2 (Personal Care, Household, Snacks)</option>
                    <option value="Floor 3">Floor 3 (Electronics, Audio, Tech)</option>
                  </select>
                </div>

                {/* Aisle & Map Node */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Map Node</label>
                    <select
                      value={editForm.nodeId}
                      onChange={(e) => {
                        const nId = e.target.value;
                        setEditForm({
                          ...editForm,
                          nodeId: nId,
                          aisle: `Aisle ${nId}`
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                    >
                      {getNodeOptionsForFloor(editForm.floor).map(n => (
                        <option key={n.id} value={n.id}>
                          {n.id} ({n.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Shelf Position</label>
                    <select
                      value={editForm.shelf}
                      onChange={(e) => setEditForm({ ...editForm, shelf: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold"
                    >
                      <option value="Shelf 1">Shelf 1 (Top / Left)</option>
                      <option value="Shelf 2">Shelf 2 (Bottom / Right)</option>
                      <option value="Shelf 3">Shelf 3 (Feature Endcap)</option>
                    </select>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xxs font-medium leading-relaxed">
                  💡 <strong>Single Source of Truth:</strong> Saving these changes immediately updates customer product search, Shopping List pathfinding, and multi-floor navigation.
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save Placement</span>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
