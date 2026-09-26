import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../utils/graphData';
import { searchNaturalProducts } from '../utils/productSearch';
import { Bot, Send, Check, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant() {
  const { 
    assistantMessages, 
    addAssistantMessage, 
    shoppingList, 
    addToShoppingList, 
    navigateToCheckout 
  } = useStore();
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText) return;

    setInput('');
    addAssistantMessage(userText, 'user');

    setTimeout(() => {
      const results = searchNaturalProducts(userText, PRODUCTS);

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
          introText = `Found ${results.length} requested products:`;
        }

        addAssistantMessage(introText, 'assistant', {
          products: results,
          isSearchResult: true
        });
      } else {
        const lower = userText.toLowerCase();
        if (lower.includes('checkout') || lower.includes('billing')) {
          addAssistantMessage("Billing Counter 2 is the fastest open checkout lane right now. Click below to navigate directly.", "assistant", { mentionsCheckout: true });
        } else {
          addAssistantMessage("Tell me what you need (e.g. 'I need pasta', 'Find shampoo', 'I need pasta, cheese and sauce', or 'I need XYZ') and I will check store availability and shelf location.", "info");
        }
      }
    }, 400);
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-600 text-white ml-auto';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-gray-150/50 dark:border-slate-800/50';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-md flex flex-col justify-between min-h-[380px]">
      <div>
        <div className="flex items-center justify-between border-b border-gray-150/50 dark:border-slate-700/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Smart Product Search</h4>
          </div>
          <span className="text-[11px] text-slate-400">Stock & Shelf Locator</span>
        </div>

        {/* Message window */}
        <div className="h-60 overflow-y-auto space-y-3 pr-1 mb-4 text-xs">
          <AnimatePresence initial={false}>
            {assistantMessages.map((msg) => {
              const isUser = msg.type === 'user';
              const hasProducts = msg.products && msg.products.length > 0;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-2xl flex flex-col gap-2 max-w-[95%] ${getMessageColor(msg.type)}`}
                >
                  <div className="flex items-start gap-2.5">
                    {!isUser && (
                      <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="leading-relaxed font-semibold">{msg.text}</div>
                    </div>
                  </div>

                  {/* Render Product Cards if search result */}
                  {!isUser && hasProducts && (
                    <div className="space-y-2 pt-1">
                      {msg.products.map((prod) => {
                        const isAvailable = prod.inStock !== false;
                        const isAlreadyInList = shoppingList.some(item => item.id === prod.id);

                        if (isAvailable) {
                          return (
                            <div
                              key={prod.id}
                              className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-slate-800 dark:text-slate-100 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase inline-flex items-center gap-1">
                                  <Check className="h-3 w-3 stroke-[3]" /> IN STOCK
                                </span>
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  ₹{prod.price}
                                </span>
                              </div>

                              <div>
                                <div className="font-extrabold text-xs flex items-center gap-1.5">
                                  <span>{prod.emoji}</span>
                                  <span>{prod.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {prod.floor || 'Floor 1'} • {prod.aisle} • {prod.shelf}
                                </div>
                              </div>

                              <button
                                onClick={() => addToShoppingList(prod)}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                  isAlreadyInList
                                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                          );
                        }

                        return (
                          <div
                            key={prod.id || prod.name}
                            className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-1 text-slate-800 dark:text-slate-100"
                          >
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase inline-flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> NOT AVAILABLE
                            </span>
                            <div className="font-bold text-xs pt-0.5">{prod.name}</div>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                              {prod.name} is currently unavailable in this store. This product is currently unavailable.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span className={`text-[9px] ${isUser ? 'text-blue-100' : 'text-gray-400 dark:text-slate-500'} block mt-1`}>
                    {msg.timestamp || 'Just now'}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input panel */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-150/50 dark:border-slate-700/50 pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try 'I need pasta', 'Find shampoo', 'I need XYZ'..."
          className="flex-grow px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow shadow-blue-500/10 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
