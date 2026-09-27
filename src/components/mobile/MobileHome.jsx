import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { STORE_OFFERS } from '../../utils/offersData';
import { PRODUCTS, NODES } from '../../utils/graphData';
import { 
  Store, 
  MapPin, 
  Search, 
  Sparkles, 
  Bot, 
  ShoppingCart, 
  Navigation, 
  CreditCard, 
  ArrowRight, 
  Plus, 
  Check, 
  Flame, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileHome() {
  const { 
    currentPosition, 
    setCurrentPosition,
    destination,
    selectedProduct,
    path,
    directions,
    shoppingList,
    addToShoppingList,
    navigateToProduct,
    navigateToCheckout,
    optimizeShoppingRoute,
    setActiveMobileTab,
    assistantMessages,
    addAssistantMessage,
    products
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [addedOfferId, setAddedOfferId] = useState(null);

  const productCatalog = products && products.length > 0 ? products : PRODUCTS;

  const filteredProducts = searchQuery.trim()
    ? productCatalog.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.aisle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddOfferToList = (offer) => {
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
    setAddedOfferId(offer.id);
    setTimeout(() => setAddedOfferId(null), 1600);
  };

  const handleQuickAssistantAsk = (question, answer, targetNodeId) => {
    addAssistantMessage(question, 'info');
    setTimeout(() => {
      addAssistantMessage(answer, 'success');
      if (targetNodeId && NODES[targetNodeId]) {
        // If question matches a product, can also allow direct route
      }
    }, 400);
    setActiveMobileTab('assistant');
  };

  const currentLabel = currentPosition && NODES[currentPosition] 
    ? NODES[currentPosition].label 
    : 'Store Entrance';

  const totalPrice = shoppingList
    .reduce((acc, item) => acc + (item.price || 0), 0)
    .toFixed(2);

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-slate-100">
      
      {/* 1. STORE HEADER */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-white rounded-3xl p-5 shadow-xl shadow-blue-500/10 border border-blue-500/20 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-3 relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Open Now
                </span>
                <span className="text-blue-200 text-xs">•</span>
                <span className="text-[11px] font-bold text-blue-100">3 Floors</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight mt-0.5">
                SmartMart Super Store
              </h1>
              <p className="text-xs text-blue-100/80">123 Market Street, Downtown</p>
            </div>
          </div>

          {/* Current Position Tag */}
          <button
            onClick={() => {
              if (!currentPosition) setCurrentPosition('ENT');
              setActiveMobileTab('navigation');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-sm transition-all active:scale-95 shrink-0"
            title="Current location"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span className="max-w-[85px] truncate">{currentLabel}</span>
          </button>
        </div>

        {/* In-Store Search Bar */}
        <div className="relative z-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, aisles (e.g. Milk, B3)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
            <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 dark:text-slate-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-2 max-h-64 overflow-y-auto z-50 text-slate-900 dark:text-white"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const isOutOfStock = p.stock <= 0 || p.inStock === false;

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                          isOutOfStock
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{p.emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold leading-snug ${isOutOfStock ? 'text-slate-500' : ''}`}>{p.name}</span>
                              {isOutOfStock ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                  ⚠ NOT AVAILABLE
                                </span>
                              ) : (
                                <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">₹{p.price}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isOutOfStock ? (
                                <span className="text-amber-600 dark:text-amber-400">{p.name} is currently unavailable.</span>
                              ) : (
                                <span>{p.floor || 'Floor 1'} • {p.aisle} • {p.shelf}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isOutOfStock ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                addToShoppingList(p);
                                setSearchQuery('');
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                              title="Add to shopping list"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                navigateToProduct(p);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm"
                            >
                              <Navigation className="h-3 w-3 rotate-45" /> Go
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 font-medium">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. STORE-SPECIFIC OFFERS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500">
              <Flame className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight">Today's Store Deals</h2>
          </div>
          <button
            onClick={() => setActiveMobileTab('offers')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Horizontal Offers Carousel */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
          {STORE_OFFERS.slice(0, 4).map((offer) => {
            const isAdded = addedOfferId === offer.id;

            return (
              <div
                key={offer.id}
                className="snap-start shrink-0 w-[240px] bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-200/70 dark:border-slate-700/60 shadow-md flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-extrabold uppercase tracking-wide ${offer.badgeColor}`}>
                    {offer.discount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {offer.expiresIn}
                  </span>
                </div>

                {/* Offer Details */}
                <div className="flex items-center gap-3 my-2">
                  <span className="text-3xl">{offer.emoji}</span>
                  <div>
                    <h3 className="text-xs font-extrabold line-clamp-1">{offer.productName}</h3>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{offer.title}</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">${offer.discountPrice}</span>
                      <span className="text-xxs text-slate-400 line-through">${offer.originalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-medium mb-3 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-indigo-500" /> Aisle {offer.aisle} • {offer.shelf}
                </div>

                {/* Touch Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-150/60 dark:border-slate-700/40">
                  <button
                    onClick={() => handleAddOfferToList(offer)}
                    className={`py-2 px-1 rounded-xl text-xxs font-bold flex items-center justify-center gap-1 transition-all ${
                      isAdded 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3 w-3" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Add List
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
                    className="py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xxs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Navigation className="h-3 w-3 rotate-45" /> Go
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. AI SHOPPING ASSISTANT */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/30 rounded-3xl p-4 border border-blue-100 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold leading-tight">AI Shopping Assistant</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask for products, aisles or checkout routes</p>
            </div>
          </div>
          <button
            onClick={() => setActiveMobileTab('assistant')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            Chat <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Latest message preview */}
        {assistantMessages.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-100/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            "{assistantMessages[assistantMessages.length - 1].text}"
          </div>
        )}

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleQuickAssistantAsk(
              "Where is Milk?",
              "Milk is fresh in Aisle A4 (Shelf 1). Click below to navigate there!",
              'A4'
            )}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xxs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-400 active:scale-95 transition-all shadow-xs"
          >
            🥛 Where is Milk?
          </button>
          <button
            onClick={() => handleQuickAssistantAsk(
              "Where is Toothpaste?",
              "Toothpaste is located in Aisle B3 (Shelf 2) in Personal Care.",
              'B3'
            )}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xxs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-400 active:scale-95 transition-all shadow-xs"
          >
            🪥 Find Toothpaste
          </button>
          <button
            onClick={() => {
              navigateToCheckout();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xxs font-bold text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 active:scale-95 transition-all shadow-xs"
          >
            💳 Nearest Checkout
          </button>
        </div>
      </section>

      {/* 4. SHOPPING LIST SUMMARY */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/70 dark:border-slate-700/60 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-gray-150/60 dark:border-slate-700/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold leading-tight">Shopping List Summary</h2>
              <span className="text-[10px] text-slate-400">
                {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'} • Est. ${totalPrice}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveMobileTab('list')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            Manage <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {shoppingList.length > 0 ? (
          <div className="space-y-3">
            {/* Horizontal preview of top 3 items */}
            <div className="grid grid-cols-2 gap-2">
              {shoppingList.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-gray-150 dark:border-slate-800 flex items-center gap-2"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{item.name}</div>
                    <div className="text-xxs text-slate-400 truncate">Aisle {item.aisle} • ${item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Optimize Multi-Stop Route Button */}
            <button
              onClick={optimizeShoppingRoute}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all"
            >
              <Sparkles className="h-4 w-4" /> Optimize Shopping Route
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-slate-400 font-medium">Your shopping list is empty.</p>
            <button
              onClick={() => setActiveMobileTab('offers')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Browse Deals to Add <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </section>

      {/* 5. CONTINUE NAVIGATION */}
      <section>
        {path.length > 0 ? (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-5 shadow-lg shadow-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wide">Active Navigation</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
                {directions.length} {directions.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>

            <div>
              <div className="text-base font-extrabold">
                {selectedProduct ? `${selectedProduct.emoji} ${selectedProduct.name}` : 'Billing Checkout'}
              </div>
              <div className="text-xs text-emerald-100 mt-0.5 line-clamp-1">
                {directions[0]?.instruction || 'Following fastest calculated path.'}
              </div>
            </div>

            <button
              onClick={() => setActiveMobileTab('navigation')}
              className="w-full py-3.5 rounded-2xl bg-white text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-emerald-50 active:scale-98 transition-all"
            >
              <Navigation className="h-4 w-4 rotate-45 text-emerald-600" /> Resume Navigation Map
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/70 dark:border-slate-700/60 shadow-md flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold">Explore Store Map</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View aisles, shelves and test positioning on the interactive floorplan.
              </p>
            </div>
            <button
              onClick={() => setActiveMobileTab('navigation')}
              className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/15 shrink-0 active:scale-95 transition-all"
            >
              Open Map <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
