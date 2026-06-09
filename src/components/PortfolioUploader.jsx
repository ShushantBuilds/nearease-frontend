import React, { useState } from "react";
import { UploadCloud, X } from "lucide-react";

export default function PortfolioUploader({ onImagesChange }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewUrls.length > 5) {
      alert("You can only upload up to 5 portfolio images.");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Adds the Base64 string to the state
        setPreviewUrls(prev => {
          const newUrls = [...prev, reader.result];
          onImagesChange(newUrls); // Send back to parent form state!
          return newUrls;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      onImagesChange(newUrls);
      return newUrls;
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">Portfolio Images (Max 5)</label>
      
      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">Click or drag images here to upload</p>
      </div>

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="flex gap-4 overflow-x-auto py-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}