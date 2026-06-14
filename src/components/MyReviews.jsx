import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, Calendar, User as UserIcon, CornerDownRight, CheckCircle2, Edit3 } from "lucide-react";
import { UserAPI } from "../services/userApi"; 
import GoBackButton from "./GoBackButton";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // States for Replying
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const data = await UserAPI.getMyReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
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

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return window.alert("Reply cannot be empty.");
    setIsSubmittingReply(true);

    try {
      const user = JSON.parse(localStorage.getItem("nearEaseUser"));
      const res = await fetch(`${BASE_URL}/api/reviews/reply-review/${reviewId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (!res.ok) throw new Error("Failed to post reply.");

      // Instantly update the UI without reloading
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, providerReply: replyText } : r));
      setReplyingTo(null);
      setReplyText("");
      window.alert("Reply posted successfully!");

    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Helper to open the edit box and pre-fill existing text
  const openReplyBox = (reviewId, existingReply) => {
    setReplyingTo(reviewId);
    setReplyText(existingReply || "");
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
  if (errorMsg) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500 font-bold">{errorMsg}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GoBackButton/>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl"><Star className="w-8 h-8 text-yellow-500 fill-current" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Feedback</h1>
          <p className="text-gray-500">Respond to reviews and ratings from your customers.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No reviews received yet</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition hover:shadow-md">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-black">
                     {review.customerName?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-900 dark:text-white">{review.customerName || "Anonymous Client"}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{review.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 px-3 py-1 rounded-xl border border-gray-100 dark:border-gray-700">
                  <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1.5" />
                  <span className="font-bold text-gray-900 dark:text-white">{review.rating}.0</span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-gray-200 dark:border-gray-600 pl-4 mb-4">
                "{review.comment || "Rated without a written comment."}"
              </p>

              <div className="flex justify-between items-center mb-4 mt-2">
                 <p className="text-xs text-gray-400 font-mono">Booking ID: #{review.bookingId}</p>
                 {review.bookingDate && (
                   <p className="text-xs text-gray-400 flex items-center gap-1">
                     <Calendar size={12} />
                     {new Date(review.bookingDate).toLocaleDateString()}
                   </p>
                 )}
              </div>

              {/* THE ENHANCED REPLY SECTION */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                {replyingTo === review.id ? (
                  
                  // EDIT / WRITE MODE
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 animate-in slide-in-from-top-2 border border-gray-200 dark:border-gray-700">
                    <textarea 
                      autoFocus
                      rows={3}
                      placeholder="Write your response to the customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 mb-3 text-sm resize-none shadow-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                      <button onClick={() => handleReplySubmit(review.id)} disabled={isSubmittingReply} className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2 shadow-sm">
                        {isSubmittingReply ? <Loader2 size={16} className="animate-spin"/> : "Post Reply"}
                      </button>
                    </div>
                  </div>

                ) : (

                  // VIEW MODE
                  <div className="flex flex-col gap-3">
                    {review.providerReply && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in border border-indigo-100 dark:border-indigo-800/50">
                        <CornerDownRight className="text-indigo-400 shrink-0 mt-1" size={18} />
                        <div className="flex-1">
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                             Provider Response <CheckCircle2 size={12}/>
                          </p>
                          <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">{review.providerReply}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* The smart toggle button (Edit vs Reply) */}
                    <button 
                      onClick={() => openReplyBox(review.id, review.providerReply)} 
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 transition w-fit px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                    >
                      {review.providerReply ? (
                        <><Edit3 size={16} /> Edit Reply</>
                      ) : (
                        <><CornerDownRight size={16} /> Reply to Customer</>
                      )}
                    </button>
                  </div>

                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}