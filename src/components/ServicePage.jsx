import React, { useState, useEffect } from "react";
import { Star, MapPin, ShoppingCart, CreditCard, ArrowLeft, Send, Phone, MessageCircle } from "lucide-react";

export default function ServicePage({ service, onBack, onProceedToPayment }) {
  const [previewImage, setPreviewImage] = useState(0);
  const [bookingState, setBookingState] = useState("idle"); 
  const [reviewText, setReviewText] = useState("");

  const handleBooking = () => {
    setBookingState("cart");
    setTimeout(() => { setBookingState("payment"); }, 2000);
  };

  const submitReview = () => {
    if(!reviewText) return alert("Please write a review first.");
    alert("Review submitted successfully! Pending approval.");
    setReviewText("");
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium mb-8 transition cursor-pointer">
        <ArrowLeft size={20} /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Gallery & Reviews */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md">
              <img src={service.images[previewImage]} alt={service.name} className="w-full h-full object-cover animate-in fade-in duration-300" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {service.images.map((img, idx) => (
                <button key={idx} onClick={() => setPreviewImage(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${previewImage === idx ? 'border-indigo-600 opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review the Service</h3>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="How was your experience with this provider?" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:border-indigo-500 transition min-h-[120px] mb-4 dark:text-white placeholder-gray-400"></textarea>
            <button onClick={submitReview} className="flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition cursor-pointer">
              <Send size={16} /> Submit Review
            </button>
          </div>
        </div>

        {/* Right Column: Details, Comms, Map, Ratings & Booking */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4">
            <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold px-3 py-1 rounded-full uppercase tracking-wide text-xs w-fit">
              {service.mainCategory}
            </span>
            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full uppercase tracking-wide text-xs w-fit">
              {service.subCategory}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">{service.name}</h1>
          <div className="flex flex-col gap-1 mb-6">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium text-lg">
              <MapPin size={20} className="text-red-400 shrink-0" /> {service.address}
            </p>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 text-lg">{service.description}</p>

          {/* Communication Buttons */}
          <div className="flex gap-4 mb-8">
            <a href={`tel:${service.contactNumber}`} className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-400 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl transition flex justify-center items-center gap-2 cursor-pointer shadow-sm">
              <Phone size={20} className="text-indigo-600 dark:text-indigo-400" /> Call Now
            </a>
            <a href={`https://wa.me/${service.contactNumber?.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-2xl transition flex justify-center items-center gap-2 cursor-pointer shadow-sm">
              <MessageCircle size={20} /> WhatsApp
            </a>
          </div>

          {/* Google Maps Embed */}
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-inner mb-8 border border-gray-100 dark:border-gray-700">
             <iframe 
               src={service.mapLocation} 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen="" 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title={`${service.name} Location`}
             ></iframe>
          </div>

          {/* Amazon Inspired Ratings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => ( <Star key={i} size={28} className={i < Math.floor(service.rating) ? "fill-current" : "text-gray-300 dark:text-gray-600"} /> ))}
              </div>
              <span className="text-3xl font-bold dark:text-white">{service.rating}</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium ml-auto">{service.reviews} global ratings</span>
            </div>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center text-sm font-medium text-indigo-900 dark:text-indigo-100 group cursor-pointer hover:opacity-80 transition">
                  <span className="w-14 text-blue-600 dark:text-blue-400 underline decoration-blue-600/30">{star} star</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-6 rounded-md mx-4 overflow-hidden shadow-inner">
                    <div className="bg-yellow-400 h-full rounded-md transition-all duration-1000 ease-out" style={{ width: `${service.ratingData?.[star] || 0}%` }}></div>
                  </div>
                  <span className="w-12 text-right text-gray-500 dark:text-gray-400">{service.ratingData?.[star] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Action */}
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
            {bookingState === "idle" && ( <button onClick={handleBooking} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition shadow-xl text-xl flex justify-center items-center gap-3 transform hover:-translate-y-1 cursor-pointer">Book Now</button> )}
            {bookingState === "cart" && ( <button disabled className="w-full bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-xl text-xl flex justify-center items-center gap-3 animate-pulse cursor-not-allowed"><ShoppingCart size={24} className="animate-bounce" /> Moving to Cart...</button> )}
            {bookingState === "payment" && ( <button onClick={() => onProceedToPayment(service)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition shadow-xl text-xl flex justify-center items-center gap-3 animate-in slide-in-from-bottom-2 cursor-pointer"><CreditCard size={24} /> Proceed to Payment</button> )}
          </div>
        </div>
      </div>
    </div>
  );
}