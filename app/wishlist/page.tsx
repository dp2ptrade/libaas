'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/shop/product-card';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    const fetchWishlist = async () => {
      const { data } = await supabase
        .from('wishlists')
        .select('product:products(*, category:categories(*), product_images(*), product_variants(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const items = (data || []).map((d: any) => d.product).filter(Boolean) as Product[];
      setProducts(items);
      setLoading(false);
    };
    fetchWishlist();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container-luxury py-28 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="font-serif text-4xl md:text-5xl mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {products.length} {products.length === 1 ? 'item' : 'items'} saved
        </p>
      </motion.div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="font-serif text-2xl mb-2">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-8">Save items you love to find them here later.</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-8 py-3 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
          >
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
