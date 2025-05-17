import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { lisk } from "viem/chains";

export const account = privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: lisk,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: lisk,
  transport: http(),
});