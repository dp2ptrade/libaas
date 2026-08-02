'use client';

import { motion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container-luxury py-28 md:py-32 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Information</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Shipping & Returns</h1>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-2xl mb-3 flex items-center gap-2"><Truck size={22} className="text-gold-600" /> Shipping</h2>
            <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>We ship across Bangladesh with our trusted courier partners. Orders are processed within 1-2 business days.</p>
              <p><strong className="text-foreground">Inside Dhaka:</strong> 60 ৳ — delivered in 1-2 days</p>
              <p><strong className="text-foreground">Outside Dhaka:</strong> 150 ৳ — delivered in 2-4 days</p>
              <p><strong className="text-foreground">Free shipping</strong> on all orders above 5,000 ৳</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-3 flex items-center gap-2"><RotateCcw size={22} className="text-gold-600" /> Returns & Exchanges</h2>
            <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>We offer a 7-day return policy on all non-couture items. Products must be unworn, unwashed, and with all tags attached.</p>
              <p>Couture and made-to-measure pieces are non-returnable unless there is a manufacturing defect.</p>
              <p>To initiate a return, contact us at hello@libaasgallery.com with your order number.</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-3 flex items-center gap-2"><ShieldCheck size={22} className="text-gold-600" /> Quality Guarantee</h2>
            <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>Every piece is inspected by hand before dispatch. If you receive a damaged or incorrect item, we will replace it at no cost.</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
