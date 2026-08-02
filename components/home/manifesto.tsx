'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { EditableText } from '@/components/admin/editable-text';

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section ref={ref} className="py-32 bg-ink-900 relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/8426345/pexels-photo-8426345.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="container-luxury relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-8 text-center"
        >
          Our Philosophy
        </motion.p>

        <div className="max-w-4xl mx-auto text-center">
          <EditableText
            contentKey="manifesto_title"
            fallback="Where Heritage Meets the Contemporary"
            as="h2"
            multiline
            className="font-serif text-2xl md:text-4xl lg:text-5xl text-white/90 leading-relaxed text-balance"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { num: '200+', label: 'Hours per Couture Piece' },
            { num: '100%', label: 'Hand-Crafted in Bangladesh' },
            { num: '50k+', label: 'Happy Customers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-gold-400">{stat.num}</p>
              <p className="text-white/50 text-sm mt-2 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
