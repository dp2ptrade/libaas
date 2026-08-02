'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/8886952/pexels-photo-8886952.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="The Libaas Gallery atelier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-4"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl text-white text-shadow-luxury text-balance"
          >
            The Art of <span className="italic text-gold-400">Libaas</span>
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="container-luxury max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="font-serif text-3xl mb-6">From Dhaka to the World</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Libaas Gallery was born from a simple belief: that the artisanal
              textile heritage of Bangladesh deserves a global stage. Founded in
              2024, we set out to bridge the gap between centuries-old craft
              techniques and the modern wardrobe.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every piece in our collection is hand-crafted by artisans who have
              inherited their skills across generations — from zardozi embroidery
              to block printing, from handloom weaving to natural dyeing. We work
              directly with these craftspeople, ensuring fair wages and preserving
              techniques that might otherwise be lost.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our designs are contemporary, but our roots are deep. We believe
              that true luxury is not about logos — it is about the human hands
              that made what you wear.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/30">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Artisan Craft', desc: 'Every piece is hand-crafted by skilled artisans in Bangladesh, using techniques passed down through generations.' },
              { title: 'Ethical Sourcing', desc: 'We work directly with our craftspeople, ensuring fair wages and sustainable practices at every step.' },
              { title: 'Timeless Design', desc: 'We design beyond trends — pieces meant to be treasured and passed on, not discarded after a season.' },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <h3 className="font-serif text-2xl mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-ink-900 text-center">
        <div className="container-luxury">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-white mb-6 text-balance"
          >
            Discover Our Collection
          </motion.h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-900 text-sm font-medium uppercase tracking-wider hover:bg-gold-500 hover:text-white transition-colors group"
          >
            Explore Now
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
