import React from 'react';
import { useWallet } from '../contexts/WalletContext';

const styles = {
  btn: {
    padding: '10px 20px',
    borderRadius: '25px',
    border: 'none',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'transform 0.1s',
  },
  connected: {
    background: 'linear-gradient(135deg, #1D9E75, #0f6e56)',
    color: '#fff',
  },
  disconnected: {
    background: 'linear-gradient(135deg, #ff3366, #cc1144)',
    color: '#fff',
  },
};

export default function WalletButton({ style = {} }) {
  const { address, shortAddress, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected) {
    return (
      <button
        data-testid="wallet-button-connected"
        style={{ ...styles.btn, ...styles.connected, ...style }}
        onClick={disconnect}
        title={address}
      >
        ✅ {shortAddress}
      </button>
    );
  }

  return (
    <button
      data-testid="wallet-button-disconnected"
      style={{ ...styles.btn, ...styles.disconnected, ...style }}
      onClick={connect}
      disabled={isConnecting}
    >
      {isConnecting ? '⏳ Connecting...' : '🔗 Connect OneWallet'}
    </button>
  );
}