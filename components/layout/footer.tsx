'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-900 text-white/70 mt-20">
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-2xl text-white mb-4">
              The Libaas <span className="text-gold-500 italic">Gallery</span>
            </h3>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              Where heritage meets modern elegance. Crafted in Bangladesh with
              artisanal detail and uncompromising quality.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-white/50 hover:text-gold-500 transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/50 hover:text-gold-500 transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="mailto:hello@libaasgallery.com" className="text-white/50 hover:text-gold-500 transition-colors" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop/luxury-pret" className="hover:text-gold-500 transition-colors">Luxury Pret</Link></li>
              <li><Link href="/shop/unstitched" className="hover:text-gold-500 transition-colors">Unstitched</Link></li>
              <li><Link href="/shop/sarees" className="hover:text-gold-500 transition-colors">Sarees</Link></li>
              <li><Link href="/shop/men" className="hover:text-gold-500 transition-colors">Men</Link></li>
              <li><Link href="/shop/accessories" className="hover:text-gold-500 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-gold-500 transition-colors">Contact</Link></li>
              <li><Link href="/shipping" className="hover:text-gold-500 transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-gold-500 transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="hover:text-gold-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-gold-500 shrink-0" />
                <span>Gulshan Avenue, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-500 shrink-0" />
                <span>+880 1700 000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-500 shrink-0" />
                <span>hello@libaasgallery.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} The Libaas Gallery. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>We accept:</span>
            <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-medium">Visa</span>
            <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-medium">bKash</span>
            <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-medium">Nagad</span>
            <span className="px-2 py-1 bg-white/10 rounded text-white/70 font-medium">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
