import { Hero } from '@/components/home/hero';
import { ScrollScrubVideo } from '@/components/home/scroll-scrub';
import { CategoryCircles } from '@/components/home/category-circles';
import { NewArrivals } from '@/components/home/new-arrivals';
import { Manifesto } from '@/components/home/manifesto';
import { FeatureStrip, EditorialSplit } from '@/components/home/feature-strip';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { Category, Product } from '@/lib/types';

export const revalidate = 3600;

async function getData() {
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('products')
      .select('*, category:categories(*), product_images(*), product_variants(*)')
      .eq('is_active', true)
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return {
    categories: (categories as Category[]) || [],
    products: (products as Product[]) || [],
  };
}

export default async function HomePage() {
  const { categories, products } = await getData();

  return (
    <>
      <Hero />
      <FeatureStrip />
      <CategoryCircles categories={categories} />
      <NewArrivals products={products} />
      <ScrollScrubVideo />
      <Manifesto />
      <EditorialSplit />
    </>
  );
}
