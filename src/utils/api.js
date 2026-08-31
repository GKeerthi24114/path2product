// Client side API fetch requests
const API_BASE = '/api';

export async function getAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function searchProducts(query) {
  try {
    const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search products');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to get product details');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function navigatePath(from, to) {
  try {
    const res = await fetch(`${API_BASE}/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to })
    });
    if (!res.ok) throw new Error('Failed to calculate path');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function navigateOptimized(from, destinations) {
  try {
    const res = await fetch(`${API_BASE}/navigate/optimized`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, destinations })
    });
    if (!res.ok) throw new Error('Failed to calculate optimized route');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to load analytics');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function logSearch(productName) {
  try {
    const res = await fetch(`${API_BASE}/analytics/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName })
    });
    if (!res.ok) throw new Error('Failed to log search');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
  }
}

async function postAnalyticsEvent(event, payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/analytics/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to log ${event}`);
    return await res.json();
  } catch (error) {
    console.error('Analytics Error:', error);
    return null;
  }
}

export const logNavigation = (payload) => postAnalyticsEvent('navigation', payload);
export const logLocation = (aisle) => postAnalyticsEvent('location', { aisle });
export const logPickup = (productId) => postAnalyticsEvent('pickup', { productId });
