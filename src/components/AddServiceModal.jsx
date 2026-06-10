import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { ProviderAPI } from "../services/providerApi";
import { PublicAPI } from "../services/publicApi"; 

export default function AddServiceModal({ isOpen, onClose, onSuccess, hasExistingService }) {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    serviceTypeId: "",
    price: "",
    description: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // Added for better UX
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Main Categories when modal opens
  useEffect(() => {
    if (isOpen) {
      PublicAPI.getCategories().then(data => setCategories(data || []));
    }
  }, [isOpen]);

  // Load Subcategories (Types) when Main Category changes
  useEffect(() => {
    if (selectedCategory) {
      PublicAPI.getTypesByCategory(selectedCategory).then(data => setTypes(data || []));
    }
  }, [selectedCategory]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size cannot exceed 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !formData.serviceTypeId || !formData.name || !formData.price || !formData.description) {
      return alert("Please fill all required fields and upload a cover image.");
    }
    
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("file", imageFile); 
      
      const serviceDetailsBlob = new Blob([JSON.stringify({
        name: formData.name, 
        serviceTypeId: formData.serviceTypeId,
        price: formData.price,
        description: formData.description
      })], { type: "application/json" });
      
      submitData.append("serviceDetails", serviceDetailsBlob);

      const response = await ProviderAPI.addService(submitData);

      // Success feedback to the user
      alert(response?.message || "Service added successfully!");

      onSuccess(); 
      handleClose();   
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state before closing
    setFormData({ name: "", serviceTypeId: "", price: "", description: "" });
    setSelectedCategory("");
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Service</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-700 rounded-full transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Content: Limit Error vs Form */}
        {hasExistingService ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Limit Reached</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Providers are currently limited to offering one active service on the platform. You must delete your existing service before creating a new one.
            </p>
            <button onClick={handleClose} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold cursor-pointer transition hover:scale-105">
              Got it, close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* New Name/Title Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Service Title</label>
              <input 
                type="text" required placeholder="e.g. Premium Home Deep Cleaning"
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Category & Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                <select 
                  className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Service Type</label>
                <select 
                  className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  value={formData.serviceTypeId}
                  onChange={(e) => setFormData({...formData, serviceTypeId: e.target.value})}
                  disabled={!selectedCategory}
                  required
                >
                  <option value="">Select Type</option>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (₹)</label>
              <input 
                type="number" required placeholder="e.g. 500"
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
              <textarea 
                rows="2" required placeholder="Describe what is included in this service..."
                className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Cleaned Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cover Image</label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition relative group">
                  <input 
                    type="file" accept="image/*" required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Click or Drag to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition transform group-hover:scale-105"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center mt-6 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Publish Service"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}