"use client";

// Client-side fetch interceptor for Reown/WalletConnect/analytics endpoints
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.toString() 
        : (input as Request).url;
    
    const isReownOrWeb3 = 
      url.includes('web3modal') ||
      url.includes('walletconnect') ||
      url.includes('reown') ||
      url.includes('amplitude') ||
      url.includes('mixpanel');

    const isInternalOrSupabase = 
      url.startsWith('/') ||
      url.includes(window.location.host) ||
      url.includes('supabase.co');

    if (isReownOrWeb3) {
      try {
        const mockData: any = { status: 'ok' };
        mockData.features = {
          analytics: false,
          swaps: false,
          onramp: false
        };
        mockData.planLimits = {
          tier: 'free'
        };
        
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ planLimits: { tier: 'free' }, features: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      return await originalFetch(input, init);
    } catch (error) {
      if (!isInternalOrSupabase) {
        return new Response(JSON.stringify({ planLimits: { tier: 'free' }, features: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  };
}

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { ModalProviderGlobal } from "./modal/ModalProvider";
import { LoadingProvider } from "./loading/LoadingContext";
import { TxRegistryProvider } from "@/context/TxRegistryContext";

const queryClient = new QueryClient();

const customTheme = darkTheme({
  accentColor: "#ff6b4a",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} locale="en">
          <TxRegistryProvider>
            <LoadingProvider>
              <ModalProviderGlobal>
                {children}
              </ModalProviderGlobal>
            </LoadingProvider>
          </TxRegistryProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

