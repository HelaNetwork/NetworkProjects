import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { Job } from '../../types';

const JOB_TYPES = ['all', 'full-time', 'part-time', 'contract', 'remote', 'internship'];
const JOB_ROLES = ['All Roles', 'Engineering', 'Design', 'Product', 'Security', 'DevOps', 'Marketing'];

const JobsTab: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');

  const fetchJobs = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '6' });
      if (search) params.append('search', search);
      if (type && type !== 'all') params.append('type', type);
      if (role && role !== 'All Roles') params.append('role', role);
      if (location) params.append('location', location);

      const res = await api.get(`/jobs?${params}`);
      const fetched: Job[] = res.data.jobs || [];
      setJobs((prev) => (append ? [...prev, ...fetched] : fetched));
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, type, role, location]);

  useEffect(() => { fetchJobs(1, false); }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchJobs(1, false); };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(20,184,166,0.1)' }}>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input
            id="jobs-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, roles, companies…"
            className="input-field flex-1"
          />
          <button id="jobs-search-btn" type="submit" className="btn-mint px-6">Search</button>
          <button
            id="jobs-reload-btn"
            type="button"
            onClick={() => fetchJobs(1, false)}
            className="btn-ghost px-4"
            title="Reload"
          >🔄</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {/* Type filters */}
          <div className="flex gap-1 flex-wrap">
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                id={`filter-type-${t}`}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  type === t
                    ? 'bg-mint-500/20 text-mint-400 border border-mint-500/40'
                    : 'text-white/40 hover:text-white/70 border border-white/10'
                }`}
              >{t}</button>
            ))}
          </div>
          {/* Location */}
          <input
            id="jobs-location-filter"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location…"
            className="input-field py-1.5 text-xs max-w-[140px]"
          />
          {/* Role */}
          <select
            id="jobs-role-filter"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field py-1.5 text-xs max-w-[140px]"
          >
            {JOB_ROLES.map((r) => <option className='text-white bg-mint-950' key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">
          {loading ? 'Loading…' : `${total} job${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Job Cards Grid */}
      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-3">🔍</div>
          <p>No jobs match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="glass-card p-5 rounded-2xl card-hover" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{job.title}</h3>
                  <p className="text-sm text-white/50 mt-0.5">{job.company}</p>
                </div>
                <span className="badge-mint shrink-0 capitalize">{job.type}</span>
              </div>

              <p className="text-sm text-white/40 line-clamp-2 mb-3">{job.description}</p>

              <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                <span>📍 {job.location}</span>
                <span>🏷 {job.role}</span>
                {job.postedAt && <span>🕐 {job.postedAt}</span>}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 4).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-md text-white/40"
                    style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}>
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                {job.salaryRange && (
                  <span className="text-sm font-semibold text-mint-400">{job.salaryRange}</span>
                )}
                <button
                  onClick={() => setSelectedJob(job)}
                  id={`view-job-${job._id}`}
                  className="btn-mint text-sm px-4 py-2 ml-auto"
                >
                  View Job ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < pages && (
        <div className="flex justify-center pt-2">
          <button
            id="jobs-load-more-btn"
            onClick={() => fetchJobs(page + 1, true)}
            disabled={loading}
            className="btn-ghost px-10"
          >
            {loading ? '⟳ Loading…' : 'Load More Jobs'}
          </button>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                <p className="text-mint-400 font-semibold mt-1">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span>📍 {selectedJob.location}</span>
                <span className="capitalize">💼 {selectedJob.type}</span>
                <span>🏷 {selectedJob.role}</span>
                {selectedJob.salaryRange && <span className="text-mint-400 font-bold">💰 {selectedJob.salaryRange}</span>}
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Job Description</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Skills Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-lg text-mint-400 bg-mint-400/10 border border-mint-400/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end">
              <a
                href={selectedJob.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedJob(null)}
                className="bg-mint-500 hover:bg-mint-400 text-black font-bold py-3 px-8 rounded-xl transition-all"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsTab;
