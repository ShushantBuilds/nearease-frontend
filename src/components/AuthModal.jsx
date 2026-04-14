import React, { useState, useEffect } from "react";
// Added 'Eye' and 'EyeOff' icons to the import
import { X, Mail, Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

const BACKEND_URL = "http://192.168.1.15:8080"; // Keep your backend IP

export default function AuthModal({ isOpen, view, onClose, onViewChange, onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  // --- Login States ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false); // Toggle visibility

  // --- Signup States ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Toggle visibility for signup passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // --- Email Verification States ---
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Clear inputs and reset visibility states when the modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setLoginEmail("");
      setLoginPassword("");
      setFirstName("");
      setLastName("");
      setUsername("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setEmailOtp("");
      setIsOtpSent(false);
      setIsEmailVerified(false);
      
      // Reset password visibility
      setShowLoginPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGetOTP = async () => {
    if (!email) return alert("Please enter an email address first.");
    setIsVerifying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) setIsOtpSent(true);
      else alert("Failed to send OTP to email.");
    } catch (error) {
      console.error(error);
      alert("Network Error. Cannot reach backend.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!emailOtp) return alert("Please enter the OTP.");
    setIsVerifying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      if (response.ok) setIsEmailVerified(true);
      else alert("Invalid OTP. Please try again.");
    } catch (error) {
      console.error(error);
      alert("Network Error.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (!isEmailVerified) return alert("Please verify your email before creating an account.");
    
    setIsLoading(true);
    try {
      const payload = { firstName, lastName, username, phone, email, password };
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
    } catch (error) {
      console.error(error);
      alert("Network Error. Cannot reach backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return alert("Please fill in both fields.");
    
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data); 
        onClose(); 
      } else {
        alert("Invalid credentials.");
      }
    } catch (error) {
      console.error(error);
      alert("Network Error. Cannot reach backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl text-gray-900 dark:text-white my-8">
        
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-1.5 rounded-full">
          <X size={20} />
        </button>

        {/* -------------------- SIGN UP VIEW -------------------- */}
        {view === "signup" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Join NearEase</h2>

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
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 px-4 py-2.5 rounded-xl outline-none transition" />
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
                <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2">
                  <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} type="text" placeholder="Enter OTP" maxLength={6} className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-xl outline-none text-center tracking-widest font-mono" />
                  <button onClick={handleVerifyOTP} disabled={isVerifying} className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer">
                    {isVerifying ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
                  </button>
                </div>
              )}
            </div>

            {/* Passwords Row (with Eye Icons) */}
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
        )}

        {/* -------------------- LOGIN VIEW -------------------- */}
        {view === "login" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">Login to access your NearEase dashboard</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 pl-11 pr-4 py-3 rounded-xl outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    type={showLoginPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 pl-11 pr-11 py-3 rounded-xl outline-none transition" 
                  />
                  {/* Eye Toggle Button */}
                  <button 
                    type="button" 
                    onClick={() => setShowLoginPassword(!showLoginPassword)} 
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button onClick={handleLogin} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 shadow-lg cursor-pointer">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-700 dark:text-gray-400 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              New to NearEase? <button onClick={() => onViewChange("signup")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Create Account</button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}