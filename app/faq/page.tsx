'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    { q: 'How long does delivery take?', a: 'Inside Dhaka: 1-2 business days. Outside Dhaka: 2-4 business days. Couture and made-to-measure pieces may take 2-3 weeks as they are hand-crafted.' },
    { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), Visa/Mastercard, bKash, and Nagad. For bKash and Nagad, complete the payment and enter your transaction ID at checkout.' },
    { q: 'Can I return or exchange an item?', a: 'Yes, non-couture items can be returned within 7 days, provided they are unworn, unwashed, and have all tags attached. Couture and made-to-measure pieces are non-returnable unless defective.' },
    { q: 'Do you offer custom tailoring?', a: 'Yes! Our couture and formal wear pieces can be made to your measurements. Contact us at hello@libaasgallery.com for custom orders.' },
    { q: 'Are your products hand-crafted?', a: 'Every piece in our collection is hand-crafted by skilled artisans in Bangladesh, using traditional techniques like zardozi, chikan, and block printing.' },
    { q: 'Do you ship internationally?', a: 'We currently ship within Bangladesh only. International shipping is coming soon — follow us on social media for updates.' },
  ];

  return (
    <div className="container-luxury py-28 md:py-32 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Help Center</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Frequently Asked Questions</h1>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform shrink-0 ml-2 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
                >
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
