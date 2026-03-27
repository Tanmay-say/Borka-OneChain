import { SuiClient } from '@onelabs/sui/client';

export const NETWORK = process.env.REACT_APP_ONECHAIN_NETWORK || 'testnet';
export const RPC_URL = process.env.REACT_APP_ONECHAIN_RPC || 'https://rpc-testnet.onelabs.cc:443';
export const EXPLORER_URL = process.env.REACT_APP_ONECHAIN_EXPLORER || 'https://onescan.cc/testnet';
export const PACKAGE_ID = process.env.REACT_APP_PACKAGE_ID || '';
export const LEADERBOARD_ID = process.env.REACT_APP_LEADERBOARD_ID || '';
export const MINT_REGISTRY_ID = process.env.REACT_APP_MINT_REGISTRY_ID || '';

export const suiClient = new SuiClient({ url: RPC_URL });

export function truncateAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function explorerTxUrl(digest) {
  return `${EXPLORER_URL}/txblock/${digest}`;
}

export function computeScore(coins, deaths) {
  // Higher coins = better, lower deaths = better
  return coins * 100 - deaths * 50;
}
