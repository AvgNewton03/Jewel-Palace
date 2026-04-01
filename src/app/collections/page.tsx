"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";

// Types
interface Product {
  _id: string;
  title: string;
  price: number;
  category: string | string[];
  occasion?: string | string[];
  color?: string | string[];
  imageUrl: string;
  isVisible: boolean;
  description?: string;
}

// Utility to add Cloudinary optimizations
const optimizeImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("q_auto") || url.includes("f_auto")) return url;
    return url.replace("/upload/", "/upload/q_auto,f_auto/");
  }
  return url;
};

// Skeleton Component for Loading State
const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse bg-white rounded-lg border border-gray-100 p-4">
    <div className="w-full aspect-[4/5] bg-gray-200 rounded-md" />
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 w-3/4 rounded" />
      <div className="h-4 bg-gray-200 w-1/4 rounded" />
    </div>
  </div>
);

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("Featured");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  useEffect(() => {
    // Safely parse URL without next/navigation Suspense requirements
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeQuery = params.get('type');
      if (typeQuery) {
        const typeCapitalized = typeQuery.charAt(0).toUpperCase() + typeQuery.slice(1);
        if (['Wedding', 'Casual', 'Heavy Festive', 'Office Wear'].includes(typeCapitalized)) {
          setSelectedOccasions([typeCapitalized]);
        } else {
          setSelectedTypes([typeCapitalized]);
        }
      }
    }

    const fetchProducts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/products`);
        // Ensure only visible items are shown
        const visibleProducts = data.filter((p: Product) => p.isVisible !== false);
        setProducts(visibleProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasions(prev => prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]);
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handlePriceChange = (price: string) => {
    setSelectedPrices(prev => prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]);
  };
  
  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setSelectedPrices([]);
  };

  const sortedProducts = useMemo(() => {
    let result = [...products];

    // Helper to safely check inclusion against string or array (Case Insensitive)
    const includesAny = (fieldValue: string | string[] | undefined, selectedFilters: string[]): boolean => {
      if (!fieldValue) return false;
      const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      return selectedFilters.some(filter => {
        const filterLower = filter.toLowerCase();
        if (filter === "Bangles & Bracelets") {
          return values.some(v => v.toLowerCase() === "bracelets" || v.toLowerCase() === "bangles");
        }
        return values.some(v => v.toLowerCase() === filterLower);
      });
    };

    // Filter by type
    if (selectedTypes.length > 0) {
      result = result.filter(p => includesAny(p.category, selectedTypes));
    }

    // Filter by occasion
    if (selectedOccasions.length > 0) {
      result = result.filter(p => includesAny(p.occasion, selectedOccasions));
    }

    // Filter by color
    if (selectedColors.length > 0) {
      result = result.filter(p => includesAny(p.color, selectedColors));
    }

    // Filter by price
    if (selectedPrices.length > 0) {
      result = result.filter(p => {
        return selectedPrices.some(priceGroup => {
          if (priceGroup === "Under ₹1,000") return p.price < 1000;
          if (priceGroup === "₹1,000 - ₹2,500") return p.price >= 1000 && p.price <= 2500;
          if (priceGroup === "₹2,500 - ₹5,000") return p.price >= 2500 && p.price <= 5000;
          if (priceGroup === "Above ₹5,000") return p.price > 5000;
          return false;
        });
      });
    }

    switch (sortOption) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "New Arrivals":
        // Assuming newer _id implies newer product creation
        result.reverse(); 
        break;
      case "Featured":
      default:
        // Default fetching order
        break;
    }
    return result;
  }, [products, sortOption, selectedTypes, selectedOccasions, selectedColors, selectedPrices]);

  return (
    <div className="bg-brand-bg/30 min-h-screen pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="py-8 border-b border-gray-200 mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">All Collections</h1>
          <p className="text-gray-600 max-w-2xl">
            Browse our entire range of exquisite imitation jewellery.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-[280px] flex-shrink-0">
            <FilterSidebar 
              selectedTypes={selectedTypes}
              selectedOccasions={selectedOccasions}
              selectedColors={selectedColors}
              selectedPrices={selectedPrices}
              onTypeChange={handleTypeChange}
              onOccasionChange={handleOccasionChange}
              onColorChange={handleColorChange}
              onPriceChange={handlePriceChange}
              onClear={handleClearFilters}
            />
          </aside>

          {/* Product Grid Header & Content */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500 font-medium">{sortedProducts.length} Products Found</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-brand-maroon focus:border-brand-maroon p-2 bg-white border"
                >
                  <option>Featured</option>
                  <option>New Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : sortedProducts.map((product) => (
                      <ProductCard 
                        key={product._id} 
                        id={product._id}
                        title={product.title}
                        price={product.price}
                        imageUrl={optimizeImageUrl(product.imageUrl)}
                        occasion={Array.isArray(product.category) ? product.category.join(", ") : product.category}
                      />
                  ))
              }
            </div>

            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-light text-lg">No products found for the selected filters.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 text-brand-maroon border-b border-brand-maroon pb-0.5 hover:text-brand-maroon/80 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
