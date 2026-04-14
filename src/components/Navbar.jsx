import React from "react";
import { Search, MapPin, Menu, UserCircle, LogOut, Moon, Sun } from "lucide-react";

export default function Navbar({ 
  setActivePage, location, setLocation, search, setSearch, user, 
  isDropdownOpen, setIsDropdownOpen, toggleTheme, isDarkMode, 
  handleLogout, setAuthModalView 
}) {
  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-6 h-full">
        
        {/* Logo and Symbol */}
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
          <div className="flex items-center px-4 py-1.5 flex-1">
            <Search size={16} className="text-gray-400 mr-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="w-full bg-transparent outline-none text-sm dark:text-white placeholder-gray-400" />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 ml-1 transition cursor-pointer">
            <Search size={16} />
          </button>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition cursor-pointer" aria-label="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="relative">
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 bg-indigo-50 dark:bg-gray-800 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-700 transition border border-indigo-100 dark:border-gray-700 overflow-hidden">
                <UserCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                   Hi! {user.firstName || "User"}
                </span>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
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