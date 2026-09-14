import React from 'react';
import { MapPin, Bed, Bath, Move, ShieldCheck, Phone } from 'lucide-react';
import { formatCurrency, formatArea } from '../utils';

export default function RentalCard({ rental }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            RENTAL
          </span>
          <span className="text-xs text-slate-400 capitalize">
            {rental.furnishing?.replace('-', ' ')}
          </span>
        </div>

        <h3 className="font-bold text-lg text-white line-clamp-1">
          {rental.apartment_name || rental.title || 'Rental Residence'}
        </h3>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          {rental.locality || 'Chennai'}
        </p>

        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Bed className="w-4 h-4 text-emerald-400" />
            <span>{rental.bedroom || 0} BHK</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Bath className="w-4 h-4 text-emerald-400" />
            <span>{rental.bathroom || 0} Bath</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Move className="w-4 h-4 text-emerald-400" />
            <span>{rental.carpet_area || 0} sqft</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Deposit:</span>
            <span className="text-slate-200 font-medium">{formatCurrency(rental.deposit)}</span>
          </div>
          <div className="flex justify-between">
            <span>Maintenance:</span>
            <span className="text-slate-200 font-medium">
              {rental.maintenance ? `₹${rental.maintenance}/mo` : 'Included'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold text-emerald-400">
            ₹{(rental.price || 0).toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-400">/month</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{rental.posted_by_contact || 'Contact Owner'}</span>
        </div>
      </div>
    </div>
  );
}
