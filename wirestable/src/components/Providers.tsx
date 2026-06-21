"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { ModalProviderGlobal } from "./modal/ModalProvider";
import { LoadingProvider } from "./loading/LoadingContext";

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
          <LoadingProvider>
            <ModalProviderGlobal>
              {children}
            </ModalProviderGlobal>
          </LoadingProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

