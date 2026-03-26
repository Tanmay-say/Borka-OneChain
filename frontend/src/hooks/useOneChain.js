import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { PACKAGE_ID, LEADERBOARD_ID, suiClient } from '../lib/onechain';

export function useSubmitScore() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txDigest, setTxDigest] = useState(null);
  const [error, setError] = useState(null);

  const submitScore = useCallback(({ coins, deaths, timeMs }) => {
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

  return { submitScore, isPending, txDigest, error };
}

export function useClaimTokens() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txDigest, setTxDigest] = useState(null);
  const [error, setError] = useState(null);

  const claimTokens = useCallback(({ coins }) => {
    if (!PACKAGE_ID || !LEADERBOARD_ID) {
      setError('Contract not configured');
      return;
    }
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::borka_game::claim_tokens`,
      arguments: [
        tx.object(LEADERBOARD_ID),
        tx.pure.u64(coins),
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

  return { claimTokens, isPending, txDigest, error };
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