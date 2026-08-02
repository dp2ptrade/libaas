'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <section className="py-24 bg-background">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Explore</p>
          <h2 className="font-serif text-4xl md:text-5xl">Shop by Category</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link href={`/shop/${cat.slug}`} className="group block">
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 bg-muted">
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                </div>
                <p className="text-center font-medium text-sm md:text-base group-hover:text-gold-600 transition-colors">
                  {cat.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
