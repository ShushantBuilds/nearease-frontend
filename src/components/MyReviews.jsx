import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, Calendar, User as UserIcon } from "lucide-react";
import { UserAPI } from "../services/userApi"; 

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const data = await UserAPI.getMyReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        // Handle the specific backend exception cleanly, just in case
        if (error.message && error.message.includes("You are not Provider")) {
          setErrorMsg("You must be an approved Provider to view Client Feedback.");
        } else {
          setErrorMsg("Failed to load your reviews.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading client feedback...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
         <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-indigo-500 w-10 h-10 fill-current" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Provider Dashboard</h2>
         <p className="text-gray-500 text-lg">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
          <Star className="w-8 h-8 text-yellow-500 fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Feedback</h1>
          <p className="text-gray-500">Reviews and ratings you have received from your customers.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No reviews received yet</h3>
          <p className="text-gray-500">Provide excellent service to your clients to start earning 5-star ratings!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                
                {/* Service Info (Mapped directly from Spring Boot ProviderResponseDto) */}
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full flex items-center justify-center font-black">
                     {review.customerName?.charAt(0).toUpperCase() || <UserIcon size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {review.customerName || "Anonymous Client"}
                    </h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                      Service: {review.serviceName || "Completed Service"}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "fill-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{review.rating}.0</span>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700 mb-4" />

              {/* Review Comment */}
              {review.comment ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{review.comment}"
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                  The client left a star rating without a written comment.
                </p>
              )}

              <div className="flex justify-between items-center mt-4">
                 <p className="text-xs text-gray-400 font-mono">Booking ID: #{review.bookingId}</p>
                 {review.bookingDate && (
                   <p className="text-xs text-gray-400 flex items-center gap-1">
                     <Calendar size={12} />
                     {new Date(review.bookingDate).toLocaleDateString()}
                   </p>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}