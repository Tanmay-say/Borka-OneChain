import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@onelabs/dapp-kit';
import '@onelabs/dapp-kit/dist/index.css';
import { suiClient } from '@/lib/onechain';
import { WalletContextProvider } from '@/contexts/WalletContext';
import BorkaGame from "@/components/BorkaGame.jsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider client={suiClient}>
        <WalletProvider autoConnect>
          <WalletContextProvider>
            <div className="App">
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<BorkaGame />} />
                </Routes>
              </BrowserRouter>
            </div>
          </WalletContextProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
