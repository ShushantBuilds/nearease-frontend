import React, { useState } from "react";
import { ArrowLeft, MapPin, Calendar, FileText, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { BookingAPI } from "../services/bookingApi"; 

export default function CheckoutPage({ service, onBack, onComplete }) {
  const [formData, setFormData] = useState({
    scheduleTime: "",
    workLocation: "",
    customerRequest: "",
    city: "Default City", 
    state: "Default State",
    pinCode: "000000"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  const platformFee = 50;
  const servicePrice = service?.price || 0;
  const totalEstimatedCost = servicePrice + platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const bookingPayload = {
        serviceOfferingId: service.id,
        scheduleTime: new Date(formData.scheduleTime).toISOString(),
        workLocation: formData.workLocation,
        customerRequest: formData.customerRequest,
        city: formData.city,
        state: formData.state,
        pinCode: parseInt(formData.pinCode),
        totalPrice: totalEstimatedCost 
      };

      const response = await BookingAPI.bookService(bookingPayload);
      setSuccessData({ bookingId: response.id || Math.floor(Math.random() * 10000) });
    } catch (err) {
      // THE FIX: Use the Global Alert to display backend rejections!
      window.alert(err.message || "Failed to send service request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <button onClick={onComplete} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition mb-6 font-medium">
        <ArrowLeft size={20} /> Back to Service
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Complete Your Request</h1>
          <p className="text-indigo-100 mt-1">{service?.name || service?.serviceType?.name || "Service Booking"}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={18} className="text-indigo-500" /> Scheduled Date & Time
              </label>
              {/* BEAUTIFIED NATIVE INPUT */}
              <div className="relative">
                <input 
                  type="datetime-local" required
                  className="w-full p-3.5 pl-4 pr-10 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 font-medium transition-all shadow-sm hover:border-indigo-300 cursor-pointer"
                  onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin size={18} className="text-indigo-500" /> Full Address
              </label>
              <input 
                type="text" required placeholder="House No, Street, Landmark..."
                className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 font-medium transition-all shadow-sm hover:border-indigo-300"
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
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-700 dark:text-gray-200 font-medium shadow-sm transition-all hover:border-indigo-300"
              onChange={(e) => setFormData({...formData, customerRequest: e.target.value})}
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            
            {/* PLATFORM FEE BREAKDOWN */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-6 border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                 <span>Service Cost</span>
                 <span className="font-semibold text-gray-700 dark:text-gray-300">₹{servicePrice}</span>
               </div>
               <div className="flex justify-between items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                 <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500"/> Secure Escrow Fee</span>
                 <span className="font-semibold text-gray-700 dark:text-gray-300">₹{platformFee}</span>
               </div>
               <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                 <span className="text-gray-700 dark:text-gray-200 font-bold">Total Estimated Cost</span>
                 <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{totalEstimatedCost}</span>
               </div>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 text-lg shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Confirm Booking Request"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Payment will be securely collected after provider accepts.</p>
          </div>
        </form>
      </div>
    </div>
  );
}