import React, { useState, useMemo } from 'react';
import ListingCard from '../components/ListingCard';
import { Search, SlidersHorizontal, Filter, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCleanPrice, getCleanCarpet } from '../utils';

export default function ListingsPage({ listings, savedIds, onToggleSave, onSelectListing }) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyLive, setOnlyLive] = useState(true);
  const [sortBy, setSortBy] = useState('posted_at_desc');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Extract unique localities from dataset
  const localities = useMemo(() => {
    const locs = new Set();
    listings.forEach(l => {
      if (l.locality) locs.add(l.locality.toLowerCase().trim());
    });
    return Array.from(locs).sort();
  }, [listings]);

  // Robust client-side filtering and sorting
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      // Live filter
      if (onlyLive && !l.is_live) return false;

      // Locality
      if (selectedLocality !== 'all' && l.locality?.toLowerCase().trim() !== selectedLocality) {
        return false;
      }

      // BHK
      if (selectedBhk !== 'all') {
        const bhk = Number(selectedBhk);
        if (bhk === 4) {
          if ((l.bedroom || 0) < 4) return false;
        } else if (l.bedroom !== bhk) {
          return false;
        }
      }

      // Furnishing
      if (selectedFurnishing !== 'all' && l.furnishing !== selectedFurnishing) {
        return false;
      }

      // Price range (using normalized price)
      const cleanPrice = getCleanPrice(l);
      if (minPrice && cleanPrice < Number(minPrice)) return false;
      if (maxPrice && cleanPrice > Number(maxPrice)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.apartment_name?.toLowerCase().includes(q);
        const matchLoc = l.locality?.toLowerCase().includes(q);
        const matchDesc = l.description?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = getCleanPrice(a);
      const priceB = getCleanPrice(b);
      const carpetA = getCleanCarpet(a);
      const carpetB = getCleanCarpet(b);

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'area_asc') return carpetA - carpetB;
      if (sortBy === 'area_desc') return carpetB - carpetA;
      if (sortBy === 'posted_at_desc') {
        return new Date(b.posted_at || 0) - new Date(a.posted_at || 0);
      }
      return 0;
    });
  }, [listings, searchQuery, selectedLocality, selectedBhk, selectedFurnishing, minPrice, maxPrice, onlyLive, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredListings.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, page]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocality('all');
    setSelectedBhk('all');
    setSelectedFurnishing('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('posted_at_desc');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chennai Properties for Sale</h1>
          <p className="text-sm text-slate-400">
            Showing <span className="text-emerald-400 font-semibold">{filteredListings.length}</span> matching homes across Chennai
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search apartment, locality..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Locality */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Locality
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => {
                setSelectedLocality(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="all">All Localities</option>
              {localities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Bedrooms
            </label>
            <select
              value={selectedBhk}
              onChange={(e) => {
                setSelectedBhk(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All BHKs</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Furnishing
            </label>
            <select
              value={selectedFurnishing}
              onChange={(e) => {
                setSelectedFurnishing(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="all">Any Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Min Price (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Max Price (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 15000000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="posted_at_desc">Newest Posted</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Carpet Area: High to Low</option>
            </select>
          </div>
        </div>

        {/* Toggles & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLive}
              onChange={(e) => {
                setOnlyLive(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
            />
            <span>Active Listings Only (excludes inactive/expired)</span>
          </label>

          <button
            onClick={resetFilters}
            className="text-xs text-slate-400 hover:text-emerald-400 transition underline underline-offset-4"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No listings matched your criteria</h3>
          <p className="text-sm text-slate-400 mb-4">Try relaxing your price, BHK, or locality filters.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              isSaved={savedIds.includes(listing.listing_id)}
              onToggleSave={onToggleSave}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Page <span className="text-white font-medium">{page}</span> of{' '}
            <span className="text-white font-medium">{totalPages}</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
