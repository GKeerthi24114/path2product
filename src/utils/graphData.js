import storeGraph from '../../server/data/storeGraph.json';
import products from '../../server/data/products.json';

export const NODES = storeGraph.nodes;
export const EDGES = storeGraph.edges;
export const PRODUCTS = products;

export const ADJACENCY_LIST = EDGES.reduce((adjacency, { from, to, weight }) => {
  adjacency[from] ??= [];
  adjacency[to] ??= [];
  adjacency[from].push({ node: to, weight });
  adjacency[to].push({ node: from, weight });
  return adjacency;
}, {});
