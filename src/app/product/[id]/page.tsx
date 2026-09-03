"use client";

import { useEffect, useState, use, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  MessageCircle, 
  ShoppingBag, 
  Store, 
  Heart, 
  Tag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface MediaItem {
  url: string;
  mediaType: string;
  _id?: string;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string[];
  occasion: string[];
  color: string[];
  productColor?: string[];
  imageUrl: string;
  media?: MediaItem[];
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, addToWishlist, removeFromWishlist } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const requireAuth = useRequireAuth();

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const resetLightboxZoom = () => {
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
    isDraggingRef.current = false;
    hasMovedRef.current = false;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const mediaList = product?.media && product.media.length > 0 
    ? product.media 
    : (product ? [{ url: product.imageUrl, mediaType: 'image' }] : []);

  // Keyboard navigation & body scroll lock for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        resetLightboxZoom();
      } else if (e.key === "ArrowRight") {
        setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
        resetLightboxZoom();
      } else if (e.key === "ArrowLeft") {
        setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
        resetLightboxZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen, mediaList.length]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lightboxScale <= 1) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...lightboxPos };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || lightboxScale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    const maxBoundX = (typeof window !== 'undefined' ? window.innerWidth : 800) * (lightboxScale - 1) * 0.45;
    const maxBoundY = (typeof window !== 'undefined' ? window.innerHeight : 800) * (lightboxScale - 1) * 0.45;

    const newX = Math.max(-maxBoundX, Math.min(maxBoundX, initialPosRef.current.x + dx));
    const newY = Math.max(-maxBoundY, Math.min(maxBoundY, initialPosRef.current.y + dy));

    setLightboxPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }
    if (lightboxScale === 1) {
      setLightboxScale(2);
      setLightboxPos({ x: 0, y: 0 });
    } else {
      resetLightboxZoom();
    }
  };

  if (loading) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#0f0a08] min-h-screen py-16 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-maroon dark:text-amber-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#0f0a08] min-h-screen py-16 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mb-4">Product Not Found</h2>
        <Link href="/collections" className="text-brand-maroon dark:text-amber-400 hover:underline">
          Return to Collections
        </Link>
      </div>
    );
  }

  const activeMedia = mediaList[activeMediaIndex] || { url: product.imageUrl, mediaType: 'image' };
  
  const occasionDisplay = product.occasion && product.occasion.length > 0 
    ? product.occasion[0] 
    : (product.category && product.category.length > 0 ? product.category[0] : "Jewellery");

  const isWishlisted = user?.wishlist?.some((item: any) => 
    (typeof item === 'string' ? item : item._id) === product?._id
  );

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product) {
      requireAuth(async () => {
        if (isWishlisted) {
          await removeFromWishlist(product._id);
        } else {
          await addToWishlist(product._id);
        }
      });
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl
      });
    }
  };

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0f0a08] min-h-screen text-stone-900 dark:text-stone-100 py-8 md:py-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-stone-500 dark:text-stone-400 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-brand-maroon dark:hover:text-amber-400 transition-colors">Home</Link>
            </li>
            <li><span className="mx-2 text-stone-400 dark:text-stone-600">/</span></li>
            <li>
              <Link href="/collections" className="hover:text-brand-maroon dark:hover:text-amber-400 transition-colors">Collections</Link>
            </li>
            <li><span className="mx-2 text-stone-400 dark:text-stone-600">/</span></li>
            <li className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-[200px]" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Image Gallery Slider */}
          <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {mediaList.length > 1 && (
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 flex-shrink-0 hide-scrollbar pb-2 md:pb-0">
                {mediaList.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setActiveMediaIndex(idx);
                      setLightboxScale(1);
                    }}
                    className={`relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeMediaIndex 
                        ? 'border-[#6b1414] dark:border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                        : 'border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.mediaType === 'video' ? (
                      <div className="w-full h-full bg-stone-100 dark:bg-stone-800 flex justify-center items-center group relative">
                        <video src={item.url} className="object-cover w-full h-full opacity-50" />
                        <div className="absolute inset-0 flex justify-center items-center bg-black/20">
                          <span className="w-8 h-8 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 flex items-center justify-center text-sm shadow-sm pl-0.5">▶</span>
                        </div>
                      </div>
                    ) : (
                      <Image src={item.url} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Media Container (Click to Open Bigger View) */}
            <div 
              className={`relative w-full aspect-[4/5] bg-stone-100 dark:bg-[#1a120e] rounded-2xl overflow-hidden flex-1 flex items-center justify-center border border-stone-200/80 dark:border-stone-800 shadow-sm select-none transition-all group ${
                activeMedia.mediaType === 'video' ? '' : 'cursor-pointer hover:shadow-md'
              }`}
              onClick={() => {
                if (activeMedia.mediaType !== 'video') {
                  setIsLightboxOpen(true);
                  setLightboxScale(1);
                }
              }}
            >
              {activeMedia.mediaType === 'video' ? (
                <video 
                  src={activeMedia.url} 
                  autoPlay 
                  controls 
                  loop 
                  muted 
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <Image 
                  src={activeMedia.url} 
                  alt={product.title} 
                  fill 
                  className="object-cover transition-opacity duration-200 group-hover:opacity-95" 
                  priority 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              
              {/* Category / Occasion Badge */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                <span className="bg-[#6b1414] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-sm">
                  {occasionDisplay}
                </span>
              </div>

              {/* Click for Bigger View Badge */}
              {activeMedia.mediaType !== 'video' && (
                <div className="absolute bottom-4 right-4 bg-stone-900/80 dark:bg-black/85 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all pointer-events-none z-10">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-medium">Click for Bigger View</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl lg:text-4xl font-serif text-stone-900 dark:text-stone-100 mb-4 pr-8 line-clamp-3">
                {product.title}
              </h1>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={handleWishlistToggle}
                  className={`p-3 transition-all rounded-full cursor-pointer ${
                    isWishlisted 
                      ? 'bg-brand-maroon text-white hover:bg-brand-maroon/90 shadow-md' 
                      : 'bg-stone-100 dark:bg-[#1a120e] text-stone-400 dark:text-stone-500 hover:text-brand-maroon dark:hover:text-amber-400 border border-stone-200 dark:border-stone-800'
                  }`} 
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-semibold text-[#8a1c1c] dark:text-amber-400 font-serif">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>

            {product.description ? (
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light whitespace-pre-wrap">
                {product.description}
              </p>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light">
                This stunning piece is exactly what you need to complete your look. Beautifully handcrafted and designed for {occasionDisplay.toLowerCase()}.
              </p>
            )}

            {product.color && product.color.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Material</h4>
                <div className="flex gap-2 text-sm text-gray-600">
                  {product.color.join(", ")}
                </div>
              </div>
            )}

            {product.productColor && product.productColor.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Color</h4>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  {product.productColor.map(color => (
                    <span key={color} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full lowercase first-letter:uppercase">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-brand-maroon text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black font-semibold text-lg py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5 text-white dark:text-black" />
                <span className="text-white dark:text-black">Add to Cart</span>
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    requireAuth(() => {
                      const productUrl = typeof window !== 'undefined' ? window.location.href : `https://jewelpalacemumbai.com/product/${product._id}`;
                      const msg = `Hi Jewel Palace Borivali! I want to order: ${product.title} (ID: ${product._id}).\n\nProduct Link: ${productUrl}`;
                      window.open(`https://wa.me/919029923215?text=${encodeURIComponent(msg)}`, '_blank');
                    });
                  }}
                  className="bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 dark:border-[#25D366]/40 font-medium py-3.5 rounded-xl hover:bg-[#25D366]/20 dark:hover:bg-[#25D366]/20 transition-all flex justify-center items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Enquire on WhatsApp
                </button>
                <button 
                  onClick={() => {
                    requireAuth(() => {
                      const productUrl = typeof window !== 'undefined' ? window.location.href : `https://jewelpalacemumbai.com/product/${product._id}`;
                      const msg = `Hi Jewel Palace Borivali! I would like to reserve this product to pick up from the store: ${product.title} (ID: ${product._id}).\n\nProduct Link: ${productUrl}`;
                      window.open(`https://wa.me/919029923215?text=${encodeURIComponent(msg)}`, '_blank');
                    });
                  }}
                  className="bg-brand-maroon/5 hover:bg-brand-maroon/10 border border-brand-maroon/30 dark:bg-amber-400/15 dark:hover:bg-amber-400/25 dark:border-amber-400/60 font-semibold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Store className="h-5 w-5 text-brand-maroon dark:!text-amber-300 shrink-0" />
                  <span className="text-brand-maroon dark:!text-amber-300 font-semibold tracking-wide">
                    Reserve & Pick
                  </span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-stone-200/80 dark:border-stone-800 pt-8 mt-4">
              <div className="grid grid-cols-3 gap-2 p-4 bg-stone-50 dark:bg-[#160f0b] rounded-2xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="h-6 w-6 text-stone-500 dark:text-stone-400 mb-2" />
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">Authentic Quality</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 border-x border-stone-200 dark:border-stone-800">
                  <Truck className="h-6 w-6 text-stone-500 dark:text-stone-400 mb-2" />
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">Safe Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="h-6 w-6 text-stone-500 dark:text-stone-400 mb-2" />
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">Reliable Service</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL (Bigger View) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-150 touch-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
              resetLightboxZoom();
            }
          }}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-black/60 border-b border-white/10 z-30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
              <span className="text-white/90 font-serif text-xs sm:text-sm md:text-base font-medium truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {product.title}
              </span>
              {mediaList.length > 1 && (
                <span className="text-[11px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-full font-mono flex-shrink-0">
                  {activeMediaIndex + 1} / {mediaList.length}
                </span>
              )}
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLightboxScale((prev) => {
                    const next = Math.max(1, +(prev - 0.5).toFixed(1));
                    if (next === 1) setLightboxPos({ x: 0, y: 0 });
                    return next;
                  });
                }}
                disabled={lightboxScale <= 1}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={resetLightboxZoom}
                className="px-2 py-1 text-[11px] sm:text-xs font-mono text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(lightboxScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxScale((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
                }}
                disabled={lightboxScale >= 3}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-[1px] h-5 bg-white/15 mx-0.5 sm:mx-1" />
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  resetLightboxZoom();
                }}
                className="p-1.5 sm:p-2 text-white/90 hover:text-white bg-white/15 hover:bg-[#6b1414] rounded-full transition-colors cursor-pointer ml-0.5"
                title="Close (Esc)"
                aria-label="Close Fullscreen View"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewport with Smooth GPU Drag/Pan */}
          <div 
            className="relative flex-1 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLightboxOpen(false);
                resetLightboxZoom();
              }
            }}
          >
            {/* Left Prev Arrow */}
            {mediaList.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
                  resetLightboxZoom();
                }}
                className="absolute left-2 sm:left-6 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 shadow-2xl transition-all hover:scale-105 cursor-pointer active:scale-95"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Hint Badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-stone-900/80 backdrop-blur-md border border-white/10 text-white/80 text-[11px] sm:text-xs px-3 py-1 rounded-full shadow-lg">
              {lightboxScale === 1 ? "Tap / Click image to zoom" : "Drag to explore • Tap to zoom out"}
            </div>

            {/* Main Interactive Lightbox Media */}
            <div 
              className={`relative max-w-4xl max-h-[62vh] sm:max-h-[72vh] md:max-h-[78vh] w-full h-full flex items-center justify-center select-none touch-none ${
                lightboxScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={handleMediaClick}
              style={{
                transform: `translate3d(${lightboxPos.x}px, ${lightboxPos.y}px, 0) scale(${lightboxScale})`,
                transition: isDraggingRef.current ? 'none' : 'transform 180ms ease-out',
                willChange: 'transform',
              }}
            >
              {activeMedia.mediaType === 'video' ? (
                <video
                  src={activeMedia.url}
                  autoPlay
                  controls
                  loop
                  muted
                  className="max-w-full max-h-[60vh] sm:max-h-[72vh] object-contain rounded-lg"
                />
              ) : (
                <div className="relative w-full h-[58vh] sm:h-[68vh] md:h-[75vh] flex items-center justify-center pointer-events-none">
                  <Image
                    src={activeMedia.url}
                    alt={product.title}
                    fill
                    className="object-contain drop-shadow-2xl pointer-events-none"
                    priority
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />
                </div>
              )}
            </div>

            {/* Right Next Arrow */}
            {mediaList.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
                  resetLightboxZoom();
                }}
                className="absolute right-2 sm:right-6 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 shadow-2xl transition-all hover:scale-105 cursor-pointer active:scale-95"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {mediaList.length > 1 && (
            <div className="p-2.5 sm:p-3.5 bg-black/70 border-t border-white/10 z-30 flex justify-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar">
              {mediaList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveMediaIndex(idx);
                    resetLightboxZoom();
                  }}
                  className={`relative w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    idx === activeMediaIndex
                      ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20 ring-1 ring-amber-400/40'
                      : 'border-white/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full bg-stone-800 flex items-center justify-center text-xs text-white">
                      ▶
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
