import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import navigationRouter from './routes/navigation.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/navigate', navigationRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static assets in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // If requesting api routes that don't exist, return 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  // Fallback to index.html for SPA router
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In development or if not built yet, print visual warning
      res.status(200).send('API Server is running. Frontend build is not found. Please run "npm run build" to serve the production frontend.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` SmartStore Navigator API Server is online!`);
  console.log(` Port: ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
