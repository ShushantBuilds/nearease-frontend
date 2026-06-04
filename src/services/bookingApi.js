const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api/bookings";

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

// Standard headers for JSON requests
const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getAuthToken(); 
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to handle responses safely and throw actual errors
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

export const BookingAPI = {
  // Get all bookings for the logged-in customer
  getAllBookings: async () => {
    return fetchWithAuth(`${BASE_URL}/all-bookings`, { 
      headers: getHeaders() 
    });
  },

  // Get booking requests (Only for Providers)
  getBookingRequests: async () => {
    return fetchWithAuth(`${BASE_URL}/booking-requests`, { 
      headers: getHeaders() 
    });
  },

  // Book a new service
  bookService: async (bookingData) => {
    return fetchWithAuth(`${BASE_URL}/bookService`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingData), 
    });
  },

  // --- FIX 1: Send status as a URL Query Parameter, NOT JSON Body ---
  updateStatus: async (bookingId, statusData) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/status?status=${statusData.status}`, {
      method: "PUT",
      headers: getHeaders(),
      // We removed the JSON body because the backend reads from the URL
    });
  },

  // --- FIX 2: Handle FormData correctly without application/json headers ---
  completeBooking: async (bookingId, formData) => {
    const token = getAuthToken();
    return fetchWithAuth(`${BASE_URL}/${bookingId}/complete`, {
      method: "PUT",
      headers: { 
        // Notice we do NOT include "Content-Type": "application/json" here
        // The browser will automatically set the correct multipart/form-data boundary
        "Authorization": token ? `Bearer ${token}` : "" 
      },
      body: formData, // Pass FormData directly, DO NOT JSON.stringify it!
    });
  },

  // OTP Management for bookings
  sendBookingOtp: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/send-otp`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  },

  // Cancellation Flow
  requestCancel: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/cancel/request`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  },
  
  // --- FIX 3: Added the missing OTP parameter to match backend ---
  confirmCancel: async (bookingId, otp) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/cancel/confirm?otp=${otp}`, { 
      method: "POST", 
      headers: getHeaders() 
    });
  }
};