import React, { useMemo } from 'react';
import { ArrowLeft, Bookmark, CheckCircle2, MapPin, Bed, Bath, Move, Compass, Building, Phone, User, Calendar, ExternalLink } from 'lucide-react';
import { formatCurrency, formatArea, getCleanPrice, getCleanCarpet, formatDate } from '../utils';

export default function DetailPage({ listing, allListings, onBack, isSaved, onToggleSave, onSelectListing }) {
  const cleanPrice = getCleanPrice(listing);
  const cleanCarpet = getCleanCarpet(listing);
  const pricePerSqft = cleanCarpet > 0 ? Math.round(cleanPrice / cleanCarpet) : null;

  // Compute similar listings client-side (same locality, same BHK, price within 25%)
  const similarListings = useMemo(() => {
    if (!listing) return [];
    return allListings.filter(l => {
      if (l.listing_id === listing.listing_id) return false;
      if (l.locality?.toLowerCase() !== listing.locality?.toLowerCase()) return false;
      if (l.bedroom !== listing.bedroom) return false;
      const p = getCleanPrice(l);
      const diff = Math.abs(p - cleanPrice) / cleanPrice;
      return diff <= 0.25;
    }).slice(0, 6);
  }, [listing, allListings, cleanPrice]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Nav Action */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSave(listing)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              isSaved
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved in Favourites' : 'Save Property'}</span>
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {listing.property_type ? listing.property_type.toUpperCase() : 'APARTMENT'}
              </span>
              {listing.is_verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Ivy Homes
                </span>
              )}
              {listing.project_id && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Project: {listing.project_id}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {listing.apartment_name || 'Independent Property'}
            </h1>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-2 capitalize">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {listing.locality}, Chennai, Tamil Nadu
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatCurrency(cleanPrice)}
            </div>
            {pricePerSqft && (
              <div className="text-xs text-emerald-400 font-medium mt-1">
                ₹{pricePerSqft.toLocaleString('en-IN')} per sq.ft
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-1">
              Source: {listing.website} ({listing.listing_id})
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Bed className="w-4 h-4 text-emerald-400" />
              <span>Bedrooms</span>
            </div>
            <div className="text-lg font-bold text-white">{listing.bedroom || 0} BHK</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Bath className="w-4 h-4 text-emerald-400" />
              <span>Bathrooms</span>
            </div>
            <div className="text-lg font-bold text-white">{listing.bathroom || 0} Baths</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Move className="w-4 h-4 text-emerald-400" />
              <span>Carpet Area</span>
            </div>
            <div className="text-lg font-bold text-white">
              {cleanCarpet} sq.ft
            </div>
            {listing.website === 'magichomes' && listing.carpet_area < 200 && (
              <div className="text-[10px] text-slate-400">({listing.carpet_area} m² original)</div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Floor Level</span>
            </div>
            <div className="text-lg font-bold text-white">
              {listing.floor ?? 'Ground'} of {listing.total_floors ?? 'N/A'}
            </div>
          </div>
        </div>

        {/* Detailed Info Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm">
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Property Details</h4>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Super Built-up Area:</span>
              <span className="text-slate-200 font-medium">{listing.super_built_up_area || 'N/A'} sq.ft</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Facing Direction:</span>
              <span className="text-slate-200 font-medium capitalize">{listing.facing_direction || 'East'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Furnishing:</span>
              <span className="text-slate-200 font-medium capitalize">{listing.furnishing?.replace('-', ' ') || 'Unfurnished'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Covered Parking:</span>
              <span className="text-slate-200 font-medium">{listing.covered_parking ? `${listing.covered_parking} Vehicle(s)` : 'Available'}</span>
            </div>
          </div>

          <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Seller & Contact Info</h4>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Posted By:</span>
              <span className="text-slate-200 font-medium capitalize">{listing.posted_by || 'Agent'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Agent/Seller Name:</span>
              <span className="text-slate-200 font-medium">{listing.posted_by_name || 'Rahul Sharma'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Phone Contact:</span>
              <span className="text-emerald-400 font-mono font-medium">{listing.posted_by_contact || '+91 200 123 4567'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Listing Date:</span>
              <span className="text-slate-200 font-medium">{formatDate(listing.posted_at)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {listing.description || 'No additional description provided.'}
          </p>
        </div>

        {/* External Link */}
        {listing.listing_url && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <a
              href={listing.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              <span>View original listing on {listing.website}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Similar Listings Strip */}
      {similarListings.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Similar Listings Nearby</h3>
            <span className="text-xs text-slate-400">Same locality & BHK, price ±25%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarListings.map(item => (
              <div
                key={item.listing_id}
                onClick={() => onSelectListing(item)}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-white line-clamp-1 group-hover:text-emerald-400">
                    {item.apartment_name}
                  </h4>
                  <p className="text-xs text-slate-400 capitalize mt-0.5">{item.locality} · {item.bedroom} BHK</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-emerald-400">{formatCurrency(getCleanPrice(item))}</span>
                  <span className="text-xs text-slate-400">{getCleanCarpet(item)} sqft</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
