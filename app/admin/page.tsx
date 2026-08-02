'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatBDT, formatDate } from '@/lib/format';
import Link from 'next/link';

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: any[];
  topProducts: any[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { data: orders },
        { data: products },
        { data: profiles },
        { data: recentOrders },
        { data: topItems },
      ] = await Promise.all([
        supabase.from('orders').select('total, status'),
        supabase.from('products').select('id, is_active'),
        supabase.from('profiles').select('id, role'),
        supabase
          .from('orders')
          .select('id, order_number, total, status, payment_method, created_at, shipping_name')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('order_items')
          .select('product_name, quantity, total_price')
          .order('quantity', { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const pendingOrders = (orders || []).filter((o: any) => o.status === 'pending').length;
      const customers = (profiles || []).filter((p: any) => p.role === 'customer').length;

      const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
      (topItems || []).forEach((item: any) => {
        const existing = topMap.get(item.product_name) || { name: item.product_name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += Number(item.total_price);
        topMap.set(item.product_name, existing);
      });
      const topProducts = Array.from(topMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalProducts: products?.length || 0,
        totalCustomers: customers,
        pendingOrders,
        recentOrders: recentOrders || [],
        topProducts,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>;
  }

  const cards = [
    { label: 'Total Revenue', value: formatBDT(stats.totalRevenue), icon: TrendingUp, color: 'text-success' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-gold-600' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Overview of your store performance</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white border border-border rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={22} className={card.color} />
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-serif font-medium">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-600 hover:underline">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping_name} · {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatBDT(order.total)}</p>
                    <span className="text-xs text-muted-foreground capitalize">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-gold-600 hover:underline">View all</Link>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatBDT(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{product.qty} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.pendingOrders > 0 && (
        <div className="mt-6 bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm">
            <span className="font-medium text-warning">{stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''}</span> need your attention.
          </p>
          <Link href="/admin/orders" className="text-sm font-medium text-warning hover:underline">Review →</Link>
        </div>
      )}
    </div>
  );
}
