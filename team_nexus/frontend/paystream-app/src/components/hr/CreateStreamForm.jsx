import { useState } from 'react';
import { createStream } from '../../services/contractService';

export default function CreateStreamForm({ onStreamCreated }) {
    const [employee, setEmployee] = useState('');
    const [rate, setRate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!employee || !rate) {
            setError('Please fill in all fields.');
            return;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(employee)) {
            setError('Invalid Ethereum address format.');
            return;
        }

        if (Number(rate) <= 0) {
            setError('Rate must be greater than zero.');
            return;
        }

        try {
            setLoading(true);
            await createStream(employee, rate);
            setEmployee('');
            setRate('');
            if (onStreamCreated) onStreamCreated();
        } catch (err) {
            console.error('Create stream failed:', err);
            setError(err.reason || err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card">
            <div className="card-header">
                <h2 className="card-title">
                    Create Stream
                </h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="employee-address">
                        Employee Address
                    </label>
                    <input
                        id="employee-address"
                        className="form-input"
                        type="text"
                        placeholder="0x..."
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="rate-per-second">
                        Rate Per Second (HLUSD)
                    </label>
                    <input
                        id="rate-per-second"
                        className="form-input"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="e.g. 0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        disabled={loading}
                    />
                    <p className="form-hint">
                        Tokens streamed to employee every second. 0.01 ≈ 864 PST/day.
                    </p>
                </div>
                {error && (
                    <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        Error: {error}
                    </p>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Creating…
                        </>
                    ) : (
                        'Create Stream'
                    )}
                </button>
            </form>
        </div>
    );
}
