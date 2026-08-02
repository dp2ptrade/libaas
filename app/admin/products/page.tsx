'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Search, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatBDT, slugify } from '@/lib/format';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/admin/image-uploader';
import type { Product, Category, ProductImage } from '@/lib/types';

type UploadedImage = {
  url: string;
  alt_text: string;
  is_primary: boolean;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data as Category[]) || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete product');
      return;
    }
    toast.success('Product deleted');
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:border-gold-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No products found</td></tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatBDT(product.price)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{product.stock_quantity}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditing(product); setShowForm(true); }}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editing}
            categories={categories}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSaved={() => { fetchProducts(); setShowForm(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    category_id: product?.category_id || categories[0]?.id || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_best_seller: product?.is_best_seller ?? false,
    fabric: product?.fabric || '',
    care_instructions: product?.care_instructions || '',
    sku: product?.sku || '',
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product?.id) {
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order')
        .then(({ data }) => {
          setExistingImages((data as ProductImage[]) || []);
          setImages(
            ((data as ProductImage[]) || []).map((img) => ({
              url: img.url,
              alt_text: img.alt_text || '',
              is_primary: img.is_primary,
            }))
          );
        });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);

    const slug = form.slug || slugify(form.name);
    const payload = {
      name: form.name,
      slug,
      short_description: form.short_description || null,
      description: form.description || null,
      category_id: form.category_id || null,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
      is_best_seller: product?.is_best_seller ?? false,
      fabric: form.fabric || null,
      care_instructions: form.care_instructions || null,
      sku: form.sku || null,
    };

    let productId = product?.id;

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Product updated');
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      productId = data.id;
      toast.success('Product created');
    }

    // Sync images: delete old ones, insert new ones
    if (productId) {
      await supabase.from('product_images').delete().eq('product_id', productId);

      if (images.length > 0) {
        const imageRows = images.map((img, i) => ({
          product_id: productId,
          url: img.url,
          alt_text: img.alt_text || form.name,
          is_primary: img.is_primary,
          sort_order: i,
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imageRows);
        if (imgError) {
          toast.error('Product saved but images failed to save');
        }
      }
    }

    setSaving(false);
    onSaved();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-serif text-xl">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 bg-background"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Field label="Price (৳)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <Field label="Compare Price (৳)" type="number" value={form.compare_price} onChange={(v) => setForm({ ...form, compare_price: v })} />
            <Field label="Stock" type="number" value={form.stock_quantity} onChange={(v) => setForm({ ...form, stock_quantity: v })} />
            <Field label="Fabric" value={form.fabric} onChange={(v) => setForm({ ...form, fabric: v })} />
          </div>
          <Field label="Short Description" value={form.short_description} onChange={(v) => setForm({ ...form, short_description: v })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>
          <Field label="Care Instructions" value={form.care_instructions} onChange={(v) => setForm({ ...form, care_instructions: v })} />

          {/* Image uploader */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Product Images</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { key: 'is_active', label: 'Active' },
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_best_seller', label: 'Best Seller' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[flag.key as keyof typeof form] as boolean}
                  onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                {flag.label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink-900 text-white text-sm font-medium rounded-md hover:bg-gold-500 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
      />
    </div>
  );
}
