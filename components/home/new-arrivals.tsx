'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatBDT, calculateDiscount } from '@/lib/format';
import { ProductCard } from '@/components/shop/product-card';

export function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Just Arrived</p>
            <h2 className="font-serif text-4xl md:text-5xl">New Arrivals</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium uppercase tracking-wider hover:text-gold-600 transition-colors flex items-center gap-2 group"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
