import React from 'react';
import { Building, MapPin, Calendar, CheckCircle, Layers, Home } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function ProjectCard({ project, actualLiveCount }) {
  // Convert project prices: < 10 is Crores (* 10^7), >= 10 is Lakhs (* 10^5)
  const getProjectPriceInr = (val) => {
    if (!val) return 0;
    return val < 10 ? Math.round(val * 10000000) : Math.round(val * 100000);
  };

  const minPriceInr = getProjectPriceInr(project.price_min);
  const maxPriceInr = getProjectPriceInr(project.price_max);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {project.project_status?.toUpperCase() || 'DEVELOPMENT'}
          </span>
          <span className="text-xs text-slate-400">
            RERA: {project.rera_number || 'Registered'}
          </span>
        </div>

        <h3 className="font-bold text-lg text-white line-clamp-1">
          {project.apartment_name}
        </h3>
        <p className="text-xs text-emerald-400 font-medium">{project.developer_name}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          {project.locality || 'Chennai'}
        </p>

        <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Towers / Units</span>
            <span className="font-medium">{project.total_towers || 1} Towers · {project.total_units || 0} Units</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Unit Sizes</span>
            <span className="font-medium">{project.min_area_sqft} - {project.max_area_sqft} sqft</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Launch Date</span>
            <span className="font-medium">{project.launch_date || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Possession</span>
            <span className="font-medium">{project.possession_date || 'N/A'}</span>
          </div>
        </div>

        {/* Listings Count Comparison */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-750/50 border border-slate-700/60 text-xs mb-4">
          <span className="text-slate-400">Live Available Listings:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">{actualLiveCount ?? project.total_listings}</span>
            {actualLiveCount !== undefined && actualLiveCount !== project.total_listings && (
              <span className="text-[10px] text-slate-400" title="API reported value differed from actual live listings">
                (API reported: {project.total_listings})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block">Price Range (Normalized INR)</span>
          <div className="text-base font-extrabold text-white">
            {formatCurrency(minPriceInr)} - {formatCurrency(maxPriceInr)}
          </div>
        </div>
        <a
          href={project.project_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold text-white transition"
        >
          Project Info
        </a>
      </div>
    </div>
  );
}
