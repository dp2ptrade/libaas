'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/shop/product-card';

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">You May Also Like</p>
          <h2 className="font-serif text-3xl md:text-4xl">Complete the Look</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
