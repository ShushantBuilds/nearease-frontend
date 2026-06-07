import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Star, Printer, FileText, DollarSign, Trash2, ShieldCheck } from "lucide-react";
import { BookingAPI } from "../services/bookingApi"; 
import { PaymentAPI } from "../services/paymentApi";
import ReviewModal from "./ReviewModal";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  
  const [hiddenIds, setHiddenIds] = useState(() => JSON.parse(localStorage.getItem("hiddenCustomerBookings") || "[]"));

  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelOtp, setCancelOtp] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (booking) => {
    setIsLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load. Are you online?");

      const orderData = await PaymentAPI.createOrder(booking.id);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.amountInPaise, 
        currency: orderData.currency,
        name: "NearEase",
        description: `Payment for ${booking.ServiceName}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // Include Razorpay Payment ID to help backend map it properly to avoid SQL constraints
            await PaymentAPI.confirmPaymentSuccess(booking.id, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
            });
            alert("Payment Successful! Your funds are secured in Escrow.");
            fetchBookings(); // Refresh the list to show the green Secured badge
          } catch (err) {
            alert("Payment succeeded, but we couldn't update the server. Don't worry, your money is safe. Please contact support.");
            fetchBookings(); // Fetch anyway, sometimes the webhook catches it
          }
        },
        prefill: { name: orderData.customerName, email: orderData.customerEmail, contact: orderData.customerPhone },
        theme: { color: "#4f46e5" } 
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      alert(error.message || "Failed to initiate payment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await BookingAPI.requestCancel(bookingId);
      setCancellingBookingId(bookingId);
    } catch (err) {
      alert(err.message || "Failed to initiate cancellation.");
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelOtp || cancelOtp.length < 4) return alert("Please enter a valid OTP.");
    setIsSubmittingCancel(true);
    try {
      await BookingAPI.confirmCancel(cancellingBookingId, cancelOtp);
      setCancelMessage("Booking successfully cancelled.");
      setBookings(bookings.map(b => b.id === cancellingBookingId ? { ...b, bookingStatus: "CANCELLED" } : b));
      setTimeout(() => {
        setCancellingBookingId(null);
        setCancelOtp("");
        setCancelMessage("");
      }, 2000);
    } catch (err) {
      alert(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // BEAUTIFIED INVOICE HTML
  const printBill = (booking) => {
    const printWindow = window.open('', '_blank');
    const servicePrice = booking.price || booking.serviceOffering?.price || 0;
    const platformFee = 50;
    const totalPaid = servicePrice + platformFee;
    const txnId = booking.transectionId || booking.transactionId || 'Awaiting Sync';

    printWindow.document.write(`
      <html>
        <head>
          <title>NearEase Invoice #${booking.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto;}
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;}
            .logo { font-size: 32px; font-weight: 900; color: #4f46e5; margin: 0; }
            .invoice-title { text-transform: uppercase; color: #888; font-weight: bold; letter-spacing: 2px;}
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .details-box { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #eee;}
            table { w-full; border-collapse: collapse; margin-bottom: 30px; width: 100%; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; color: #666; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .totals { text-align: right; margin-left: auto; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-size: 24px; font-weight: bold; color: #4f46e5; border-top: 2px solid #ddd; padding-top: 15px; margin-top: 10px;}
            .footer { text-align: center; color: #888; font-size: 14px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px;}
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo">NearEase</h1>
              <p style="margin:5px 0 0 0; color:#666;">Official Service Invoice</p>
            </div>
            <div class="invoice-title">INVOICE #${booking.id}</div>
          </div>

          <div class="details-grid">
            <div class="details-box">
              <strong>Billed To:</strong><br/>
              ${booking.customer?.firstName} ${booking.customer?.lastName}<br/>
              ${booking.workLocation}
            </div>
            <div class="details-box">
              <strong>Service Details:</strong><br/>
              <strong>Date:</strong> ${new Date(booking.scheduledTime).toLocaleString()}<br/>
              <strong>Provider:</strong> ${booking.provider?.name || 'N/A'}<br/>
              <strong>Transaction ID:</strong> <span style="font-family: monospace;">${txnId}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.ServiceName || booking.serviceOffering?.name || 'Professional Service'}</td>
                <td style="text-align:right;">₹${servicePrice}</td>
              </tr>
              <tr>
                <td>Platform Escrow & Safety Fee</td>
                <td style="text-align:right;">₹${platformFee}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${servicePrice}</span>
            </div>
            <div class="totals-row">
              <span>Platform Fee:</span>
              <span>₹${platformFee}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total Paid:</span>
              <span>₹${totalPaid}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for choosing NearEase.<br/>
            This is a computer-generated invoice and requires no signature.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteCard = (id) => {
    if(window.confirm("Are you sure you want to delete this booking from your view?")) {
      const updated = [...hiddenIds, id];
      setHiddenIds(updated);
      localStorage.setItem("hiddenCustomerBookings", JSON.stringify(updated));
    }
  };

  const visibleBookings = bookings.filter(b => !hiddenIds.includes(b.id));

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Bookings</h1>

      {visibleBookings.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-10 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleBookings.map((booking) => {
            const isPast = new Date(booking.scheduledTime) < new Date();
            const servicePrice = booking.price || booking.serviceOffering?.price || 0;
            const totalWithFee = servicePrice + 50;

            // Normalize Note Field 
            const note = booking.CostumerRequest || booking.customerRequest || booking.note;

            return (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md relative">
                
                <button onClick={() => handleDeleteCard(booking.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-full shadow-sm z-10" title="Delete from view">
                  <Trash2 size={18} />
                </button>

                {/* --- SMART STATUS BANNERS --- */}
                {booking.bookingStatus === "PENDING" && !isPast && (
                  <div className="bg-yellow-50 text-yellow-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-yellow-100">
                    <Clock size={16} /> Request sent. Waiting for provider approval.
                  </div>
                )}
                {booking.bookingStatus === "PENDING" && isPast && (
                  <div className="bg-gray-100 text-gray-600 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-gray-200">
                    <AlertCircle size={16} /> Request Expired. The scheduled time has passed without provider approval.
                  </div>
                )}
                
                {/* AFTER PAYMENT GREEN BADGE */}
                {booking.bookingStatus === "CONFIRMED" && booking.paymentStatus === "PAID_TO_PLATFORM" && (
                  <div className="bg-emerald-50 text-emerald-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-emerald-100">
                    <ShieldCheck size={16} /> Payment secured in Escrow. Waiting for provider to complete the job.
                  </div>
                )}
                
                {/* BEFORE PAYMENT BLUE BADGE */}
                {booking.bookingStatus === "CONFIRMED" && booking.paymentStatus !== "PAID_TO_PLATFORM" && (
                  <div className="bg-blue-50 text-blue-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-blue-100">
                    <CheckCircle size={16} /> Request accepted! Please complete payment to secure your slot.
                  </div>
                )}

                {booking.bookingStatus === "COMPLETED" && (
                  <div className="bg-green-50 text-green-800 px-6 py-3 font-medium text-sm flex items-center gap-2 border-b border-green-100">
                    <CheckCircle size={16} /> The service has been completed successfully.
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
                  <div className="flex justify-between items-start mb-4 pr-12">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.ServiceName || booking.serviceOffering?.name || "Service Booking"}</h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">Booking ID: #{booking.id}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm text-gray-500 font-medium mb-1">Total Estimated</p>
                       <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{totalWithFee}</p>
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
                    
                    {/* DISPLAY CUSTOMER NOTE */}
                    {note && (
                      <p className="text-gray-600 dark:text-gray-300 flex items-start gap-2 md:col-span-2">
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <span><span className="block font-semibold text-gray-900 dark:text-gray-100">Your Note</span>{note}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    
                    {booking.bookingStatus === "PENDING" && !isPast && (
                      <button onClick={() => handleInitiateCancel(booking.id)} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors">
                        Cancel Booking
                      </button>
                    )}

                    {/* ONLY SHOW PAY NOW IF IT HASN'T BEEN PAID YET */}
                    {booking.bookingStatus === "CONFIRMED" && booking.paymentStatus !== "PAID_TO_PLATFORM" && !isPast && (
                      <>
                        <button onClick={() => handleInitiateCancel(booking.id)} className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handlePayment(booking)} className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5">
                          <DollarSign size={18} /> Pay Now (₹{totalWithFee})
                        </button>
                      </>
                    )}
                    
                    {booking.bookingStatus === "COMPLETED" && (
                      <>
                        <button onClick={() => printBill(booking)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                          <Printer size={18} /> Print Bill
                        </button>
                        
                        {!booking.hasReviewed && (
                          <button onClick={() => { setSelectedBookingForReview(booking); setReviewModalOpen(true); }} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                            <Star size={18} className="fill-green-700" /> Leave Review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION MODAL LOGIC REMAINS THE SAME */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           {/* ... existing modal code ... */}
           <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
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
                <button onClick={() => setCancellingBookingId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white z-10"><XCircle size={24} /></button>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-red-600 dark:text-red-400 w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Cancellation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Please enter the 4-digit OTP sent to your email to safely cancel this booking.</p>
                <input type="text" placeholder="Enter OTP" value={cancelOtp} onChange={(e) => setCancelOtp(e.target.value)} className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-white/50 bg-white/50 dark:bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-6 shadow-inner" maxLength={6} />
                <button onClick={handleConfirmCancel} disabled={isSubmittingCancel} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex justify-center items-center">
                  {isSubmittingCancel ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Cancel"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} booking={selectedBookingForReview} onSuccess={(bookingId) => setBookings(bookings.map(b => b.id === bookingId ? { ...b, hasReviewed: true } : b))} />
    </div>
  );
}