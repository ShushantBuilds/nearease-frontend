const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Helper function to safely extract the token from the saved user object
const getAuthToken = () => {
  const savedUser = localStorage.getItem("nearEaseUser");
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      return userObj.token; 
    } catch (e) {
      console.error("Failed to parse user from local storage");
      return null;
    }
  }
  return null;
};

// 1. Standard headers for JSON requests
const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getAuthToken(); // <-- FIXED: Now it successfully grabs the token!
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// 2. Auth headers ONLY (Used for image uploads so we don't break FormData)
const getAuthHeadersOnly = () => {
  const headers = {};
  const token = getAuthToken(); // <-- FIXED: Now it successfully grabs the token!
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// 3. Helper to handle responses and throw actual errors for your React catch blocks
const fetchWithAuth = async (url, options = {}) => {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    // Safely attempt to parse error messages (in case backend sends text instead of JSON)
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
  
  // Safely handle empty responses (like 200 OK with no body)
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const UserAPI = {
  // --- USER CONTROLLER ---
  getMyDetails: async () => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/me`, {
      method: "GET", 
      headers: getHeaders() 
    });
  },
  updateDetails: async (details) => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/update-details`, {
      method: "POST", // Make sure this matches your backend (POST vs PUT)
      headers: getHeaders(), 
      body: JSON.stringify(details)
    });
  },
  
  changePassword: async (passwordData) => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/changePassword`, {
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify(passwordData)
    });
  },

  updateProfileImage: async (formData) => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/profile-image`, {
      method: "POST", 
      headers: getAuthHeadersOnly(), // Sends token, lets browser handle Content-Type
      body: formData
    });
  },

  requestEmailUpdate: async (emailData) => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/request-email-update`, {
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify(emailData)
    });
  },

  verifyEmailUpdate: async (verificationData) => {
    return fetchWithAuth(`${BASE_URL}/api/user-update/verify-email-update`, {
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify(verificationData)
    });
  },

 submitReview: async (bookingId, reviewData) => {
    const REVIEW_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api/reviews/new/review";
    return fetchWithAuth(`${REVIEW_URL}?bookingId=${bookingId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(reviewData)
    });
  },

  getMyReviews: async () => {
    return fetchWithAuth(`${BASE_URL}/api/reviews/my-reviews`, { 
      headers: getHeaders() 
    });
  },

  getProviderReviews: async (providerId) => {
    return fetchWithAuth(`${BASE_URL}/api/reviews/provider/${providerId}`, { 
      headers: getHeaders() 
    });
  },

  uploadImage: async (formData) => {
    return fetchWithAuth(`${BASE_URL}/api/images/upload`, {
      method: "POST",
      headers: getAuthHeadersOnly(), 
      body: formData 
    });
  },

  globalSearch: async (searchParams) => {
    return fetchWithAuth(`${BASE_URL}/api/services/search`, {
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify(searchParams)
    });
  }
};