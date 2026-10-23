import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Flame,
} from 'lucide-react';
import { Product, ProductFilterState } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BUSINESS_INFO, SIZES, JERSEY_TYPES, JERSEY_VERSIONS } from '../lib/constants';

interface ShopPageProps {
  products: Product[];
  loading: boolean;
  initialFilters?: Partial<ProductFilterState>;
  onViewProduct: (slug: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  loading,
  initialFilters,
  onViewProduct,
}) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [selectedClub, setSelectedClub] = useState(initialFilters?.clubOrCountry || '');
  const [selectedType, setSelectedType] = useState(initialFilters?.jerseyType || '');
  const [selectedVersion, setSelectedVersion] = useState(initialFilters?.version || '');
  const [selectedSize, setSelectedSize] = useState(initialFilters?.size || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>(
    initialFilters?.sortBy || 'newest'
  );
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract distinct clubs/countries from catalog
  const availableClubs = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.club_or_country) set.add(p.club_or_country.trim());
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & sorted catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchClub = p.club_or_country.toLowerCase().includes(q);
          const matchSeason = p.season.toLowerCase().includes(q);
          const matchType = p.jersey_type.toLowerCase().includes(q);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchClub && !matchSeason && !matchType && !matchTags) {
            return false;
          }
        }

        // Club filter
        if (selectedClub && p.club_or_country.toLowerCase() !== selectedClub.toLowerCase()) {
          return false;
        }

        // Jersey Type
        if (selectedType && p.jersey_type !== selectedType) {
          return false;
        }

        // Version
        if (selectedVersion && p.version !== selectedVersion) {
          return false;
        }

        // Size availability filter
        if (selectedSize) {
          const hasSizeInStock = p.sizes?.some(
            (s) => s.size_label === selectedSize && s.stock_quantity > 0
          );
          if (!hasSizeInStock) return false;
        }

        // Price filter
        if (p.selling_price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') {
          return a.selling_price - b.selling_price;
        }
        if (sortBy === 'price_high') {
          return b.selling_price - a.selling_price;
        }
        // default 'newest'
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [
    products,
    search,
    selectedClub,
    selectedType,
    selectedVersion,
    selectedSize,
    sortBy,
    maxPrice,
  ]);

  const clearFilters = () => {
    setSearch('');
    setSelectedClub('');
    setSelectedType('');
    setSelectedVersion('');
    setSelectedSize('');
    setSortBy('newest');
    setMaxPrice(1000);
  };

  const hasActiveFilters = Boolean(
    search || selectedClub || selectedType || selectedVersion || selectedSize || maxPrice < 1000
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title & Delivery Notice */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
            Official Catalog • Delivery in Abofour only
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            SHOP FOOTBALL JERSEYS
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse genuine Fan and Player version football kits in Ghana Cedis ({BUSINESS_INFO.currency}).
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden px-4 py-2.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-xs font-bold flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00E676]" />
          <span>Filters {hasActiveFilters && '(Active)'}</span>
        </button>
      </div>

      {/* Search & Quick Sort Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search club, country, kit edition, or season..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#0D121F] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high')
            }
            className="px-3 py-2 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00E676]"
          >
            <option value="newest">Newest Added</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Catalog Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside
          className={`lg:block ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-[#080B11]/95 p-6 overflow-y-auto block'
              : 'hidden'
          } lg:relative lg:inset-auto lg:p-0 lg:bg-transparent space-y-6`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#00E676]" />
              Filter Jerseys
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#00E676] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset All
              </button>
            )}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter: Club or Country */}
          {availableClubs.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Club / Country
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white focus:border-[#00E676]"
              >
                <option value="">All Clubs & Countries</option>
                {availableClubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter: Jersey Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Jersey Edition
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedType === ''
                    ? 'bg-[#00E676] text-black font-bold'
                    : 'bg-[#0D121F] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                All
              </button>
              {JERSEY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedType === type
                      ? 'bg-[#00E676] text-black font-bold'
                      : 'bg-[#0D121F] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Version */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Version Fit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {JERSEY_VERSIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVersion(selectedVersion === v ? '' : v)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                    selectedVersion === v
                      ? 'bg-[#00E676] text-black border-[#00E676]'
                      : 'bg-[#0D121F] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Size Availability */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Available In Your Size
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`py-2 rounded-lg text-xs font-bold transition border ${
                    selectedSize === sz
                      ? 'bg-[#00E676] text-black border-[#00E676]'
                      : 'bg-[#0D121F] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Max Price */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-300 uppercase tracking-wider">Max Price</span>
              <span className="font-bold text-[#00E676]">
                {BUSINESS_INFO.currency} {maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#00E676] cursor-pointer"
            />
          </div>

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-[#00E676] text-black font-bold text-xs uppercase"
            >
              Apply Filters ({filteredProducts.length} Jerseys)
            </button>
          )}
        </aside>

        {/* PRODUCTS GRID */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing <strong className="text-white">{filteredProducts.length}</strong> jerseys
            </span>
            {hasActiveFilters && (
              <span className="text-[#00E676] font-medium">Filtered results</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-900/60 rounded-2xl animate-pulse border border-gray-800"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#0D121F] border border-gray-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">No jerseys match your filters</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Try clearing your search keyword, size selection, or price filter to see more jerseys.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F]"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
