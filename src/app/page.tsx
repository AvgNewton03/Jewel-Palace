"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Star, Sparkles, MessageSquarePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);
  
  // Hero section refs & state
  const heroSectionRef = useRef<HTMLElement>(null);
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const h1WrapperRef = useRef<HTMLDivElement>(null);
  const h1TextRef = useRef<HTMLHeadingElement>(null);
  
  const sampleImages = [
    '/sample_images/1.jpeg',
    '/sample_images/2.jpeg',
    '/sample_images/3.jpeg',
    '/sample_images/4.jpeg',
    '/sample_images/5.jpeg',
    '/sample_images/6.jpeg',
    '/sample_images/7.jpeg',
    '/sample_images/8.jpeg',
    '/sample_images/9.jpeg',
  ];
  
  // Initialize with sample images so the DOM elements exist on first render
  const [heroImages, setHeroImages] = useState<string[]>(sampleImages.slice(0, 6));

  // Logic to determine 6 hero images
  useEffect(() => {

    if (!loading) {
      if (allProducts.length >= 20) {
        setHeroImages(allProducts.slice(0, 6).map(p => optimizeImageUrl(p.imageUrl)));
      } else {
        // Strictly use sample images until 20 products are available
        setHeroImages(sampleImages.slice(0, 6));
      }
    }
  }, [allProducts, loading]);

  useGSAP(() => {
    if (!barsContainerRef.current || heroImages.length === 0 || !h1WrapperRef.current || !h1TextRef.current) return;
    const bars = gsap.utils.toArray(".hero-bar", barsContainerRef.current) as HTMLElement[];
    
    // Set initial state
    gsap.set(bars, { 
      rotationY: 0
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: "top top",
        end: "+=200%", // 2x viewport height for ample scroll distance
        scrub: 2, // Smoother scrubbing
        pin: true,
        pinSpacing: true, // Crucial for preventing overlap of sections below
        anticipatePin: 1, // Prevent pin jumping/flashing
      }
    });

    // Step 1: Reveal height of wrapper
    tl.to(h1WrapperRef.current, { height: "auto", ease: "power1.inOut" })
      // Step 2: Fade in and translate text
      .to(h1TextRef.current, { opacity: 1, y: 0, ease: "power1.out" }, "<")
      // Step 3: Animate 3D bars
      .to(bars, {
        rotationY: 180, // Flip 180 degrees like blinds
        stagger: 0.1,
        ease: "power1.inOut",
      }, "<0.2");
  }, { scope: heroSectionRef }); // Empty dependencies so it only runs once on mount

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

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

        const productsWithImages = visibleProducts.filter(p => p.imageUrl);
        if (productsWithImages.length > 0) {
          setAllProducts(productsWithImages);
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/reviews`);
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchTrendingProducts();
    fetchReviews();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsBannerVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Slideshow interval
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % allProducts.length);
    }, 60000); // Change image every 60 seconds
    
    return () => clearInterval(interval);
  }, [allProducts]);

  // Review slideshow interval
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 8000); // Change review every 8 seconds
    return () => clearInterval(interval);
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setSubmittingReview(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { data } = await axios.post(`${API_URL}/api/reviews`, newReview);
      setReviews([data, ...reviews]);
      setIsReviewModalOpen(false);
      setNewReview({ name: "", rating: 5, comment: "" });
      setCurrentReviewIndex(0); // Show newly added review
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative h-[100vh] w-full flex items-center justify-center bg-[#1c1917] z-0">
        {/* 3D Bars Container */}
        <div ref={barsContainerRef} className="absolute inset-0 z-0 grid grid-cols-2 grid-rows-2 md:flex md:flex-row w-full h-full perspective-[1200px]">
          {heroImages.map((img, i) => (
            <div 
              key={i} 
              className={`relative w-full h-full md:flex-1 border-b md:border-b-0 md:border-r border-black/20 md:last:border-r-0 ${i >= 4 ? 'hidden md:block' : 'block'}`}
            >
              <div className="hero-bar relative w-full h-full origin-center [transform-style:preserve-3d]">
                {/* Front Face */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
                  <Image 
                    src={img}
                    alt={`Hero image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    priority={i < 4}
                    className="object-cover"
                  />
                </div>
                {/* Back Face */}
                <div 
                  className="absolute inset-0 w-full h-full bg-brand-maroon/90 [backface-visibility:hidden]"
                  style={{ transform: 'rotateY(180deg)' }}
                ></div>
              </div>
            </div>
          ))}
          
          {/* Overlay gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 z-0 pointer-events-none"></div>
        </div>

        {/* Hero Text Overlay */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 pointer-events-none flex flex-col items-center">
          <span className="text-brand-gold font-medium tracking-[0.2em] uppercase text-sm md:text-base mb-6 block drop-shadow-md">Exquisite Imitation Collection</span>
          
          <div ref={h1WrapperRef} className="overflow-hidden h-0 w-full">
            <h1 ref={h1TextRef} className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8 drop-shadow-xl opacity-0 translate-y-12">
              Adorn Yourself With <br/>
              <span className="italic text-brand-gold">Royal Elegance</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto mt-6">
            <Link href="/collections?type=wedding" className="w-full sm:w-auto bg-brand-gold text-brand-maroon font-semibold px-8 py-4 rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2 group shadow-lg">
              Shop Wedding
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/collections" className="w-full sm:w-auto bg-transparent border border-white text-white font-medium px-8 py-4 rounded-sm hover:bg-white/10 transition-colors shadow-lg backdrop-blur-sm">
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
      <section 
        ref={bannerRef}
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      >
        <div className={`bg-brand-maroon rounded-2xl overflow-hidden flex flex-col md:flex-row items-center shadow-2xl transition-all duration-1000 ease-out transform ${
          isBannerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        }`}>
          <div className="w-full md:w-1/2 relative h-[350px] md:h-auto md:self-stretch">
            <div className="absolute inset-y-0 left-4 right-4 md:left-8 md:right-8 overflow-hidden bg-brand-maroon/20 group">
              {allProducts.length > 0 ? (() => {
                const currentProduct = allProducts[currentSlideIndex];
                const occasion = Array.isArray(currentProduct.category) && currentProduct.category.length > 0 
                  ? currentProduct.category[0] 
                  : (currentProduct.category as string || "jewellery");
                  
                return (
                  <Link href={`/collections?type=${occasion.toLowerCase()}`} className="block w-full h-full">
                    <Image 
                      key={currentSlideIndex}
                      src={optimizeImageUrl(currentProduct.imageUrl)}
                      alt={currentProduct.title || "Featured jewelry"}
                      fill
                      className="object-cover animate-fade-in transition-transform duration-1000 group-hover:scale-105"
                    />
                  </Link>
                );
              })() : (
                <Image 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                  alt="Artisan at work"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center text-white z-10 relative">
            <h2 className="text-2xl md:text-4xl font-serif mb-3 md:mb-6 leading-tight">Authentic Craftsmanship, Flawless Finish.</h2>
            <p className="text-brand-bg/80 text-base md:text-lg font-light mb-6 md:mb-8 leading-relaxed">
              Our master artisans pour their passion into creating imitation jewellery that rivals the real thing. Utilizing premium stones, intricate meenakari, and anti-tarnish gold plating.
            </p>
            <div className="flex gap-4 mb-8">
              <div className="flex flex-col">
                <span className="text-3xl font-serif text-brand-gold">5K+</span>
                <span className="text-xs uppercase tracking-wider text-brand-bg/70 mt-1">Happy Customers</span>
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

      {/* Testimonial / Reviews Section */}
      <section className="py-20 bg-brand-bg relative">
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          {reviews.length > 0 ? (
            <div className="relative min-h-[250px] flex flex-col justify-center animate-fade-in">
              <div className="flex justify-center mb-6 text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-6 w-6 ${i < reviews[currentReviewIndex].rating ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl font-serif text-gray-900 leading-relaxed mb-8 min-h-[120px] transition-opacity duration-500">
                "{reviews[currentReviewIndex].comment}"
              </blockquote>
              <p className="font-medium text-brand-maroon tracking-widest uppercase">— {reviews[currentReviewIndex].name}</p>
              
              {reviews.length > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                  <button onClick={() => setCurrentReviewIndex(prev => prev === 0 ? reviews.length - 1 : prev - 1)} className="p-2 rounded-full hover:bg-brand-maroon/10 text-brand-maroon transition-colors"><ChevronLeft className="h-6 w-6"/></button>
                  <div className="flex items-center gap-2">
                    {reviews.map((_, i) => (
                      <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentReviewIndex ? "w-6 bg-brand-maroon" : "w-2 bg-brand-maroon/30"}`} />
                    ))}
                  </div>
                  <button onClick={() => setCurrentReviewIndex(prev => (prev + 1) % reviews.length)} className="p-2 rounded-full hover:bg-brand-maroon/10 text-brand-maroon transition-colors"><ChevronRight className="h-6 w-6"/></button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative min-h-[250px] flex flex-col justify-center animate-fade-in">
              <div className="flex justify-center mb-6 text-brand-gold">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
              </div>
              <blockquote className="text-2xl md:text-3xl font-serif text-gray-900 leading-relaxed mb-8 min-h-[120px] transition-opacity duration-500">
                I ordered a heavy kundan ad set from Jewel Palace for my friends reception. The quality is unmatched! It looked as heavy as and more vibrant than my real gold jewellery. Highly recommend!
              </blockquote>
              <p className="font-medium text-brand-maroon tracking-widest uppercase">— Ananya S.</p>
            </div>
          )}
          
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-10 inline-flex items-center gap-2 border border-brand-maroon text-brand-maroon px-6 py-3 rounded-sm hover:bg-brand-maroon hover:text-white transition-colors font-medium"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Write a Review
          </button>
        </div>

        {/* Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
              <div className="bg-brand-maroon p-6 text-white flex justify-between items-center">
                <h3 className="text-2xl font-serif">Share Your Experience</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitReview} className="p-6 md:p-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`h-8 w-8 ${newReview.rating >= star ? "fill-brand-gold text-brand-gold" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-shadow"
                    placeholder="E.g. Ananya S."
                  />
                </div>
                
                <div className="mb-8">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea 
                    id="comment"
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-shadow resize-none"
                    placeholder="Tell us what you loved about your jewellery..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="w-full bg-brand-gold text-brand-maroon font-semibold py-4 rounded-sm hover:bg-brand-maroon hover:text-white transition-colors flex justify-center items-center gap-2"
                >
                  {submittingReview ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>Submit Review <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
