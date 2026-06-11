import React, { useState, useEffect } from "react";
import { Image, Maximize2, X, ChevronLeft, ChevronRight, Loader2, Camera } from "lucide-react";
import { PublicAPI } from "../services/publicApi";

export default function PortfolioGallery({ providerId }) {
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox State
  const [selectedImgIndex, setSelectedImgIndex] = useState(null);

  useEffect(() => {
    if (providerId) {
      const loadPortfolio = async () => {
        try {
          const data = await PublicAPI.getProviderPortfolio(providerId);
          
          // THE FIX: Flatten the backend DTO into a standard gallery array!
          let galleryItems = [];
          if (Array.isArray(data)) {
             data.forEach(job => {
                // Grab the Before Image
                if (job.beforeImageUrl) {
                    galleryItems.push({ 
                        url: job.beforeImageUrl, 
                        label: 'Before', 
                        serviceName: job.serviceName 
                    });
                }
                // Grab the After Image
                if (job.afterImageUrl) {
                    galleryItems.push({ 
                        url: job.afterImageUrl, 
                        label: 'After', 
                        serviceName: job.serviceName 
                    });
                }
             });
          }
          
          setPortfolio(galleryItems);
        } catch (error) {
          console.error("Failed to load portfolio", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadPortfolio();
    }
  }, [providerId]);

  const openLightbox = (index) => setSelectedImgIndex(index);
  const closeLightbox = () => setSelectedImgIndex(null);
  
  const nextImg = (e) => {
    e.stopPropagation();
    setSelectedImgIndex((prev) => (prev + 1) % portfolio.length);
  };
  
  const prevImg = (e) => {
    e.stopPropagation();
    setSelectedImgIndex((prev) => (prev === 0 ? portfolio.length - 1 : prev - 1));
  };

  if (isLoading) return <Loader2 className="animate-spin text-indigo-500 mx-auto my-12" />;

  if (portfolio.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">This provider hasn't uploaded portfolio photos yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-in fade-in">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Image size={22} className="text-indigo-600" />
        Past Work & Portfolio
      </h3>

      {/* Responsive Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {portfolio.map((item, index) => (
          <div 
            key={index} 
            onClick={() => openLightbox(index)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            {/* THE FIX: Use item.url to render the image */}
            <img 
              src={item.url} 
              alt={`Portfolio ${index}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Added Badge: Shows 'Before' or 'After' */}
            <span className={`absolute top-2 left-2 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10 ${item.label === 'After' ? 'bg-green-500/80' : 'bg-black/60'}`}>
              {item.label}
            </span>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* --- FULL SCREEN LIGHTBOX --- */}
      {selectedImgIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-colors z-20"
          >
            <X size={28} />
          </button>

          <button 
            onClick={prevImg}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
          >
            <ChevronLeft size={40} />
          </button>

          <button 
            onClick={nextImg}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
          >
            <ChevronRight size={40} />
          </button>

          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            
            {/* Context Header inside Lightbox */}
            <div className="absolute top-6 left-6 text-white z-20">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 ${portfolio[selectedImgIndex].label === 'After' ? 'bg-green-500' : 'bg-gray-700'}`}>
                {portfolio[selectedImgIndex].label} Image
              </span>
              <h4 className="font-bold text-lg">{portfolio[selectedImgIndex].serviceName}</h4>
            </div>

            {/* THE FIX: Use portfolio[selectedImgIndex].url to render the expanded image */}
            <img 
              src={portfolio[selectedImgIndex].url} 
              alt="Expanded view" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-white/60 font-medium">
              {selectedImgIndex + 1} / {portfolio.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}