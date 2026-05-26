import React, { useState, useEffect } from "react";
import { Star, MapPin, ShoppingCart, ArrowLeft, Send, Phone, MessageCircle, Flashlight } from "lucide-react";
import PortfolioGallery from "./PortfolioGallery";

export default function ServicePage({ service, onBack, onProceedToCheckout }) {
  const [previewImage, setPreviewImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Safely extract images whether they come as a single string or an array from Spring Boot
  const images = service?.images?.length > 0 
    ? service.images 
    : (service?.imageUrl ? [service.imageUrl] : ["https://via.placeholder.com/800x400?text=No+Image"]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAddToCart = () => {
    setIsAddedToCart(true);
    // In the future, you will dispatch this to a Cart Context or Redux store
    setTimeout(() => setIsAddedToCart(false), 3000); 
  };

  const submitReview = () => {
    if(!reviewText) return alert("Please write a review first.");
    alert("Review submitted successfully! Pending approval.");
    setReviewText("");
  };

  if (!service) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 font-medium mb-8 transition cursor-pointer">
        <ArrowLeft size={20} /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Gallery & Reviews */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md">
              <img src={images[previewImage]} alt={service.name} className="w-full h-full object-cover animate-in fade-in duration-300" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setPreviewImage(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${previewImage === idx ? 'border-indigo-600 opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review the Service</h3>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="How was your experience with this provider?" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:border-indigo-500 transition min-h-[120px] mb-4 dark:text-white placeholder-gray-400"></textarea>
            <button onClick={submitReview} className="flex items-center gap-2 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl transition cursor-pointer">
              <Send size={16} /> Submit Review
            </button>
          </div>
        </div>

        {/* Right Column: Details & Booking */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4">
            <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold px-3 py-1 rounded-full uppercase tracking-wide text-xs w-fit">
              {service.serviceType?.category?.name || "Service"}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
            {service.name || service.serviceType?.name || "Professional Service"}
          </h1>
          
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium text-lg">
              <MapPin size={20} className="text-red-400 shrink-0" /> {service.location || service.provider?.address || "Remote / On-site"}
            </p>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{service.price || 0}</p>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 text-lg">
            {service.description || "High quality service guaranteed. Please review the portfolio below and book a slot that works for you."}
          </p>

          <div className="mb-8">
            <PortfolioGallery providerId={service?.provider?.id} />
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleAddToCart} 
              disabled={isAddedToCart}
              className={`w-full py-4 rounded-2xl font-bold transition shadow-sm text-lg flex justify-center items-center gap-3 cursor-pointer ${isAddedToCart ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-600'}`}
            >
              <ShoppingCart size={20} /> {isAddedToCart ? "Added to Cart!" : "Add to Cart"}
            </button>
            
            <button 
              onClick={() => onProceedToCheckout(service)} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition shadow-xl text-lg flex justify-center items-center gap-3 transform hover:-translate-y-1 cursor-pointer"
            >
              <Flashlight size={20} /> Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}