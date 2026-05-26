const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const PublicAPI = {
  // 1. Get main categories (e.g., Semi-Luxurious, Luxurious)
  getCategories: async () => {
    try {
      // Notice the added /api/public and the trailing slash!
      const response = await fetch(`${BASE_URL}/api/public/categories/`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json(); 
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  },

  // 2. Get types under a specific category
  getTypesByCategory: async (categoryName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/public/categories/${categoryName}/types`);
      if (!response.ok) throw new Error("Failed to fetch types");
      return await response.json(); 
    } catch (error) {
      console.error("Error in getTypesByCategory:", error);
      return [];
    }
  },

  getAllOfferings: async () => {
    // Replace with your actual backend endpoint for all services
    const res = await fetch(`${BASE_URL}/api/public/services/all`); 
    if (!res.ok) throw new Error("Failed to fetch all services");
    return res.json();
  },

  // 3. Get provider offerings for a specific type ID
  getOfferingsByType: async (typeId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/public/type/${typeId}/offering`);
      if (!response.ok) throw new Error("Failed to fetch offerings");
      return await response.json();
    } catch (error) {
      console.error("Error in getOfferingsByType:", error);
      return [];
    }
  },

  // 4. Get a specific provider's portfolio (images, etc.)
  getProviderPortfolio: async (providerId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/public/providers/${providerId}/portfolio`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return await response.json();
    } catch (error) {
      console.error("Error in getProviderPortfolio:", error);
      return [];
    }
  }
};