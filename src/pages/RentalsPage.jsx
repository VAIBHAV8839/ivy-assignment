import React, { useState, useMemo } from 'react';
import RentalCard from '../components/RentalCard';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function RentalsPage({ rentals }) {
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [maxRent, setMaxRent] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const localities = useMemo(() => {
    const s = new Set();
    rentals.forEach(r => {
      if (r.locality) s.add(r.locality.toLowerCase().trim());
    });
    return Array.from(s).sort();
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      if (selectedLocality !== 'all' && r.locality?.toLowerCase().trim() !== selectedLocality) {
        return false;
      }
      if (selectedBhk !== 'all') {
        const bhk = Number(selectedBhk);
        if (bhk === 4) {
          if ((r.bedroom || 0) < 4) return false;
        } else if (r.bedroom !== bhk) {
          return false;
        }
      }
      if (maxRent && (r.price || 0) > Number(maxRent)) {
        return false;
      }
      return true;
    });
  }, [rentals, selectedLocality, selectedBhk, maxRent]);

  const totalPages = Math.ceil(filteredRentals.length / pageSize) || 1;
  const paginatedItems = filteredRentals.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Chennai Rental Homes</h1>
        <p className="text-sm text-slate-400">
          Explore <span className="text-emerald-400 font-semibold">{filteredRentals.length}</span> verified apartments and houses for rent
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Max Rent / Month (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 40000"
            value={maxRent}
            onChange={(e) => {
              setMaxRent(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No rentals matched your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map(r => (
            <RentalCard key={r.listing_id} rental={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
              {page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
