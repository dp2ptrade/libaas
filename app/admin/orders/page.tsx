'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatBDT, formatDateTime } from '@/lib/format';
import { toast } from 'sonner';
import type { Order } from '@/lib/types';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState<Order | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      toast.error('Could not update order status');
      return;
    }
    toast.success(`Order marked as ${status}`);

    // Send status update email to customer
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, type: 'status_update' }),
      });
    } catch {
      // Email failure should not block status update
    }

    fetchOrders();
    if (viewing?.id === id) {
      setViewing({ ...viewing, status });
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">{orders.length} total orders</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {['all', ...statusOptions].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-ink-900 text-white'
                : 'bg-white border border-border text-foreground hover:bg-muted'
            }`}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No orders found</td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground capitalize">{order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p>{order.shipping_name}</p>
                    <p className="text-xs text-muted-foreground">{order.shipping_phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatBDT(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer capitalize ${statusColors[order.status]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-white text-foreground">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setViewing(order)}
                      className="p-1.5 hover:bg-muted rounded transition-colors inline-flex items-center gap-1 text-sm"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h2 className="font-serif text-xl">{viewing.order_number}</h2>
                  <p className="text-xs text-muted-foreground">{formatDateTime(viewing.created_at)}</p>
                </div>
                <button onClick={() => setViewing(null)}><X size={22} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                    <p className="text-sm font-medium">{viewing.shipping_name}</p>
                    <p className="text-sm text-muted-foreground">{viewing.shipping_phone}</p>
                    {viewing.customer_email && <p className="text-sm text-muted-foreground">{viewing.customer_email}</p>}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Shipping Address</p>
                    <p className="text-sm">{viewing.shipping_address}</p>
                    <p className="text-sm text-muted-foreground">{viewing.shipping_city}, {viewing.shipping_district}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Items</p>
                  <div className="space-y-3">
                    {viewing.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} className="w-12 h-14 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} {item.color && `· ${item.color}`} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatBDT(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBDT(viewing.subtotal)}</span></div>
                  {viewing.discount_amount > 0 && (
                    <div className="flex justify-between text-success"><span>Discount</span><span>-{formatBDT(viewing.discount_amount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatBDT(viewing.shipping_cost)}</span></div>
                  <div className="flex justify-between font-serif text-lg pt-2 border-t border-border"><span>Total</span><span>{formatBDT(viewing.total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="capitalize">{viewing.payment_method} · {viewing.payment_status}</span></div>
                </div>

                {viewing.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{viewing.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
