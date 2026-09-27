import { PRODUCTS } from './graphData.js';

/**
 * Natural language product search and availability engine for Phase 3
 * Identifies requested products from natural customer queries:
 * - "I need pasta" -> [Pasta] (In Stock)
 * - "Find shampoo" -> [Shampoo] (In Stock)
 * - "I want rice" -> [Rice] (In Stock)
 * - "Add toothpaste" -> [Toothpaste] (In Stock)
 * - "I need pasta, cheese and sauce" -> [Pasta, Cheese, Pasta Sauce] (All In Stock)
 * - "Do you have cooking oil?" -> [Cooking Oil] (In Stock)
 * - "I need XYZ" -> [XYZ] (Not Available)
 * 
 * Rules:
 * - Only returns products explicitly requested (No recipe inferences, no unwanted substitutions).
 * - Identifies inStock availability for every item.
 */
export function searchNaturalProducts(query, catalog = PRODUCTS) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();

  const matched = [];
  const matchedIds = new Set();

  // 1. Multi-word catalog items check first (e.g., 'Pasta Sauce', 'Cooking Oil', 'Tea Powder')
  const multiWordProds = catalog.filter(p => p.name.includes(' '));
  for (const prod of multiWordProds) {
    const nameLower = prod.name.toLowerCase();
    if (q.includes(nameLower)) {
      matched.push(prod);
      matchedIds.add(prod.id);
    }
  }

  // 2. Common synonyms/aliases (e.g. "sauce" -> Pasta Sauce, "oil" -> Cooking Oil)
  if (!matchedIds.has(18) && (q.includes('sauce') || q.includes('pasta sauce'))) {
    const sauce = catalog.find(p => p.id === 18 || p.name.toLowerCase() === 'pasta sauce');
    if (sauce && !matchedIds.has(sauce.id)) {
      matched.push(sauce);
      matchedIds.add(sauce.id);
    }
  }

  if (!matchedIds.has(4) && (q.includes('oil') || q.includes('cooking oil'))) {
    const oil = catalog.find(p => p.id === 4 || p.name.toLowerCase() === 'cooking oil');
    if (oil && !matchedIds.has(oil.id)) {
      matched.push(oil);
      matchedIds.add(oil.id);
    }
  }

  // 3. Single-word catalog items check
  const tokens = q
    .replace(/[?!.,;:]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  for (const prod of catalog) {
    if (matchedIds.has(prod.id)) continue;
    const nameLower = prod.name.toLowerCase();

    // Check if token matches product name
    const hasWord = tokens.some(token => token === nameLower || (nameLower.length > 4 && token.startsWith(nameLower)));
    if (hasWord) {
      matched.push(prod);
      matchedIds.add(prod.id);
    }
  }

  // If products were found in catalog, return them sorted by query order
  if (matched.length > 0) {
    const formatted = matched.map(prod => {
      const isAvailable = prod.stock !== undefined ? (prod.stock > 0 && prod.inStock !== false) : prod.inStock !== false;
      return {
        ...prod,
        inStock: isAvailable,
        isUnavailable: !isAvailable
      };
    });

    return formatted.sort((a, b) => {
      const posA = q.indexOf(a.name.toLowerCase());
      const posB = q.indexOf(b.name.toLowerCase());
      if (posA !== -1 && posB !== -1) return posA - posB;
      return 0;
    });
  }

  // 4. If no catalog products matched, check if an unavailable product was requested
  const carrierWords = new Set([
    'i', 'need', 'want', 'find', 'add', 'do', 'you', 'have', 'where', 'is', 'are',
    'can', 'get', 'looking', 'for', 'show', 'me', 'give', 'there', 'any',
    'some', 'the', 'a', 'an', 'please', 'to', 'in', 'store'
  ]);

  const requestedTokens = tokens.filter(t => !carrierWords.has(t));
  if (requestedTokens.length > 0) {
    const requestedName = requestedTokens
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return [{
      id: `unavail_${requestedName.toLowerCase()}`,
      name: requestedName,
      price: null,
      inStock: false,
      isUnavailable: true,
      emoji: '📦'
    }];
  }

  return [];
}
