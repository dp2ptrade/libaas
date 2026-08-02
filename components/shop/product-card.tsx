'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatBDT, calculateDiscount } from '@/lib/format';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [wished, setWished] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const secondaryImage = product.product_images?.find((img) => !img.is_primary);
  const imageUrl = primaryImage?.url || product.product_images?.[0]?.url || '';
  const hoverImageUrl = secondaryImage?.url || imageUrl;
  const discount = calculateDiscount(product.price, product.compare_price);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to save items to your wishlist');
      router.push('/signin');
      return;
    }
    if (wished) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      setWished(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      setWished(true);
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-muted mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={hovered ? hoverImageUrl : imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="px-2.5 py-1 bg-ink-900 text-white text-[10px] font-medium uppercase tracking-wider">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-gold-500 text-white text-[10px] font-medium uppercase tracking-wider">
              {discount}% Off
            </span>
          )}
          {product.is_best_seller && (
            <span className="px-2.5 py-1 bg-success text-white text-[10px] font-medium uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            className={wished ? 'fill-destructive text-destructive' : 'text-ink-700'}
          />
        </button>

        {/* Quick add overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-silk">
          <div className="bg-white/95 backdrop-blur-sm py-3 text-center text-xs font-medium uppercase tracking-wider text-ink-900">
            View Details
          </div>
        </div>
      </div>

      <div className="px-1">
        <h3 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-gold-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {product.fabric}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-medium text-sm text-foreground">{formatBDT(product.price)}</span>
          {product.compare_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBDT(product.compare_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
