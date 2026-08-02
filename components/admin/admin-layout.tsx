'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, Ticket, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    if (profile && profile.role !== 'admin') {
      router.push('/account');
    }
  }, [user, profile, loading, router]);

  if (loading || !user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-900 text-white/80 fixed left-0 top-0 bottom-0 hidden lg:flex flex-col py-6 overflow-y-auto">
        <div className="px-6 mb-8">
          <Link href="/admin" className="font-serif text-xl text-white">
            The Libaas <span className="text-gold-500 italic">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-gold-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pt-6 border-t border-white/10 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-ink-900 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-serif text-lg">
          The Libaas <span className="text-gold-500 italic">Admin</span>
        </Link>
        <select
          onChange={(e) => router.push(e.target.value)}
          value={pathname}
          className="bg-ink-800 text-white text-sm rounded px-2 py-1.5 border border-white/10"
        >
          {adminLinks.map((link) => (
            <option key={link.href} value={link.href}>{link.label}</option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
