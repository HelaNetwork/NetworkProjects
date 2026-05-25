import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { Event } from '../../types';

const EVENT_TYPES = ['all', 'workshop', 'conference', 'meetup', 'webinar', 'hackathon', 'other'];

const typeIcon: Record<string, string> = {
  workshop: '🔧', conference: '🎤', meetup: '🤝',
  webinar: '💻', hackathon: '⚡', other: '🎪', all: '📅',
};

const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [location, setLocation] = useState('');

  const fetchEvents = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '6' });
      if (search) params.append('search', search);
      if (type && type !== 'all') params.append('type', type);
      if (location) params.append('location', location);

      const res = await api.get(`/events?${params}`);
      const fetched: Event[] = res.data.events || [];
      setEvents((prev) => (append ? [...prev, ...fetched] : fetched));
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, type, location]);

  useEffect(() => { fetchEvents(1, false); }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchEvents(1, false); };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(20,184,166,0.1)' }}>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input
            id="events-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, workshops, conferences…"
            className="input-field flex-1"
          />
          <button id="events-search-btn" type="submit" className="btn-mint px-6">Search</button>
          <button
            id="events-reload-btn"
            type="button"
            onClick={() => fetchEvents(1, false)}
            className="btn-ghost px-4"
          >🔄</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              id={`filter-event-${t}`}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize flex items-center gap-1 ${
                type === t
                  ? 'bg-mint-500/20 text-mint-400 border border-mint-500/40'
                  : 'text-white/40 hover:text-white/70 border border-white/10'
              }`}
            >
              {typeIcon[t]} {t}
            </button>
          ))}
          <input
            id="events-location-filter"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location…"
            className="input-field py-1.5 text-xs max-w-[140px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">
          {loading ? 'Loading…' : `${total} event${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Event Cards */}
      {loading && events.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <div className="text-4xl mb-3">🎪</div>
          <p>No events match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event._id} className="glass-card p-5 rounded-2xl card-hover" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Type badge + header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{event.title}</h3>
                  <p className="text-sm text-white/50 mt-0.5">{event.organizer}</p>
                </div>
                <span className="badge-mint shrink-0 capitalize">
                  {typeIcon[event.type]} {event.type}
                </span>
              </div>

              <p className="text-sm text-white/40 line-clamp-2 mb-3">{event.description}</p>

              {/* Meta */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>📅</span><span>{event.date}{event.time ? ` · ${event.time}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>📍</span><span>{event.address}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md text-white/40"
                    style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${event.isFree ? 'text-mint-400' : 'text-amber-400'}`}>
                  {event.isFree ? '✅ Free' : `💰 ${event.price}`}
                </span>
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`open-event-${event._id}`}
                  className="btn-mint text-sm px-4 py-2"
                >
                  Open Event ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < pages && (
        <div className="flex justify-center pt-2">
          <button
            id="events-load-more-btn"
            onClick={() => fetchEvents(page + 1, true)}
            disabled={loading}
            className="btn-ghost px-10"
          >
            {loading ? '⟳ Loading…' : 'Load More Events'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsTab;
