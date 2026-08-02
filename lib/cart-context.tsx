'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { CartItem } from '@/lib/types';

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  applyCoupon: (code: string, subtotal: number) => Promise<{ error: string | null; discount: number }>;
  removeCoupon: () => void;
  discountAmount: number;
};

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  isCartOpen: false,
  setCartOpen: () => {},
  appliedCoupon: null,
  applyCoupon: async () => ({ error: 'Not initialized', discount: 0 }),
  removeCoupon: () => {},
  discountAmount: 0,
});

const STORAGE_KEY = 'tlg_cart';
const COUPON_KEY = 'tlg_coupon';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setAppliedCoupon(JSON.parse(coupon));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) {
      if (appliedCoupon) localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      else localStorage.removeItem(COUPON_KEY);
    }
  }, [appliedCoupon, hydrated]);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === newItem.product_id && i.variant_id === newItem.variant_id
      );
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id && i.variant_id === newItem.variant_id
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i
        );
      }
      return [...prev, newItem];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.product_id === productId && i.variant_id === variantId) {
            return { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) };
          }
          return i;
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback(async (code: string, sub: number) => {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return { error: 'Invalid coupon code', discount: 0 };
    }

    if (data.min_order_amount && sub < data.min_order_amount) {
      return {
        error: `Minimum order of ${data.min_order_amount} ৳ required`,
        discount: 0,
      };
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      return { error: 'This coupon has reached its usage limit', discount: 0 };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { error: 'This coupon has expired', discount: 0 };
    }

    let discount = 0;
    if (data.type === 'percentage') {
      discount = Math.round((sub * data.value) / 100);
    } else {
      discount = Math.min(data.value, sub);
    }

    setAppliedCoupon({ code: data.code, discountAmount: discount });
    return { error: null, discount };
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount: appliedCoupon?.discountAmount || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
