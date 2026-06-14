import React from "react";
import { Star, MapPin } from "lucide-react";

export default function ServiceCard({ item, onCardClick, onPreviewClick }) {
  const displayImage = item.imageUrl || (item.images && item.images[0]) || "https://via.placeholder.com/400x300?text=No+Image";
  
  // THE FIX: Smart check for average rating. Returns "New" if 0 or null.
  const getRating = () => {
    const avg = item.provider?.averageRating || item.providerProfile?.averageRating || item.rating;
    return avg > 0 ? Number(avg).toFixed(1) : "New";
  };

  const ratingValue = getRating();

  return (
    <div 
      onClick={() => onCardClick(item)} 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img src={displayImage} alt={item.name || "Service"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2">
            {item.name || item.serviceType?.name || "Professional Service"}
          </h3>
          <div className={`flex items-center px-2 py-1 rounded-lg shrink-0 ${ratingValue === "New" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-yellow-50 dark:bg-yellow-900/30"}`}>
            <Star size={14} className={`${ratingValue === "New" ? "text-amber-500" : "text-yellow-500 fill-current"} mr-1`} />
            <span className={`text-sm font-bold ${ratingValue === "New" ? "text-amber-700 dark:text-amber-400" : "text-yellow-700 dark:text-yellow-500"}`}>
              {ratingValue}
            </span>
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium mb-4">
          <MapPin size={16} className="text-red-400 shrink-0" /> {item.location || item.provider?.address || "Remote / On-site"}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="font-extrabold text-lg text-gray-900 dark:text-white">₹{item.price || 0}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onPreviewClick(item); }}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}