"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageCircle, ShoppingBag, Store, Heart, Tag, ShieldCheck, Truck, RotateCcw, Loader2 } from "lucide-react";
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

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-16 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-maroon" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen py-16 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">Product Not Found</h2>
        <Link href="/collections" className="text-brand-maroon hover:underline">
          Return to Collections
        </Link>
      </div>
    );
  }

  const mediaList = product.media && product.media.length > 0 
    ? product.media 
    : [{ url: product.imageUrl, mediaType: 'image' }];

  const activeMedia = mediaList[activeMediaIndex];
  
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
    <div className="bg-white min-h-screen py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-brand-maroon transition-colors">Home</Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link href="/collections" className="hover:text-brand-maroon transition-colors">Collections</Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]" aria-current="page">
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
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 rounded-md overflow-hidden border-2 ${idx === activeMediaIndex ? 'border-brand-maroon' : 'border-transparent'}`}
                  >
                    {item.mediaType === 'video' ? (
                      <div className="w-full h-full bg-gray-100 flex justify-center items-center group relative">
                        <video src={item.url} className="object-cover w-full h-full opacity-50" />
                        <div className="absolute inset-0 flex justify-center items-center bg-black/20">
                          <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-sm shadow-sm pl-0.5">▶</span>
                        </div>
                      </div>
                    ) : (
                      <Image src={item.url} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Media */}
            <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden flex-1 flex items-center justify-center">
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
                <Image src={activeMedia.url} alt={product.title} fill className="object-cover" priority />
              )}
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-brand-maroon text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded shadow-sm">
                  {occasionDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4 pr-8 line-clamp-3">
                {product.title}
              </h1>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={handleWishlistToggle}
                  className={`p-2 transition-all rounded-full ${
                    isWishlisted 
                      ? 'bg-brand-maroon text-white hover:bg-brand-maroon/90 shadow-md' 
                      : 'bg-gray-50 text-gray-400 hover:text-brand-maroon'
                  }`} 
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-semibold text-brand-maroon">₹{product.price.toLocaleString("en-IN")}</span>
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
                className="w-full bg-foreground text-white font-medium text-lg py-4 rounded hover:bg-brand-maroon shadow-md transition-all flex justify-center items-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    requireAuth(() => {
                      window.open(`https://wa.me/919029923215?text=Hi Jewel Palace Borivali! I want to order: ${product.title} (ID: ${product._id}).%0A%0AReference Image: ${encodeURIComponent(product.imageUrl)}`, '_blank');
                    });
                  }}
                  className="bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 font-medium py-3.5 rounded hover:bg-[#25D366]/20 transition-all flex justify-center items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </button>
                <button 
                  onClick={() => {
                    requireAuth(() => {
                      window.open(`https://wa.me/919029923215?text=Hi Jewel Palace Borivali! I would like to reserve this product to pick up from the store: ${product.title} (ID: ${product._id}).%0A%0AReference Image: ${encodeURIComponent(product.imageUrl)}`, '_blank');
                    });
                  }}
                  className="bg-brand-gold/10 text-brand-maroon border border-brand-gold/50 font-medium py-3.5 rounded hover:bg-brand-gold/20 transition-all flex justify-center items-center gap-2"
                >
                  <Store className="h-5 w-5" />
                  Reserve & Pick
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-100 pt-8 mt-4">
              <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">Authentic Quality</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 border-x border-gray-200">
                  <Truck className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">Safe Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">Reliable Service</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
