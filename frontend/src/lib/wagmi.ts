import { defaultConfig } from "@xellar/kit";
import { lisk } from "viem/chains";
import { webSocket } from "wagmi";

export const config = defaultConfig({
  appName: "Kriptoin",
  walletConnectProjectId: "b1522ae57ecc0f9637609ceea5373a39",
  ssr: true,
  xellarAppId: "317e39eb-f94a-4f8e-8aa1-d8e25a92b704",
  xellarEnv: "production",
  chains: [lisk],
  transports: {
    [lisk.id]: webSocket("wss://ws.api.lisk.com", {
      retryCount: 20,
    }),
  },
});
