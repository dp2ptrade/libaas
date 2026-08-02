import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { Product, Category } from '@/lib/types';
import { ShopGrid } from '@/components/shop/shop-grid';
import { ShopHero } from '@/components/shop/shop-hero';

export const revalidate = 3600;

export default async function AllShopPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), product_images(*), product_variants(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <>
      <ShopHero
        title="All Collections"
        description="Discover our full collection of couture, luxury pret, unstitched lawn, sarees, and menswear."
      />
      <ShopGrid
        products={(products as Product[]) || []}
        categories={(categories as Category[]) || []}
      />
    </>
  );
}
