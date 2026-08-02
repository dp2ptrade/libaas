'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/admin/editable-text';

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0"
      >
        <img
          src="https://images.pexels.com/photos/37962746/pexels-photo-37962746.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="The Libaas Gallery Couture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-gold-400 text-sm md:text-base uppercase tracking-[0.3em] mb-6"
        >
          <EditableText contentKey="hero_eyebrow" fallback="Couture & Pret — Est. 2024" as="span" />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white text-shadow-luxury text-balance max-w-4xl"
        >
          <EditableText contentKey="hero_title" fallback="Where Heritage Meets Elegance" as="span" className="font-serif text-5xl md:text-7xl lg:text-8xl text-white text-shadow-luxury text-balance" />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-white/80 text-lg md:text-xl mt-8 max-w-xl text-balance"
        >
          <EditableText contentKey="hero_subtitle" fallback="Hand-crafted couture, luxury pret, and timeless menswear — made in Bangladesh, designed for the world." as="span" />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-900 text-sm font-medium uppercase tracking-wider hover:bg-gold-500 hover:text-white transition-all duration-300"
          >
            <EditableText contentKey="hero_cta_primary" fallback="Explore Collection" as="span" />
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white text-sm font-medium uppercase tracking-wider hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
          >
            <EditableText contentKey="hero_cta_secondary" fallback="Our Story" as="span" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
