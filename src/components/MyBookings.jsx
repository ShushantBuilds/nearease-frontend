import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Star, Printer, FileText } from "lucide-react";
import { BookingAPI } from "../services/bookingApi"; 
import ReviewModal from "./ReviewModal";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  // --- CANCELLATION OTP STATE ---
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelOtp, setCancelOtp] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await BookingAPI.getAllBookings();
        setBookings(Array.isArray(data) ? data : []); 
      } catch (err) {
        setError("Failed to load your bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // STEP 1: Request the Cancellation (Triggers OTP Email)
  const handleInitiateCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await BookingAPI.requestCancel(bookingId);
      // If successful, open the OTP modal
      setCancellingBookingId(bookingId);
    } catch (err) {
      // THE FIX: Display the exact error message from the Spring Boot backend
      alert(err.message || "Failed to initiate cancellation.");
    }
  };

  // STEP 2: Confirm the Cancellation with OTP
  const handleConfirmCancel = async () => {
    if (!cancelOtp || cancelOtp.length < 4) return alert("Please enter a valid OTP.");
    setIsSubmittingCancel(true);
    
    try {
      await BookingAPI.confirmCancel(cancellingBookingId, cancelOtp);
      
      setCancelMessage("Booking successfully cancelled.");
      
      // Permanently update the local UI state now that the database is updated
      setBookings(bookings.map(b => b.id === cancellingBookingId ? { ...b, bookingStatus: "CANCELLED" } : b));
      
      setTimeout(() => {
        setCancellingBookingId(null);
        setCancelOtp("");
        setCancelMessage("");
      }, 2000);
      
    } catch (err) {
      // THE FIX: Display the exact error message from the backend
      alert(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const printBill = (booking) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>NearEase Invoice #${booking.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #4f46e5; margin: 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-size: 20px; font-weight: bold; border-top: 2px solid #eee; padding-top: 15px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo">NearEase</h1>
            <p>Official Service Invoice</p>
          </div>
          <div class="row"><strong>Order ID:</strong> <span>#${booking.id}</span></div>
          <div class="row"><strong>Date:</strong> <span>${new Date(booking.scheduledTime).toLocaleString()}</span></div>
          <div class="row"><strong>Service:</strong> <span>${booking.ServiceName || 'Service'}</span></div>
          <div class="row"><strong>Provider:</strong> <span>${booking.provider?.name || 'N/A'}</span></div>
          <div class="row"><strong>Location:</strong> <span>${booking.workLocation}</span></div>
          <div class="row total"><strong>Total Paid:</strong> <span>₹${booking.price || 0}</span></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-10 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
              
              {/* STATUS BANNERS */}
              {booking.bookingStatus === "PENDING" && (
                <div className="bg-yellow-50 text-yellow-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-yellow-100">
                  <Clock size={16} /> Request sent. Waiting for provider approval.
                </div>
              )}
              {booking.bookingStatus === "CONFIRMED" && (
                <div className="bg-blue-50 text-blue-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-blue-100">
                  <CheckCircle size={16} /> Your service request has been accepted!
                </div>
              )}
              {booking.bookingStatus === "COMPLETED" && (
                <div className="bg-green-50 text-green-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-green-100">
                  <CheckCircle size={16} /> The service has been completed.
                </div>
              )}
              {booking.bookingStatus === "REJECTED" && (
                <div className="bg-red-50 text-red-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-red-100">
                  <XCircle size={16} /> Your request has been rejected by the provider.
                </div>
              )}
              {booking.bookingStatus === "CANCELLED" && (
                <div className="bg-gray-100 text-gray-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-gray-200">
                  <AlertCircle size={16} /> This booking was cancelled.
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.ServiceName || "Service Booking"}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1">Booking ID: #{booking.id}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm text-gray-500 font-medium mb-1">Total Price</p>
                     <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{booking.price || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
                  <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><span className="block font-semibold text-gray-900 dark:text-gray-100">Scheduled Time</span>{new Date(booking.scheduledTime).toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><span className="block font-semibold text-gray-900 dark:text-gray-100">Location</span>{booking.workLocation}</span>
                  </p>
                  
                  {(booking.CostumerRequest || booking.customerRequest) && (
                    <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2 md:col-span-2">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <span><span className="block font-semibold text-gray-900 dark:text-gray-100">Your Note</span>{booking.CostumerRequest || booking.customerRequest}</span>
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 pt-2">
                  {(booking.bookingStatus === "PENDING" || booking.bookingStatus === "CONFIRMED") && (
                    <button 
                      onClick={() => handleInitiateCancel(booking.id)} 
                      className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {booking.bookingStatus === "COMPLETED" && (
                    <>
                      <button onClick={() => printBill(booking)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <Printer size={18} /> Print Bill
                      </button>
                      
                      {!booking.hasReviewed && (
                        <button 
                          onClick={() => { setSelectedBookingForReview(booking); setReviewModalOpen(true); }}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <Star size={18} className="fill-green-700" /> Leave Review
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CANCELLATION OTP MODAL (GLASSMORPHISM) --- */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
            
            {/* Background glowing orb for glass effect */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500 rounded-full blur-3xl opacity-20"></div>

            {cancelMessage ? (
              <div className="py-6 animate-in zoom-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle className="text-white w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{cancelMessage}</h3>
              </div>
            ) : (
              <>
                <button onClick={() => setCancellingBookingId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white z-10">
                  <XCircle size={24} />
                </button>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-red-600 dark:text-red-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Cancellation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Please enter the 4-digit OTP sent to your email to safely cancel this booking.</p>
                
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={cancelOtp}
                  onChange={(e) => setCancelOtp(e.target.value)}
                  className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-white/50 bg-white/50 dark:bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6 shadow-inner"
                  maxLength={6}
                />
                
                <button 
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex justify-center items-center"
                >
                  {isSubmittingCancel ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Cancel"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <ReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)} 
        booking={selectedBookingForReview}
        onSuccess={(bookingId) => setBookings(bookings.map(b => b.id === bookingId ? { ...b, hasReviewed: true } : b))}
      />
    </div>
  );
}