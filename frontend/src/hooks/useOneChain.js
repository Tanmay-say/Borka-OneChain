import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, LEADERBOARD_ID, MINT_REGISTRY_ID, publicAssetUrl, suiClient } from '../lib/onechain';

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
        onError: (err) => setError(err.message),
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
        onError: (err) => setError(err.message),
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
    const imageUrl = publicAssetUrl('/1');
    const thumbnailUrl = publicAssetUrl('/2.png');
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
        onError: (err) => setError(err.message),
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
    const entries = obj?.data?.content?.fields?.entries || [];
    return entries
      .map(e => ({
        address: e.fields?.player,
        coins: Number(e.fields?.coins),
        deaths: Number(e.fields?.deaths),
        timeMs: Number(e.fields?.time_ms),
        score: Number(e.fields?.coins) * 100 - Number(e.fields?.deaths) * 50,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}
