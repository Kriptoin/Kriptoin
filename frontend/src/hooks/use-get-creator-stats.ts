interface SuccessReturnType {
  status: "success";
  totalTipsReceived: bigint;
  tipCount: bigint;
}

import { useReadContracts } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";
import { TipKuAbi } from "@/abi/TipKu";

type UseGetStatsReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetCreatorStats = (
  contractAddress: `0x${string}` | undefined
): UseGetStatsReturnType => {
  const result = useReadContracts({
    contracts: [
      {
        abi: TipKuAbi,
        address: contractAddress,
        functionName: "getTipCount",
      },
      {
        abi: TipKuAbi,
        address: contractAddress,
        functionName: "totalTipsReceived",
      },
    ],
    query: {
      enabled: !!contractAddress,
    },
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error?.message,
    };
  }

  if (result.status === "pending") {
    return {
      status: "pending",
    };
  }

  return {
    status: "success",
    tipCount:
      result.data[0].status === "success" ? result.data[0].result : BigInt(0),
    totalTipsReceived:
      result.data[1].status === "success" ? result.data[1].result : BigInt(0),
  };
};
