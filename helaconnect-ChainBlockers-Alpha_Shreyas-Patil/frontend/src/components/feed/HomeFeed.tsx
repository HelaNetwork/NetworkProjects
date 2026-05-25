import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import api from "../../lib/axios";
import { Job, Event, User } from "../../types";
import useGenerateAvatar from "../../hooks/useGenerateAvatar";
import { fetchRecentTransactions } from "../../lib/ethers";
import { timeAgo } from "../../utils/timeAgo";

// ── On-Chain Activity Card ─────────────────────────────────────────────────
const ChainActivityFeed: React.FC<{ following: User[] }> = ({ following }) => {
  const { generateAvatar } = useGenerateAvatar();

  return (
    <div
      className="glass-card p-5 rounded-2xl card-hover"
      style={{ border: "1px solid rgba(20,184,166,0.1)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⛓️</span>
        <h3 className="font-bold text-white">On-Chain Activity</h3>
        <span className="badge-mint ml-auto">Live</span>
      </div>
      {following.length === 0 ? (
        <div className="text-center py-8 text-white/30">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm">Follow users to see their on-chain activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {following.slice(0, 4).map((u) => (
            <div
              key={u._id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <img
                src={generateAvatar(u.walletAddress || u.fullName)}
                alt={u.fullName || "User"}
                className="w-10 h-10 rounded-full object-cover shrink-0"
                style={{ boxShadow: "0 0 8px rgba(20,184,166,0.2)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white truncate">
                    {u.fullName}
                  </p>
                  <span className="text-xs text-white/30 shrink-0">
                    {u.trxAgo}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  {u.recentTx || "No recent transactions"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] font-mono text-white/20 truncate w-24">
                    {u.walletAddress}
                  </p>
                  <a
                    href={`https://testnet.helascan.io/address/${u.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-mint-400 hover:text-mint-300 shrink-0"
                  >
                    View Tx ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Mini Job Card ──────────────────────────────────────────────────────────
const MiniJobCard: React.FC<{ job: Job; onClick: () => void }> = ({
  job,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="block p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-sm text-white group-hover:text-mint-400 transition-colors">
          {job.title}
        </p>
        <p className="text-xs text-white/50 mt-0.5">
          {job.company} · {job.location}
        </p>
      </div>
      <span className="badge-mint text-xs shrink-0">{job.type}</span>
    </div>
    <div className="flex flex-wrap gap-1 mt-2">
      {job.skills.slice(0, 3).map((s) => (
        <span
          key={s}
          className="text-xs px-2 py-0.5 rounded-md text-white/40"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {s}
        </span>
      ))}
    </div>
    {job.salaryRange && (
      <p className="text-xs text-mint-400 mt-2 font-medium">
        {job.salaryRange}
      </p>
    )}
  </div>
);

// ── Mini Event Card ────────────────────────────────────────────────────────
const MiniEventCard: React.FC<{ event: Event }> = ({ event }) => (
  <a
    href={event.sourceUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-4 rounded-xl hover:bg-white/5 transition-all group"
    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-sm text-white group-hover:text-mint-400 transition-colors">
          {event.title}
        </p>
        <p className="text-xs text-white/50 mt-0.5">
          {event.organizer} · {event.location}
        </p>
      </div>
      <span className="badge-mint text-xs shrink-0 capitalize">
        {event.type}
      </span>
    </div>
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs text-white/40">📅 {event.date}</span>
      {event.time && (
        <span className="text-xs text-white/40">⏰ {event.time}</span>
      )}
      <span
        className={`text-xs font-medium ${event.isFree ? "text-mint-400" : "text-amber-400"}`}
      >
        {event.isFree ? "Free" : event.price}
      </span>
    </div>
  </a>
);

// ── Mini Airdrop Card ──────────────────────────────────────────────────────
const MiniAirdropCard: React.FC<{ airdrop: any }> = ({ airdrop }) => (
  <div
    className="p-4 rounded-xl"
    style={{
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(20,184,166,0.04)",
    }}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <p className="font-semibold text-sm text-white">{airdrop.title}</p>
      <span className="text-xs bg-mint-500/20 text-mint-400 px-2 py-0.5 rounded-full border border-mint-500/30 font-semibold shrink-0">
        {airdrop.reward}
      </span>
    </div>
    <p className="text-xs text-white/40 mb-3 line-clamp-2">
      {airdrop.description}
    </p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/30">
        Ends: {new Date(airdrop.endDate).toLocaleDateString()}
      </span>
      <a
        href={airdrop.participationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs btn-mint px-3 py-1"
      >
        Participate ↗
      </a>
    </div>
  </div>
);

// ── Job Detail Modal ────────────────────────────────────────────────────────
const JobDetailModal: React.FC<{ job: Job; onClose: () => void }> = ({
  job,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
    <div
      className="glass-card w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      style={{ border: "1px solid rgba(20,184,166,0.2)" }}
    >
      <div className="flex justify-between items-center p-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white">{job.title}</h2>
          <p className="text-mint-400 font-semibold mt-1">{job.company}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-2xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        <div className="flex flex-wrap gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-white/60">📍 {job.location}</span>
          <span className="text-white/60 capitalize">💼 {job.type}</span>
          <span className="text-white/60">🏷 {job.role}</span>
          {job.salaryRange && (
            <span className="text-mint-400 font-bold">
              💰 {job.salaryRange}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white mb-2">Description</h3>
          <p className="text-white/60 text-sm whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white mb-2">Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1 rounded-lg text-mint-400 bg-mint-400/10 border border-mint-400/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-white/5 flex justify-end">
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="btn-mint px-8 py-2.5"
        >
          Apply Now ↗
        </a>
      </div>
    </div>
  </div>
);

// ── Home Feed Tab ──────────────────────────────────────────────────────────
const HomeFeed: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [following, setFollowing] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [airdrops, setAirdrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, jRes, eRes, aRes] = await Promise.all([
          api.get("/users/search?q="),
          api.get("/jobs?limit=4"),
          api.get("/events?limit=4"),
          api.get("/airdrops"),
        ]);

        const allUsers: User[] = uRes.data.data || [];
        const connectedUsers: any = [];

        if (user?.walletAddress) {
          const lowerWallet = user.walletAddress.toLowerCase();
          for (const u of allUsers) {
            if (u.walletAddress.toLowerCase() === lowerWallet) continue;
            if (u.followers?.includes(lowerWallet)) {
              const trx = await fetchRecentTransactions(u.walletAddress);
              const newObject = {
                ...u,
                recentTx: trx
                  ? `${trx[0].value} transferred • ${trx[0].status === "success" ? "✅ Success" : "❌ Failed"}`
                  : null,
                trxAgo:
                  trx.length > 0
                    ? `${timeAgo(trx[0].timestamp) || "NAN"}`
                    : null,
              };
              connectedUsers.push(newObject);
            }
          }
        }

        setFollowing(connectedUsers);
        setJobs(jRes.data.jobs || []);
        setEvents(eRes.data.events || []);
        setAirdrops(aRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* On-chain feed */}
        <ChainActivityFeed following={following} />

        {/* Job recs */}
        <div
          className="glass-card p-5 rounded-2xl card-hover"
          style={{ border: "1px solid rgba(20,184,166,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💼</span>
            <h3 className="font-bold text-white">Recommended Jobs</h3>
            <span className="ml-auto text-xs text-white/30">
              for {user?.skills?.[0] || "you"}
            </span>
          </div>
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-center py-8 text-white/30 text-sm">
                No jobs yet
              </p>
            ) : (
              jobs.map((j) => (
                <MiniJobCard
                  key={j._id}
                  job={j}
                  onClick={() => setSelectedJob(j)}
                />
              ))
            )}
          </div>
        </div>

        {/* Event recs */}
        <div
          className="glass-card p-5 rounded-2xl card-hover"
          style={{ border: "1px solid rgba(20,184,166,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎪</span>
            <h3 className="font-bold text-white">Upcoming Events</h3>
            <span className="ml-auto text-xs text-white/30">near you</span>
          </div>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-center py-8 text-white/30 text-sm">
                No events yet
              </p>
            ) : (
              events.map((e) => <MiniEventCard key={e._id} event={e} />)
            )}
          </div>
        </div>
      </div>

      {/* Active Airdrops Section */}
      {airdrops.length > 0 && (
        <div
          className="mt-6 glass-card p-5 rounded-2xl"
          style={{ border: "1px solid rgba(20,184,166,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎁</span>
            <h3 className="font-bold text-white">Active Airdrops</h3>
            <span className="badge-mint ml-auto">New</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {airdrops.slice(0, 3).map((a) => (
              <MiniAirdropCard key={a._id} airdrop={a} />
            ))}
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
};

export default HomeFeed;
