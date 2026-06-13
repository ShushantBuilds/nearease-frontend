import React from 'react';
import { Mail, Phone, UserCircle, Calendar, Edit3, Shield, Briefcase } from 'lucide-react';

import GoBackButton from "./GoBackButton";

export default function ViewProfile({ user, setActivePage }) {
  if (!user) return null;

  // Helper to render a beautiful, dynamic role badge
  const renderRoleBadge = () => {
    // 1. Safely extract all possible role formats from Spring Boot
    let rolesArray = [];
    if (typeof user.role === 'string') rolesArray.push(user.role.toUpperCase());
    
    if (Array.isArray(user.roles)) {
      user.roles.forEach(r => {
        if (typeof r === 'string') rolesArray.push(r.toUpperCase());
        if (typeof r === 'object' && r !== null) {
          if (r.name) rolesArray.push(String(r.name).toUpperCase());
          if (r.authority) rolesArray.push(String(r.authority).toUpperCase());
        }
      });
    }

    if (Array.isArray(user.authorities)) {
      user.authorities.forEach(auth => {
        if (typeof auth === 'string') rolesArray.push(auth.toUpperCase());
        if (typeof auth === 'object' && auth !== null && auth.authority) {
           rolesArray.push(String(auth.authority).toUpperCase());
        }
      });
    }

    const isAdmin = rolesArray.includes("ADMIN") || rolesArray.includes("ROLE_ADMIN");
    
    // 2. THE BAND-AID FIX: Check roles array OR if the backend attached provider data
    const isProvider = rolesArray.includes("PROVIDER") || 
                       rolesArray.includes("ROLE_PROVIDER") || 
                       user.providerProfile || 
                       user.isProvider;

    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold tracking-wide">
          <Shield size={16} /> Administrator
        </span>
      );
    }
    
    if (isProvider) {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold tracking-wide">
          <Briefcase size={16} /> Verified Provider
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold tracking-wide">
        <UserCircle size={16} /> Standard User
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <GoBackButton/>
      
      {/* Header section with Edit Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {setActivePage && (
          <button
            onClick={() => setActivePage("settings")}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Premium Gradient Banner */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 w-full relative overflow-hidden">
          {/* Subtle overlay pattern/texture for the banner */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>

        <div className="px-6 sm:px-10 pb-10">
          
          {/* Floating Profile Image & Name Section */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-16 mb-8">
            
            {/* Image Container with thick border to cut into the banner */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-lg flex-shrink-0 z-10">
              <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-indigo-100 dark:border-gray-600">
                {user.profileImage || user.profilePictureImageUrl ? (
                  <img src={user.profileImage || user.profilePictureImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={80} className="text-indigo-300 dark:text-gray-500" />
                )}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 mt-4 sm:mt-0 pb-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4">
                {renderRoleBadge()}
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <Calendar size={16} /> Active Member
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
            
            {/* Email Card */}
            <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                <p className="text-base font-medium text-gray-900 dark:text-white break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                <p className={`text-base font-medium ${user.phone ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 italic'}`}>
                  {user.phone || "No phone number added"}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}