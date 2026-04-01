"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Sparkles } from "lucide-react";

// Types
interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
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

// Skeleton Component
const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse bg-white rounded-lg border border-gray-100 p-4">
    <div className="w-full aspect-[4/5] bg-gray-200 rounded-md" />
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 w-3/4 rounded" />
      <div className="h-4 bg-gray-200 w-1/4 rounded" />
    </div>
  </div>
);

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/products`);
        // Ensure only visible items are shown
        const visibleProducts: Product[] = data.filter((p: Product) => p.isVisible !== false);
        
        // Take the latest 4 products as "trending"
        // (Assuming DB natural order or _id order means newer are at the end, so reverse and take 4)
        const latestFour = visibleProducts.reverse().slice(0, 4);
        setTrendingProducts(latestFour);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background - ideally this would be an actual high-quality banner image */}
        <div className="absolute inset-0 bg-brand-maroon/90 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599643478514-4a4204b281f5?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <span className="text-brand-gold font-medium tracking-[0.2em] uppercase text-sm md:text-base mb-6 block">Exquisite Imitation Collection</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8 drop-shadow-lg">
            Adorn Yourself With <br/>
            <span className="italic text-brand-gold">Royal Elegance</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed hidden sm:block">
            Discover our festive & vibrant pieces meticulously crafted to bring out the palace queen in you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/collections?type=wedding" className="w-full sm:w-auto bg-brand-gold text-brand-maroon font-semibold px-8 py-4 rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2 group">
              Shop Wedding
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/collections" className="w-full sm:w-auto bg-transparent border border-white text-white font-medium px-8 py-4 rounded-sm hover:bg-white/10 transition-colors">
              Explore All
            </Link>
          </div>
        </div>
      </section>

      {/* Categories / Occasions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">Shop By Occasion</h2>
          <div className="h-1 w-20 bg-brand-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 hover:cursor-pointer">
          {[
            { title: "Wedding Wonders", desc: "Bridal sets, matha pattis & heavy chokers", link: "wedding", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=600" },
            { title: "Heavy Festive", desc: "Statement neckpieces & intricate bangles", link: "heavy", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600" }
          ].map((cat, i) => (
            <Link href={`/collections?type=${cat.link}`} key={i} className="group relative h-96 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-500 block">
              <Image 
                src={cat.img} 
                alt={cat.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10 transition-opacity duration-300 group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-serif text-white mb-2">{cat.title}</h3>
                <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{cat.desc}</p>
                <span className="text-brand-gold text-sm font-semibold flex items-center gap-1 uppercase tracking-wider">
                  View Collection <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-brand-maroon/5 border-y border-brand-maroon/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 text-brand-maroon mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold uppercase tracking-wider text-sm">Trending Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Most Loved Pieces</h2>
            </div>
            <Link href="/collections?sort=trending" className="hidden md:flex items-center gap-2 text-brand-maroon font-medium hover:text-brand-gold transition-colors pb-1 border-b-2 border-transparent hover:border-brand-gold">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : trendingProducts.length > 0 ? (
              trendingProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  title={product.title}
                  price={product.price}
                  imageUrl={optimizeImageUrl(product.imageUrl)}
                  occasion={Array.isArray(product.category) && product.category.length > 0 ? product.category[0] : (product.category as string || "Jewellery")}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100">
                No trending products available.
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/collections?sort=trending" className="inline-flex items-center gap-2 text-brand-maroon font-medium border border-brand-maroon px-6 py-3 rounded hover:bg-brand-maroon hover:text-white transition-colors">
              View All Trending
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-brand-maroon rounded-2xl overflow-hidden flex flex-col md:flex-row items-center shadow-2xl">
          <div className="md:w-1/2 relative h-[300px] md:h-full min-h-[400px] w-full">
            <Image 
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
              alt="Artisan at work"
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">Authentic Craftsmanship, Flawless Finish.</h2>
            <p className="text-brand-bg/80 text-lg font-light mb-8 leading-relaxed">
              Our master artisans pour their passion into creating imitation jewellery that rivals the real thing. Utilizing premium stones, intricate meenakari, and anti-tarnish gold plating.
            </p>
            <div className="flex gap-4 mb-8">
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-brand-gold">5K+</span>
                <span className="text-xs uppercase tracking-wider text-brand-bg/70 mt-1">Happy Brides</span>
              </div>
              <div className="w-px bg-brand-gold/30"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-brand-gold">500+</span>
                <span className="text-xs uppercase tracking-wider text-brand-bg/70 mt-1">Unique Designs</span>
              </div>
            </div>
            <Link href="/collections" className="bg-brand-gold text-brand-maroon font-semibold px-8 py-4 rounded-sm hover:bg-white transition-colors self-start">
              Visit Our Store
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial preview */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex justify-center mb-6 text-brand-gold">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
          </div>
          <blockquote className="text-2xl md:text-3xl font-serif text-gray-900 leading-relaxed mb-8">
             I ordered a bridal set from Jewel Palace for my reception. The quality is unmatched! It looked heavier and more vibrant than my real gold jewellery. Highly recommend! 
          </blockquote>
          <p className="font-medium text-brand-maroon tracking-widest uppercase">— Ananya S.</p>
        </div>
      </section>
    </div>
  );
}
