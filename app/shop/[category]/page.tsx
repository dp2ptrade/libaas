import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { Product, Category } from '@/lib/types';
import { ShopGrid } from '@/components/shop/shop-grid';
import { ShopHero } from '@/components/shop/shop-hero';

export const revalidate = 3600;

async function getData(categorySlug?: string) {
  let productQuery = supabase
    .from('products')
    .select('*, category:categories(*), product_images(*), product_variants(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  const { data: products } = await productQuery;

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  let activeCategory: Category | undefined;
  if (categorySlug) {
    activeCategory = (categories as Category[])?.find((c) => c.slug === categorySlug);
  }

  return {
    products: (products as Product[]) || [],
    categories: (categories as Category[]) || [],
    activeCategory,
  };
}

export default async function ShopPage({
  params,
}: {
  params: { category?: string };
}) {
  const categorySlug = params?.category;
  const { products, categories, activeCategory } = await getData(categorySlug);

  const title = activeCategory?.name || 'All Collections';
  const description =
    activeCategory?.description ||
    'Discover our full collection of couture, luxury pret, unstitched lawn, sarees, and menswear.';

  return (
    <>
      <ShopHero title={title} description={description} image={activeCategory?.image_url} />
      <ShopGrid
        products={products}
        categories={categories}
        activeCategory={categorySlug}
      />
    </>
  );
}
