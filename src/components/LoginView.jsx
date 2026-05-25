import React, { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { UserAPI } from "../services/userApi"; // <-- ADDED: Needed to fetch the profile!

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function LoginView({ onViewChange, onLoginSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setIsLoading(true); // <-- Turn on the loading spinner!
    
    try {
      // 1. Standard login call (FIXED: Now sending your actual email & password state)
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }) 
      });

      if (!res.ok) {
        throw new Error("Invalid Email or Password");
      }

      const authResponse = await res.json();
      console.log("Backend Login Response:", authResponse);

      const token = authResponse.token || authResponse.jwt || authResponse.jwtToken;

      if (token) {
        // 2. Temporarily save the token so UserAPI can use it in the headers
        localStorage.setItem("nearEaseUser", JSON.stringify({ token: token }));

        // 3. Fetch the complete profile from your Spring Boot backend
        const userProfile = await UserAPI.getMyDetails();

        // 4. Combine token and fresh database details
        const completeUser = {
          token: token,
          role: authResponse.role, 
          roles: userProfile.roles,
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          phone: userProfile.phone,
          profileImage: userProfile.imageUrl 
        };

        // 5. Save the complete package locally
        localStorage.setItem("nearEaseUser", JSON.stringify(completeUser));
        
        // 6. Pass data back to App.jsx and close the modal
        if (onLoginSuccess) onLoginSuccess(completeUser);
        if (onClose) onClose();
        
      } else {
        throw new Error("Login worked, but no Token was received!");
      }
      
    } catch (error) {
      console.error("Login Error details:", error);
      alert(error.message || "Something went wrong during login");
    } finally {
      setIsLoading(false); // <-- Turn off the loading spinner whether it succeeds or fails
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">Login to access your NearEase dashboard</p>

      <div className="space-y-5">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 pl-11 pr-4 py-3 rounded-xl outline-none transition" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1 font-medium">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type={showLoginPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 pl-11 pr-11 py-3 rounded-xl outline-none transition" 
            />
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
  );
}