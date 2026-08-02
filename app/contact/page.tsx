'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const contactInfo = [
    { icon: MapPin, label: 'Address', value: 'Gulshan Avenue, Dhaka 1212, Bangladesh' },
    { icon: Phone, label: 'Phone', value: '+880 1700 000000' },
    { icon: Mail, label: 'Email', value: 'hello@libaasgallery.com' },
  ];

  return (
    <div className="container-luxury py-28 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-2xl mx-auto"
      >
        <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Get in Touch</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Contact Us</h1>
        <p className="text-muted-foreground">
          Questions about an order, a custom piece, or anything else? We are here to help.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {/* Contact info */}
        <div className="lg:col-span-1 space-y-8">
          {contactInfo.map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                <info.icon size={20} className="text-gold-600" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">{info.label}</p>
                <p className="text-sm text-muted-foreground">{info.value}</p>
              </div>
            </motion.div>
          ))}

          <div className="pt-8 border-t border-border">
            <h3 className="font-medium text-sm mb-3">Store Hours</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Saturday – Thursday: 10am – 9pm</p>
              <p>Friday: 3pm – 9pm</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
