import { supabaseServer as supabase } from '@/lib/supabase-server';
import { formatBDT, formatDateTime } from '@/lib/format';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';

export const revalidate = 0;

async function getOrder(id: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();
  return data;
}

export default async function OrderConfirmation({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="container-luxury py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Order Not Found</h1>
        <Link href="/shop" className="text-gold-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const paymentLabel = {
    cod: 'Cash on Delivery',
    visa: 'Visa / Card',
    bkash: 'bKash',
    nagad: 'Nagad',
  }[order.payment_method as string] || order.payment_method;

  return (
    <div className="container-luxury py-28 md:py-32">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 rounded-full bg-success/10 items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Order Confirmed</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order is being processed.
          </p>
          <p className="text-sm font-medium mt-4">
            Order Number: <span className="text-gold-600">{order.order_number}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>

        {/* Status tracker */}
        <div className="flex items-center justify-between mb-12 px-4">
          {[
            { icon: CheckCircle2, label: 'Confirmed', active: true },
            { icon: Package, label: 'Processing', active: false },
            { icon: Truck, label: 'Shipped', active: false },
            { icon: Home, label: 'Delivered', active: false },
          ].map((s, i) => (
            <div key={s.label} className="flex flex-col items-center flex-1 relative">
              {i < 3 && (
                <div className={`absolute top-5 left-1/2 w-full h-px ${s.active ? 'bg-success' : 'bg-border'}`} />
              )}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                s.active ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <s.icon size={18} />
              </div>
              <span className="text-xs mt-2 text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Order items */}
        <div className="border border-border rounded-lg p-6 mb-6">
          <h2 className="font-serif text-xl mb-5">Items</h2>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} {item.color && `· ${item.color}`} × {item.quantity}
                  </p>
                  <p className="text-sm font-medium mt-1">{formatBDT(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border rounded-lg p-6 mb-6">
          <h2 className="font-serif text-xl mb-5">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBDT(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount ({order.coupon_code})</span>
                <span>-{formatBDT(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cost === 0 ? 'Free' : formatBDT(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-serif text-lg pt-3 border-t border-border">
              <span>Total</span>
              <span>{formatBDT(order.total)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{paymentLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-success' : 'text-warning'}`}>
                {order.payment_status}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{order.payment_reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div className="border border-border rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl mb-3">Shipping Address</h2>
          <p className="text-sm">{order.shipping_name}</p>
          <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
          <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
          <p className="text-sm text-muted-foreground">
            {order.shipping_city}, {order.shipping_district}
            {order.shipping_postcode && ` ${order.shipping_postcode}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="flex-1 text-center py-4 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="flex-1 text-center py-4 border border-border text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
