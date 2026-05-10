import React, { useState, useEffect } from "react";
import { Star, MapPin } from "lucide-react";

export default function ServiceCard({ item, onClick }) {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
    }, 3000 + Math.random() * 1000); 
    return () => clearInterval(timer);
  }, [item.images.length]);

  return (
    <div onClick={() => onClick(item)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {item.images.map((img, i) => (
          <img 
            key={i} src={img} alt={item.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === imgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          />
        ))}
        <span className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
          {item.category?.name}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{item.name}</h4>
          <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg shrink-0 ml-2">
            <Star size={14} className="text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{item.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium mb-4">
          <MapPin size={16} className="text-red-400 shrink-0" /> {item.location}
        </p>
      </div>
    </div>
  );
}