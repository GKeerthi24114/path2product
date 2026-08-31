import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getGraph = () => {
  const filePath = path.join(__dirname, '../data/storeGraph.json');
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
};

// Build adjacency list helper
const buildAdjacencyList = (edges) => {
  const adj = {};
  edges.forEach(({ from, to, weight }) => {
    if (!adj[from]) adj[from] = [];
    if (!adj[to]) adj[to] = [];
    adj[from].push({ node: to, weight });
    adj[to].push({ node: from, weight });
  });
  return adj;
};

// Dijkstra implementation
const dijkstra = (adj, start, end) => {
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
    // Simple priority sorting (min extract)
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

  // Reconstruction
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

// Step-by-step instructions generator based on spatial layout
const generateInstructions = (pathNodes, nodesMeta, adjacency) => {
  if (pathNodes.length === 0) return [];
  if (pathNodes.length === 1) {
    const node = nodesMeta[pathNodes[0]];
    return [{
      instruction: `You have arrived at ${node?.label || 'your destination'}.`,
      from: pathNodes[0],
      to: pathNodes[0],
      label: node?.label || 'Destination',
      distance: 0
    }];
  }
  const instructions = [];

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

    instructions.push({
      instruction: `${turn} towards ${toNode.label}`,
      from: fromId,
      to: toId,
      label: toNode.label,
      distance: adjacency[fromId]?.find(edge => edge.node === toId)?.weight || 0
    });
  }

  // Final confirmation
  const destinationNode = nodesMeta[pathNodes[pathNodes.length - 1]];
  instructions.push({
    instruction: `You have arrived at ${destinationNode ? destinationNode.label : 'your destination'}.`,
    from: pathNodes[pathNodes.length - 1],
    to: pathNodes[pathNodes.length - 1],
    label: destinationNode ? destinationNode.label : 'Destination',
    distance: 0
  });

  return instructions;
};

// Route 1: POST /api/navigate - Shortest route pathfinding
router.post('/', (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to node ID' });
    }

    const { nodes, edges } = getGraph();
    if (!nodes[from] || !nodes[to]) {
      return res.status(404).json({ error: 'Node not found in graph' });
    }

    const adj = buildAdjacencyList(edges);
    const result = dijkstra(adj, from, to);
    const directions = generateInstructions(result.path, nodes, adj);

    res.json({
      path: result.path,
      distance: result.distance,
      directions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating navigation route' });
  }
});

// Route 2: POST /api/navigate/optimized - Multiple stop TSP heuristic (Nearest Neighbor)
router.post('/optimized', (req, res) => {
  try {
    const { from, destinations } = req.body; // destinations: ['B3', 'A1', 'A5']
    if (!from || !destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({ error: 'Missing starting node or destination list' });
    }

    const { nodes, edges } = getGraph();
    const adj = buildAdjacencyList(edges);

    let current = from;
    const invalidDestination = destinations.find(nodeId => !nodes[nodeId]);
    if (!nodes[from] || invalidDestination) {
      return res.status(404).json({ error: 'Node not found in graph' });
    }

    const unvisited = [...new Set(destinations)];
    const orderedStops = [];
    let fullPath = [from];
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
        // Unreachable rest
        break;
      }

      const nextTarget = unvisited.splice(nearestIndex, 1)[0];
      orderedStops.push(nextTarget);
      totalDistance += minDistance;
      
      // Concatenate path, removing duplicate start node
      fullPath = fullPath.concat(bestPath.slice(1));
      current = nextTarget;
    }

    const directions = generateInstructions(fullPath, nodes, adj);

    res.json({
      orderedStops,
      path: fullPath,
      distance: totalDistance,
      directions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating optimized route' });
  }
});

export default router;
