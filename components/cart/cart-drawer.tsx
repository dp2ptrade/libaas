'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatBDT } from '@/lib/format';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    discountAmount,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-serif text-xl flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold-500" />
                Your Cart
                {totalItems > 0 && (
                  <span className="text-sm text-muted-foreground">({totalItems})</span>
                )}
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag size={32} className="text-muted-foreground" />
                </div>
                <p className="font-serif text-lg mb-2">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Discover our latest collection
                </p>
                <Link
                  href="/shop"
                  onClick={() => setCartOpen(false)}
                  className="px-6 py-3 bg-foreground text-background text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product_id}-${item.variant_id}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="shrink-0"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-24 object-cover rounded-md"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="font-medium text-sm hover:text-gold-500 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                          {item.size && <span>{item.size}</span>}
                          {item.color && (
                            <span className="flex items-center gap-1">
                              <span
                                className="w-3 h-3 rounded-full border border-border"
                                style={{ backgroundColor: item.color_hex || undefined }}
                              />
                              {item.color}
                            </span>
                          )}
                        </div>
                        <p className="text-gold-600 font-medium text-sm mt-1">
                          {formatBDT(item.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id, item.variant_id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-6 py-5 space-y-3">
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount</span>
                      <span className="text-success">-{formatBDT(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBDT(subtotal - discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between font-serif text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatBDT(subtotal - discountAmount)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="block w-full text-center py-4 bg-foreground text-background text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
