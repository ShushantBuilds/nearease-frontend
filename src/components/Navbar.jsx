import React from "react";
import { 
  Search, MapPin, Menu, UserCircle, LogOut, Moon, Sun, 
  Calendar, Briefcase, Shield, Star, User, Settings, PlusCircle, LayoutDashboard, Edit
} from "lucide-react"; 

export default function Navbar({ 
  setActivePage, location, setLocation, search, setSearch, user, 
  isDropdownOpen, setIsDropdownOpen, toggleTheme, isDarkMode, 
  handleLogout, setAuthModalView 
}) {

  // --- BULLETPROOF ROLE CHECKER ---
  const checkRole = (roleType) => {
    if (!user) return false;
    
    const targetRole = roleType.toUpperCase(); 
    const targetRoleFull = `ROLE_${targetRole}`; 
    
    let userRoles = [];

    // 1. Check direct string role
    if (typeof user.role === 'string') userRoles.push(user.role.toUpperCase());

    // 2. Check 'roles' array
    if (Array.isArray(user.roles)) {
      user.roles.forEach(r => {
        if (typeof r === 'string') userRoles.push(r.toUpperCase());
        if (typeof r === 'object' && r !== null) {
          if (r.name) userRoles.push(String(r.name).toUpperCase());
          if (r.authority) userRoles.push(String(r.authority).toUpperCase());
        }
      });
    }

    // 3. Check Spring Security's default 'authorities' array
    if (Array.isArray(user.authorities)) {
      user.authorities.forEach(auth => {
        if (typeof auth === 'string') userRoles.push(auth.toUpperCase());
        if (typeof auth === 'object' && auth !== null) {
          if (auth.authority) userRoles.push(String(auth.authority).toUpperCase());
        }
      });
    }

    return userRoles.includes(targetRole) || userRoles.includes(targetRoleFull);
  };

  const isProvider = checkRole('PROVIDER');
  const isAdmin = checkRole('ADMIN');

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-6 h-full">
        
        {/* Logo */}
        <div onClick={() => setActivePage("home")} className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center p-2.5">
            <div className="w-full h-full bg-white rounded-full"></div> 
          </div>
          <h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">NearEase</h1>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-1 items-center shadow-sm">
          <div className="flex items-center px-4 py-1.5 flex-1 border-r border-gray-300 dark:border-gray-600">
            <MapPin size={16} className="text-gray-400 mr-2" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where? (e.g. Raipur)" className="w-full bg-transparent outline-none text-sm dark:text-white placeholder-gray-400" />
          </div>
          {/* <div className="flex items-center px-4 py-1.5 flex-1">
            <Search size={16} className="text-gray-400 mr-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="w-full bg-transparent outline-none text-sm dark:text-white placeholder-gray-400" />
          </div> */}
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 ml-1 transition cursor-pointer">
            <Search size={16} />
          </button>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition cursor-pointer">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="relative">
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 bg-indigo-50 dark:bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-700 transition border border-indigo-100 dark:border-gray-700 overflow-hidden">
                {user?.profileImage || user?.profilePictureImageUrl ? (
                  <img src={user.profileImage || user.profilePictureImageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-900" />
                ) : (
                  <UserCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
                )}
                <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                  Hi! {user?.firstName || user?.username || user?.user?.firstName || "User"}
                </span>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  
                  {/* Admin Menu */}
                  {isAdmin ? (
                    <>
                      <button onClick={() => { setActivePage("view-profile"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <User size={18} /> View Profile
                      </button>

                      <button onClick={() => { setActivePage("admin"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                        <Shield size={18} /> Admin Panel
                      </button>
                    </>
                  ) : 
                  
                //  Provider Menu
                  isProvider ? (
                    <>
                      <button onClick={() => { setActivePage("view-profile"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <User size={18} /> View Profile
                      </button>

                      <button onClick={() => { setActivePage("settings"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <Edit size={18} /> Update Profile
                      </button>
                      
                      <button onClick={() => { setActivePage("my-reviews"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <Star size={18} /> My Reviews
                      </button>

                      <button onClick={() => { setActivePage("add-service"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer">
                        <PlusCircle size={18} /> Add Service
                      </button>

                      <button onClick={() => { setActivePage("provider-dashboard"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                        <LayoutDashboard size={18} /> View my Dashboard
                      </button>
                    </>
                  ) : 
                  
                  // Standard User Menu
                  (
                    <>
                      <button onClick={() => { setActivePage("view-profile"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <User size={18} /> View Profile
                      </button>

                      <button onClick={() => { setActivePage("settings"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                        <Edit size={18} /> Edit Profile
                      </button>

                      <button onClick={() => { setActivePage("bookings"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                        <Calendar size={18} /> My Bookings
                      </button>

                      <button onClick={() => { setActivePage("apply-provider"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                        <Briefcase size={18} /> Become a Provider
                      </button>
                    </>
                  )}

                  {/* Universal Logout Button */}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                    <LogOut size={18} /> Logout
                  </button>

                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setAuthModalView("login")} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium transition cursor-pointer px-2">Login</button>
              <button onClick={() => setAuthModalView("signup")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition shadow-md cursor-pointer">Sign Up</button>
            </>
          )}
        </div>
        
        {/* Mobile menu action */}
        <div className="md:hidden flex items-center gap-3 shrink-0">
          <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-full transition cursor-pointer">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="text-gray-600 dark:text-gray-300 cursor-pointer p-1"><Menu size={28} /></button>
        </div>

      </div>
    </nav>
  );
}