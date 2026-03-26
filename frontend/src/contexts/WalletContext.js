import React, { createContext, useContext } from 'react';
import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@onelabs/dapp-kit';
import { truncateAddress } from '../lib/onechain';

const WalletContext = createContext(null);

export function WalletContextProvider({ children }) {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connectWallet, isPending: isConnecting } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  const connect = () => {
    if (wallets.length > 0) connectWallet({ wallet: wallets[0] });
  };

  const value = {
    address: account?.address || null,
    shortAddress: truncateAddress(account?.address),
    isConnected: !!account,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);