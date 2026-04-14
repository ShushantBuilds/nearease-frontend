const BASE_URL = "http://192.168.1.15:8080/api/public";

export const PublicAPI = {
  // 1. Get main categories (e.g., Semi-Luxurious, Luxurious)
  getCategories: async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories/`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json(); 
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 2. Get types under a specific category
  getTypesByCategory: async (categoryName) => {
    try {
      const response = await fetch(`${BASE_URL}/categories/${categoryName}/types`);
      if (!response.ok) throw new Error("Failed to fetch types");
      return await response.json(); 
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 3. Get provider offerings for a specific type ID
  getOfferingsByType: async (typeId) => {
    try {
      const response = await fetch(`${BASE_URL}/type/${typeId}/offering`);
      if (!response.ok) throw new Error("Failed to fetch offerings");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 4. Get a specific provider's portfolio (images, etc.)
  getProviderPortfolio: async (providerId) => {
    try {
      const response = await fetch(`${BASE_URL}/providers/${providerId}/portfolio`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};