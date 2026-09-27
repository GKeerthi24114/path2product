import React, { createContext, useContext, useState, useEffect } from 'react';
import { dijkstra, generateDirections, findOptimizedRoute, findMultiProductRoute } from '../utils/dijkstra';
import { ADJACENCY_LIST, NODES, PRODUCTS } from '../utils/graphData';
import { navigatePath, navigateOptimized, logSearch, updateProductApi } from '../utils/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // Single source of truth for products (managed by store owner / admin)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('store_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  // Configurable route start node (defaults to Entrance 'ENT' for demo)
  const [routeStartNode, setRouteStartNodeState] = useState(() => {
    return localStorage.getItem('routeStartNode') || 'ENT';
  });

  const [currentPosition, setCurrentPositionState] = useState(() => {
    return localStorage.getItem('currentPosition') || 'ENT';
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
  
  const [activeMobileTab, setActiveMobileTab] = useState('home'); // 'home' | 'assistant' | 'offers' | 'list' | 'navigation'
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Multi-Stop Shopping Navigation State
  const [multiStopRoute, setMultiStopRoute] = useState(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  // Active Floor Selection State (1, 2, 3)
  const [activeFloor, setActiveFloor] = useState(1);

  // Chatbot State
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 1,
      text: "Welcome to Path2Product Supermarket! Search for a product above or click 'Enter Store' to begin navigation.",
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

  // Fetch live products catalog from backend API on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const apiProducts = await res.json();
          if (Array.isArray(apiProducts) && apiProducts.length > 0) {
            setProducts(apiProducts);
            localStorage.setItem('store_products', JSON.stringify(apiProducts));
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    }
    fetchProducts();
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const updateRouteStartNode = (nodeId) => {
    setRouteStartNodeState(nodeId);
    localStorage.setItem('routeStartNode', nodeId);
  };

  // Admin function to update product placement, stock, price
  const updateProduct = async (productId, updates) => {
    const updatedList = products.map(p => {
      if (p.id === productId) {
        const updated = { ...p, ...updates };
        if (updated.stock !== undefined) {
          const numStock = Math.max(0, parseInt(updated.stock, 10) || 0);
          updated.stock = numStock;
          updated.inStock = numStock > 0;
        }
        return updated;
      }
      return p;
    });

    setProducts(updatedList);
    localStorage.setItem('store_products', JSON.stringify(updatedList));

    // Also update any matching item in shoppingList
    setShoppingList(prev => prev.map(item => {
      if (item.id === productId) {
        const matchingUpdated = updatedList.find(p => p.id === productId);
        return {
          ...item,
          ...updates,
          stock: matchingUpdated?.stock,
          inStock: matchingUpdated?.inStock,
          floor: matchingUpdated?.floor || item.floor,
          aisle: matchingUpdated?.aisle || item.aisle,
          shelf: matchingUpdated?.shelf || item.shelf,
          nodeId: matchingUpdated?.nodeId || item.nodeId,
          price: matchingUpdated?.price || item.price
        };
      }
      return item;
    }));

    // If multiStopRoute is active, update product info in stops
    if (multiStopRoute && multiStopRoute.stops) {
      setMultiStopRoute(prev => ({
        ...prev,
        stops: prev.stops.map(stop => {
          if (stop.product.id === productId) {
            const matchingUpdated = updatedList.find(p => p.id === productId);
            return {
              ...stop,
              product: { ...stop.product, ...matchingUpdated },
              floor: matchingUpdated?.floor || stop.floor,
              aisle: matchingUpdated?.aisle || stop.aisle,
              shelf: matchingUpdated?.shelf || stop.shelf,
              nodeId: matchingUpdated?.nodeId || stop.nodeId
            };
          }
          return stop;
        })
      }));
    }

    // Call backend API
    try {
      await updateProductApi(productId, updates);
    } catch (err) {
      console.warn("Backend product update error:", err);
    }

    addAssistantMessage(`Updated product #${productId} (${updates.name || 'details'})`, 'info');
  };

  const addAssistantMessage = (text, type = 'info', extra = {}) => {
    setAssistantMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...extra
      }
    ]);
  };

  const setCurrentPosition = (nodeId) => {
    setCurrentPositionState(nodeId);
    if (nodeId) {
      localStorage.setItem('currentPosition', nodeId);
      const nodeObj = NODES[nodeId];
      const label = nodeObj ? nodeObj.label : nodeId;
      if (nodeObj && nodeObj.floor) {
        setActiveFloor(nodeObj.floor);
      }
      addAssistantMessage(`Location updated: You are now at ${label}`, "info");
    } else {
      localStorage.removeItem('currentPosition');
    }
  };

  const clearNavigation = () => {
    setDestination(null);
    setSelectedProduct(null);
    setPath([]);
    setDirections([]);
    setActiveStepIndex(0);
    setRouteError(null);
    setMultiStopRoute(null);
    setCurrentStopIndex(0);
  };

  // Requirement 11: End Navigation clears customer cart ONLY after entire navigation/checkout flow finishes
  const endNavigation = (completed = false) => {
    const isAtOrHeadingToCheckout = destination && destination.startsWith('BILL');
    const isAllStopsDone = multiStopRoute && multiStopRoute.stops && multiStopRoute.stops.every(s => s.isCollected);

    if (completed || isAtOrHeadingToCheckout || isAllStopsDone) {
      setShoppingList([]);
      localStorage.removeItem('shoppingList');
      addAssistantMessage("🎉 Shopping complete! Your shopping list has been cleared. Thank you for using Path2Product.", "success");
    }

    clearNavigation();
  };

  // Single Product Navigation (Exact product -> exact map node)
  const navigateToProduct = async (product) => {
    if (!product || !product.nodeId) return;

    // Check stock/availability
    const liveProd = products.find(p => p.id === product.id) || product;
    if (liveProd.stock <= 0 || liveProd.inStock === false) {
      addAssistantMessage(`⚠ ${liveProd.name} is currently out of stock and unavailable for navigation.`, "warning");
      return;
    }

    if (!currentPosition) {
      setCurrentPosition('ENT');
    }

    setSelectedProduct(product);
    setDestination(product.nodeId);
    setActiveStepIndex(0);
    setIsCalculating(true);
    setRouteError(null);
    setActiveMobileTab('navigation');
    
    // Switch active floor to the product's floor
    if (product.floor) {
      const floorNum = parseInt(product.floor.replace(/\D/g, '')) || 1;
      setActiveFloor(floorNum);
    }

    // Reset multi-stop route when single navigating
    setMultiStopRoute(null);
    setCurrentStopIndex(0);

    // Log search event in backend for metrics
    logSearch(product.name);

    const startNode = currentPosition || 'ENT';
    const endNode = product.nodeId;

    try {
      const localResult = dijkstra(ADJACENCY_LIST, startNode, endNode);
      const localDirs = generateDirections(localResult.path, NODES, ADJACENCY_LIST, product);
      setPath(localResult.path);
      setDirections(localDirs);
      addAssistantMessage(`Route calculated directly to ${product.name} at ${product.aisle} (${product.shelf}, ${product.floor || 'Floor 1'})!`, "success");
    } catch (err) {
      setRouteError("Unable to calculate route to product.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Navigates to nearest billing cash checkout counter
  const navigateToCheckout = async () => {
    if (!currentPosition) {
      setCurrentPosition('ENT');
    }
    
    const startNode = currentPosition || 'ENT';
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
    setActiveStepIndex(0);
    setIsCalculating(true);
    setRouteError(null);
    setActiveMobileTab('navigation');
    setActiveFloor(1);
    // Reset multiStopRoute so that checkout navigation activates cleanly
    setMultiStopRoute(null);
    setCurrentStopIndex(0);

    const localDirs = generateDirections(bestPath, NODES, ADJACENCY_LIST, {
      name: NODES[targetCheckout]?.label || 'Checkout Counter',
      aisle: 'Checkout Area',
      shelf: 'Billing Desk'
    });
    setPath(bestPath);
    setDirections(localDirs);
    addAssistantMessage(`Heading to nearest checkout: ${NODES[targetCheckout]?.label || 'Billing 2'} (${minDistance} m away).`, "success");
    setIsCalculating(false);
  };

  // Multi-stop shopping optimization (TSP Nearest Neighbor + Dynamic Nearest Checkout)
  const optimizeShoppingRoute = async () => {
    if (shoppingList.length === 0) {
      addAssistantMessage("Your shopping list is empty. Add products to optimize your route.", "warning");
      return;
    }

    // Filter available products (out-of-stock items cannot be navigated to)
    const availableItems = shoppingList.filter(item => {
      const live = products.find(p => p.id === item.id);
      return live ? (live.stock > 0 && live.inStock) : (item.inStock !== false && (item.stock === undefined || item.stock > 0));
    });

    if (availableItems.length === 0) {
      setRouteError("All items in your shopping list are currently out of stock.");
      addAssistantMessage("All items in your shopping list are currently out of stock.", "warning");
      return;
    }

    // Requirement 1 & 2: ALWAYS start optimized route from Entrance for the demo (configurable)
    const startNode = routeStartNode || 'ENT';
    setCurrentPosition(startNode);
    setActiveFloor(1); // Entrance is always on Floor 1

    setIsCalculating(true);
    setRouteError(null);
    setActiveMobileTab('navigation');

    try {
      const multiRoute = findMultiProductRoute(ADJACENCY_LIST, startNode, availableItems, NODES);
      setMultiStopRoute(multiRoute);

      // Find first uncollected stop in sequence
      const firstPendingIndex = multiRoute.stops.findIndex(s => !s.isCollected);
      const activeIndex = firstPendingIndex !== -1 ? firstPendingIndex : 0;
      setCurrentStopIndex(activeIndex);

      if (multiRoute.stops.length > 0 && firstPendingIndex !== -1) {
        const targetStop = multiRoute.stops[activeIndex];
        setSelectedProduct(targetStop.product);
        setDestination(targetStop.nodeId);
        setPath(targetStop.pathSegment);
        setDirections(targetStop.directions);
        setActiveStepIndex(0);
        // Start view on Floor 1 where Entrance is so customer visibly sees path from Entrance!
        setActiveFloor(1);

        addAssistantMessage(`✨ AI Optimized Shopping Route: Route begins at Entrance (${NODES[startNode]?.label || 'Entrance'}). Visiting ${multiRoute.stops.length} products with shortest walking distance (${multiRoute.totalDistance} m, ${multiRoute.estimatedTimeFormatted}). Stop 1: ${targetStop.product.name} at ${targetStop.aisle}!`, "success");
      } else if (multiRoute.stops.length > 0 && firstPendingIndex === -1) {
        // All items collected! Head to checkout
        setCurrentStopIndex(multiRoute.stops.length);
        const checkout = multiRoute.finalCheckout;
        setSelectedProduct(null);
        setDestination(checkout.nodeId);
        setPath(checkout.pathSegment);
        setDirections(checkout.directions);
        setActiveStepIndex(0);
        setActiveFloor(1);
        addAssistantMessage(`Shopping complete 🎉 Head to nearest checkout: ${checkout.label} (${checkout.distanceFromLastProduct} m)`, "success");
      }
    } catch (err) {
      setRouteError("Unable to optimize shopping route. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Advance to next stop when user marks an item collected
  const markStopCollected = (stopIndex) => {
    if (!multiStopRoute || !multiStopRoute.stops) return;
    
    const updatedStops = multiStopRoute.stops.map((stop, idx) => {
      if (idx === stopIndex) {
        return { ...stop, isCollected: true };
      }
      return stop;
    });

    const nextIndex = stopIndex + 1;
    setMultiStopRoute(prev => ({
      ...prev,
      stops: updatedStops
    }));

    const currentStop = multiStopRoute.stops[stopIndex];
    if (currentStop) {
      setShoppingList(prev => prev.map(item =>
        item.id === currentStop.product.id ? { ...item, collected: true } : item
      ));
      setCurrentPosition(currentStop.nodeId);
      addAssistantMessage(`✓ Collected ${currentStop.product.name} at ${currentStop.aisle}! (${nextIndex}/${multiStopRoute.stops.length} items collected)`, "success");
    }

    if (nextIndex < multiStopRoute.stops.length) {
      // Advance to next stop
      setCurrentStopIndex(nextIndex);
      const nextStop = multiStopRoute.stops[nextIndex];
      setSelectedProduct(nextStop.product);
      setDestination(nextStop.nodeId);
      setPath(nextStop.pathSegment);
      setDirections(nextStop.directions);
      setActiveStepIndex(0);
      if (nextStop.floor) {
        const floorNum = parseInt(nextStop.floor.replace(/\D/g, '')) || 1;
        setActiveFloor(floorNum);
      }
    } else {
      // All items collected! Head to checkout
      setCurrentStopIndex(multiStopRoute.stops.length);
      const checkout = multiStopRoute.finalCheckout;
      if (checkout) {
        setSelectedProduct(null);
        setDestination(checkout.nodeId);
        setPath(checkout.pathSegment);
        setDirections(checkout.directions);
        setActiveStepIndex(0);
        setActiveFloor(1);
        addAssistantMessage(`Shopping complete 🎉 Head to nearest checkout: ${checkout.label} (${checkout.distanceFromLastProduct} m)`, "success");
      }
    }
  };

  // Update item quantity (min 1)
  const updateItemQuantity = (productId, delta) => {
    setShoppingList(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));

    if (multiStopRoute && multiStopRoute.stops) {
      setMultiStopRoute(prev => ({
        ...prev,
        stops: prev.stops.map(stop => {
          if (stop.product.id === productId) {
            const newQty = Math.max(1, (stop.quantity || stop.product.quantity || 1) + delta);
            return {
              ...stop,
              quantity: newQty,
              product: { ...stop.product, quantity: newQty }
            };
          }
          return stop;
        })
      }));
    }
  };

  // Toggle collection of a product from the shopping list small circle
  const toggleProductCollected = (productId) => {
    // 1. Determine current collected state synchronously from current state
    const currentStop = multiStopRoute?.stops?.find(s => String(s.product?.id) === String(productId));
    const listItem = shoppingList.find(item => String(item.id) === String(productId));
    
    // Toggle: if currently collected, become false; otherwise become true
    const isCurrentlyCollected = currentStop ? Boolean(currentStop.isCollected) : Boolean(listItem?.collected);
    const nextCollectedState = !isCurrentlyCollected;

    // 2. Synchronize Shopping List state
    setShoppingList(prev => prev.map(item => {
      if (String(item.id) === String(productId)) {
        return { ...item, collected: nextCollectedState };
      }
      return item;
    }));

    // 3. Update Multi-Stop Route state
    if (multiStopRoute && multiStopRoute.stops) {
      const updatedStops = multiStopRoute.stops.map(stop => {
        if (String(stop.product?.id) === String(productId)) {
          return { ...stop, isCollected: nextCollectedState };
        }
        return stop;
      });

      setMultiStopRoute(prev => ({
        ...prev,
        stops: updatedStops
      }));

      // Update currentPosition to the collected product's node
      const justCollected = multiStopRoute.stops.find(s => String(s.product?.id) === String(productId));
      if (nextCollectedState && justCollected) {
        setCurrentPosition(justCollected.nodeId);
      }

      // Find the first uncollected stop in the sequence
      const nextUncollectedIndex = updatedStops.findIndex(s => !s.isCollected);

      if (nextUncollectedIndex !== -1) {
        setCurrentStopIndex(nextUncollectedIndex);
        const nextStop = updatedStops[nextUncollectedIndex];
        setSelectedProduct(nextStop.product);
        setDestination(nextStop.nodeId);
        setPath(nextStop.pathSegment);
        setDirections(nextStop.directions);
        setActiveStepIndex(0);
        if (nextStop.floor) {
          const floorNum = parseInt(nextStop.floor.replace(/\D/g, '')) || 1;
          setActiveFloor(floorNum);
        }
      } else {
        // All stops collected! Activate nearest checkout
        setCurrentStopIndex(updatedStops.length);
        const checkout = multiStopRoute.finalCheckout;
        if (checkout) {
          setSelectedProduct(null);
          setDestination(checkout.nodeId);
          setPath(checkout.pathSegment);
          setDirections(checkout.directions);
          setActiveStepIndex(0);
          setActiveFloor(1);
          addAssistantMessage(`All items collected! Nearest checkout: ${checkout.label} (${checkout.distanceFromLastProduct} m)`, "success");
        }
      }
    }
  };

  // Shopping list management
  const addToShoppingList = (product) => {
    // Check live stock and availability
    const live = products.find(p => p.id === product.id) || product;
    if (live.stock <= 0 || live.inStock === false) {
      addAssistantMessage(`⚠ ${live.name} is currently out of stock and cannot be added.`, "warning");
      return;
    }

    const existing = shoppingList.find(item => item.id === product.id);
    if (existing) {
      updateItemQuantity(product.id, 1);
      addAssistantMessage(`Increased ${product.name} quantity to ${(existing.quantity || 1) + 1}.`, "info");
      return;
    }
    const itemWithQty = {
      ...product,
      ...live,
      quantity: product.quantity || 1,
      collected: false
    };
    setShoppingList(prev => [...prev, itemWithQty]);
    // Reset multiStopRoute so newly added item can be optimized into the tour
    setMultiStopRoute(null);
    setCurrentStopIndex(0);
    addAssistantMessage(`Added ${product.emoji} ${product.name} to shopping list.`, "info");
  };

  const removeFromShoppingList = (productId) => {
    const product = shoppingList.find(p => p.id === productId);
    setShoppingList(prev => prev.filter(item => item.id !== productId));
    if (product) {
      addAssistantMessage(`Removed ${product.name} from shopping list.`, "info");
    }
    // If multiStopRoute is active, reset it to re-optimize
    setMultiStopRoute(null);
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    setMultiStopRoute(null);
    setCurrentStopIndex(0);
    addAssistantMessage("Cleared shopping list.", "info");
  };

  return (
    <StoreContext.Provider value={{
      products,
      updateProduct,
      routeStartNode,
      updateRouteStartNode,
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
      updateItemQuantity,
      toggleProductCollected,
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
      optimizeShoppingRoute,
      clearNavigation,
      endNavigation,
      activeMobileTab,
      setActiveMobileTab,
      activeStepIndex,
      setActiveStepIndex,
      isCalculating,
      routeError,
      multiStopRoute,
      currentStopIndex,
      markStopCollected,
      activeFloor,
      setActiveFloor
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
