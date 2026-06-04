import React, { useState } from "react";
import { ArrowLeft, MapPin, Calendar, FileText, CheckCircle, Loader2 } from "lucide-react";
import { BookingAPI } from "../services/bookingApi"; // Ensure this path is correct

export default function CheckoutPage({ service, onBack, onComplete }) {
  const [formData, setFormData] = useState({
    scheduleTime: "",
    workLocation: "",
    customerRequest: "",
    city: "Default City", // Update these based on your actual form needs
    state: "Default State",
    pinCode: "000000"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Mapping to your BookingRequestDto structure
      const bookingPayload = {
        serviceOfferingId: service.id,
        scheduleTime: new Date(formData.scheduleTime).toISOString(),
        workLocation: formData.workLocation,
        customerRequest: formData.customerRequest,
        city: formData.city,
        state: formData.state,
        pinCode: parseInt(formData.pinCode)
      };

      const response = await BookingAPI.bookService(bookingPayload);
      
      // Show the success screen with the returned Booking ID
      setSuccessData({ bookingId: response.id || Math.floor(Math.random() * 10000) });
    } catch (err) {
      setError("Failed to send service request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (successData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Request Sent Successfully!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Your service request has been sent to the provider. You will be notified in your Bookings tab once they accept the job.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-8 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Your Booking ID</p>
            <p className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">#{successData.bookingId}</p>
          </div>
          <button 
            onClick={onComplete} // Should trigger setActivePage("bookings") in App.jsx
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // --- CHECKOUT FORM ---
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-6 font-medium">
        <ArrowLeft size={20} /> Back to Service
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Complete Your Request</h1>
          <p className="text-indigo-100 mt-1">{service?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={18} className="text-indigo-500" /> Scheduled Date & Time
              </label>
              <input 
                type="datetime-local" required
                className="w-full p-3.5 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={18} className="text-indigo-500" /> Full Address
              </label>
              <input 
                type="text" required placeholder="House No, Street, Landmark..."
                className="w-full p-3.5 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={18} className="text-indigo-500" /> Customer's Note (Optional)
            </label>
            <textarea 
              rows="3" placeholder="Any specific instructions for the provider?"
              className="w-full p-3.5 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              onChange={(e) => setFormData({...formData, customerRequest: e.target.value})}
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Estimated Cost</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">₹{service?.price || 0}</span>
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 text-lg shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirm Booking Request"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Payment will be collected only after the service is completed.</p>
          </div>
        </form>
      </div>
    </div>
  );
}