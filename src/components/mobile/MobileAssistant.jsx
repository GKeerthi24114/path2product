import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../utils/graphData';
import { searchNaturalProducts } from '../../utils/productSearch';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Navigation, 
  CreditCard, 
  User, 
  Check, 
  Plus, 
  AlertCircle, 
  ShoppingCart, 
  ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileAssistant() {
  const { 
    assistantMessages, 
    addAssistantMessage, 
    shoppingList,
    addToShoppingList,
    navigateToProduct, 
    navigateToCheckout,
    setActiveMobileTab 
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages, isTyping]);

  // Useful Quick Searches requested in Phase 3 (searches existing catalog)
  const quickSearches = [
    { label: "Pasta", query: "I need pasta", icon: "🍝" },
    { label: "Rice", query: "I need rice", icon: "🍚" },
    { label: "Shampoo", query: "Find shampoo", icon: "🧴" },
    { label: "Toothpaste", query: "I need toothpaste", icon: "🪥" },
    { label: "Cooking Oil", query: "Do you have cooking oil?", icon: "🫗" }
  ];

  const handleSend = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    addAssistantMessage(text, 'user');
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const results = searchNaturalProducts(text, PRODUCTS);

      if (results.length > 0) {
        let introText = "";
        if (results.length === 1) {
          const item = results[0];
          if (item.inStock !== false) {
            introText = `Found ${item.name}:`;
          } else {
            introText = `⚠ ${item.name} is currently unavailable in this store.`;
          }
        } else {
          introText = `Found ${results.length} requested items:`;
        }

        addAssistantMessage(introText, 'assistant', {
          products: results,
          isSearchResult: true
        });
      } else {
        const lower = text.toLowerCase();
        if (lower.includes('checkout') || lower.includes('billing')) {
          addAssistantMessage("Billing Counter 2 is the fastest open checkout lane right now. Tap below to navigate directly.", 'assistant', { mentionsCheckout: true });
        } else {
          addAssistantMessage("Tell me what you need (e.g. 'I need pasta', 'Find shampoo', 'I need pasta, cheese and sauce', or 'I need XYZ') and I will check store availability and shelf location.", 'assistant');
        }
      }
      setIsTyping(false);
    }, 350);
  };

  const handleAddAll = (productsToAdd) => {
    productsToAdd.forEach(p => {
      if (p.inStock !== false) {
        addToShoppingList(p);
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Assistant Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-200/70 dark:border-slate-700/60 shadow-md flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Bot className="h-6 w-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">Smart Product Search</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant stock check & shelf locator</p>
          </div>
        </div>

        {shoppingList.length > 0 && (
          <button
            onClick={() => setActiveMobileTab('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold active:scale-95 transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>List ({shoppingList.length})</span>
          </button>
        )}
      </div>

      {/* Quick Searches Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        {quickSearches.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap active:scale-95 transition-all shadow-xs"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
        <AnimatePresence initial={false}>
          {assistantMessages.map((msg) => {
            const isUser = msg.type === 'user';
            const hasProducts = msg.products && msg.products.length > 0;
            const availableProducts = hasProducts ? msg.products.filter(p => p.inStock !== false) : [];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2.5 max-w-[95%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isUser ? (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}

                <div className={`p-3.5 rounded-3xl text-xs space-y-3 leading-relaxed w-full ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-white dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm'
                }`}>
                  <div className="font-semibold">{msg.text}</div>

                  {/* Multi-Product Action Header */}
                  {!isUser && hasProducts && availableProducts.length > 1 && (
                    <button
                      onClick={() => handleAddAll(availableProducts)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add All to Shopping List ({availableProducts.length} items)
                    </button>
                  )}

                  {/* Product Availability Result Cards */}
                  {!isUser && hasProducts && (
                    <div className="space-y-2.5 pt-1">
                      {msg.products.map((prod) => {
                        const isAvailable = prod.inStock !== false;
                        const isAlreadyInList = shoppingList.some(item => item.id === prod.id);

                        if (isAvailable) {
                          return (
                            <div
                              key={prod.id}
                              className="bg-slate-50 dark:bg-slate-900/70 border border-emerald-500/30 dark:border-emerald-500/25 rounded-2xl p-3.5 space-y-2.5 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1">
                                  <Check className="h-3 w-3 stroke-[3]" /> IN STOCK
                                </span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  ₹{prod.price}
                                </span>
                              </div>

                              <div>
                                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span className="text-lg">{prod.emoji}</span>
                                  <span>{prod.name}</span>
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                                  {prod.floor || 'Floor 1'} • {prod.aisle}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {prod.shelf}
                                </div>
                              </div>

                              <div className="pt-1 flex items-center gap-2">
                                <button
                                  onClick={() => addToShoppingList(prod)}
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                    isAlreadyInList
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                  }`}
                                >
                                  {isAlreadyInList ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 stroke-[3]" /> In Shopping List
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add to Shopping List
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // UNAVAILABLE PRODUCT RESULT CARD
                        return (
                          <div
                            key={prod.id || prod.name}
                            className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 shadow-xs"
                          >
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 stroke-[2.5]" /> NOT AVAILABLE
                            </span>

                            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                              <span>{prod.emoji || '📦'}</span>
                              <span>{prod.name}</span>
                            </div>

                            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-snug">
                              {prod.name} is currently unavailable in this store. This product is currently unavailable.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Checkout CTA shortcut if applicable */}
                  {!isUser && msg.mentionsCheckout && (
                    <button
                      onClick={navigateToCheckout}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xxs shadow-sm active:scale-95"
                    >
                      <CreditCard className="h-3 w-3" /> Go to Checkout
                    </button>
                  )}

                  <div className={`text-[9px] ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.timestamp || 'Just now'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <Bot className="h-4 w-4 animate-spin text-blue-500" />
            <span>Checking product stock & location...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Try 'I need pasta', 'Find shampoo', 'I need XYZ'..."
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}

