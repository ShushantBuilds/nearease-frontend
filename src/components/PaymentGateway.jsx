import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, ShieldCheck, XCircle } from "lucide-react";
import { PaymentAPI } from "../services/paymentApi";
import { BookingAPI } from "../services/bookingApi";

// Helper to load the Razorpay SDK script asynchronously
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentGateway({ service, checkoutData, onComplete, onFail }) {
  const [status, setStatus] = useState("initializing"); // 'initializing', 'processing', 'success', 'failed'
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializePayment = async () => {
      // 1. Load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        setErrorMessage("Failed to load Razorpay SDK. Check your internet connection.");
        setStatus("failed");
        return;
      }

      try {
        // 2. Create the Booking in your Database FIRST
        // We must have a Booking ID before we can create a Payment Order
        const bookingPayload = {
          serviceOfferingId: service.id,
          scheduleTime: `${checkoutData.bookingDate}T${checkoutData.bookingTime}:00`,
          workLocation: `${checkoutData.street}, ${checkoutData.apt ? checkoutData.apt + ', ' : ''}${checkoutData.city}, ${checkoutData.state} ${checkoutData.zip}`,
          customerRequest: "Standard Booking"
        };

        const bookingResponse = await BookingAPI.bookService(bookingPayload);
        
        // Extract the ID safely based on how your backend returns it
        const bookingId = bookingResponse.id || bookingResponse.bookingId || bookingResponse.data?.id;
        if (!bookingId) throw new Error("Failed to generate Booking ID from server.");

        // 3. Create the Razorpay Order via your Spring Boot Backend
        const orderData = await PaymentAPI.createOrder(bookingId);

        // 4. Configure and Open the Razorpay Modal
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_PUBLIC_KEY", // Add your key to .env
          amount: orderData.amountInPaise,
          currency: orderData.currency || "INR",
          name: "NearEase",
          description: `Payment for ${service.name || "Service"}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            // Payment Success Handler
            setStatus("processing");
            
            // Here you can send response.razorpay_signature to backend for extra verification
            // For now, we update the booking status directly to CONFIRMED
            await BookingAPI.updateStatus(bookingId, { status: "CONFIRMED" });
            setStatus("success");
          },
          prefill: {
            name: orderData.customerName || `${checkoutData.firstName} ${checkoutData.lastName}`,
            email: orderData.customerEmail || checkoutData.email,
            contact: orderData.customerPhone || checkoutData.phone
          },
          theme: { color: "#4f46e5" }, // Indigo-600 to match your UI
          modal: {
            ondismiss: function() {
              setErrorMessage("Payment was cancelled by the user.");
              setStatus("failed");
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

      } catch (error) {
        console.error("Payment Error:", error);
        setErrorMessage(error.message || "Failed to initialize payment gateway.");
        setStatus("failed");
      }
    };

    if (service && checkoutData) {
      initializePayment();
    } else {
      setErrorMessage("Missing booking or checkout details.");
      setStatus("failed");
    }
  }, [service, checkoutData]);

  // Handle the success countdown
  useEffect(() => {
    if (status === "success") {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, onComplete]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center animate-in zoom-in-95">
        
        {status === "initializing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 size={64} className="text-indigo-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Connecting to Secure Gateway...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait while we initialize your transaction.</p>
          </div>
        )}

        {status === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <Loader2 size={64} className="text-indigo-600 animate-spin" />
              <ShieldCheck size={24} className="text-green-500 absolute bottom-0 right-0 bg-white rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Verifying Payment...</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Securing your transaction with the provider.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle size={80} className="text-green-500 mb-2" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Your booking has been securely confirmed.</p>
            
            <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 w-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to homepage in</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{countdown}s</p>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in slide-in-from-bottom-4">
            <XCircle size={80} className="text-red-500 mb-2" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Payment Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{errorMessage}</p>
            
            <button 
              onClick={onFail} 
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-md"
            >
              Return to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}