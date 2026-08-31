// Dijkstra algorithm for shortest path in store
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

// Generates step-by-step navigation instructions
export const generateDirections = (pathNodes, nodesMeta, adjacency = {}) => {
  if (pathNodes.length === 0) return [];
  if (pathNodes.length === 1) {
    const node = nodesMeta[pathNodes[0]];
    return [{
      instruction: `You have arrived at ${node?.label || 'your destination'}.`,
      from: pathNodes[0],
      to: pathNodes[0],
      distance: 0
    }];
  }
  const directions = [];

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const fromId = pathNodes[i];
    const toId = pathNodes[i + 1];
    const fromNode = nodesMeta[fromId];
    const toNode = nodesMeta[toId];

    if (!fromNode || !toNode) continue;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;

    let turn = 'Proceed';
    if (Math.abs(dx) > Math.abs(dy)) {
      turn = dx > 0 ? 'Proceed right' : 'Proceed left';
    } else {
      turn = dy > 0 ? 'Continue forward' : 'Proceed toward the front';
    }

    directions.push({
      instruction: `${turn} towards ${toNode.label}`,
      from: fromId,
      to: toId,
      distance: adjacency[fromId]?.find(edge => edge.node === toId)?.weight
        || Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) / 10))
    });
  }

  const destinationNode = nodesMeta[pathNodes[pathNodes.length - 1]];
  directions.push({
    instruction: `You have arrived at ${destinationNode ? destinationNode.label : 'your destination'}.`,
    from: pathNodes[pathNodes.length - 1],
    to: pathNodes[pathNodes.length - 1],
    distance: 0
  });

  return directions;
};

// Multi-stop navigation route optimizer (Nearest Neighbor Heuristic)
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

    if (nearestIndex === -1 || minDistance === Infinity) {
      break;
    }

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
