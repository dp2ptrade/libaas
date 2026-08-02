'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeatureStrip() {
  const features = [
    { icon: '✦', title: 'Free Shipping', desc: 'On orders over 5,000 ৳' },
    { icon: '◈', title: 'Easy Returns', desc: '7-day return policy' },
    { icon: '✧', title: 'Secure Payments', desc: 'Visa, bKash, Nagad, COD' },
    { icon: '❋', title: 'Authentic Craft', desc: 'Hand-made in Bangladesh' },
  ];

  return (
    <section className="border-y border-border bg-background">
      <div className="container-luxury">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-3 px-4 py-6"
            >
              <span className="text-gold-500 text-2xl shrink-0">{f.icon}</span>
              <div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EditorialSplit() {
  return (
    <section className="py-24 bg-background">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <img
              src="https://images.pexels.com/photos/14284143/pexels-photo-14284143.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="The Libaas Gallery craft"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-4">
              The Atelier
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-balance">
              A Legacy Stitched <br /> in Gold Thread
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each Libaas piece begins as a sketch and ends as an heirloom. Our
              artisans — some with forty years at the loom — translate heritage
              motifs into modern silhouettes, one stitch at a time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From zardozi to chikan, from raw silk to chiffon, every material is
              sourced with intention and every finish is inspected by hand.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:text-gold-600 transition-colors group w-fit"
            >
              Our Story
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
