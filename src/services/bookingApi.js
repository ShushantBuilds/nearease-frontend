const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api/bookings";

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

const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getAuthToken(); 
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

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
  const data = text ? JSON.parse(text) : {};

  // THE FIX: Catch soft errors where the backend returns 200 OK but success is false
  if (data && data.success === false) {
     throw new Error(data.message || "Action failed on the server.");
  }

  return data;
};

export const BookingAPI = {
  getAllPlatformBookings: async () => {
    return fetchWithAuth(`${BASE_URL}/admin/all-bookings`, { headers: getHeaders() });
  },

  getAllBookings: async () => {
    return fetchWithAuth(`${BASE_URL}/all-bookings`, { headers: getHeaders() });
  },

  getBookingRequests: async () => {
    return fetchWithAuth(`${BASE_URL}/booking-requests`, { headers: getHeaders() });
  },

  bookService: async (bookingData) => {
    return fetchWithAuth(`${BASE_URL}/bookService`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingData), 
    });
  },

  updateStatus: async (bookingId, statusData) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/status?status=${statusData.status}`, {
      method: "PUT",
      headers: getHeaders(),
    });
  },

  // THE FIX: Pass OTP cleanly as a query parameter so Spring Boot parses it correctly
  completeBooking: async (bookingId, formData) => {
    const token = getAuthToken();
    return fetchWithAuth(`${BASE_URL}/${bookingId}/complete`, {
      method: "PUT",
      headers: { 
        // We ONLY send Authorization. 
        // DO NOT set Content-Type; the browser must set it automatically for FormData!
        "Authorization": token ? `Bearer ${token}` : "" 
      },
      body: formData, 
    });
  },

  sendBookingOtp: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/send-otp`, { 
      method: "POST", headers: getHeaders() 
    });
  },

  requestCancel: async (bookingId) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/cancel/request`, { 
      method: "POST", headers: getHeaders() 
    });
  },
  
  confirmCancel: async (bookingId, otp) => {
    return fetchWithAuth(`${BASE_URL}/${bookingId}/cancel/confirm?otp=${otp}`, { 
      method: "POST", headers: getHeaders() 
    });
  }
};