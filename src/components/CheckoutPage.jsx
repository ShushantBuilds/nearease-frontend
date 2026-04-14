import React, { useState, useEffect } from "react";
import { ArrowLeft, User, MapPin, CalendarDays, Star } from "lucide-react";
import PaymentForm from "./PaymentForm"; 

export default function CheckoutPage({ service, onBack }) {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    street: "", apt: "", city: "", state: "", zip: ""
  });
  const [saveDetails, setSaveDetails] = useState(true);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const serviceFee = 10.00;
  const tax = 3.90;
  const grandTotal = serviceFee + tax + 50.00; 

  const orderSummaryItems = [
    { name: `${service.name} Booking`, price: 50.00 },
    { name: 'Service Fee', price: serviceFee },
    { name: 'Tax', price: tax },
  ];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 font-medium mb-10 transition cursor-pointer"><ArrowLeft size={20} /> Back to details</button>
      
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 leading-tight">Secure Checkout & Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12 items-start">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white"><User size={22} className="text-indigo-600" /> 1. Your Details & Address</h3>
            <div className="grid grid-cols-2 gap-5">
              {[ {label: 'First Name', name: 'firstName'}, {label: 'Last Name', name: 'lastName'}, {label: 'Phone Number', name: 'phone', type: 'tel'}, {label: 'Email Address', name: 'email', type: 'email'}].map(field => (
                <div key={field.name} className="col-span-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 ml-1 font-medium">{field.label}</label>
                  <input name={field.name} type={field.type || 'text'} value={formData[field.name]} onChange={handleInputChange} placeholder={field.label} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white placeholder-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white"><MapPin size={22} className="text-indigo-600" /> Booking Address</h3>
            <div className="grid grid-cols-2 gap-5">
              {[ {label: 'Street Address', name: 'street', colSpan: 1}, {label: 'Apartment/Unit', name: 'apt', colSpan: 1}, {label: 'City', name: 'city'}, {label: 'State/Province', name: 'state'}, {label: 'ZIP/Postal Code', name: 'zip'}].map(field => (
                <div key={field.name} className={field.colSpan === 1 ? 'col-span-1' : 'col-span-2'}>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 ml-1 font-medium">{field.label}</label>
                  <input name={field.name} type="text" value={formData[field.name]} onChange={handleInputChange} placeholder={field.label} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white placeholder-gray-400" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
               <input type="checkbox" id="saveDetails" checked={saveDetails} onChange={() => setSaveDetails(!saveDetails)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
               <label htmlFor="saveDetails" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Save for future bookings</label>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:sticky lg:top-28">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Booking</h3>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <img src={service.images[0]} alt={service.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">{service.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5"><CalendarDays size={16} className="text-indigo-600" /> Confirmed, Oct 26</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5"><Star size={16} className="text-yellow-500 fill-current" /> {service.rating} ({service.reviews} reviews)</p>
                </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Order Summary & Payment</h3>
            <div className="space-y-3 font-medium text-sm text-gray-700 dark:text-gray-300">
              {orderSummaryItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center"><p>{item.name}</p><p>${item.price.toFixed(2)}</p></div>
              ))}
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700"><p>Grand Total</p><p>${grandTotal.toFixed(2)}</p></div>
            </div>
            <PaymentForm grandTotal={grandTotal} serviceName={service.name} />
          </div>
        </div>
      </div>
    </div>
  );
}