import React from "react";
import { MapPin, X, ArrowRight } from "lucide-react";

export default function PreviewModal({ listing, onClose, onProceedToDetails }) {
  if (!listing) return null;

  const displayImage = listing.imageUrl || (listing.images && listing.images[0]) || "https://via.placeholder.com/400x300";

  return (
    // Glassmorphism Background
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl text-gray-900 dark:text-white flex flex-col">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full shadow-md transition cursor-pointer">
          <X size={20} />
        </button>

        <div className="h-64 w-full">
          <img src={displayImage} alt="Cover" className="w-full h-full object-cover" />
        </div>

        <div className="p-8 flex flex-col gap-3">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs">
            {listing.serviceType?.category?.name || "Service"}
          </span>
          <h3 className="text-2xl font-extrabold line-clamp-2">{listing.name || listing.serviceType?.name}</h3>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">
            <MapPin size={18} className="text-red-500" /> {listing.location || listing.provider?.address}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
            {listing.description || "Experience top-tier service provided by verified professionals. Click below to see full details, reviews, and to book your slot."}
          </p>

          <button 
            onClick={() => {
              onProceedToDetails(listing);
              onClose();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2 cursor-pointer"
          >
            View Full Details <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}