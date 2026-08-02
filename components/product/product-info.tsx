'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Truck, RotateCcw, ShieldCheck, Check, Minus, Plus } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { formatBDT, calculateDiscount } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ProductInfo({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const variants = product.product_variants || [];
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Map(variants.map((v) => [v.color, v])).values()) as ProductVariant[];

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0]?.color || null
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const availableStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const discount = calculateDiscount(product.price, product.compare_price);

  const handleAddToCart = async () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    setAdding(true);
    const primaryImage = product.product_images?.find((img) => img.is_primary);
    const imageUrl = primaryImage?.url || product.product_images?.[0]?.url || '';

    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      name: product.name,
      slug: product.slug,
      price: product.price + (selectedVariant?.price_adjustment || 0),
      image_url: imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: availableStock,
    });

    setTimeout(() => setAdding(false), 500);
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.info('Please sign in to save items');
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
    <div className="space-y-6">
      {/* Title & price */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {product.is_new_arrival && (
            <span className="px-2 py-0.5 bg-ink-900 text-white text-[10px] font-medium uppercase tracking-wider">
              New
            </span>
          )}
          {product.is_best_seller && (
            <span className="px-2 py-0.5 bg-success text-white text-[10px] font-medium uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mb-3">{product.name}</h1>
        <p className="text-muted-foreground text-sm">{product.short_description}</p>

        <div className="flex items-center gap-3 mt-4">
          <span className="font-serif text-2xl text-foreground">{formatBDT(product.price)}</span>
          {product.compare_price && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatBDT(product.compare_price)}
              </span>
              <span className="px-2 py-0.5 bg-gold-500/10 text-gold-700 text-xs font-medium rounded">
                Save {discount}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium uppercase tracking-wider">Size</p>
            <span className="text-xs text-muted-foreground">Size guide</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2.5 border text-sm font-medium transition-all ${
                  selectedSize === size
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-border hover:border-ink-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && colors[0]?.color && (
        <div>
          <p className="text-sm font-medium uppercase tracking-wider mb-3">
            Color {selectedColor && <span className="text-muted-foreground normal-case">— {selectedColor}</span>}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedColor(variant.color)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === variant.color
                    ? 'border-gold-500 ring-2 ring-gold-500/20'
                    : 'border-border hover:border-gold-500'
                }`}
                style={{ backgroundColor: variant.color_hex || '#ccc' }}
                title={variant.color || ''}
              >
                {selectedColor === variant.color && (
                  <Check
                    size={16}
                    className="absolute inset-0 m-auto text-white drop-shadow"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & stock */}
      <div>
        <p className="text-sm font-medium uppercase tracking-wider mb-3">Quantity</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-5 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
              className="px-3 py-2.5 hover:bg-muted transition-colors"
              disabled={quantity >= availableStock}
            >
              <Plus size={16} />
            </button>
          </div>
          <span className={`text-xs ${availableStock < 10 ? 'text-warning' : 'text-muted-foreground'}`}>
            {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={adding || availableStock === 0}
          className="flex-1 py-4 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={toggleWishlist}
          className="w-14 h-14 border border-border flex items-center justify-center hover:border-gold-500 transition-colors"
        >
          <Heart
            size={20}
            className={wished ? 'fill-destructive text-destructive' : 'text-foreground'}
          />
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        {[
          { icon: Truck, label: 'Free shipping over 5,000 ৳' },
          { icon: RotateCcw, label: '7-day easy returns' },
          { icon: ShieldCheck, label: 'Secure checkout' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
            <item.icon size={20} className="text-gold-600" />
            <p className="text-[11px] text-muted-foreground leading-tight">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {product.description && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Details */}
      <div className="pt-4 border-t border-border space-y-2">
        {product.fabric && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fabric</span>
            <span className="font-medium">{product.fabric}</span>
          </div>
        )}
        {product.care_instructions && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Care</span>
            <span className="font-medium text-right max-w-[60%]">{product.care_instructions}</span>
          </div>
        )}
        {product.sku && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SKU</span>
            <span className="font-medium">{product.sku}</span>
          </div>
        )}
      </div>
    </div>
  );
}
