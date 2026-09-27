import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { STORE_OFFERS } from '../utils/offersData';
import { PRODUCTS } from '../utils/graphData';
import { 
  QrCode, 
  Store, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Plus, 
  Navigation, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Scan, 
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreSelection() {
  const navigate = useNavigate();
  const { 
    setCurrentPosition, 
    addAssistantMessage, 
    setPath, 
    setDirections, 
    setDestination, 
    setSelectedProduct,
    addToShoppingList,
    navigateToProduct,
    shoppingList
  } = useStore();

  const [step, setStep] = useState('scan'); // 'scan' | 'scanning' | 'identified'
  const [addedOfferIds, setAddedOfferIds] = useState([]);

  // Filter or prioritize the required 4 hackathon offers: Milk, Pasta, Cheese, Shampoo
  const priorityOfferIds = ['off-milk', 'off-pasta', 'off-cheese', 'off-shampoo'];
  const featuredOffers = STORE_OFFERS.filter(o => priorityOfferIds.includes(o.id));
  const remainingOffers = STORE_OFFERS.filter(o => !priorityOfferIds.includes(o.id));
  const displayOffers = [...featuredOffers, ...remainingOffers];

  const handleStartScan = () => {
    setStep('scanning');
    setTimeout(() => {
      handleIdentifyStore();
    }, 1500);
  };

  const handleUseDemoStore = () => {
    handleIdentifyStore();
  };

  const handleIdentifyStore = () => {
    // Reset previous states & set starting point at Entrance
    setPath([]);
    setDirections([]);
    setDestination(null);
    setSelectedProduct(null);
    setCurrentPosition('ENT');
    addAssistantMessage("Identified Path2Product Supermarket! Position set to Entrance (Ground Floor).", "success");
    setStep('identified');
  };

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
    setAddedOfferIds(prev => [...prev, offer.id]);
    setTimeout(() => {
      setAddedOfferIds(prev => prev.filter(id => id !== offer.id));
    }, 1800);
  };

  const handleNavigateToOffer = (offer) => {
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
    navigateToProduct(product);
    navigate('/dashboard');
  };

  const handleEnterDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900/60 py-6 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: QR SCANNER SCREEN */}
          {(step === 'scan' || step === 'scanning') && (
            <motion.div
              key="qr-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/80 dark:border-slate-700/70 shadow-2xl p-6 sm:p-8 space-y-6 text-center"
            >
              {/* Header Title */}
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                  <QrCode className="h-8 w-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Scan Store QR
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Scan the QR code at the supermarket entrance to load live aisle maps and exclusive discounts.
                </p>
              </div>

              {/* QR Scanner Viewfinder Frame */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-3xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                {/* Viewfinder corner guides */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                {/* Simulated store QR code graphic */}
                <div className="p-4 bg-white rounded-2xl shadow-md opacity-90">
                  <QrCode className="h-28 w-28 sm:h-32 sm:w-32 text-slate-900" />
                </div>

                {/* Animated Laser Scanning Line */}
                {step === 'scanning' ? (
                  <motion.div
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]"
                  />
                ) : (
                  <div className="absolute bottom-3 text-[10px] text-slate-400 font-semibold bg-slate-950/70 px-2 py-0.5 rounded-full">
                    Camera Viewfinder Ready
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartScan}
                  disabled={step === 'scanning'}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
                >
                  <Scan className="h-5 w-5" />
                  <span>{step === 'scanning' ? 'Identifying Store...' : 'Scan QR'}</span>
                </button>

                <button
                  onClick={handleUseDemoStore}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Store className="h-4 w-4 text-blue-500" />
                  <span>Use Demo Store</span>
                </button>

                <p className="text-[11px] text-slate-400">
                  Demo Store works instantly without requiring camera hardware permissions.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2 & 3: STORE IDENTIFIED + STORE-SPECIFIC OFFERS + START SHOPPING */}
          {step === 'identified' && (
            <motion.div
              key="identified-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* STORE IDENTIFIED CARD */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-800 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/15 border border-blue-400/20 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Store Identified</span>
                  </div>

                  <span className="text-xs text-blue-100 font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Entrance Initialized
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Path2Product Supermarket
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100">
                    123 Market Street, Downtown
                  </p>
                </div>

                {/* 3 Floors • Open Now Tags */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/15">
                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center gap-2.5">
                    <Layers className="h-5 w-5 text-indigo-200" />
                    <div>
                      <div className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Store Size</div>
                      <div className="text-sm font-extrabold text-white">3 Floors</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center gap-2.5">
                    <Clock className="h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Status</div>
                      <div className="text-sm font-extrabold text-white">Open Now</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STORE-SPECIFIC OFFERS SECTION */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-slate-700/70 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150/60 dark:border-slate-700/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                        Today's Offers
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Exclusive entrance discounts on aisle shelves
                      </p>
                    </div>
                  </div>
                  <span className="text-xxs font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-sm">
                    Special Deals
                  </span>
                </div>

                {/* Offers Cards Grid */}
                <div className="space-y-3">
                  {displayOffers.map((offer) => {
                    const isAdded = addedOfferIds.includes(offer.id);

                    return (
                      <div
                        key={offer.id}
                        className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-gray-200/70 dark:border-slate-800 hover:border-blue-400/50 transition-all space-y-3"
                      >
                        {/* Top: Badges and Limited-time label */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-white text-xxs font-extrabold tracking-wide uppercase ${offer.badgeColor}`}>
                            {offer.discount}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" /> Limited Time Deal
                          </span>
                        </div>

                        {/* Middle: Product Info & Pricing */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 shadow-xs">
                              {offer.emoji}
                            </span>
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {offer.productName}
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {offer.title}
                              </p>
                              <div className="text-xxs text-slate-400 mt-0.5 font-medium">
                                Aisle {offer.aisle} • {offer.shelf}
                              </div>
                            </div>
                          </div>

                          {/* Pricing block */}
                          <div className="text-right shrink-0">
                            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                              ${offer.discountPrice}
                            </div>
                            <div className="text-xs text-slate-400 line-through">
                              ${offer.originalPrice}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Action Buttons [Add to List] and [Navigate] */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleAddOfferToList(offer)}
                            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                              isAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
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
                            onClick={() => handleNavigateToOffer(offer)}
                            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95"
                          >
                            <Navigation className="h-3.5 w-3.5 rotate-45" /> Navigate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* START SHOPPING PRIMARY CTA */}
                <div className="pt-3 border-t border-gray-150/60 dark:border-slate-700/50">
                  <button
                    onClick={handleEnterDashboard}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 active:scale-98 transition-all"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  {shoppingList.length > 0 && (
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      🛒 {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'} in your shopping list ready for navigation.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
