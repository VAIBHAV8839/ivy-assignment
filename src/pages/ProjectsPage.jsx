import React, { useState, useMemo } from 'react';
import ProjectCard from '../components/ProjectCard';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function ProjectsPage({ projects, listings }) {
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 18;

  // Compute live listings per project
  const liveCountByProject = useMemo(() => {
    const map = {};
    listings.forEach(l => {
      if (l.project_id && l.is_live) {
        map[l.project_id] = (map[l.project_id] || 0) + 1;
      }
    });
    return map;
  }, [listings]);

  const localities = useMemo(() => {
    const s = new Set();
    projects.forEach(p => {
      if (p.locality) s.add(p.locality.toLowerCase().trim());
    });
    return Array.from(s).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedLocality !== 'all' && p.locality?.toLowerCase().trim() !== selectedLocality) {
        return false;
      }
      if (selectedStatus !== 'all' && p.project_status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [projects, selectedLocality, selectedStatus]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedItems = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Chennai Builder Projects</h1>
        <p className="text-sm text-slate-400">
          Explore <span className="text-emerald-400 font-semibold">{filteredProjects.length}</span> residential developments (with price & area units normalized to INR & sqft)
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Project Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="ready to move">Ready to Move</option>
            <option value="under construction">Under Construction</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No projects matched your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map(p => (
            <ProjectCard
              key={p.project_id}
              project={p}
              actualLiveCount={liveCountByProject[p.project_id] || 0}
            />
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
