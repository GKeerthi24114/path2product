import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const getProducts = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData);
};

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    const products = getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error reading products database' });
  }
});

// GET /api/products/search - Search products by query
router.get('/search', (req, res) => {
  try {
    const query = (req.query.q || '').toString().toLowerCase();
    const products = getProducts();
    if (!query) {
      return res.json(products);
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.aisle.toLowerCase().includes(query)
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error searching products' });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving product' });
  }
});

// PUT /api/products/:id - Update product location, stock, price, category
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;
    const filePath = path.join(__dirname, '../data/products.json');
    const products = getProducts();
    
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...products[index],
      ...updates,
      id // preserve ID
    };

    // Calculate inStock based on stock number
    if (updatedProduct.stock !== undefined) {
      updatedProduct.stock = Math.max(0, parseInt(updatedProduct.stock, 10) || 0);
      updatedProduct.inStock = updatedProduct.stock > 0;
    }

    products[index] = updatedProduct;
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

export default router;
