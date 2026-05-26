import React, { useState, useEffect } from "react";
import { ArrowLeft, User, MapPin, Clock, CalendarDays, ShieldCheck } from "lucide-react";

export default function CheckoutPage({ service, onBack, onProceedToGateway }) {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    street: "", apt: "", city: "", state: "", zip: "",
    bookingDate: "", bookingTime: ""
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const serviceFee = 50.00; // Example platform fee
  const grandTotal = (service?.price || 0) + serviceFee; 

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleProceed = () => {
    // Basic validation
    if (!formData.bookingDate || !formData.bookingTime || !formData.street || !formData.firstName) {
      alert("Please fill in your name, address, and select a date/time.");
      return;
    }
    // Proceed to Gateway
    onProceedToGateway(formData);
  };

  if (!service) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-10 transition cursor-pointer">
        <ArrowLeft size={20} /> Back to Details
      </button>
      
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12 items-start">
        
        {/* Left Column: Data Entry */}
        <div className="space-y-8">
          
          {/* SECTION 1: Date and Time (FIXED UX) */}
          <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-6">
              <Clock size={22} className="text-indigo-600" /> 1. Schedule Appointment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 ml-1 font-medium">Select Date</label>
                <input 
                  type="date" name="bookingDate" value={formData.bookingDate} onChange={handleInputChange} 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white cursor-pointer focus:border-indigo-500 transition" 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 ml-1 font-medium">Select Time</label>
                <input 
                  type="time" name="bookingTime" value={formData.bookingTime} onChange={handleInputChange} 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white cursor-pointer focus:border-indigo-500 transition" 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Address & Details */}
          <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-6">
                <User size={22} className="text-indigo-600" /> 2. Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <input name="firstName" placeholder="First Name" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
                <input name="lastName" placeholder="Last Name" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
                <input name="phone" type="tel" placeholder="Phone Number" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
                <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-6">
                <MapPin size={22} className="text-indigo-600" /> 3. Service Location
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <input name="street" placeholder="Street Address" onChange={handleInputChange} className="col-span-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
                <input name="city" placeholder="City" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
                <input name="zip" placeholder="ZIP / Postal Code" onChange={handleInputChange} className="col-span-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Make Payment */}
        <div className="lg:sticky lg:top-28 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <img src={service.imageUrl || (service.images && service.images[0]) || "https://via.placeholder.com/100"} alt="Service" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight line-clamp-1">{service.name || service.serviceType?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">₹{service.price || 0}</p>
                </div>
            </div>
            
            <div className="space-y-3 font-medium text-sm text-gray-700 dark:text-gray-300 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center"><p>Service Cost</p><p>₹{service.price || 0}</p></div>
              <div className="flex justify-between items-center"><p>Platform Fee</p><p>₹{serviceFee}</p></div>
              <div className="flex justify-between items-center text-xl font-black text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                <p>Total</p><p>₹{grandTotal}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleProceed}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition shadow-xl text-lg flex justify-center items-center gap-3 transform hover:-translate-y-1 cursor-pointer"
          >
            <ShieldCheck size={24} /> Make Payment
          </button>
        </div>
      </div>
    </div>
  );
}