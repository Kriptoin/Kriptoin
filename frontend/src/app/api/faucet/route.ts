import { FaucetContractAddress } from "@/constants";
import { NextRequest, NextResponse } from "next/server";
import { BaseError, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { liskSepolia } from "viem/chains";

const account = privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: liskSepolia,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
});

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const hash = await walletClient.writeContract({
      address: FaucetContractAddress,
      abi,
      functionName: "transfer",
      args: [address],
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      txHash: receipt.transactionHash,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as BaseError).shortMessage || "Transfer failed" },
      { status: 500 },
    );
  }
}
