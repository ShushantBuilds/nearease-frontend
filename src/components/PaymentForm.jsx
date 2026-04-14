import React, { useState } from "react";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";

export default function PaymentForm({ grandTotal, serviceName }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setBookingConfirmed(true);
      alert(`Payment of $${grandTotal.toFixed(2)} for ${serviceName} received! Booking confirmed.`);
    }, 2500); 
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white"><CreditCard size={20} className="text-indigo-600" /> Payment Method</h3>
        <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full"><Lock size={14} /> Secured</div>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Card Number</label>
          <input type="text" placeholder="#### #### #### ####" maxLength={16} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white placeholder-gray-400 text-center tracking-widest font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-5">
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Expiry</label><input type="text" placeholder="MM/YY" maxLength={5} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white placeholder-gray-400 text-center font-mono" /></div>
            <div><label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">CVV</label><input type="password" placeholder="***" maxLength={3} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl outline-none text-sm dark:text-white placeholder-gray-400 text-center font-mono" /></div>
        </div>
      </div>

      <button 
        onClick={handlePayment} 
        disabled={isProcessing || bookingConfirmed}
        className="w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg flex justify-center items-center gap-3 cursor-pointer disabled:bg-gray-400 disabled:dark:bg-indigo-400 disabled:cursor-not-allowed group transform hover:-translate-y-1"
      >
        {isProcessing && !bookingConfirmed && (<><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> Processing Payment...</>)}
        {!isProcessing && !bookingConfirmed && (<>Complete Booking</>)}
        {bookingConfirmed && (<><CheckCircle2 size={24} className="text-green-300 animate-pulse" /> Booking Confirmed!</>)}
      </button>
    </div>
  );
}