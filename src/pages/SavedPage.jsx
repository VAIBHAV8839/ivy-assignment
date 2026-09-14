import React from 'react';
import ListingCard from '../components/ListingCard';
import { Bookmark, ArrowLeft } from 'lucide-react';

export default function SavedPage({ savedListings, onToggleSave, onSelectListing, onExplore }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Saved Properties</h1>
          <p className="text-sm text-slate-400">
            {savedListings.length === 0
              ? 'You have not saved any properties yet'
              : `You have ${savedListings.length} saved home${savedListings.length > 1 ? 's' : ''} in your portfolio`}
          </p>
        </div>
      </div>

      {savedListings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Saved Properties</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Click the bookmark icon on any property card while browsing to save it to your account.
          </p>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map(listing => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
