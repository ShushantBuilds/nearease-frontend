import React, { useState } from "react";
import { User, Mail, Lock, Camera, Loader2, CheckCircle } from "lucide-react";
import { UserAPI } from "../services/userApi";

export default function ProfileSettings({ user, setUser }) {
  // --- STATES FOR EACH SECTION ---
  const [details, setDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || ""
  });
  
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  // Email & OTP States
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  // Loading states
  const [loadingSection, setLoadingSection] = useState(null); // 'image', 'details', 'email', 'verifyEmail', 'password'
  
  // Success messages
  const [messages, setMessages] = useState({});

  const showMessage = (section, text, isError = false) => {
    setMessages({ ...messages, [section]: { text, isError } });
    setTimeout(() => setMessages((prev) => ({ ...prev, [section]: null })), 4000);
  };

  // --- HANDLERS ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingSection("image");
    try {
      const formData = new FormData();
      formData.append("file", file); 

      const response = await UserAPI.updateProfileImage(formData);
      
      // Extract URL depending on how your backend sends the raw string or JSON object
      const newImageUrl = typeof response === 'string' ? response : (response.imageUrl || response.url || response.message);
      
      const updatedUser = { ...user, profileImage: newImageUrl };
      
      setUser(updatedUser);
      localStorage.setItem("nearEaseUser", JSON.stringify(updatedUser)); 

      showMessage("image", "Profile picture updated!");
    } catch (error) {
      showMessage("image", "Failed to upload image.", true);
    } finally {
      setLoadingSection(null);
    }
  };

  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    setLoadingSection("details");
    try {
      await UserAPI.updateDetails(details);
      
      const updatedUser = { ...user, ...details };
      setUser(updatedUser);
      localStorage.setItem("nearEaseUser", JSON.stringify(updatedUser));

      showMessage("details", "Profile details updated!");
    } catch (error) {
      showMessage("details", "Failed to update details.", true);
    } finally {
      setLoadingSection(null);
    }
  };

  // STEP 1: Request the OTP
  const handleEmailRequest = async (e) => {
    e.preventDefault();
    setLoadingSection("email");
    try {
      await UserAPI.requestEmailUpdate({ email: newEmail });
      showMessage("email", "Verification OTP sent to your new email!");
      setShowOtpInput(true); // Reveal the OTP input field
    } catch (error) {
      showMessage("email", error.message || "Failed to request email update.", true);
    } finally {
      setLoadingSection(null);
    }
  };

  // STEP 2: Verify the OTP and save new email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoadingSection("verifyEmail");
    try {
      const response = await UserAPI.verifyEmailUpdate({ email: newEmail, otp: otp });
      
      // Backend ApiResponse returns the new JWT token in the message or token field
      const newToken = response.message || response.token;
      
      const updatedUser = { ...user, email: newEmail, token: newToken };
      setUser(updatedUser);
      localStorage.setItem("nearEaseUser", JSON.stringify(updatedUser));

      showMessage("email", "Email successfully updated!");
      setShowOtpInput(false);
      setNewEmail("");
      setOtp("");
    } catch (error) {
      showMessage("email", error.message || "Invalid OTP. Please try again.", true);
    } finally {
      setLoadingSection(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showMessage("password", "New passwords do not match.", true);
    }

    setLoadingSection("password");
    try {
      await UserAPI.changePassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword 
      });
      
      showMessage("password", "Password successfully changed!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
    } catch (error) {
      showMessage("password", error.message || "Failed to change password.", true);
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>

      <div className="space-y-6">
        
        {/* 1. PROFILE IMAGE SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
              {user?.profileImage || user?.profilePictureImageUrl ? (
                <img src={user.profileImage || user.profilePictureImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-indigo-300 dark:text-gray-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition shadow-lg">
              {loadingSection === "image" ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loadingSection === "image"} />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Picture</h3>
            <p className="text-sm text-gray-500">Upload a professional photo to build trust.</p>
            {messages.image && <p className={`text-sm mt-2 font-medium ${messages.image.isError ? "text-red-500" : "text-green-500"}`}>{messages.image.text}</p>}
          </div>
        </div>

        {/* 2. PERSONAL DETAILS SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-indigo-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Details</h3>
          </div>
          <form onSubmit={handleDetailsUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input required type="text" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={details.firstName} onChange={(e) => setDetails({...details, firstName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input required type="text" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={details.lastName} onChange={(e) => setDetails({...details, lastName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input type="tel" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              {messages.details ? (
                <p className={`text-sm font-medium flex items-center gap-1 ${messages.details.isError ? "text-red-500" : "text-green-500"}`}>
                  {!messages.details.isError && <CheckCircle size={16} />} {messages.details.text}
                </p>
              ) : <div />}
              <button type="submit" disabled={loadingSection === "details"} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center">
                {loadingSection === "details" ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Details"}
              </button>
            </div>
          </form>
        </div>

        {/* 3. EMAIL UPDATE SECTION (UPDATED WITH OTP FLOW) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="text-indigo-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Address</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Current email: <strong className="text-gray-900 dark:text-white">{user?.email}</strong></p>
          
          <form onSubmit={showOtpInput ? handleVerifyEmail : handleEmailRequest} className="space-y-3">
            <div className="flex gap-3">
              <input 
                required 
                type="email" 
                placeholder="Enter new email address" 
                className={`flex-1 p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none ${showOtpInput ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                disabled={showOtpInput}
              />
              {!showOtpInput && (
                <button type="submit" disabled={loadingSection === "email"} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition flex items-center justify-center min-w-[140px]">
                  {loadingSection === "email" ? <Loader2 className="animate-spin w-5 h-5" /> : "Request Update"}
                </button>
              )}
            </div>

            {/* Hidden OTP field that slides down when requested */}
            {showOtpInput && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  required 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  className="flex-1 p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center font-semibold" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  maxLength={6}
                />
                <button type="submit" disabled={loadingSection === "verifyEmail"} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center min-w-[140px]">
                  {loadingSection === "verifyEmail" ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Update"}
                </button>
              </div>
            )}
          </form>

          {messages.email && <p className={`text-sm mt-2 font-medium ${messages.email.isError ? "text-red-500" : "text-green-500"}`}>{messages.email.text}</p>}
        </div>

        {/* 4. PASSWORD CHANGE SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-indigo-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input required type="password" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input required type="password" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input required type="password" className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-2">
              {messages.password ? (
                <p className={`text-sm font-medium flex items-center gap-1 ${messages.password.isError ? "text-red-500" : "text-green-500"}`}>
                  {!messages.password.isError && <CheckCircle size={16} />} {messages.password.text}
                </p>
              ) : <div />}
              <button type="submit" disabled={loadingSection === "password"} className="bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center">
                {loadingSection === "password" ? <Loader2 className="animate-spin w-5 h-5" /> : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}