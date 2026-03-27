import { SuiClient } from '@onelabs/sui/client';

const DEFAULT_CHAIN_CONFIG = {
  network: 'testnet',
  rpcUrl: 'https://rpc-testnet.onelabs.cc:443',
  explorerUrl: 'https://onescan.cc/testnet',
  packageId: '0x7c358897ac2c98bed32a1f3148e99e7e6b5aee9ca8be671988a353682e31710d',
  leaderboardId: '0xb327c4cce2fea39c812692a9df63742aa2582a83e6c0955da6c4506849de2987',
  mintRegistryId: '0x5823bdfdf319242d19fcaf4fb41cd7eb89c91b8673007fda8ff0361d1e6c7c96',
};

export const NETWORK = process.env.REACT_APP_ONECHAIN_NETWORK || DEFAULT_CHAIN_CONFIG.network;
export const RPC_URL = process.env.REACT_APP_ONECHAIN_RPC || DEFAULT_CHAIN_CONFIG.rpcUrl;
export const EXPLORER_URL = process.env.REACT_APP_ONECHAIN_EXPLORER || DEFAULT_CHAIN_CONFIG.explorerUrl;
export const PACKAGE_ID = process.env.REACT_APP_PACKAGE_ID || DEFAULT_CHAIN_CONFIG.packageId;
export const LEADERBOARD_ID = process.env.REACT_APP_LEADERBOARD_ID || DEFAULT_CHAIN_CONFIG.leaderboardId;
export const MINT_REGISTRY_ID = process.env.REACT_APP_MINT_REGISTRY_ID || DEFAULT_CHAIN_CONFIG.mintRegistryId;

export const suiClient = new SuiClient({ url: RPC_URL });

export function truncateAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function explorerTxUrl(digest) {
  return `${EXPLORER_URL}/txblock/${digest}`;
}

export function publicAssetUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base =
    (typeof window !== 'undefined' && window.location.origin) ||
    process.env.REACT_APP_BACKEND_URL ||
    '';
  return `${base}${normalized}`;
}

export function computeScore(coins, deaths) {
  // Higher coins = better, lower deaths = better
  return coins * 100 - deaths * 50;
}
