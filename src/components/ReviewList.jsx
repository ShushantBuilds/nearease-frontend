import React, { useState, useEffect } from "react";
import { Star, User, Loader2, MessageSquare } from "lucide-react";
import { UserAPI } from "../services/userApi";

export default function ReviewList({ providerId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (providerId) {
      UserAPI.getProviderReviews(providerId)
        .then(data => setReviews(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to load reviews", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No reviews yet</h3>
        <p className="text-gray-500 text-sm mt-1">Book this service and be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
        <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.map((review, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 transition hover:shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner">
                  {review.customerName?.charAt(0).toUpperCase() || <User size={18} />}
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">
                    {review.customerName || "Verified Customer"}
                  </span>
                  {review.createdAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex text-yellow-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < review.rating ? "fill-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                ))}
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}