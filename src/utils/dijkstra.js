// Enhanced Dijkstra algorithm and human-understandable route optimizer for SmartStore

export const dijkstra = (adj, start, end) => {
  const distances = {};
  const previous = {};
  const queue = [];
  const nodes = Object.keys(adj);

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[start] = 0;
  queue.push({ node: start, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node: current } = queue.shift();

    if (current === end) break;

    const neighbors = adj[current] || [];
    for (const neighbor of neighbors) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
        queue.push({ node: neighbor.node, dist: alt });
      }
    }
  }

  const path = [];
  let curr = end;
  if (distances[end] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return { path, distance: distances[end] };
};

// Generates natural, human-understandable step-by-step directions without exposing raw graph node IDs
export const generateDirections = (pathNodes, nodesMeta, adjacency = {}, productMeta = null) => {
  if (!pathNodes || pathNodes.length === 0) return [];
  if (pathNodes.length === 1) {
    const node = nodesMeta[pathNodes[0]];
    const label = productMeta ? `${productMeta.name} (${productMeta.aisle})` : node?.label || 'your destination';
    return [{
      instruction: `You have arrived at ${label}.`,
      from: pathNodes[0],
      to: pathNodes[0],
      distance: 0,
      turnType: 'arrived'
    }];
  }

  const directions = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromId = pathNodes[i];
    const toId = pathNodes[i + 1];
    const fromNode = nodesMeta[fromId];
    const toNode = nodesMeta[toId];

    if (!fromNode || !toNode) continue;

    // Detect Floor Changes (Escalator, Stairs, Lift)
    const isEscalator = toNode.type === 'escalator' || fromNode.type === 'escalator';
    const isStairs = toNode.type === 'stairs' || fromNode.type === 'stairs';
    const isLift = toNode.type === 'lift' || fromNode.type === 'lift';

    const edgeWeight = adjacency[fromId]?.find(edge => edge.node === toId)?.weight || 5;

    if (fromNode.floor !== toNode.floor) {
      const directionWord = toNode.floor > fromNode.floor ? '↑ up to' : '↓ down to';
      const transportType = isEscalator ? 'Take the escalator' : isStairs ? 'Take the stairs' : isLift ? 'Take the elevator' : 'Go';
      directions.push({
        instruction: `${transportType} ${directionWord} Floor ${toNode.floor}`,
        from: fromId,
        to: toId,
        distance: edgeWeight,
        turnType: 'vertical',
        floor: toNode.floor
      });
      continue;
    }

    if (fromNode.type === 'escalator' || fromNode.type === 'stairs' || fromNode.type === 'lift') {
      directions.push({
        instruction: `Continue to ${toNode.label} (${edgeWeight} m)`,
        from: fromId,
        to: toId,
        distance: edgeWeight,
        turnType: 'straight'
      });
      continue;
    }

    if (toNode.type === 'escalator') {
      directions.push({
        instruction: `Continue to the escalator (${edgeWeight} m)`,
        from: fromId,
        to: toId,
        distance: edgeWeight,
        turnType: 'vertical'
      });
      continue;
    }

    if (toNode.type === 'stairs') {
      directions.push({
        instruction: `Continue to the stairs (${edgeWeight} m)`,
        from: fromId,
        to: toId,
        distance: edgeWeight,
        turnType: 'vertical'
      });
      continue;
    }

    if (toNode.type === 'lift') {
      directions.push({
        instruction: `Continue to the elevator / lift (${edgeWeight} m)`,
        from: fromId,
        to: toId,
        distance: edgeWeight,
        turnType: 'vertical'
      });
      continue;
    }

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;

    let turnText = 'Walk straight';
    let turnType = 'straight';

    if (Math.abs(dx) > Math.abs(dy) + 40) {
      turnText = dx > 0 ? 'Turn right' : 'Turn left';
      turnType = dx > 0 ? 'right' : 'left';
    } else if (dy > 40) {
      turnText = 'Continue forward';
      turnType = 'forward';
    } else if (dy < -40) {
      turnText = 'Proceed toward the front';
      turnType = 'forward';
    }

    const friendlyTarget = toNode.label;
    directions.push({
      instruction: `${turnText} toward ${friendlyTarget} (${edgeWeight} m)`,
      from: fromId,
      to: toId,
      distance: edgeWeight,
      turnType
    });
  }

  // Final Arrival Instruction
  const lastNodeId = pathNodes[pathNodes.length - 1];
  const lastNode = nodesMeta[lastNodeId];
  let arrivalText = `You have arrived at ${lastNode?.label || 'your destination'}.`;
  
  if (productMeta) {
    const side = productMeta.shelf?.toLowerCase().includes('1') ? 'left' : 'right';
    arrivalText = `You have arrived at ${productMeta.aisle}. ${productMeta.name} is on your ${side} (${productMeta.shelf}).`;
  }

  directions.push({
    instruction: arrivalText,
    from: lastNodeId,
    to: lastNodeId,
    distance: 0,
    turnType: 'arrived'
  });

  return directions;
};

