"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { X, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Types
interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  isVisible: boolean;
  productColor?: string[];
  description?: string;
}

const CATEGORIES = [
  "All",
  'Necklace set', 'Pendent set', 'Bangle', 'Kada', 'Ring', 'Nath', 
  'Hath pan', 'Mang tika', 'Tops', 'Earrings', 'Mangalsutra', 
  'Borla', 'Killangi', 'Chocker', 'Balli', 'Earcuff', 'Payal', 
  'West belt', 'Baju band', 'Jooda', 'Damini', 'Sheeshphool', 
  'Ghughri', 'Mala', 'Chain', 'Sindoor box', 'Groom mala'
];

const POPULAR_CATEGORIES = [
  "All",
  "Necklace set",
  "Earrings",
  "Ring",
  "Bangle",
  "Mangalsutra"
];

// Utility to add Cloudinary optimizations
const optimizeImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("q_auto") || url.includes("f_auto")) return url;
    return url.replace("/upload/", "/upload/q_auto,f_auto/");
  }
  return url;
};

// Skeleton Component
const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse">
    <div className="w-full aspect-[4/5] bg-gray-200" />
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 w-3/4" />
      <div className="h-4 bg-gray-200 w-1/4" />
    </div>
  </div>
);

export default function CustomerGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the environment variable with a fallback for local development
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const { data } = await axios.get(`${API_URL}/api/products`);

        const visibleProducts = data.filter(
          (p: Product) => p.isVisible !== false,
        );
        setProducts(visibleProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesCategory = selectedCategory === "All";
      
      if (!matchesCategory && product.category) {
        const productCats = Array.isArray(product.category) ? product.category : [product.category];
        matchesCategory = productCats.some(c => c.toLowerCase() === selectedCategory.toLowerCase());
      }

      const matchesSearch = !searchQuery || (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleOrderWhatsApp = (product: Product) => {
    const phoneNumber = "919876543210";
    const message = `Hi Jewel Palace Borivali, I am interested in ${product.title} - ${formatPrice(product.price)}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      imageUrl: optimizeImageUrl(product.imageUrl),
    });
    // Optional: could add toast notification here
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-wide">
            Our Collection
          </h1>
          <div className="h-px w-24 bg-gray-300 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-light tracking-wide uppercase text-sm">
            Curated elegance for every occasion
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 md:px-6 rounded-full text-sm uppercase tracking-wider transition-colors border ${
                  selectedCategory === cat
                    ? "bg-brand-maroon text-white border-brand-maroon"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
            
            <div className="relative">
              <select
                value={POPULAR_CATEGORIES.includes(selectedCategory) ? "" : selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-5 py-2 pr-10 md:px-6 md:pr-10 rounded-full text-sm uppercase tracking-wider transition-colors border outline-none appearance-none cursor-pointer ${
                  !POPULAR_CATEGORIES.includes(selectedCategory) && selectedCategory !== ""
                    ? "bg-brand-maroon text-white border-brand-maroon"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <option value="" disabled>More Options</option>
                {CATEGORIES.filter(c => !POPULAR_CATEGORIES.includes(c)).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${!POPULAR_CATEGORIES.includes(selectedCategory) && selectedCategory !== "" ? 'text-white' : 'text-gray-600'}`}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search pieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon transition-all placeholder:text-gray-400 text-sm font-light"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group flex flex-col cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 border border-gray-100">
                    <img
                      src={optimizeImageUrl(product.imageUrl)}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Overlays (Desktop) */}
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                      <span className="bg-white text-gray-900 px-6 py-2 text-sm uppercase tracking-widest border border-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-sm hover:bg-gray-50">
                        View Details
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-brand-maroon text-white px-6 py-2 text-sm uppercase tracking-widest border border-brand-maroon transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 shadow-lg hover:bg-brand-maroon/90 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="font-serif text-lg text-gray-900 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-gray-600 font-light">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-light text-lg">
              No products found for "{searchQuery}" in {selectedCategory}.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-brand-maroon border-b border-brand-maroon pb-0.5 hover:text-brand-maroon/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedProduct(null)}
          ></div>

          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 text-gray-900 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/2 relative bg-gray-50">
              <div className="aspect-[4/5] md:aspect-auto md:h-full relative w-full border-r border-gray-100">
                <img
                  src={optimizeImageUrl(selectedProduct.imageUrl)}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
              <span className="text-xs text-brand-maroon uppercase tracking-widest mb-4 block font-medium">
                {selectedProduct.category || "Jewellery"}
              </span>

              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight">
                {selectedProduct.title}
              </h2>

              <p className="text-2xl text-gray-700 mb-8 font-light">
                {formatPrice(selectedProduct.price)}
              </p>

              <div className="h-px w-full bg-gray-100 mb-8"></div>

              <div className="prose prose-sm text-gray-600 font-light mb-10 leading-relaxed">
                <p>
                  {selectedProduct.description ||
                    "Experience the epitome of elegance with this beautifully crafted piece. Designed to add a touch of royal grandeur to your ensemble, it features intricate detailing and a flawless finish that shines in any light."}
                </p>
                
                {selectedProduct.productColor && selectedProduct.productColor.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900 mr-2">Color:</span>
                    <span className="capitalize">{selectedProduct.productColor.join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null); // optional: close modal after adding to cart
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-brand-maroon hover:bg-brand-maroon/90 text-white py-4 px-8 rounded-sm transition-colors text-lg font-medium tracking-wide uppercase shadow-lg shadow-brand-maroon/20"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={() => handleOrderWhatsApp(selectedProduct)}
                  className="w-full flex items-center justify-center gap-3 bg-transparent border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white py-3.5 px-8 rounded-sm transition-all text-lg font-medium tracking-wide uppercase"
                >
                  <MessageCircle className="w-5 h-5" />
                  Quick Inquiry on WhatsApp
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6 uppercase tracking-widest">
                Free shipping on all orders
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
