import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, LEADERBOARD_ID, MINT_REGISTRY_ID, suiClient } from '../lib/onechain';

// Resolve the base URL for NFT assets — use the deployed frontend URL, never localhost
const ASSET_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.origin !== 'http://localhost:3000'
    ? window.location.origin
    : 'https://borka-game.preview.emergentagent.com');

const NFT_IMAGE_URL     = `${ASSET_BASE_URL}/1`;
const NFT_THUMBNAIL_URL = `${ASSET_BASE_URL}/2.png`;

function normalizeWalletError(error) {
  const message = error?.message || String(error || 'Unknown error');
  if (/reject/i.test(message) || /denied/i.test(message) || /User rejected/i.test(message)) {
    return 'Request cancelled in wallet.';
  }
  if (/Failed to fetch/i.test(message)) {
    return 'Wallet or RPC connection failed. Reload the app and try again.';
  }
  return message;
}

export function useSubmitScore() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txDigest, setTxDigest] = useState(null);
  const [error, setError] = useState(null);

  const submitScore = useCallback(({ coins, deaths, timeMs }) => {
    setError(null);
    setTxDigest(null);
    if (!PACKAGE_ID || !LEADERBOARD_ID) {
      setError('Contract not configured');
      return;
    }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::borka_game::submit_score`,
      arguments: [
        tx.object(LEADERBOARD_ID),
        tx.pure.u64(coins),
        tx.pure.u64(deaths),
        tx.pure.u64(timeMs),
      ],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => setTxDigest(result.digest),
        onError: (err) => setError(normalizeWalletError(err)),
      }
    );
  }, [signAndExecute]);

  const reset = useCallback(() => {
    setTxDigest(null);
    setError(null);
  }, []);

  return { submitScore, isPending, txDigest, error, reset };
}

export function useClaimTokens() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txDigest, setTxDigest] = useState(null);
  const [error, setError] = useState(null);

  const claimTokens = useCallback(({ coins }) => {
    setError(null);
    setTxDigest(null);
    if (!PACKAGE_ID || !LEADERBOARD_ID) {
      setError('Contract not configured');
      return;
    }
    const _ = coins;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::borka_game::claim_tokens`,
      arguments: [
        tx.object(LEADERBOARD_ID),
      ],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => setTxDigest(result.digest),
        onError: (err) => setError(normalizeWalletError(err)),
      }
    );
  }, [signAndExecute]);

  const reset = useCallback(() => {
    setTxDigest(null);
    setError(null);
  }, []);

  return { claimTokens, isPending, txDigest, error, reset };
}

export function useMintDevilBoris() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txDigest, setTxDigest] = useState(null);
  const [error, setError] = useState(null);

  const mintNFT = useCallback(() => {
    setError(null);
    setTxDigest(null);
    if (!PACKAGE_ID || !MINT_REGISTRY_ID) {
      setError('Contract not configured');
      return;
    }
    const name = 'Devil Borka';
    const description = 'Exclusive Devil Borka skin NFT unlocked after beating all 8 BORKA levels.';
    const imageUrl = NFT_IMAGE_URL;
    const thumbnailUrl = NFT_THUMBNAIL_URL;
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::borka_game::mint_devil_borka`,
      arguments: [
        tx.object(MINT_REGISTRY_ID),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
        tx.pure.string(thumbnailUrl),
      ],
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => setTxDigest(result.digest),
        onError: (err) => setError(normalizeWalletError(err)),
      }
    );
  }, [signAndExecute]);

  const reset = useCallback(() => {
    setTxDigest(null);
    setError(null);
  }, []);

  return { mintNFT, isPending, txDigest, error, reset };
}

export async function checkDevilBorisNFT(address) {
  if (!address || !PACKAGE_ID) return false;
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::borka_game::BorkaSkinNFT`,
      },
      options: { showContent: true },
    });
    return objects.data.length > 0;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard() {
  if (!LEADERBOARD_ID) return [];
  try {
    const obj = await suiClient.getObject({
      id: LEADERBOARD_ID,
      options: { showContent: true },
    });
    // The RPC may nest entries differently depending on the client version.
    // Try both common shapes.
    const fields = obj?.data?.content?.fields || {};
    const rawEntries = fields.entries || [];
    if (rawEntries.length === 0 && obj?.data?.content?.fields === undefined) {
      console.warn('[Borka] fetchLeaderboard: no content fields returned. Check RPC connection.');
    }
    return rawEntries
      .map(e => {
        // Each entry may be {fields: {...}} or directly the fields object
        const f = e?.fields ?? e;
        return {
          address: f?.player,
          coins: Number(f?.coins ?? 0),
          deaths: Number(f?.deaths ?? 0),
          timeMs: Number(f?.time_ms ?? 0),
          score: Number(f?.coins ?? 0) * 100 - Number(f?.deaths ?? 0) * 50,
        };
      })
      .filter(e => e.address)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (err) {
    console.error('[Borka] fetchLeaderboard error:', err);
    throw err; // Re-throw so Leaderboard.jsx can show an error state
  }
}
