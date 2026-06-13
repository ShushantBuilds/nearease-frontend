import React from "react";
import { 
  Menu, UserCircle, LogOut, Moon, Sun, 
  User, Edit, Compass, LayoutDashboard, 
  PlusCircle, Star, Calendar, Briefcase, Shield
} from "lucide-react"; 

export default function Navbar({ 
  setActivePage, user, 
  isDropdownOpen, setIsDropdownOpen, toggleTheme, isDarkMode, 
  handleLogout, setAuthModalView 
}) {

  // --- RESTORED ROLE CHECKER ---
  const checkRole = (roleType) => {
    if (!user) return false;
    const targetRole = roleType.toUpperCase(); 
    const targetRoleFull = `ROLE_${targetRole}`; 
    let userRoles = [];

    if (typeof user.role === 'string') userRoles.push(user.role.toUpperCase());
    if (Array.isArray(user.roles)) {
      user.roles.forEach(r => {
        if (typeof r === 'string') userRoles.push(r.toUpperCase());
        if (typeof r === 'object' && r !== null) {
          if (r.name) userRoles.push(String(r.name).toUpperCase());
          if (r.authority) userRoles.push(String(r.authority).toUpperCase());
        }
      });
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-full">
        
        {/* Left Side: Premium Modern Logo */}
        <div onClick={() => setActivePage("home")} className="flex items-center gap-3 cursor-pointer shrink-0 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 group-hover:-rotate-12 transition-all duration-300">
            <Compass size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 tracking-tight">
            NearEase
          </h1>
        </div>

        {/* CENTER SPACE: Role-Specific Menus (Smoothly Fades In on Login) */}
        {user && (
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
            {isAdmin ? (
              <button onClick={() => setActivePage("admin")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition cursor-pointer">
                <Shield size={18} /> Admin Panel
              </button>
            ) : isProvider ? (
              <>
                <button onClick={() => setActivePage("provider-dashboard")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition cursor-pointer">
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <button onClick={() => setActivePage("add-service")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition cursor-pointer">
                  <PlusCircle size={18} /> Add Service
                </button>
                <button onClick={() => setActivePage("my-reviews")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400 transition cursor-pointer">
                  <Star size={18} /> My Reviews
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setActivePage("bookings")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition cursor-pointer">
                  <Calendar size={18} /> My Bookings
                </button>
                <button onClick={() => setActivePage("apply-provider")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition cursor-pointer">
                  <Briefcase size={18} /> Become a Provider
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Right Side: Modern Theme Toggle & Auth */}
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          
          <button 
            onClick={toggleTheme} 
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer hidden md:flex ${isDarkMode ? "bg-indigo-900" : "bg-gray-200"}`}
          >
            <span className={`flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${isDarkMode ? "translate-x-9" : "translate-x-1"}`}>
              {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
            </span>
          </button>

          {/* Smooth Auth Area */}
          <div className="hidden md:flex items-center min-w-[140px] justify-end">
            {user ? (
              <div className="relative animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="flex items-center gap-3 bg-indigo-50 dark:bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-700 transition border border-indigo-100 dark:border-gray-700 overflow-hidden shadow-sm"
                >
                  {user?.profileImage || user?.profilePictureImageUrl ? (
                    <img src={user.profileImage || user.profilePictureImageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-900" />
                  ) : (
                    <UserCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
                  )}
                  <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                    Hi! {user?.firstName || user?.username || user?.user?.firstName || "User"}
                  </span>
                </div>
                
                {/* Clean Dropdown with only 3 specific items */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-2 origin-top-right animate-in zoom-in-95 fade-in duration-200">
                    <button onClick={() => { setActivePage("view-profile"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                      <User size={18} /> View Profile
                    </button>
                    <button onClick={() => { setActivePage("settings"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 transition cursor-pointer">
                      <Edit size={18} /> Edit Profile
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer border-t border-gray-100 dark:border-gray-700">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                <button onClick={() => setAuthModalView("login")} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-bold transition cursor-pointer px-4">Login</button>
                <button onClick={() => setAuthModalView("signup")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition shadow-md cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5">Sign Up</button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile menu action */}
        <div className="md:hidden flex items-center gap-3 shrink-0 ml-auto">
          <button 
            onClick={toggleTheme} 
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? "bg-indigo-900" : "bg-gray-200"}`}
          >
            <span className={`flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-1"}`}>
              {isDarkMode ? <Moon size={12} className="text-indigo-400" /> : <Sun size={12} className="text-amber-500" />}
            </span>
          </button>
          <button className="text-gray-600 dark:text-gray-300 cursor-pointer p-1"><Menu size={28} /></button>
        </div>

      </div>
    </nav>
  );
}