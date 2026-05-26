import React from "react";
import { Star, MapPin } from "lucide-react";

export default function ServiceCard({ item, onCardClick, onPreviewClick }) {
  // Safely grab the image whether it's called imageUrl or images[0]
  const displayImage = item.imageUrl || (item.images && item.images[0]) || "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div 
      onClick={() => onCardClick(item)} 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img src={displayImage} alt={item.name || item.serviceType?.name || "Service"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2">
            {item.name || item.serviceType?.name || "Professional Service"}
          </h3>
          <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg shrink-0">
            <Star size={14} className="text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{item.rating || "New"}</span>
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium mb-4">
          <MapPin size={16} className="text-red-400 shrink-0" /> {item.location || item.provider?.address || "Remote / On-site"}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="font-extrabold text-lg text-gray-900 dark:text-white">₹{item.price || 0}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // CRITICAL: Stops the card click from firing
              onPreviewClick(item);
            }}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600 px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}