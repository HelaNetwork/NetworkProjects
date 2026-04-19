import React, { useState, useEffect } from 'react';

// HR Dashboard Component with Pause/Resume functionality
function HRStreamsTable() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState(null);

  // Fetch all streams
  const fetchStreams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/streams/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStreams(data.streams || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      showMessage('Failed to load streams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show message
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Pause stream
  const handlePause = async (streamId) => {
    if (!confirm('Are you sure you want to pause this stream?')) {
      return;
    }

    setActionLoading({ ...actionLoading, [`pause-${streamId}`]: true });

    try {
      const response = await fetch(`/api/streams/${streamId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Stream paused! Transaction: ${data.txHash.substring(0, 10)}...`, 'success');
        
        // Poll for confirmation
        pollTransactionStatus(data.txHash, () => {
          fetchStreams(); // Refresh after confirmation
          showMessage('Stream pause confirmed!', 'success');
        });
      } else {
        showMessage(data.error || 'Failed to pause stream', 'error');
      }
    } catch (error) {
      console.error('Error pausing stream:', error);
      showMessage('Failed to pause stream', 'error');
    } finally {
      setActionLoading({ ...actionLoading, [`pause-${streamId}`]: false });
    }
  };

  // Resume stream
  const handleResume = async (streamId) => {
    if (!confirm('Are you sure you want to resume this stream?')) {
      return;
    }

    setActionLoading({ ...actionLoading, [`resume-${streamId}`]: true });

    try {
      const response = await fetch(`/api/streams/${streamId}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Stream resumed! Transaction: ${data.txHash.substring(0, 10)}...`, 'success');
        
        // Poll for confirmation
        pollTransactionStatus(data.txHash, () => {
          fetchStreams(); // Refresh after confirmation
          showMessage('Stream resume confirmed!', 'success');
        });
      } else {
        showMessage(data.error || 'Failed to resume stream', 'error');
      }
    } catch (error) {
      console.error('Error resuming stream:', error);
      showMessage('Failed to resume stream', 'error');
    } finally {
      setActionLoading({ ...actionLoading, [`resume-${streamId}`]: false });
    }
  };

  // Cancel stream
  const handleCancel = async (streamId) => {
    if (!confirm('Are you sure you want to cancel this stream? This cannot be undone.')) {
      return;
    }

    setActionLoading({ ...actionLoading, [`cancel-${streamId}`]: true });

    try {
      const response = await fetch(`/api/streams/${streamId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Stream cancelled! Transaction: ${data.txHash.substring(0, 10)}...`, 'success');
        
        pollTransactionStatus(data.txHash, () => {
          fetchStreams();
          showMessage('Stream cancellation confirmed!', 'success');
        });
      } else {
        showMessage(data.error || 'Failed to cancel stream', 'error');
      }
    } catch (error) {
      console.error('Error cancelling stream:', error);
      showMessage('Failed to cancel stream', 'error');
    } finally {
      setActionLoading({ ...actionLoading, [`cancel-${streamId}`]: false });
    }
  };

  // Poll transaction status
  const pollTransactionStatus = async (txHash, onConfirmed, maxAttempts = 40) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/streams/tx-status/${txHash}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const status = await response.json();

        if (status.status === 'confirmed') {
          clearInterval(interval);
          onConfirmed();
        } else if (++attempts >= maxAttempts) {
          clearInterval(interval);
          showMessage('Transaction taking longer than expected', 'warning');
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling status:', error);
      }
    }, 3000);
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (stream) => {
    if (!stream.active) {
      return <span className="badge badge-inactive">Cancelled</span>;
    }
    if (stream.paused) {
      return <span className="badge badge-paused">⏸️ Paused</span>;
    }
    return <span className="badge badge-active">✓ Active</span>;
  };

  return (
    <div className="streams-container">
      <div className="header">
        <h2>Employee Streams</h2>
        <button onClick={fetchStreams} disabled={loading} className="btn-refresh">
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Streams Table */}
      <div className="table-container">
        <table className="streams-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Total Amount</th>
              <th>Withdrawn</th>
              <th>Available</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  {loading ? 'Loading streams...' : 'No streams found'}
                </td>
              </tr>
            ) : (
              streams.map((stream) => (
                <tr key={stream.streamId} className={stream.paused ? 'stream-paused' : ''}>
                  <td>
                    <div className="employee-info">
                      <strong>{stream.employeeName}</strong>
                      <small>{stream.employeeEmail}</small>
                    </div>
                  </td>
                  <td>{stream.totalAmount} HLUSD</td>
                  <td>{stream.withdrawnAmount} HLUSD</td>
                  <td>
                    <strong className="available-balance">
                      {stream.availableBalance} HLUSD
                    </strong>
                  </td>
                  <td>{getStatusBadge(stream)}</td>
                  <td>{formatDate(stream.startTime)}</td>
                  <td>{formatDate(stream.endTime)}</td>
                  <td>
                    <div className="action-buttons">
                      {stream.active && !stream.paused && (
                        <button
                          onClick={() => handlePause(stream.streamId)}
                          disabled={actionLoading[`pause-${stream.streamId}`]}
                          className="btn btn-pause"
                          title="Pause stream"
                        >
                          {actionLoading[`pause-${stream.streamId}`] ? '...' : '⏸️ Pause'}
                        </button>
                      )}
                      
                      {stream.active && stream.paused && (
                        <button
                          onClick={() => handleResume(stream.streamId)}
                          disabled={actionLoading[`resume-${stream.streamId}`]}
                          className="btn btn-resume"
                          title="Resume stream"
                        >
                          {actionLoading[`resume-${stream.streamId}`] ? '...' : '▶️ Resume'}
                        </button>
                      )}
                      
                      {stream.active && (
                        <button
                          onClick={() => handleCancel(stream.streamId)}
                          disabled={actionLoading[`cancel-${stream.streamId}`]}
                          className="btn btn-cancel"
                          title="Cancel stream"
                        >
                          {actionLoading[`cancel-${stream.streamId}`] ? '...' : '🛑 Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .streams-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .btn-refresh {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-refresh:hover {
          background: #0056b3;
        }

        .btn-refresh:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .message {
          padding: 12px 20px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .message-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message-warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .streams-table {
          width: 100%;
          border-collapse: collapse;
        }

        .streams-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #dee2e6;
        }

        .streams-table td {
          padding: 15px;
          border-bottom: 1px solid #dee2e6;
          color: #555;
        }

        .streams-table tr:hover {
          background: #f8f9fa;
        }

        .stream-paused {
          background: #fff3cd !important;
        }

        .employee-info {
          display: flex;
          flex-direction: column;
        }

        .employee-info strong {
          margin-bottom: 4px;
          color: #333;
        }

        .employee-info small {
          color: #666;
          font-size: 12px;
        }

        .available-balance {
          color: #28a745;
          font-size: 16px;
        }

        .badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-active {
          background: #d4edda;
          color: #155724;
        }

        .badge-paused {
          background: #fff3cd;
          color: #856404;
        }

        .badge-inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-pause {
          background: #ffc107;
          color: #000;
        }

        .btn-pause:hover:not(:disabled) {
          background: #e0a800;
        }

        .btn-resume {
          background: #28a745;
          color: white;
        }

        .btn-resume:hover:not(:disabled) {
          background: #218838;
        }

        .btn-cancel {
          background: #dc3545;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #c82333;
        }

        .text-center {
          text-align: center;
          padding: 40px;
          color: #999;
        }

        @media (max-width: 768px) {
          .streams-container {
            padding: 10px;
          }

          .streams-table {
            font-size: 12px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default HRStreamsTable;
