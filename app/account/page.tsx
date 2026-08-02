'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, MapPin, User, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { formatBDT, formatDate } from '@/lib/format';
import type { Order, Address } from '@/lib/types';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchData = async () => {
      const [{ data: ordersData }, { data: addrData }] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at'),
      ]);
      setOrders((ordersData as Order[]) || []);
      setAddresses((addrData as Address[]) || []);
    };
    fetchData();
  }, [user, router]);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);
    if (error) {
      toast.error('Could not update profile');
      return;
    }
    toast.success('Profile updated');
    setEditingName(false);
    refreshProfile();
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container-luxury py-28 md:py-32">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-2">My Account</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-white font-medium">
                {(profile?.full_name || user.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name || 'Member'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'wishlist') {
                    router.push('/wishlist');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-ink-900 text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-serif text-2xl mb-6">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-lg">
                  <Package size={40} className="mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-2">No orders yet</p>
                  <p className="text-sm text-muted-foreground mb-6">When you place orders, they will appear here.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-3 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-muted'}`}>
                            {order.status}
                          </span>
                          <span className="font-serif text-lg">{formatBDT(order.total)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {order.order_items?.map((item) => (
                          <img
                            key={item.id}
                            src={item.product_image || ''}
                            alt={item.product_name}
                            className="w-12 h-14 object-cover rounded shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Saved Addresses</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-lg">
                  <MapPin size={40} className="mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-2">No saved addresses</p>
                  <p className="text-sm text-muted-foreground">Your shipping addresses will appear here after checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-border rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-muted text-xs rounded">{addr.label}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 bg-gold-500/10 text-gold-700 text-xs rounded">Default</span>
                        )}
                      </div>
                      <p className="font-medium text-sm">{addr.full_name}</p>
                      <p className="text-sm text-muted-foreground">{addr.phone}</p>
                      <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.district}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-serif text-2xl mb-6">Account Settings</h2>
              <div className="border border-border rounded-lg p-6 space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name</label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="flex-1 border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
                      />
                      <button onClick={updateProfile} className="px-4 py-2.5 bg-ink-900 text-white text-sm rounded-md hover:bg-gold-500 transition-colors">
                        Save
                      </button>
                      <button onClick={() => setEditingName(false)} className="px-4 py-2.5 border border-border text-sm rounded-md hover:bg-muted transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{profile?.full_name || 'Not set'}</p>
                      <button onClick={() => setEditingName(true)} className="text-sm text-gold-600 hover:underline">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium mb-1.5">Role</label>
                  <p className="text-sm capitalize">{profile?.role || 'customer'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
