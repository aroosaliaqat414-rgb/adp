import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Filter,
  Check,
  Search,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialNewArrival?: boolean;
  initialBestSeller?: boolean;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialSearch,
  initialNewArrival,
  initialBestSeller,
  onNavigate,
  onQuickView
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            size: selectedSize || undefined,
            color: selectedColor || undefined,
            fabric: selectedFabric || undefined,
            minPrice: minPrice > 0 ? minPrice : undefined,
            maxPrice: maxPrice < 25000 ? maxPrice : undefined,
            sort: sortBy,
            newArrival: initialNewArrival ? 'true' : undefined,
            bestSeller: initialBestSeller ? 'true' : undefined
          })
        ]);
        setCategories(cats);
        let list = prods;
        if (onlyInStock) {
          list = list.filter(p => p.totalStock > 0);
        }
        if (onlyOnSale) {
          list = list.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
        }
        setProducts(list);
      } catch (err) {
        console.error('Error fetching shop data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [
    selectedCategory,
    searchQuery,
    selectedSize,
    selectedColor,
    selectedFabric,
    minPrice,
    maxPrice,
    sortBy,
    onlyInStock,
    onlyOnSale,
    initialNewArrival,
    initialBestSeller
  ]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const fabrics = ['Lawn', 'Silk', 'Linen', 'Chiffon', 'Cotton', 'Jacquard'];
  const colors = [
    { name: 'Lilac Dusk', hex: '#8E1EA2' },
    { name: 'Soft Blush', hex: '#ED96D7' },
    { name: 'Royal Ochre', hex: '#C654C3' },
    { name: 'Warm Ivory', hex: '#F7F3EE' },
    { name: 'Deep Plum', hex: '#4A154B' }
  ];

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedFabric('');
    setMinPrice(0);
    setMaxPrice(25000);
    setOnlyInStock(false);
    setOnlyOnSale(false);
    setSortBy('newest');
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (onlyOnSale ? 1 : 0);

  const selectedCategoryObj = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb Header */}
      <div className="mb-8 border-b border-[#EFE6EE] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#8E8191] mb-1.5">
              <span className="cursor-pointer hover:text-[#8E1EA2]" onClick={() => onNavigate('home')}>
                Home
              </span>
              <span>/</span>
              <span className="text-[#8E1EA2] font-semibold">Catalog</span>
              {selectedCategoryObj && (
                <>
                  <span>/</span>
                  <span className="text-[#231826] font-medium">{selectedCategoryObj.name}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231826]">
              {selectedCategoryObj ? selectedCategoryObj.name : 'All Women\'s Garments'}
            </h1>
            <p className="text-xs text-[#5A4E5C] mt-1 max-w-xl">
              {selectedCategoryObj
                ? selectedCategoryObj.description
                : 'Explore our complete ready-to-wear luxury pret, 3-piece unstitched lawn, and everyday comfortable silhouettes.'}
            </p>
          </div>

          {/* Sort Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-white border border-[#EFE6EE] rounded-xl text-xs font-semibold text-[#231826] flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#8E1EA2]" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <div className="relative flex items-center">
              <span className="text-xs text-[#8E8191] mr-2 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs font-semibold text-[#231826] bg-white border border-[#EFE6EE] rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-[#8E1EA2] shadow-xs cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="popularity">Bestsellers First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#EFE6EE]/60 text-xs">
            <span className="text-[#8E8191] font-medium">Active Filters:</span>
            {selectedCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                {selectedCategoryObj.name}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                Size: {selectedSize}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('')} />
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                Fabric: {selectedFabric}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFabric('')} />
              </span>
            )}
            {selectedColor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                Color: {selectedColor}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor('')} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                In Stock Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyInStock(false)} />
              </span>
            )}
            {onlyOnSale && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] font-semibold text-[11px]">
                On Sale
                <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyOnSale(false)} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[#8E1EA2] hover:underline font-semibold text-[11px] ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 pr-4 border-r border-[#EFE6EE]">
          {/* Categories Filter */}
          <div>
            <h3 className="font-serif text-sm font-bold text-[#231826] uppercase tracking-wider mb-3">
              Categories
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                    !selectedCategory ? 'font-bold text-[#8E1EA2] bg-[#FCFAF8]' : 'text-[#5A4E5C] hover:text-[#8E1EA2]'
                  }`}
                >
                  <span>All Categories</span>
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug || selectedCategory === cat.id
                        ? 'font-bold text-[#8E1EA2] bg-[#FCFAF8]'
                        : 'text-[#5A4E5C] hover:text-[#8E1EA2]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-[#8E8191]">{cat.itemCount || ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Size Filter */}
          <div className="pt-4 border-t border-[#EFE6EE]">
            <h3 className="font-serif text-sm font-bold text-[#231826] uppercase tracking-wider mb-3">
              Sizes
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${
                    selectedSize === sz
                      ? 'border-[#8E1EA2] bg-[#8E1EA2] text-white shadow-xs'
                      : 'border-[#EFE6EE] text-[#5A4E5C] hover:border-[#8E1EA2]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Filter */}
          <div className="pt-4 border-t border-[#EFE6EE]">
            <h3 className="font-serif text-sm font-bold text-[#231826] uppercase tracking-wider mb-3">
              Fabric
            </h3>
            <div className="space-y-1.5 text-xs text-[#5A4E5C]">
              {fabrics.map(fb => (
                <label key={fb} className="flex items-center gap-2 cursor-pointer hover:text-[#8E1EA2]">
                  <input
                    type="radio"
                    name="fabric"
                    checked={selectedFabric === fb}
                    onChange={() => setSelectedFabric(selectedFabric === fb ? '' : fb)}
                    className="accent-[#8E1EA2]"
                  />
                  <span>{fb}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-[#EFE6EE]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif text-sm font-bold text-[#231826] uppercase tracking-wider">
                Price (PKR)
              </h3>
              <span className="text-[11px] font-bold text-[#8E1EA2]">
                Up to Rs. {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-[#8E1EA2] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E8191] mt-1">
              <span>Rs. 2,000</span>
              <span>Rs. 25,000+</span>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="pt-4 border-t border-[#EFE6EE] space-y-2.5 text-xs text-[#5A4E5C]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-[#8E1EA2] accent-[#8E1EA2]"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOnSale}
                onChange={e => setOnlyOnSale(e.target.checked)}
                className="w-4 h-4 rounded text-[#8E1EA2] accent-[#8E1EA2]"
              />
              <span>On Sale Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-[#FCFAF8] rounded-2xl aspect-3/4 border border-[#EFE6EE]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#FCFAF8] rounded-3xl border border-[#EFE6EE] p-8">
              <div className="w-16 h-16 rounded-full bg-white border border-[#EFE6EE] mx-auto flex items-center justify-center text-[#8E8191] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#231826] mb-1">
                No matching garments found
              </h3>
              <p className="text-xs text-[#8E8191] max-w-sm mx-auto mb-6">
                Try widening your price range, clearing specific sizes, or exploring our full catalog.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-[#8E1EA2] text-white text-xs font-semibold rounded-full shadow-md hover:bg-[#751786] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-[#8E8191] mb-4">
                <span>Showing <strong>{products.length}</strong> luxurious designs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
              <h2 className="font-serif text-lg font-bold text-[#231826]">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider mb-2">Category</h3>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left py-1 ${!selectedCategory ? 'font-bold text-[#8E1EA2]' : 'text-gray-600'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`block w-full text-left py-1 ${selectedCategory === cat.slug ? 'font-bold text-[#8E1EA2]' : 'text-gray-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="pt-4 border-t border-[#EFE6EE]">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center border ${
                      selectedSize === sz ? 'bg-[#8E1EA2] text-white' : 'border-[#EFE6EE]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Max */}
            <div className="pt-4 border-t border-[#EFE6EE]">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider mb-1">
                Max Price: Rs. {maxPrice.toLocaleString()}
              </h3>
              <input
                type="range"
                min="2000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={e => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full accent-[#8E1EA2]"
              />
            </div>

            <div className="pt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#8E1EA2] text-white text-xs font-bold rounded-xl"
              >
                Apply Filters ({products.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
