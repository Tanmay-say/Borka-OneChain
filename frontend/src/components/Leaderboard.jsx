import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../hooks/useOneChain';
import { truncateAddress, LEADERBOARD_ID } from '../lib/onechain';

export default function Leaderboard({ refreshKey = 0 }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  useEffect(() => {
    const intervalId = window.setInterval(load, 8000);
    return () => window.clearInterval(intervalId);
  }, [refreshKey]);

  if (!LEADERBOARD_ID) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#888', fontSize: '13px' }}>Leaderboard not configured</p>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid="leaderboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#ffd700', fontSize: '16px', margin: 0 }}>
          🏆 On-Chain Leaderboard
        </h3>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#888',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            padding: '3px 8px',
            fontFamily: '"Courier New", monospace',
          }}
        >
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>
      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: '#888' }}>No scores yet. Be first!</p>
      ) : (
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
              <th style={th}>#</th>
              <th style={th}>Wallet</th>
              <th style={th}>🪙</th>
              <th style={th}>💀</th>
              <th style={th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.address} style={{ borderBottom: '1px solid #222' }}>
                <td style={td}>{i + 1}</td>
                <td style={td}>{truncateAddress(e.address)}</td>
                <td style={td}>{e.coins}</td>
                <td style={td}>{e.deaths}</td>
                <td style={{ ...td, color: '#ffd700', fontWeight: 'bold' }}>{e.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const containerStyle = {
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '20px',
  fontFamily: '"Courier New", monospace',
  color: '#fff',
  minWidth: '300px',
  maxWidth: '380px',
};
const th = { padding: '6px 8px', textAlign: 'left' };
const td = { padding: '6px 8px', color: '#ccc' };
