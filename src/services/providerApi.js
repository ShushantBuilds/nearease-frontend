const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PROVIDER_URL = `${BASE_URL}/api/provider`;

// Helper function to safely extract the token from local storage
const getAuthToken = () => {
  const savedUser = localStorage.getItem("nearEaseUser");
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      return userObj.token; // Ensure your backend sends it as 'token'
    } catch (e) {
      console.error("Failed to parse user from local storage");
      return null;
    }
  }
  return null;
};

// 1. Standard headers for JSON requests (FIXED: Now includes the token!)
const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getAuthToken(); 
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// 2. Helper to handle responses safely and throw actual errors
const fetchWithAuth = async (url, options = {}) => {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const ProviderAPI = {
  // Apply to become a provider
  apply: async (applicationData) => {
    return fetchWithAuth(`${PROVIDER_URL}/apply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(applicationData), // { bio, skills, experience, address }
    });
  },

  // Add a new service offering
  addService: async (serviceData) => {
    return fetchWithAuth(`${PROVIDER_URL}/addService`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(serviceData), // { serviceTypeId, price, description, image }
    });
  },

  // Get Provider Dashboard stats
  getDashboard: async () => {
    return fetchWithAuth(`${PROVIDER_URL}/my/DashBoard`, { 
      headers: getHeaders() 
    });
  },

  // Portfolio Management
  getMyPortfolio: async () => {
    return fetchWithAuth(`${PROVIDER_URL}/my-portfolio`, { 
      headers: getHeaders() 
    });
  },

  deletePortfolioImage: async (bookingId) => {
    return fetchWithAuth(`${PROVIDER_URL}/my-portfolio/${bookingId}/images`, { 
      method: "DELETE", 
      headers: getHeaders() 
    });
  },

  // Admin Route: Approve a provider
  approveProvider: async (providerId) => {
    return fetchWithAuth(`${BASE_URL}/api/admin/provider/approve/${providerId}`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  }
};