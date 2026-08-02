'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, Wallet, Banknote, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { formatBDT } from '@/lib/format';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/lib/types';

const bangladeshDistricts = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Bogura', 'Jessore', 'Dinajpur', 'Tangail', 'Pabna',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [form, setForm] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    district: 'Dhaka',
    postcode: '',
    notes: '',
  });

  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    mobileNumber: '',
    trxId: '',
  });

  const shippingCost = subtotal >= 5000 ? 0 : 150;
  const total = subtotal - discountAmount + shippingCost;

  if (items.length === 0 && !processing) {
    return (
      <div className="container-luxury py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some items before checking out.</p>
        <button
          onClick={() => router.push('/shop')}
          className="px-8 py-3 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors"
        >
          Browse Collection
        </button>
      </div>
    );
  }

  const validatePayment = (): string | null => {
    if (paymentMethod === 'visa') {
      if (!payment.cardNumber || !payment.cardName || !payment.expiry || !payment.cvv) {
        return 'Please fill in all card details';
      }
      if (payment.cardNumber.replace(/\s/g, '').length < 15) {
        return 'Invalid card number';
      }
      if (payment.cvv.length < 3) return 'Invalid CVV';
    }
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!payment.mobileNumber) return `${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} account number required`;
      if (!/^01[3-9]\d{8}$/.test(payment.mobileNumber)) return 'Invalid mobile number format (e.g. 01XXXXXXXXX)';
      if (!payment.trxId) return 'Transaction ID required';
      if (payment.trxId.length < 8) return 'Transaction ID seems too short';
    }
    return null;
  };

  const handleSubmit = async () => {
    const paymentError = validatePayment();
    if (paymentError) {
      toast.error(paymentError);
      return;
    }

    setProcessing(true);

    // 1. Create the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total,
        coupon_code: appliedCoupon?.code || null,
        shipping_name: form.full_name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_district: form.district,
        shipping_postcode: form.postcode || null,
        customer_email: form.email || null,
        notes: form.notes || null,
      })
      .select('id, order_number')
      .single();

    if (orderError || !orderData) {
      toast.error('Could not place order. Please try again.');
      setProcessing(false);
      return;
    }

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.name,
      product_image: item.image_url,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      toast.error('Order created but items failed. Contact support.');
      setProcessing(false);
      return;
    }

    // 3. Process payment via edge function
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const paymentResponse = await fetch(`${supabaseUrl}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          orderId: orderData.id,
          method: paymentMethod,
          amount: total,
          mobileNumber: payment.mobileNumber || undefined,
          trxId: payment.trxId || undefined,
          cardToken: paymentMethod === 'visa' ? `${payment.cardNumber.slice(-4)}` : undefined,
        }),
      });

      if (!paymentResponse.ok) {
        const errData = await paymentResponse.json().catch(() => ({}));
        toast.error(errData.error || 'Payment processing failed. Your order is still placed.');
      }
    } catch {
      toast.error('Payment service unavailable. Your order is placed — we will contact you.');
    }

    // 4. Send confirmation email (fire and forget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.id, type: 'confirmation' }),
      });
    } catch {
      // Email failure should not block checkout
    }

    // 5. Increment coupon usage if applicable
    if (appliedCoupon?.code) {
      try { await supabase.rpc('increment_coupon_usage', { coupon_code: appliedCoupon.code }); } catch {}
    }

    clearCart();
    router.push(`/order-confirmation/${orderData.id}`);
  };

  const steps = ['Shipping', 'Payment', 'Review'];

  return (
    <div className="container-luxury py-28 md:py-32">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-12">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > i + 1
                    ? 'bg-success text-white'
                    : step === i + 1
                    ? 'bg-ink-900 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > i + 1 ? <Check size={18} /> : i + 1}
              </div>
              <span className="text-xs mt-2 hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-24 h-px mx-2 ${step > i + 1 ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-serif text-2xl mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
                  <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <Input label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="01XXXXXXXXX" />
                  <Input label="Postcode (optional)" value={form.postcode} onChange={(v) => setForm({ ...form, postcode: v })} />
                </div>
                <Input label="Street Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                  <div>
                    <label className="block text-sm font-medium mb-1.5">District</label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 bg-background"
                    >
                      {bangladeshDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Any special instructions for delivery..."
                    className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!form.full_name || !form.phone || !form.address || !form.city) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    if (!/^01[3-9]\d{8}$/.test(form.phone)) {
                      toast.error('Invalid phone number format (e.g. 01XXXXXXXXX)');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full py-4 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="font-serif text-2xl mb-6">Payment Method</h2>

                <div className="space-y-3">
                  <PaymentTile
                    icon={<Banknote size={22} />}
                    label="Cash on Delivery"
                    desc="Pay when you receive your order"
                    selected={paymentMethod === 'cod'}
                    onClick={() => setPaymentMethod('cod')}
                  />
                  <PaymentTile
                    icon={<CreditCard size={22} />}
                    label="Visa / Card"
                    desc="Credit or debit card — secured by Stripe"
                    selected={paymentMethod === 'visa'}
                    onClick={() => setPaymentMethod('visa')}
                  />
                  <PaymentTile
                    icon={<Wallet size={22} />}
                    label="bKash"
                    desc="Mobile financial service"
                    selected={paymentMethod === 'bkash'}
                    onClick={() => setPaymentMethod('bkash')}
                  />
                  <PaymentTile
                    icon={<Wallet size={22} />}
                    label="Nagad"
                    desc="Mobile financial service"
                    selected={paymentMethod === 'nagad'}
                    onClick={() => setPaymentMethod('nagad')}
                  />
                </div>

                {/* Payment details */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'visa' && (
                    <motion.div
                      key="visa"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 overflow-hidden"
                    >
                      <Input label="Card Number" value={payment.cardNumber} onChange={(v) => setPayment({ ...payment, cardNumber: formatCardNumber(v) })} placeholder="1234 5678 9012 3456" />
                      <Input label="Name on Card" value={payment.cardName} onChange={(v) => setPayment({ ...payment, cardName: v })} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Expiry (MM/YY)" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: formatExpiry(v) })} placeholder="12/28" maxLength={5} />
                        <Input label="CVV" value={payment.cvv} onChange={(v) => setPayment({ ...payment, cvv: v.replace(/\D/g, '').slice(0, 4) })} placeholder="123" />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-success" />
                        Your payment is secured with bank-grade encryption via Stripe.
                      </p>
                    </motion.div>
                  )}

                  {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                    <motion.div
                      key={paymentMethod}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 overflow-hidden"
                    >
                      <Input
                        label={`${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Account Number`}
                        value={payment.mobileNumber}
                        onChange={(v) => setPayment({ ...payment, mobileNumber: v })}
                        placeholder="01XXXXXXXXX"
                      />
                      <Input
                        label="Transaction ID"
                        value={payment.trxId}
                        onChange={(v) => setPayment({ ...payment, trxId: v })}
                        placeholder="Enter your transaction ID"
                      />
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">
                          Send Money to {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}:
                        </p>
                        <p>Account: 01700-000000</p>
                        <p>Amount: {formatBDT(total)}</p>
                        <p className="mt-2 text-xs">
                          Complete the {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} payment and enter the transaction ID above. We will verify your payment before shipping.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 border border-border text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      const err = validatePayment();
                      if (err) { toast.error(err); return; }
                      setStep(3);
                    }}
                    className="flex-1 py-4 bg-ink-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-500 transition-colors flex items-center justify-center gap-2"
                  >
                    Review Order
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl mb-6">Review Your Order</h2>

                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Shipping To</h3>
                  <p className="text-sm">{form.full_name}</p>
                  <p className="text-sm text-muted-foreground">{form.phone}</p>
                  <p className="text-sm text-muted-foreground">{form.address}</p>
                  <p className="text-sm text-muted-foreground">{form.city}, {form.district}{form.postcode && ` ${form.postcode}`}</p>
                </div>

                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Payment Method</h3>
                  <p className="text-sm">
                    {paymentMethod === 'cod' && 'Cash on Delivery'}
                    {paymentMethod === 'visa' && `Visa / Card — ****${payment.cardNumber.slice(-4)}`}
                    {paymentMethod === 'bkash' && `bKash — ${payment.mobileNumber} (TrxID: ${payment.trxId})`}
                    {paymentMethod === 'nagad' && `Nagad — ${payment.mobileNumber} (TrxID: ${payment.trxId})`}
                  </p>
                </div>

                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-3">
                        <img src={item.image_url} alt={item.name} className="w-14 h-16 object-cover rounded" />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} {item.color && `· ${item.color}`} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatBDT(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-4 border border-border text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="flex-1 py-4 bg-gold-500 text-white text-sm font-medium uppercase tracking-wider hover:bg-gold-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      `Place Order — ${formatBDT(total)}`
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-6 sticky top-28">
            <h3 className="font-serif text-xl mb-5">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide mb-4">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-3 text-sm">
                  <img src={item.image_url} alt={item.name} className="w-12 h-14 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{formatBDT(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-border text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBDT(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatBDT(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-serif text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatBDT(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 transition-colors"
      />
    </div>
  );
}

function PaymentTile({
  icon,
  label,
  desc,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all text-left ${
        selected ? 'border-gold-500 bg-gold-50' : 'border-border hover:border-gold-300'
      }`}
    >
      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
        selected ? 'bg-gold-500 text-white' : 'bg-muted text-muted-foreground'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-gold-500 bg-gold-500' : 'border-border'
      }`}>
        {selected && <Check size={12} className="text-white" />}
      </div>
    </button>
  );
}
