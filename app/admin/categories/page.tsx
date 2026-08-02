'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/format';
import { toast } from 'sonner';
import type { Category } from '@/lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will remain but be uncategorized.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Category deleted');
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-border rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</p>
                {cat.description && <p className="text-sm text-muted-foreground mt-2">{cat.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-1.5 hover:bg-muted rounded">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {cat.image_url && (
              <img src={cat.image_url} alt={cat.name} className="w-full h-32 object-cover rounded mt-3" />
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { fetchCategories(); setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order?.toString() || '0',
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      image_url: form.image_url || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };
    if (category) {
      const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('Category created');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Slug (optional)</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Image URL</label>
            <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-border" />
            Active
          </label>
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
