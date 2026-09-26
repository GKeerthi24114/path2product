import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { STORE_OFFERS } from '../../utils/offersData';
import { PRODUCTS } from '../../utils/graphData';
import { Tag, MapPin, Plus, Check, Navigation, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileOffers() {
  const { addToShoppingList, navigateToProduct } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState([]);

  const categories = ['All', 'Fresh Produce', 'Grains & Staples', 'Bakery', 'Beverages', 'Personal Care', 'Snacks'];

  const filteredOffers = selectedCategory === 'All'
    ? STORE_OFFERS
    : STORE_OFFERS.filter(o => o.category === selectedCategory);

  const handleAddToList = (offer) => {
    const product = PRODUCTS.find(p => p.id === offer.productId) || {
      id: offer.productId,
      name: offer.productName,
      category: offer.category,
      aisle: offer.aisle,
      shelf: offer.shelf,
      floor: offer.floor,
      nodeId: offer.nodeId,
      price: offer.discountPrice,
      emoji: offer.emoji
    };
    addToShoppingList(product);
    setAddedIds(prev => [...prev, offer.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== offer.id));
    }, 1800);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Offers Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-rose-500/15">
        <div className="flex items-center gap-2 mb-1 text-rose-100 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Exclusive Member Discounts
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Today's In-Store Offers</h1>
        <p className="text-xs text-rose-100/90 mt-1">
          Special promotions across shelves. Tap any item to navigate directly to its aisle.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 px-0.5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200/80 dark:border-slate-700/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Offers List */}
      <div className="space-y-3">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => {
            const isAdded = addedIds.includes(offer.id);
            return (
              <motion.div
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-200/70 dark:border-slate-700/60 shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800">
                      {offer.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-extrabold uppercase ${offer.badgeColor}`}>
                          {offer.discount}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {offer.expiresIn}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                        {offer.productName} — <span className="font-medium text-slate-600 dark:text-slate-300">{offer.title}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Location Meta */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-gray-150 dark:border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      ${offer.discountPrice}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ${offer.originalPrice}
                    </span>
                    <span className="text-xxs font-extrabold text-emerald-600 dark:text-emerald-400">
                      Save ${(offer.originalPrice - offer.discountPrice).toFixed(0)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Aisle {offer.aisle} • {offer.shelf}</span>
                  </div>
                </div>

                {/* Touch Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleAddToList(offer)}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-4 w-4" /> Added to List
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add to List
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const prod = PRODUCTS.find(p => p.id === offer.productId) || {
                        id: offer.productId,
                        name: offer.productName,
                        nodeId: offer.nodeId,
                        aisle: offer.aisle,
                        shelf: offer.shelf,
                        emoji: offer.emoji
                      };
                      navigateToProduct(prod);
                    }}
                    className="py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    <Navigation className="h-4 w-4 rotate-45" /> Navigate to Aisle
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 space-y-2">
            <Tag className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold">No offers found</h3>
            <p className="text-xs text-slate-400">There are no special promotions in this category today.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold"
            >
              View All Offers
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
