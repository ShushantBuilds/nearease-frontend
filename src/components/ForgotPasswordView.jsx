import React, { useState } from "react";
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff, KeyRound } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ForgotPasswordView({ onViewChange }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return window.alert("Please enter your email address.");
    
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send recovery email.");
      }

      window.alert("Recovery OTP has been sent to your email!");
      setStep(2); // Move to Step 2
    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return window.alert("Please enter a valid OTP.");
    if (newPassword !== confirmPassword) return window.alert("Passwords do not match!");
    if (newPassword.length < 6) return window.alert("Password must be at least 6 characters long.");

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword, 
          confirmNewPassword: confirmPassword 
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password.");
      }

      window.alert("Success! Your password has been changed. Please login with your new password.");
      onViewChange("login"); // Send them back to login
    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header with Back Button */}
      <div className="relative">
        <button 
          onClick={() => step === 2 ? setStep(1) : onViewChange("login")} 
          className="absolute left-0 top-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 shadow-inner">
          <ShieldCheck size={24} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">Account Recovery</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-2 px-6">
          {step === 1 ? "Enter your email to receive a secure password reset code." : "Enter the OTP sent to your email and choose a new password."}
        </p>
      </div>

      <div className="space-y-5 mt-4">
        
        {/* STEP 1 UI: EMAIL INPUT */}
        {step === 1 && (
          <div className="animate-in zoom-in-95 duration-300">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="shushant@example.com" 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 pl-11 pr-4 py-3 rounded-xl outline-none transition" 
                autoFocus
              />
            </div>
            
            <button 
              onClick={handleSendOtp} 
              disabled={isLoading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-lg hover:shadow-indigo-500/30 mt-6"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Send Recovery Code"}
            </button>
          </div>
        )}

        {/* STEP 2 UI: OTP & NEW PASSWORD */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
            
            {/* Disabled Email view just for reference */}
            <div className="opacity-60 pointer-events-none">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input value={email} readOnly type="email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-11 pr-4 py-3 rounded-xl" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">6-Digit OTP</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter OTP" 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 pl-11 pr-4 py-3 rounded-xl outline-none transition font-mono tracking-widest text-lg" 
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 pl-11 pr-11 py-3 rounded-xl outline-none transition" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className={`w-full bg-gray-50 dark:bg-gray-900 border focus:bg-white dark:focus:bg-gray-800 pl-11 pr-4 py-3 rounded-xl outline-none transition ${confirmPassword && newPassword !== confirmPassword ? "border-red-400 focus:ring-red-200" : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"}`} 
                />
              </div>
            </div>

            <button 
              onClick={handleResetPassword} 
              disabled={isLoading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-lg hover:shadow-indigo-500/30 mt-6"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}