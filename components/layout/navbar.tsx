'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Heart, Menu, X, Loader2, TrendingUp } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { formatBDT } from '@/lib/format';

const navLinks = [
  { href: '/shop', label: 'All' },
  { href: '/shop/luxury-pret', label: 'Luxury Pret' },
  { href: '/shop/unstitched', label: 'Unstitched' },
  { href: '/shop/stitched', label: 'Stitched' },
  { href: '/shop/sarees', label: 'Sarees' },
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/accessories', label: 'Accessories' },
];

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
};

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setCartOpen } = useCart();
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isLight = scrolled || mobileOpen;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isLight ? 'glass border-b border-border/50 py-3' : 'bg-transparent py-5'
        )}
      >
        <nav className="container-luxury flex items-center justify-between">
          <button
            className={cn('lg:hidden', isLight ? 'text-foreground' : 'text-white')}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            href="/"
            className={cn(
              'font-serif text-xl md:text-2xl tracking-wide transition-colors',
              isLight ? 'text-foreground' : 'text-white'
            )}
          >
            <span className="font-medium">The Libaas</span>{' '}
            <span className="text-gold-500 italic">Gallery</span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors hover:text-gold-500',
                  isLight ? 'text-foreground/80' : 'text-white/80',
                  pathname === link.href && 'text-gold-500'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn('transition-colors hover:text-gold-500 flex items-center gap-1.5', isLight ? 'text-foreground' : 'text-white')}
              aria-label="Search"
            >
              <Search size={20} />
              <span className="hidden xl:inline text-xs uppercase tracking-wider">Search</span>
              <kbd className="hidden xl:inline text-[10px] border border-current/20 rounded px-1 py-0.5 opacity-50">⌘K</kbd>
            </button>

            <Link
              href={user ? '/account' : '/signin'}
              className={cn('transition-colors hover:text-gold-500', isLight ? 'text-foreground' : 'text-white')}
              aria-label="Account"
            >
              <User size={20} />
            </Link>

            {user && (
              <Link
                href="/wishlist"
                className={cn('hidden sm:block transition-colors hover:text-gold-500', isLight ? 'text-foreground' : 'text-white')}
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className={cn('relative transition-colors hover:text-gold-500', isLight ? 'text-foreground' : 'text-white')}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-xl pt-24 pb-8 px-6 border-b border-border"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      href={link.href}
                      className={cn(
                        'block py-3 text-lg font-medium border-b border-border/50',
                        pathname === link.href ? 'text-gold-500' : 'text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {user && (
                  <Link href="/wishlist" className="block py-3 text-lg font-medium text-foreground">Wishlist</Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className="block py-3 text-lg font-medium text-gold-500">Admin Dashboard</Link>
                )}
                <Link href="/about" className="block py-3 text-lg font-medium text-foreground">About</Link>
                <Link href="/contact" className="block py-3 text-lg font-medium text-foreground">Contact</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHighlighted(-1);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, category:categories(name), product_images(url, is_primary)')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(8);
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.product_images?.find((img: any) => img.is_primary)?.url || p.product_images?.[0]?.url || '',
          category: p.category?.name || '',
        }));
        setResults(mapped);
        setHighlighted(mapped.length > 0 ? 0 : -1);
      }
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0 && results[highlighted]) {
      e.preventDefault();
      window.location.href = `/product/${results[highlighted].slug}`;
    }
  };

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setHighlighted(-1);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] glass-dark"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="container-luxury pt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50" size={22} />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search the gallery..."
                  className="w-full bg-transparent border-b border-white/20 text-white text-2xl pl-10 pr-12 py-4 focus:outline-none focus:border-gold-500 transition-colors"
                />
                <button onClick={onClose} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {loading && (
                <div className="mt-6 flex items-center gap-2 text-white/50">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Searching...</span>
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/50 mb-1">No results found</p>
                  <p className="text-white/30 text-sm">Try a different search term</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="mt-6 space-y-1">
                  {results.map((r, i) => (
                    <Link
                      key={r.id}
                      href={`/product/${r.slug}`}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-lg transition-colors',
                        highlighted === i ? 'bg-white/10' : 'hover:bg-white/5'
                      )}
                      onMouseEnter={() => setHighlighted(i)}
                    >
                      {r.image ? (
                        <img src={r.image} alt={r.name} className="w-14 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-14 h-14 bg-white/10 rounded flex items-center justify-center">
                          <Search size={20} className="text-white/30" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium">{r.name}</p>
                        {r.category && <p className="text-white/40 text-xs">{r.category}</p>}
                      </div>
                      <p className="text-gold-500 text-sm font-medium">{formatBDT(r.price)}</p>
                    </Link>
                  ))}
                </div>
              )}

              {!query && (
                <div className="mt-6">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Saree', 'Panjabi', 'Kurti', 'Luxury Pret', 'Unstitched'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 text-sm text-white/70 border border-white/15 rounded-full hover:border-gold-500 hover:text-gold-500 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
