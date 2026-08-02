'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Banner } from '@/lib/types';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Banner deleted');
    fetchBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id);
    fetchBanners();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">{banners.length} homepage banners</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : banners.map((banner) => (
          <div key={banner.id} className="bg-white border border-border rounded-lg overflow-hidden flex flex-col sm:flex-row">
            <img src={banner.image_url} alt={banner.title} className="w-full sm:w-48 h-32 sm:h-auto object-cover" />
            <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                {banner.cta_text && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Button: "{banner.cta_text}" → {banner.cta_link}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(banner)} className={`w-9 h-5 rounded-full transition-colors ${banner.is_active ? 'bg-success' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${banner.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <BannerForm onClose={() => setShowForm(false)} onSaved={() => { fetchBanners(); setShowForm(false); }} />
      )}
    </div>
  );
}

function BannerForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: '',
    cta_link: '',
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      cta_text: form.cta_text || null,
      cta_link: form.cta_link || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: true,
    };
    const { error } = await supabase.from('banners').insert(payload);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success('Banner created');
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl">New Banner</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Image URL</label>
            <input type="text" required value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Button Text</label>
              <input type="text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Button Link</label>
              <input type="text" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                placeholder="/shop" className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
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
