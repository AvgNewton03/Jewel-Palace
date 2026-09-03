"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  hoverImageUrl?: string;
  occasion?: string;
  isNew?: boolean;
}

export default function ProductCard({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  hoverImageUrl,
  occasion,
  isNew
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { user, addToWishlist, removeFromWishlist } = useAuth();
  const router = useRouter();

  // Check if this product is in the user's wishlist
  const isWishlisted = user?.wishlist?.some((item: any) => 
    (typeof item === 'string' ? item : item._id) === id
  );

  const requireAuth = useRequireAuth();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      if (isWishlisted) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    });
  };

  return (
    <div 
      className="group flex flex-col bg-stone-50 dark:bg-[#241a14] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-[#1a120e]">
        <Link href={`/product/${id}`} className="block w-full h-full">
          <Image
            src={isHovered && hoverImageUrl ? hoverImageUrl : imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded">
              New
            </span>
          )}
          {occasion && (
            <span className="bg-[#6b1414]/90 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded truncate max-w-[120px]">
              {occasion}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 transition-all backdrop-blur rounded-full p-2 shadow-sm ${
            isWishlisted 
              ? 'bg-[#6b1414] text-white hover:bg-[#801818] shadow-[#6b1414]/30' 
              : 'bg-white/80 dark:bg-black/60 text-stone-400 hover:text-[#6b1414] dark:hover:text-amber-400'
          }`} 
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions (Desktop Hover / Mobile Visible) */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 md:translate-y-full md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent flex gap-2"
        >
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart({ id, title, price, imageUrl });
            }}
            className="flex-1 bg-white dark:bg-stone-800 hover:bg-[#6b1414] hover:text-white dark:hover:bg-amber-600 text-stone-900 dark:text-stone-100 text-sm font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
          <Link href={`/product/${id}`} className="bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 p-2.5 rounded transition-colors tooltip flex items-center justify-center" aria-label="Quick View">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider mb-1 truncate max-w-full">{occasion || 'Jewellery'}</p>
        <Link href={`/product/${id}`} className="font-serif text-lg text-stone-900 dark:text-stone-100 hover:text-[#6b1414] dark:hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2 font-medium">
          {title}
        </Link>
        <div className="mt-auto flex items-center gap-2">
          <span className="font-semibold text-[#8a1c1c] dark:text-amber-400">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="text-sm text-stone-400 dark:text-stone-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
