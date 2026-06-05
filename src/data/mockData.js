import hero1 from "../assets/new_hero.png";
import hero2 from "../assets/hero2.jpg"; 
import hero3 from "../assets/hero3.jpg"; 
import hero4 from "../assets/hero1.jpg";
import hero5 from "../assets/hero4.jpg";
import hero6 from "../assets/hero5.jpg";
import srv1 from "../assets/new_hero.png"; 
import srv2 from "../assets/hero2.jpg";
import srv3 from "../assets/hero3.jpg";

export const heroImages = [hero1, hero2, hero3, hero4, hero5, hero6];

// 1. New Hierarchical Category Structure
export const categoryStructure = {
  "Semi-Luxurious": ["Salons", "Local Restaurants", "Budget Hotels", "Normal Car Rentals"],
  "Luxurious": ["Luxury Spas", "Fine Dining Restaurants", "5-Star Hotels", "Premium Car Rentals"]
};

// 2. Updated Data Model
export const initialListings = [
  { 
    id: "1",
    name: "Spice Garden Restaurant", 
    mainCategory: "Semi-Luxurious",
    subCategory: "Local Restaurants",
    rating: 4.5, 
    location: "Raipur", 
    address: "123 Food Street, Civil Lines, Raipur, CG",
    contactNumber: "+919876543210",
    mapLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118991.66609935445!2d81.54903264426541!3d21.261972825709973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dda23be28229%3A0x163ee120469e2366!2sRaipur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin", // Generic Raipur map for demo
    reviews: 128, 
    images: [srv1, srv2, srv3],
    ratingData: { 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 },
    description: "Experience the authentic taste of local spices and herbs in a serene garden setting. Perfect for family dinners and weekend brunches."
  },
  { 
    id: "2",
    name: "The Grand Regal", 
    mainCategory: "Luxurious",
    subCategory: "5-Star Hotels",
    rating: 4.8, 
    location: "Raipur", 
    address: "VIP Road, Raipur, CG",
    contactNumber: "+919988776655",
    mapLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118991.66609935445!2d81.54903264426541!3d21.261972825709973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dda23be28229%3A0x163ee120469e2366!2sRaipur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin",
    reviews: 342,
    images: [srv2, srv3, srv1],
    ratingData: { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 },
    description: "Experience unparalleled luxury and world-class amenities at our 5-star property in the heart of the city."
  },
  { 
    id: "3",
    name: "Elite Car Service", 
    mainCategory: "Luxurious",
    subCategory: "Premium Car Rentals",
    rating: 4.6, 
    location: "Bilaspur", 
    address: "Auto Hub, Bilaspur, CG",
    contactNumber: "+919123456789",
    mapLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118182.70990393226!2d82.07166113827471!3d22.07963953531398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a280b181206f7df%3A0x67ee1c5d01ec74a5!2sBilaspur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1714000000000!5m2!1sen!2sin",
    reviews: 45,
    images: [srv3, srv1, srv2],
    ratingData: { 5: 70, 4: 20, 3: 5, 2: 3, 1: 2 },
    description: "Premium automobile rentals featuring the latest luxury sedans and SUVs for your comfort."
  },
];