import React, { createContext, useContext, useState, useEffect } from 'react';
import { dijkstra, generateDirections, findOptimizedRoute } from '../utils/dijkstra';
import { ADJACENCY_LIST, NODES, PRODUCTS } from '../utils/graphData';
import { navigatePath, navigateOptimized, logSearch } from '../utils/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [currentPosition, setCurrentPositionState] = useState(() => {
    return localStorage.getItem('currentPosition') || null;
  });
  const [destination, setDestination] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });
  const [path, setPath] = useState([]);
  const [directions, setDirections] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Chatbot State
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 1,
      text: "Welcome to SmartMart Super Store! Search for a product above or click 'Enter Store' to begin navigation.",
      type: "info",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addAssistantMessage = (text, type = 'info') => {
    setAssistantMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const setCurrentPosition = (nodeId) => {
    setCurrentPositionState(nodeId);
    if (nodeId) {
      localStorage.setItem('currentPosition', nodeId);
      const label = NODES[nodeId] ? NODES[nodeId].label : nodeId;
      addAssistantMessage(`Location updated: You are now at ${label}`, "info");
    } else {
      localStorage.removeItem('currentPosition');
    }
  };

  // Navigates to a single product destination node
  const navigateToProduct = async (product) => {
    if (!currentPosition) {
      setCurrentPosition('ENT');
    }

    setSelectedProduct(product);
    setDestination(product.nodeId);
    
    // Log search event in backend for metrics
    logSearch(product.name);

    const startNode = currentPosition || 'ENT';
    const endNode = product.nodeId;

    try {
      // Try to fetch path from backend first
      const data = await navigatePath(startNode, endNode);
      setPath(data.path);
      setDirections(data.directions);
      addAssistantMessage(`Route calculated successfully to ${product.name} at ${product.aisle} (${product.shelf})!`, "success");
    } catch (err) {
      // Client-side fallback if backend API is not responding or during initial loading
      const localResult = dijkstra(ADJACENCY_LIST, startNode, endNode);
      const localDirs = generateDirections(localResult.path, NODES);
      setPath(localResult.path);
      setDirections(localDirs);
      addAssistantMessage(`Route calculated (local fallback) to ${product.name} at ${product.aisle}!`, "success");
    }
  };

  // Navigates to billing cash checkout counters
  const navigateToCheckout = async () => {
    if (!currentPosition) return;
    
    const startNode = currentPosition;
    // Find nearest billing node (BILL1, BILL2, BILL3)
    const checkoutNodes = ['BILL1', 'BILL2', 'BILL3'];
    let bestPath = [];
    let minDistance = Infinity;
    let targetCheckout = 'BILL2';

    for (const chk of checkoutNodes) {
      const res = dijkstra(ADJACENCY_LIST, startNode, chk);
      if (res.distance < minDistance) {
        minDistance = res.distance;
        bestPath = res.path;
        targetCheckout = chk;
      }
    }

    setDestination(targetCheckout);
    setSelectedProduct(null);

    try {
      const data = await navigatePath(startNode, targetCheckout);
      setPath(data.path);
      setDirections(data.directions);
      addAssistantMessage(`Checkout counter is ${Math.round(data.distance || minDistance)} meters away. Heading to ${NODES[targetCheckout].label}.`, "success");
    } catch (err) {
      const localDirs = generateDirections(bestPath, NODES);
      setPath(bestPath);
      setDirections(localDirs);
      addAssistantMessage(`Heading to nearest checkout counter: ${NODES[targetCheckout].label}.`, "success");
    }
  };

  // Multi-stop shopping optimization (Traveling Salesman approximation)
  const optimizeShoppingRoute = async () => {
    if (shoppingList.length === 0) {
      addAssistantMessage("Your shopping list is empty. Add products to optimize your route.", "warning");
      return;
    }

    const startNode = currentPosition || 'ENT';
    const destinations = shoppingList.map(item => item.nodeId);

    try {
      const data = await navigateOptimized(startNode, destinations);
      setPath(data.path);
      setDirections(data.directions);
      addAssistantMessage(`AI Optimized Shopping Path generated visiting ${shoppingList.length} items in shortest order!`, "success");
    } catch (err) {
      // Local fallback
      const result = findOptimizedRoute(ADJACENCY_LIST, startNode, destinations);
      const localDirs = generateDirections(result.totalPath, NODES);
      setPath(result.totalPath);
      setDirections(localDirs);
      addAssistantMessage(`AI Optimized Shopping Path generated (local fallback)!`, "success");
    }
  };

  // Shopping list management
  const addToShoppingList = (product) => {
    if (shoppingList.some(item => item.id === product.id)) {
      addAssistantMessage(`${product.name} is already in your shopping list.`, "info");
      return;
    }
    setShoppingList(prev => [...prev, product]);
    addAssistantMessage(`Added ${product.emoji} ${product.name} to shopping list.`, "info");
  };

  const removeFromShoppingList = (productId) => {
    const product = shoppingList.find(p => p.id === productId);
    setShoppingList(prev => prev.filter(item => item.id !== productId));
    if (product) {
      addAssistantMessage(`Removed ${product.name} from shopping list.`, "info");
    }
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    addAssistantMessage("Cleared shopping list.", "info");
  };

  return (
    <StoreContext.Provider value={{
      currentPosition,
      setCurrentPosition,
      destination,
      setDestination,
      selectedProduct,
      setSelectedProduct,
      shoppingList,
      addToShoppingList,
      removeFromShoppingList,
      clearShoppingList,
      path,
      setPath,
      directions,
      setDirections,
      darkMode,
      toggleDarkMode,
      assistantMessages,
      addAssistantMessage,
      navigateToProduct,
      navigateToCheckout,
      optimizeShoppingRoute
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
