import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

type ResourceType = 'events' | 'jobs' | 'airdrops';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResourceType>('events');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    } else {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.get(`/admin/${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/admin/${activeTab}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (formData._id) {
        await api.put(`/admin/${activeTab}/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post(`/admin/${activeTab}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      setFormData(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save. Check all fields.';
      setSaveError(msg);
    }
  };

  const startEdit = (item: any = {}) => {
    setFormData({ isFree: true, type: activeTab === 'jobs' ? 'full-time' : 'other', ...item });
    setSaveError('');
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
        {/* Header */}
        <header className="glass-card p-6 rounded-2xl mb-8 flex justify-between items-center" style={{ border: '1px solid rgba(20,184,166,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 20px rgba(20,184,166,0.3)' }}>
              👑
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin <span className="mint-gradient-text">Dashboard</span></h1>
              <p className="text-xs text-white/40 font-mono mt-1">Platform Control Center</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-5 py-2 rounded-xl transition-all font-medium">
            Logout
          </button>
        </header>

        {!isEditing ? (
          <div className="animate-fade-in">
            {/* Tabs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-1 p-1 rounded-2xl overflow-x-auto w-full md:w-auto"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {['events', 'jobs', 'airdrops'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as ResourceType)}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-mint-400 bg-mint-500/15'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <button onClick={() => startEdit({})} className="btn-mint px-6 py-2.5 flex items-center gap-2 text-sm w-full md:w-auto justify-center">
                <span>+</span> Add New {activeTab.slice(0, -1)}
              </button>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="text-center py-20 text-white/40 animate-pulse">Loading data…</div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <tr>
                        <th className="p-5 font-semibold text-white/60">Title</th>
                        <th className="p-5 font-semibold text-white/60">Date / Info</th>
                        <th className="p-5 font-semibold text-white/60 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(item => (
                        <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                          <td className="p-5 font-medium text-white">{item.title}</td>
                          <td className="p-5 text-white/40">
                            {activeTab === 'events' && item.date}
                            {activeTab === 'jobs' && item.company}
                            {activeTab === 'airdrops' && item.reward}
                          </td>
                          <td className="p-5 text-right flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(item)} className="text-mint-400 hover:text-mint-300 font-medium px-2 py-1 bg-mint-400/10 rounded-lg transition-colors">Edit</button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-300 font-medium px-2 py-1 bg-red-400/10 rounded-lg transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {data.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-16 text-center text-white/30">
                            <div className="text-4xl mb-3">📭</div>
                            No {activeTab} found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="glass-card p-8 rounded-3xl" style={{ border: '1px solid rgba(20,184,166,0.15)' }}>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white transition-colors">← Back</button>
                <h2 className="text-xl font-bold text-white capitalize">{formData._id ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h2>
              </div>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Title</label>
                  <input required className="input-field" placeholder="Enter title"
                    value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                {activeTab === 'events' && (
                  <>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Description</label><textarea required rows={3} className="input-field resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Event Type</label>
                        <select className="input-field text-black" value={formData.type || 'other'} onChange={e => setFormData({...formData, type: e.target.value})}>
                          {['workshop','conference','meetup','webinar','hackathon','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Date</label><input required className="input-field" type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Time (optional)</label><input className="input-field" placeholder="e.g. 6:00 PM" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Location</label><input required className="input-field" placeholder="Online / City" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Venue / Address</label><input className="input-field" placeholder="Address or Online link" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Organizer</label><input className="input-field" placeholder="Organizer name" value={formData.organizer || ''} onChange={e => setFormData({...formData, organizer: e.target.value})} /></div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Event Link / URL</label><input className="input-field" placeholder="https://..." value={formData.sourceUrl || ''} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} /></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                      <span className="text-sm text-white/60">Is this event free?</span>
                      <button type="button" onClick={() => setFormData({...formData, isFree: !formData.isFree})}
                        className={`relative w-10 h-5 rounded-full transition-all ${formData.isFree !== false ? '' : 'opacity-50'}`}
                        style={{background: formData.isFree !== false ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : 'rgba(255,255,255,0.1)'}}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${formData.isFree !== false ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <span className="text-sm font-medium text-mint-400">{formData.isFree !== false ? 'Free' : 'Paid'}</span>
                      {formData.isFree === false && <input className="input-field ml-auto max-w-32 text-sm py-1" placeholder="Price e.g. $25" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} />}
                    </div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Tags (comma separated)</label><input className="input-field" placeholder="e.g. DeFi, Web3, Solidity" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || '')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map((t:string) => t.trim()).filter(Boolean)})} /></div>
                  </>
                )}

                {activeTab === 'jobs' && (
                  <>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Company</label><input required className="input-field" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Description</label><textarea required rows={4} className="input-field resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Job Type</label>
                        <select className="input-field text-black" value={formData.type || 'full-time'} onChange={e => setFormData({...formData, type: e.target.value})}>
                          {['full-time','part-time','contract','remote','internship'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                      </div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Location</label><input required className="input-field" placeholder="Remote / City" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Role Category</label><input className="input-field" placeholder="e.g. Engineering, Design" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Salary Range (optional)</label><input className="input-field" placeholder="e.g. $80k – $120k" value={formData.salaryRange || ''} onChange={e => setFormData({...formData, salaryRange: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Skills (comma separated)</label><input className="input-field" placeholder="e.g. Solidity, React, TypeScript" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} onChange={e => setFormData({...formData, skills: e.target.value.split(',').map((s:string) => s.trim()).filter(Boolean)})} /></div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Apply Link</label><input className="input-field" placeholder="https://..." value={formData.sourceUrl || ''} onChange={e => setFormData({...formData, sourceUrl: e.target.value})} /></div>
                  </>
                )}

                {activeTab === 'airdrops' && (
                  <>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Description</label><textarea required rows={3} className="input-field resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Reward Details</label><input required className="input-field" placeholder="e.g. 500 HLUSD" value={formData.reward || ''} onChange={e => setFormData({...formData, reward: e.target.value})} /></div>
                      <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">End Date</label><input required type="date" className="input-field" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">Participation Link</label><input required className="input-field" placeholder="https://" value={formData.participationLink || ''} onChange={e => setFormData({...formData, participationLink: e.target.value})} /></div>
                  </>
                )}

                {saveError && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{saveError}</div>}

                <div className="flex gap-4 pt-6 border-t border-white/5 mt-6">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost flex-1 py-3">Cancel</button>
                  <button type="submit" className="btn-mint flex-1 py-3">💾 Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
