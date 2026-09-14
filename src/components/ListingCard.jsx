import React from 'react';
import { Bookmark, CheckCircle2, MapPin, Bed, Bath, Move, ArrowUpRight, Phone, AlertCircle } from 'lucide-react';
import { formatCurrency, formatArea, getCleanPrice, getCleanCarpet } from '../utils';

export default function ListingCard({ listing, isSaved, onToggleSave, onSelect }) {
  const cleanPrice = getCleanPrice(listing);
  const cleanCarpet = getCleanCarpet(listing);
  const pricePerSqft = cleanCarpet > 0 ? Math.round(cleanPrice / cleanCarpet) : null;

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg hover:shadow-emerald-500/10 transition-all group flex flex-col justify-between">
      <div>
        {/* Card Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {listing.property_type ? listing.property_type.toUpperCase() : 'APARTMENT'}
            </span>
            {listing.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            {!listing.is_live && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Inactive
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing);
            }}
            className={`p-2 rounded-xl transition ${
              isSaved
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-750 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Title & Locality */}
        <h3
          onClick={() => onSelect(listing)}
          className="font-bold text-lg text-white group-hover:text-emerald-400 transition cursor-pointer line-clamp-1"
        >
          {listing.apartment_name || 'Independent Residence'}
        </h3>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          {listing.locality || 'Chennai'}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Bed className="w-4 h-4 text-emerald-400" />
            <span>{listing.bedroom || 0} BHK</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Bath className="w-4 h-4 text-emerald-400" />
            <span>{listing.bathroom || 0} Bath</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Move className="w-4 h-4 text-emerald-400" />
            <span title={formatArea(listing.carpet_area, listing.website)}>
              {cleanCarpet} sqft
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {listing.description || 'Spacious home with prime accessibility and community amenities.'}
        </p>
      </div>

      {/* Footer Price & Action */}
      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(cleanPrice)}
          </div>
          {pricePerSqft && (
            <div className="text-[11px] text-slate-400">
              ₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft
            </div>
          )}
        </div>

        <button
          onClick={() => onSelect(listing)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold text-white transition"
        >
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
