import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { Product } from '@/lib/types';
import { ProductGallery } from '@/components/product/gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductScrubSection } from '@/components/product/scrub-section';
import { ProductReviews } from '@/components/product/reviews';
import { RelatedProducts } from '@/components/product/related-products';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

async function getProduct(slug: string) {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), product_images(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  return data as Product | null;
}

async function getRelated(product: Product) {
  if (!product.category_id) return [];
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*), product_images(*), product_variants(*)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4);
  return (data as Product[]) || [];
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = await getRelated(product);
  const images = product.product_images || [];

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-luxury pt-28 pb-4">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link
                href={`/shop/${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product section */}
      <section className="container-luxury py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <ProductGallery images={images} />
          <div className="lg:py-4">
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      {/* Scroll scrub showcase */}
      {images.length >= 2 && <ProductScrubSection images={images} />}

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related products */}
      {related.length > 0 && <RelatedProducts products={related} />}
    </>
  );
}
