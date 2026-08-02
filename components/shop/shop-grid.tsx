'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/shop/product-card';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'featured';

export function ShopGrid({
  products,
  categories,
  activeCategory,
}: {
  products: Product[];
  categories: Category[];
  activeCategory?: string;
}) {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeCategory ? [activeCategory] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        p.category && selectedCategories.includes(p.category.slug)
      );
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => ((b.created_at || '') > (a.created_at || '') ? 1 : -1));
        break;
      case 'featured':
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategories, priceRange, sortBy]);

  const priceRanges = [
    { label: 'Under 3,000 ৳', min: 0, max: 3000 },
    { label: '3,000 – 8,000 ৳', min: 3000, max: 8000 },
    { label: '8,000 – 20,000 ৳', min: 8000, max: 20000 },
    { label: '20,000 ৳ & above', min: 20000, max: 80000 },
  ];

  return (
    <div className="container-luxury py-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium hover:text-gold-600 transition-colors"
        >
          <SlidersHorizontal size={18} />
          Filters
          {selectedCategories.length > 0 && (
            <span className="bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCategories.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent border-b border-border py-1 pr-6 focus:outline-none focus:border-gold-500 cursor-pointer text-sm font-medium"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        {showFilters && (
          <aside className="w-64 shrink-0 hidden lg:block">
            <FilterContent
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              priceRanges={priceRanges}
            />
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/40" onClick={() => setShowFilters(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterContent
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              priceRanges={priceRanges}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterContent({
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  priceRanges,
}: {
  categories: Category[];
  selectedCategories: string[];
  toggleCategory: (slug: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  priceRanges: { label: string; min: number; max: number }[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Category</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.slug)}
              className="flex items-center gap-2 text-sm w-full text-left group"
            >
              <div
                className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                  selectedCategories.includes(cat.slug)
                    ? 'bg-gold-500 border-gold-500'
                    : 'border-border group-hover:border-gold-500'
                }`}
              >
                {selectedCategories.includes(cat.slug) && <Check size={12} className="text-white" />}
              </div>
              <span className={selectedCategories.includes(cat.slug) ? 'text-gold-600' : 'text-foreground/80'}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Price Range</h4>
        <div className="space-y-2.5">
          {priceRanges.map((range) => {
            const isActive = priceRange[0] === range.min && priceRange[1] === range.max;
            return (
              <button
                key={range.label}
                onClick={() => setPriceRange([range.min, range.max])}
                className="flex items-center gap-2 text-sm w-full text-left group"
              >
                <div
                  className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                    isActive ? 'bg-gold-500 border-gold-500' : 'border-border group-hover:border-gold-500'
                  }`}
                >
                  {isActive && <Check size={12} className="text-white" />}
                </div>
                <span className={isActive ? 'text-gold-600' : 'text-foreground/80'}>{range.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
