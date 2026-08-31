import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getAnalytics = () => {
  const filePath = path.join(__dirname, '../data/analytics.json');
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
};

const saveAnalytics = (data) => {
  const filePath = path.join(__dirname, '../data/analytics.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const withDefaults = (data) => ({
  ...data,
  totalSearches: data.totalSearches || 0,
  totalNavigations: data.totalNavigations || 0,
  completedPickups: data.completedPickups || 0,
  totalRouteDistance: data.totalRouteDistance || 0,
  popularProducts: data.popularProducts || [],
  popularAisles: data.popularAisles || [],
  navigationSessions: data.navigationSessions || []
});

const incrementNamedMetric = (items, key, value, metric) => {
  const existing = items.find(item => item[key] === value);
  if (existing) existing[metric] += 1;
  else items.push({ [key]: value, [metric]: 1 });
  items.sort((a, b) => b[metric] - a[metric]);
};

// GET /api/analytics - Get stats & charts data
router.get('/', (req, res) => {
  try {
    const stats = getAnalytics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error reading analytics data' });
  }
});

// POST /api/analytics/search - Register product search for tracking
router.post('/search', (req, res) => {
  try {
    const { productName } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'Missing productName' });
    }

    const data = withDefaults(getAnalytics());
    data.totalSearches += 1;

    const prodIdx = data.popularProducts.findIndex(p => p.name.toLowerCase() === productName.toLowerCase());
    if (prodIdx !== -1) {
      data.popularProducts[prodIdx].searches += 1;
    } else {
      data.popularProducts.push({ name: productName, searches: 1 });
    }

    // Sort popular products descending
    data.popularProducts.sort((a, b) => b.searches - a.searches);

    saveAnalytics(data);
    res.json({ success: true, totalSearches: data.totalSearches });
  } catch (error) {
    res.status(500).json({ error: 'Error updating analytics' });
  }
});

// POST /api/analytics/navigation - Register an actual route calculation
router.post('/navigation', (req, res) => {
  try {
    const distance = Number(req.body.distance) || 0;
    const data = withDefaults(getAnalytics());
    data.totalNavigations += 1;
    data.totalRouteDistance += distance;
    data.avgRouteLength = Number((data.totalRouteDistance / data.totalNavigations).toFixed(1));

    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date());
    incrementNamedMetric(data.navigationSessions, 'date', day, 'count');
    saveAnalytics(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error logging navigation' });
  }
});

// POST /api/analytics/location - Register a real QR/manual aisle update
router.post('/location', (req, res) => {
  try {
    const { aisle } = req.body;
    if (!aisle) return res.status(400).json({ error: 'Missing aisle' });
    const data = withDefaults(getAnalytics());
    incrementNamedMetric(data.popularAisles, 'aisle', aisle, 'visits');
    saveAnalytics(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error logging location' });
  }
});

// POST /api/analytics/pickup - Register a completed product pickup
router.post('/pickup', (req, res) => {
  try {
    const data = withDefaults(getAnalytics());
    data.completedPickups += 1;
    saveAnalytics(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error logging pickup' });
  }
});

export default router;
