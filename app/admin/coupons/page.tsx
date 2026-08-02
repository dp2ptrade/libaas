'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, Ticket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatBDT, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import type { Coupon } from '@/lib/types';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Coupon deleted');
    fetchCoupons();
  };

  const toggleActive = async (coupon: Coupon) => {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ticket size={20} className="text-gold-600" />
                <div>
                  <p className="font-mono font-medium">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatBDT(coupon.value)} off`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(coupon)} className={`w-9 h-5 rounded-full transition-colors ${coupon.is_active ? 'bg-success' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${coupon.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => handleDelete(coupon.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Min order: {formatBDT(coupon.min_order_amount)}</p>
              <p>Used: {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}</p>
              {coupon.expires_at && <p>Expires: {formatDate(coupon.expires_at)}</p>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <CouponForm onClose={() => setShowForm(false)} onSaved={() => { fetchCoupons(); setShowForm(false); }} />
      )}
    </div>
  );
}

function CouponForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_amount: '0',
    max_uses: '',
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
    };
    const { error } = await supabase.from('coupons').insert(payload);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success('Coupon created');
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl">New Coupon</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Code</label>
            <input type="text" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value {form.type === 'percentage' ? '(%)' : '(৳)'}</label>
            <input type="number" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Min Order Amount (৳)</label>
            <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Max Uses (optional)</label>
            <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Expiry Date (optional)</label>
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border text-sm font-medium rounded-md hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
