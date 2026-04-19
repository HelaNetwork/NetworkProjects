import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Activity, DollarSign, Wallet, XCircle, Clock, LogOut, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function HRDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingTx, setPendingTx] = useState(null); // Track pending transaction
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    duration: '1',
  });
  const [stats, setStats] = useState({
    activeStreams: 0,
    totalDeposited: 0,
    totalStreams: 0
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEmployees();
    fetchStreams();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/streams/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStreams(data.streams || []);
        
        // Calculate stats
        const active = data.streams?.filter(s => s.active).length || 0;
        const total = data.streams?.length || 0;
        const deposited = data.streams?.reduce((sum, s) => 
          sum + parseFloat(s.totalAmount || 0), 0
        ) || 0;
        
        setStats({
          activeStreams: active,
          totalStreams: total,
          totalDeposited: deposited
        });
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll transaction status until confirmed
  const pollTransactionStatus = async (txHash) => {
    const maxAttempts = 60; // 60 attempts = ~2 minutes (2 second intervals)
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`${API_URL}/api/streams/tx-status/${txHash}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'confirmed') {
            setPendingTx({ status: 'confirmed', txHash });
            
            // Wait a bit for database to update, then fetch streams
            setTimeout(() => {
              fetchStreams();
              setPendingTx(null);
            }, 1000);
            
            return;
          }
        }
        
        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          // Timeout - still try to refresh
          setPendingTx({ status: 'timeout', txHash });
          fetchStreams();
          setTimeout(() => setPendingTx(null), 3000);
        }
      } catch (error) {
        console.error('Error polling transaction:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    poll();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const employee = employees.find(emp => emp.id === parseInt(formData.employeeId));
      if (!employee) {
        alert('Please select an employee');
        return;
      }

      if (!employee.wallet_address) {
        alert('This employee does not have a wallet address set. Please update their profile first.');
        return;
      }

      const durationInSeconds = parseInt(formData.duration) * 86400; // Convert days to seconds

      const response = await fetch(`${API_URL}/api/streams/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          employeeAddress: employee.wallet_address,
          totalAmount: formData.amount,
          duration: durationInSeconds
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create stream');
      }

      // Show pending status
      setPendingTx({ status: 'pending', txHash: data.txHash });
      
      // Start polling for confirmation
      pollTransactionStatus(data.txHash);
      
      setShowForm(false);
      setFormData({ employeeId: '', amount: '', duration: '1' });
      
    } catch (error) {
      alert('Error creating stream: ' + error.message);
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelStream = async (streamId) => {
    if (!confirm('Are you sure you want to cancel this stream?')) return;

    try {
      const response = await fetch(`${API_URL}/api/streams/${streamId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to cancel stream');

      alert('Stream cancelled successfully!');
      fetchStreams();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const selectedEmployee = employees.find(e => e.id === parseInt(formData.employeeId));

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Pending Transaction Notification */}
        {pendingTx && (
          <div className={`mb-6 p-4 rounded-xl border ${
            pendingTx.status === 'pending' 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : pendingTx.status === 'confirmed'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {pendingTx.status === 'pending' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <div className="flex-1">
                    <div className="text-blue-400 font-semibold">Stream Creation Pending</div>
                    <div className="text-sm text-gray-400">Waiting for blockchain confirmation...</div>
                  </div>
                </>
              )}
              {pendingTx.status === 'confirmed' && (
                <>
                  <CheckCircle className="text-green-400" size={20} />
                  <div className="flex-1">
                    <div className="text-green-400 font-semibold">Stream Created Successfully!</div>
                    <div className="text-sm text-gray-400">Refreshing stream list...</div>
                  </div>
                </>
              )}
              {pendingTx.status === 'timeout' && (
                <>
                  <AlertCircle className="text-yellow-400" size={20} />
                  <div className="flex-1">
                    <div className="text-yellow-400 font-semibold">Confirmation Taking Longer Than Expected</div>
                    <div className="text-sm text-gray-400">Please refresh manually if stream doesn't appear</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 
              className="text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #C084FC 50%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome, {userName}
            </h1>
            <p className="text-gray-400 text-lg">Create and manage payroll streams for your team</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #F97316, #EA580C)',
              boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Plus size={20} />
            New Stream
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <Activity size={32} />, label: 'Active Streams', value: stats.activeStreams, color: '#F97316' },
            { icon: <Users size={32} />, label: 'Total Streams', value: stats.totalStreams, color: '#A855F7' },
            { icon: <DollarSign size={32} />, label: 'Total Deposited', value: `${stats.totalDeposited.toFixed(2)} HLUSD`, color: '#4ade80' },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                border: `1px solid ${card.color}30`,
              }}
            >
              <div className="text-white mb-3" style={{ color: card.color }}>{card.icon}</div>
              <div className="text-sm text-gray-400">{card.label}</div>
              <div className="text-3xl font-bold text-white mt-1">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Create Stream Form */}
        {showForm && (
          <div 
            className="mb-12 p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Create New Stream</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">
                    <Users className="inline mr-2" size={16} />
                    Select Employee
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show selected employee info */}
                {selectedEmployee && (
                  <div className="md:col-span-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="text-white ml-2">{selectedEmployee.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="text-white ml-2">{selectedEmployee.email}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500">Wallet:</span>
                        <span className="text-purple-400 ml-2 font-mono text-xs">
                          {selectedEmployee.wallet_address || 'Not set ⚠️'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Amount (HLUSD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000.00"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duration (Days)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days (1 week)</option>
                    <option value="14">14 days (2 weeks)</option>
                    <option value="30">30 days (1 month)</option>
                    <option value="90">90 days (3 months)</option>
                    <option value="180">180 days (6 months)</option>
                    <option value="365">365 days (1 year)</option>
                  </select>
                </div>
              </div>

              {/* Stream Preview */}
              {formData.amount && formData.duration && selectedEmployee && (
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="text-sm text-gray-500 mb-2">Stream Preview</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rate: </span>
                      <span className="text-orange-400 font-mono">
                        {(parseFloat(formData.amount) / (Number(formData.duration) * 86400)).toFixed(8)} HLUSD/sec
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Days: </span>
                      <span className="text-purple-400 font-mono">
                        {formData.duration} days
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Employee: </span>
                      <span className="text-white">
                        {selectedEmployee.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creating || !selectedEmployee?.wallet_address}
                className="w-full py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(to right, #F97316, #A855F7)',
                  boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
                }}
              >
                {creating ? 'Creating Stream...' : 'Create Stream'}
              </button>
              
              {!selectedEmployee?.wallet_address && selectedEmployee && (
                <p className="text-yellow-400 text-sm text-center">
                  ⚠️ This employee needs a wallet address before you can create a stream
                </p>
              )}
            </form>
          </div>
        )}

        {/* Streams History */}
        <div 
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Stream History</h2>
            <button
              onClick={fetchStreams}
              disabled={loading}
              className="text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">Loading streams...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No streams yet. Create your first payroll stream!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="p-4">Stream ID</th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Withdrawn</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((stream) => (
                    <tr key={stream.streamId} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-gray-400 font-mono">#{stream.streamId}</td>
                      <td className="p-4">
                        <div className="text-white">{stream.employeeName}</div>
                        <div className="text-xs text-gray-500 font-mono">{stream.employeeEmail}</div>
                      </td>
                      <td className="p-4 text-orange-400 font-mono">{parseFloat(stream.totalAmount || 0).toFixed(2)} HLUSD</td>
                      <td className="p-4 text-gray-400">
                        {Math.ceil((stream.endTime - stream.startTime) / 86400)} days
                      </td>
                      <td className="p-4 text-green-400 font-mono">{parseFloat(stream.withdrawnAmount || 0).toFixed(2)} HLUSD</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          stream.active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {stream.active ? 'Active' : 'Ended'}
                        </span>
                      </td>
                      <td className="p-4">
                        {stream.active && (
                          <button
                            onClick={() => handleCancelStream(stream.streamId)}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
