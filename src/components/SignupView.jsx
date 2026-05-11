import React, { useState } from "react";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function SignupView({ onViewChange }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [emailOtp, setEmailOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [error, setError] = useState("");

  const handleGetOTP = async () => {
    if (!email) return alert("Please enter an email address first.");
    setIsVerifying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) setIsOtpSent(true);
      else alert("Failed to send OTP to email.");
    } catch (err) {
      console.error(err);
      alert("Network Error. Cannot reach backend.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!emailOtp) return alert("Please enter the OTP.");
    setIsVerifying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/validate-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      if (response.ok) setIsEmailVerified(true);
      else alert("Invalid OTP. Please try again.");
    } catch (err) {
      console.error(err);
      alert("Network Error.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendMessage("");
    setError(""); 
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), 
      });
      const data = await response.json();
      if (response.ok) {
        setResendMessage("A new OTP has been sent to your email.");
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setError("Network error. Cannot reach backend.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (!isEmailVerified) return alert("Please verify your email before creating an account.");
    
    setIsLoading(true);
    try {
      const payload = { firstName, lastName, username, PhoneNumber, email, password };
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Account created successfully! Please log in.");
        onViewChange("login");
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error. Cannot reach backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Join NearEase</h2>

      {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="John" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 py-2.5 rounded-xl outline-none transition" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Doe" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 py-2.5 rounded-xl outline-none transition" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="johndoe123" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 py-2.5 rounded-xl outline-none transition" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Phone Number</label>
          <input value={PhoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="tel" placeholder="+91 98765 43210" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 py-2.5 rounded-xl outline-none transition" />
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Email Address</label>
        <div className="flex gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@example.com" disabled={isOtpSent || isEmailVerified} className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-xl outline-none transition disabled:opacity-60" />
          {!isOtpSent && !isEmailVerified && (
            <button onClick={handleGetOTP} disabled={isVerifying} className="px-4 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
              {isVerifying ? <Loader2 size={18} className="animate-spin" /> : "Get OTP"}
            </button>
          )}
          {isEmailVerified && (
            <div className="px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} /> Verified
            </div>
          )}
        </div>
        {isOtpSent && !isEmailVerified && (
          <div className="flex flex-col gap-2 mt-3 animate-in slide-in-from-top-2">
            <div className="flex gap-2">
               <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} type="text" placeholder="Enter OTP" maxLength={6} className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-xl outline-none text-center tracking-widest font-mono" />
               <button onClick={handleVerifyOTP} disabled={isVerifying} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer">
                 {isVerifying ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
               </button>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </span>
                  ) : "Resend OTP"}
                </button>
              </p>
              {resendMessage && (
                <p className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {resendMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Password</label>
          <div className="relative">
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 pr-10 py-2.5 rounded-xl outline-none transition" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Confirm Password</label>
          <div className="relative">
            <input 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className={`w-full bg-gray-50 dark:bg-gray-900 border focus:bg-white dark:focus:bg-gray-800 px-4 pr-10 py-2.5 rounded-xl outline-none transition ${confirmPassword && password !== confirmPassword ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSignup} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg mt-4 cursor-pointer flex justify-center items-center">
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-700 dark:text-gray-400 mt-4">
        Already have an account? <button onClick={() => onViewChange("login")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Sign In</button>
      </p>
    </div>
  );
}