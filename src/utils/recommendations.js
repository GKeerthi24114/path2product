export const RECOMMENDATIONS_MAP = {
  "Toothpaste": ["Soap", "Shampoo"],
  "Soap": ["Shampoo", "Detergent", "Toothpaste"],
  "Rice": ["Cooking Oil", "Sugar", "Vegetables"],
  "Cooking Oil": ["Rice", "Vegetables", "Sugar"],
  "Shampoo": ["Soap", "Detergent", "Toothpaste"],
  "Biscuits": ["Chocolates", "Tea Powder", "Coffee"],
  "Milk": ["Bread", "Biscuits", "Coffee"],
  "Bread": ["Milk", "Biscuits", "Sugar"],
  "Sugar": ["Tea Powder", "Coffee", "Rice"],
  "Tea Powder": ["Coffee", "Sugar", "Biscuits"],
  "Coffee": ["Tea Powder", "Sugar", "Milk"],
  "Detergent": ["Soap", "Shampoo"],
  "Chocolates": ["Biscuits", "Milk", "Coffee"],
  "Vegetables": ["Fruits", "Rice", "Cooking Oil"],
  "Fruits": ["Vegetables", "Rice"]
};

export const getRecommendations = (productName, allProducts = []) => {
  const recommendedNames = RECOMMENDATIONS_MAP[productName] || [];
  
  if (recommendedNames.length > 0) {
    return allProducts.filter(p => recommendedNames.includes(p.name));
  }
  
  // Fallback to same category
  const selectedProduct = allProducts.find(p => p.name === productName);
  if (selectedProduct) {
    return allProducts.filter(p => p.category === selectedProduct.category && p.name !== productName).slice(0, 3);
  }

  return allProducts.slice(0, 3); // Global fallback
};
