import React, { useState, useEffect, useRef } from "react";
import { ArrowDownCircle, Loader2 } from "lucide-react";

// Components
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal"; 
import ServiceCard from "./components/ServiceCard";
import ServicePage from "./components/ServicePage";
import CheckoutPage from "./components/CheckoutPage"; 
import PreviewModal from "./components/PreviewModal";
import MyBookings from "./components/MyBookings"; 
import ProviderDashboard from "./components/ProviderDashboard";
import BecomeProvider from "./components/BecomeProvider";
import ProfileSettings from "./components/ProfileSettings";
import AdminPanel from "./components/AdminPanel";
import MyReviews from "./components/MyReviews";
import ViewProfile from './components/ViewProfile';

// API Services
import { PublicAPI } from "./services/publicApi";
import { UserAPI } from "./services/userApi";

// Local UI Assets
import { heroImages } from "./data/mockData"; 

export default function App() {
  const [mainCategories, setMainCategories] = useState([]); 
  const [subCategories, setSubCategories] = useState([]);   
  const [listings, setListings] = useState([]);             
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [activeMainCategory, setActiveMainCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState(null); 
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [authModalView, setAuthModalView] = useState(null); 
  const [user, setUser] = useState(null); 
  const [selectedModalListing, setSelectedModalListing] = useState(null);
  const [activePage, setActivePage] = useState("home"); 
  const [bookingService, setBookingService] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const mainContentRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("nearEaseUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser); 
      if (parsedUser.token) {
        UserAPI.getMyDetails()
          .then((freshData) => {
            const updatedUser = { 
              ...parsedUser, 
              firstName: freshData.firstName,
              lastName: freshData.lastName,
              phone: freshData.phone,
              profileImage: freshData.imageUrl,
              roles: freshData.roles
            };
            setUser(updatedUser);
            localStorage.setItem("nearEaseUser", JSON.stringify(updatedUser));
          })
          .catch(err => console.error("Failed to fetch fresh user data", err));
      }
    }
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await PublicAPI.getCategories();
      setMainCategories(Array.isArray(data) ? data : []);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchSubCats = async () => {
      setActiveSubCategory(null);
      if (activeMainCategory === "All") {
        setSubCategories([]);
        return;
      }
      const data = await PublicAPI.getTypesByCategory(activeMainCategory);
      setSubCategories(Array.isArray(data) ? data : []);
    };
    fetchSubCats();
  }, [activeMainCategory]);

  // THE FIX: Always fetch all offerings so our frontend filter has the raw data to work with!
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoadingData(true);
      try {
        const data = await PublicAPI.getAllOfferings();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        setListings([]); 
      } finally {
        setIsLoadingData(false);
      }
    };

    if (activePage === "home") {
      fetchListings();
    }
  }, [activePage]); 

  const scrollToContent = () => {
    if (mainContentRef.current) {
      window.scrollTo({
        top: mainContentRef.current.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: "smooth"
      });
    }
  };

  const filteredListings = listings.filter((item) => {
    
    // THE FIX: Added item?.serviceTypename to match your Postman JSON exactly
    const itemName = item?.name || item?.serviceTypename || item?.serviceType?.name || ""; 
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());

    const itemLoc = item?.location || item?.provider?.address || "";
    const matchesLoc = itemLoc ? itemLoc.toLowerCase().includes(location.toLowerCase()) : true;
    
    let matchesCategory = true;
    
    if (activeMainCategory !== "All") {
      
      // THE FIX: Added item?.serviceTypename to capture the subcategory
      const itemSubCat = (item?.serviceTypename || item?.serviceType?.name || "").toLowerCase();
      
      // THE FIX: Fallback for the main category mapping
      const itemMainCat = (item?.categoryName || item?.serviceType?.category?.name || "").toLowerCase();
      const targetMainCat = activeMainCategory.toLowerCase();

      if (activeSubCategory) {
        // If they clicked a specific subcategory (e.g. Local Restaurants), match exactly
        matchesCategory = (itemSubCat === activeSubCategory.name.toLowerCase());
      } else {
        // If they only clicked a Main Category, check if the item's subcategory is in our valid list!
        const validSubCatsForThisCategory = subCategories.map(s => (s.name || "").toLowerCase());
        
        matchesCategory = validSubCatsForThisCategory.includes(itemSubCat) || (itemMainCat === targetMainCat);
      }
    }
    
    return matchesSearch && matchesLoc && matchesCategory;
  });

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem("nearEaseUser"); 
    setIsDropdownOpen(false); 
    setActivePage("home"); 
  };
  
  const toggleTheme = () => { setIsDarkMode(!isDarkMode); setIsDropdownOpen(false); };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => prev === heroImages.length - 1 ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 relative transition-colors duration-300">
        
        <Navbar 
          activePage={activePage} setActivePage={setActivePage}
          location={location} setLocation={setLocation}
          search={search} setSearch={setSearch}
          user={user} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen}
          toggleTheme={toggleTheme} isDarkMode={isDarkMode}
          handleLogout={handleLogout} setAuthModalView={setAuthModalView}
        />

        {activePage === "home" ? (
          <>
            <div className="bg-white dark:bg-gray-900 py-16 md:py-24 px-4 transition-colors duration-300 border-b border-gray-100 dark:border-gray-800 relative z-10">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col text-left space-y-6 z-10">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    Find the best local <span className="text-indigo-600 dark:text-indigo-400">services</span> in your city.
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
                    Discover top-rated restaurants, doctors, mechanics, and more right in your neighborhood.
                  </p>
                  <div className="pt-4">
                    <button onClick={scrollToContent} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1 cursor-pointer text-lg flex items-center gap-3 group w-fit">
                      Explore Services Now
                      <ArrowDownCircle size={22} className="text-indigo-200 group-hover:translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
                <div className="relative h-[350px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                  {heroImages.map((img, index) => (
                    <img key={index} src={img} alt={`Hero ${index}`} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"}`} />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 to-transparent z-20 pointer-events-none"></div>
                </div>
              </div>
            </div>

            <main ref={mainContentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100 dark:border-gray-800">
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose an Experience</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  <button 
                    onClick={() => setActiveMainCategory("All")}
                    className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${activeMainCategory === "All" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
                  >
                    All Services
                  </button>
                  
                  {mainCategories.map((cat) => {
                    const catName = typeof cat === 'string' ? cat : cat?.name;
                    const catKey = typeof cat === 'string' ? cat : (cat?.id || cat?.name);
                    if (!catName) return null; 

                    return (
                      <button 
                        key={catKey} 
                        onClick={() => setActiveMainCategory(catName)} 
                        className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${activeMainCategory === catName ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
                      >
                        {catName} 
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeMainCategory !== "All" && subCategories.length > 0 && (
                <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Filter by Type</h4>
                  <div className="flex flex-wrap gap-3">
                    {subCategories.map((sub) => (
                      <button 
                        key={sub.id || sub.name} 
                        onClick={() => setActiveSubCategory(sub)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeSubCategory?.id === sub.id ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300"}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-8">
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeMainCategory === "All" 
                      ? "Popular Services" 
                      : (activeSubCategory ? activeSubCategory.name : activeMainCategory)} 
                    </h3>
                  {isLoadingData && <Loader2 className="animate-spin text-indigo-600" size={20} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredListings.length > 0 ? (
                    filteredListings.map((item, i) => (
                      <ServiceCard 
                        key={item.id || i} 
                        item={item} 
                        onCardClick={(selectedItem) => {
                          setBookingService(selectedItem);
                          setActivePage("service-details");
                        }}
                        onPreviewClick={(selectedItem) => setSelectedModalListing(selectedItem)}
                      />
                    ))
                  ) : (
                    !isLoadingData && (
                      <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No services found in this category.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </main>
          </>
        ) : activePage === "service-details" ? (
          <ServicePage 
             service={bookingService} 
             onBack={() => setActivePage("home")} 
             onProceedToCheckout={() => setActivePage("checkout")} 
             onLoginRedirect={() => setAuthModalView("login")} 
          />
        ) : activePage === "checkout" ? (
          <CheckoutPage 
             service={bookingService} 
             onBack={() => setActivePage("home")} 
             onComplete={() => setActivePage("bookings")} 
          />
        ) : activePage === "bookings" ? (
          <MyBookings />
        ) : activePage === "my-reviews" ? (
          <MyReviews />
        ) : activePage === "admin" ? (
          <AdminPanel />
        ) : activePage === "view-profile" ? (
          <ViewProfile user={user} setActivePage={setActivePage} />
        ) : activePage === "settings" ? (
          <ProfileSettings user={user} setUser={setUser} />
        ) : activePage === "apply-provider" ? (
          <BecomeProvider user={user} onBack={() => setActivePage("home")} />
        ) : activePage === "provider-dashboard" ? (
          <ProviderDashboard />
        ) : activePage === "add-service" ? (
          <ProviderDashboard defaultOpenAddService={true} />
        ) : null}

        <AuthModal 
          isOpen={authModalView !== null} 
          view={authModalView} 
          onClose={() => setAuthModalView(null)} 
          onViewChange={setAuthModalView} 
          onLoginSuccess={(userData) => {
            setUser(userData);
            localStorage.setItem("nearEaseUser", JSON.stringify(userData));
          }} 
        />
        
        <PreviewModal 
          listing={selectedModalListing} 
          onClose={() => setSelectedModalListing(null)} 
          onProceedToDetails={(item) => {
             setBookingService(item);
             setActivePage("service-details");
             setSelectedModalListing(null);
          }} 
        />
      </div>
    </div>
  );
}