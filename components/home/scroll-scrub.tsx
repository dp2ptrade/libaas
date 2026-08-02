'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const scrubImages = [
  'https://images.pexels.com/photos/14284158/pexels-photo-14284158.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/18799596/pexels-photo-18799596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2728267/pexels-photo-2728267.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/12713395/pexels-photo-12713395.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/14284143/pexels-photo-14284143.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/37962746/pexels-photo-37962746.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/30703872/pexels-photo-30703872.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export function ScrollScrubVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const frameCount = scrubImages.length;
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section ref={ref} className="relative h-[400vh] bg-ink-900">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Stacked images with opacity driven by scroll */}
        <div className="relative w-full h-full">
          {scrubImages.map((src, i) => (
            <ScrubFrame
              key={i}
              src={src}
              index={i}
              total={frameCount}
              progress={scrollYProgress}
            />
          ))}
        </div>

        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
            }}
            className="text-center px-6"
          >
            <p className="text-gold-400 text-xs md:text-sm uppercase tracking-[0.3em] mb-4">
              The Craft
            </p>
            <h2 className="font-serif text-4xl md:text-6xl text-white text-shadow-luxury text-balance">
              Every Thread Tells a Story
            </h2>
            <p className="text-white/60 mt-6 max-w-xl mx-auto text-balance text-sm md:text-base">
              Scroll to journey through our atelier — from the first stitch to
              the final reveal.
            </p>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full bg-gold-500 origin-left"
          />
        </div>
      </div>
    </section>
  );
}

function ScrubFrame({
  src,
  index,
  total,
  progress,
}: {
  src: string;
  index: number;
  total: number;
  progress: any;
}) {
  const segmentSize = 1 / (total - 1);
  const start = Math.max(0, index * segmentSize - segmentSize * 0.5);
  const end = Math.min(1, index * segmentSize + segmentSize * 0.5);

  const opacity = useTransform(progress, [start, index * segmentSize, end], [0, 1, 0]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
    </motion.div>
  );
}
