import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../hooks/useOneChain';
import { truncateAddress, LEADERBOARD_ID } from '../lib/onechain';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (!LEADERBOARD_ID) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#888', fontSize: '13px' }}>Leaderboard not configured</p>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid="leaderboard">
      <h3 style={{ color: '#ffd700', marginBottom: '10px', fontSize: '16px' }}>
        🏆 On-Chain Leaderboard
      </h3>
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
};
const th = { padding: '6px 8px', textAlign: 'left' };
const td = { padding: '6px 8px', color: '#ccc' };