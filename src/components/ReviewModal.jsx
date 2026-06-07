import React, { useState } from "react";
import { Star, X, Loader2, CheckCircle } from "lucide-react";
import { UserAPI } from "../services/userApi";

export default function ReviewModal({ isOpen, onClose, booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  // THE FIX: Robustly extract the provider's name to display in the UI
  const providerName = booking.provider?.name || booking.serviceOffering?.provider?.name || 
    (booking.serviceOffering?.provider?.user?.firstName ? `${booking.serviceOffering.provider.user.firstName}` : "the provider");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating!");

    setIsSubmitting(true);
    try {
      // THE FIX: Securely extract the Provider ID from the nested object!
      const finalProviderId = booking.provider?.id || booking.serviceOffering?.provider?.id;

      const payload = {
        bookingId: booking.id,
        booking_id: booking.id,
        providerId: finalProviderId,
        provider_id: finalProviderId,
        serviceOfferingId: booking.serviceOffering?.id,
        rating: rating,
        comment: comment,
        review: comment
      };

      await UserAPI.submitReview(booking.id, payload);

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(booking.id); 
        handleClose();
      }, 2000); 
    } catch (err) {
      alert("Failed to submit review. Please check console or try again.");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {isSuccess ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Submitted!</h2>
            <p className="text-gray-500 mt-2">Thank you for sharing your experience.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate your experience</h2>
                <p className="text-sm text-gray-500">How was the service from {providerName}?</p>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white dark:bg-gray-700 rounded-full shadow-sm transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        size={36} 
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "fill-gray-100 text-gray-200 dark:fill-gray-700 dark:text-gray-600"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-500">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Great" : rating === 5 ? "Excellent!" : "Select a rating"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Write a Review</label>
                <textarea 
                  rows="4" 
                  placeholder="What did you like or dislike? Would you recommend them?"
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || rating === 0}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}