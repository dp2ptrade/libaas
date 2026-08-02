'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { ProductImage } from '@/lib/types';

export function ProductScrubSection({ images }: { images: ProductImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['10%', '-5%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['5%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const sorted = [...(images || [])].sort((a, b) => a.sort_order - b.sort_order);
  const imgs = sorted.slice(0, 3);
  while (imgs.length < 3) imgs.push(sorted[imgs.length] || sorted[0]);

  return (
    <section ref={ref} className="relative h-[80vh] bg-ink-900 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 md:p-16">
        {[y1, y2, y3].map((y, i) => (
          <motion.div
            key={i}
            style={{ y }}
            className={`relative overflow-hidden rounded-lg ${i === 1 ? 'mt-12 md:mt-24' : ''}`}
          >
            {imgs[i] && (
              <img
                src={imgs[i].url}
                alt={imgs[i].alt_text || ''}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>
        ))}
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 pointer-events-none"
      >
        <p className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-4">
          Every Detail Considered
        </p>
        <h2 className="font-serif text-3xl md:text-5xl text-white text-shadow-luxury text-balance max-w-2xl">
          Crafted to be Treasured
        </h2>
      </motion.div>
    </section>
  );
}
