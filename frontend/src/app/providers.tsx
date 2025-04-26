"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { ColorProvider } from "@/components/color-provider";
import { XellarKitProvider } from "@xellar/kit";
import { config } from "@/lib/wagmi";

export function Providers(props: {
  children: ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider showConfirmationModal={false}>
          <ColorProvider>{props.children}</ColorProvider>
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
