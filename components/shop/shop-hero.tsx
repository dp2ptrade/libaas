'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

export function ShopHero({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={ref} className="relative h-[50vh] min-h-[400px] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <img
            src="https://images.pexels.com/photos/7676340/pexels-photo-7676340.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-4"
        >
          The Libaas Gallery
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl md:text-6xl text-white text-shadow-luxury text-balance"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/70 mt-4 max-w-xl text-balance text-sm md:text-base"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