// MULTI-PRODUCT ROUTE OPTIMIZATION (TSP Nearest Neighbor + Dynamic Nearest Checkout)
export const findMultiProductRoute = (adj, startNodeId, products, nodesMeta, checkoutNodeIds = ['BILL1', 'BILL2', 'BILL3']) => {
  if (!products || products.length === 0) {
    return {
      stops: [],
      fullPath: [],
      totalDistance: 0,
      estimatedTimeFormatted: '0 min',
      nearestCheckout: null,
      directions: []
    };
  }

  let current = startNodeId || 'ENT';
  const collectedItems = products.filter(p => Boolean(p.collected));
  const uncollectedItems = products.filter(p => !p.collected);
  const stops = [];
  let fullPath = [current];
  let totalDistance = 0;
  const allDirections = [];

  let stopNumber = 1;

  // 1. If some products were already collected and some are uncollected, preserve collected stops in order
  if (collectedItems.length > 0 && uncollectedItems.length > 0) {
    for (const prod of collectedItems) {
      const res = dijkstra(adj, current, prod.nodeId);
      const segmentDirections = generateDirections(res.path, nodesMeta, adj, prod);

      stops.push({
        stopNumber: stopNumber++,
        product: prod,
        quantity: prod.quantity || 1,
        nodeId: prod.nodeId,
        floor: prod.floor || 'Floor 1',
        aisle: prod.aisle,
        shelf: prod.shelf,
        distanceFromPrev: res.distance,
        pathSegment: res.path,
        directions: segmentDirections,
        isCollected: true
      });

      totalDistance += res.distance;
      fullPath = fullPath.concat(res.path.slice(1));
      allDirections.push(...segmentDirections);
      current = prod.nodeId;
    }
  }

  // 2. Visit uncollected products (or all products if none previously collected) via nearest neighbor
  const unvisitedProducts = (collectedItems.length > 0 && uncollectedItems.length > 0)
    ? [...uncollectedItems]
    : [...products];

  // Visit all shopping list items in nearest order to minimize backtracking
  while (unvisitedProducts.length > 0) {
    let nearestIndex = -1;
    let minDistance = Infinity;
    let bestPath = [];

    for (let i = 0; i < unvisitedProducts.length; i++) {
      const prod = unvisitedProducts[i];
      const targetNode = prod.nodeId;
      const res = dijkstra(adj, current, targetNode);
      if (res.distance < minDistance) {
        minDistance = res.distance;
        bestPath = res.path;
        nearestIndex = i;
      }
    }

    if (nearestIndex === -1 || minDistance === Infinity) {
      break;
    }

    const nextProduct = unvisitedProducts.splice(nearestIndex, 1)[0];
    const segmentDirections = generateDirections(bestPath, nodesMeta, adj, nextProduct);

    stops.push({
      stopNumber: stopNumber++,
      product: nextProduct,
      quantity: nextProduct.quantity || 1,
      nodeId: nextProduct.nodeId,
      floor: nextProduct.floor || 'Floor 1',
      aisle: nextProduct.aisle,
      shelf: nextProduct.shelf,
      distanceFromPrev: minDistance,
      pathSegment: bestPath,
      directions: segmentDirections,
      isCollected: Boolean(nextProduct.collected)
    });

    totalDistance += minDistance;
    // Append path without duplicating node
    fullPath = fullPath.concat(bestPath.slice(1));
    allDirections.push(...segmentDirections);
    current = nextProduct.nodeId;
  }

  // Calculate the TRUE NEAREST CHECKOUT from the final product's location
  let nearestCheckoutNode = 'BILL2';
  let minCheckoutDistance = Infinity;
  let checkoutPath = [];

  for (const chkId of checkoutNodeIds) {
    if (!nodesMeta[chkId]) continue;
    const chkRes = dijkstra(adj, current, chkId);
    if (chkRes.distance < minCheckoutDistance) {
      minCheckoutDistance = chkRes.distance;
      nearestCheckoutNode = chkId;
      checkoutPath = chkRes.path;
    }
  }

  const checkoutDirections = generateDirections(checkoutPath, nodesMeta, adj, {
    name: nodesMeta[nearestCheckoutNode]?.label || 'Checkout Counter',
    aisle: 'Checkout Area',
    shelf: 'Cash & Card'
  });

  const finalCheckout = {
    nodeId: nearestCheckoutNode,
    label: nodesMeta[nearestCheckoutNode]?.label || 'Billing 2',
    floor: 'Floor 1',
    distanceFromLastProduct: minCheckoutDistance,
    pathSegment: checkoutPath,
    directions: checkoutDirections
  };

  const totalWithCheckout = totalDistance + minCheckoutDistance;
  const fullPathWithCheckout = fullPath.concat(checkoutPath.slice(1));
  const estimatedSeconds = Math.round(totalWithCheckout / 0.8);
  const estimatedTimeFormatted = estimatedSeconds < 60 ? `${estimatedSeconds} sec` : `~${Math.ceil(estimatedSeconds / 60)} min`;

  return {
    stops,
    finalCheckout,
    totalDistance: totalWithCheckout,
    shoppingDistance: totalDistance,
    estimatedTimeFormatted,
    fullPath: fullPathWithCheckout,
    directions: allDirections
  };
};

// Fallback legacy support
export const findOptimizedRoute = (adj, start, destinations) => {
  if (!start || !destinations || destinations.length === 0) {
    return { orderedStops: [], totalPath: [], totalDistance: 0 };
  }
  let current = start;
  const unvisited = [...destinations];
  const orderedStops = [];
  let fullPath = [start];
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = -1;
    let minDistance = Infinity;
    let bestPath = [];

    for (let i = 0; i < unvisited.length; i++) {
      const target = unvisited[i];
      const resDijkstra = dijkstra(adj, current, target);
      if (resDijkstra.distance < minDistance) {
        minDistance = resDijkstra.distance;
        bestPath = resDijkstra.path;
        nearestIndex = i;
      }
    }

    if (nearestIndex === -1 || minDistance === Infinity) break;

    const nextTarget = unvisited.splice(nearestIndex, 1)[0];
    orderedStops.push(nextTarget);
    totalDistance += minDistance;
    fullPath = fullPath.concat(bestPath.slice(1));
    current = nextTarget;
  }

  return {
    orderedStops,
    totalPath: fullPath,
    totalDistance
  };
};
