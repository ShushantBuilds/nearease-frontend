const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api/payments";

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

export const PaymentAPI = {
  createOrder: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/create-order/${bookingId}`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  },

  processPayout: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/payout/${bookingId}`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  },

  processRefund: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/refund/${bookingId}`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  }
};