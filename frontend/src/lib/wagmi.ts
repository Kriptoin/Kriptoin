import { defaultConfig } from "@xellar/kit";
import { liskSepolia } from "viem/chains";
import { webSocket } from "wagmi";

export const config = defaultConfig({
  appName: "Kriptoin",
  walletConnectProjectId: "b1522ae57ecc0f9637609ceea5373a39",
  ssr: true,
  xellarAppId: "d5ccde80-e176-47e3-85f6-28ff890fbe41",
  xellarEnv: "sandbox",
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: webSocket("wss://ws.sepolia-api.lisk.com", {
      retryCount: 20,
    }),
  },
});
