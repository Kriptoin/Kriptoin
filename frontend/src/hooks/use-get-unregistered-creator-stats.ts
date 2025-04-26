import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { useReadContracts } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";

interface SuccessReturnType {
  status: "success";
  tipCount: bigint;
  totalTipsReceived: bigint;
}

type UseGetUnregisteredCreatorStatsReturnType =
  | ErrorReturnType
  | PendingReturnType
  | SuccessReturnType;

export const useGetUnregisteredCreatorStats = (
  creatorAddress: `0x${string}` | undefined
): UseGetUnregisteredCreatorStatsReturnType => {
  const result = useReadContracts({
    contracts: [
      {
        abi: UniversalTipKuAbi,
        address: UniversalTipKuAddress,
        functionName: "getTipCount",
        args: [creatorAddress!],
      },
      {
        abi: UniversalTipKuAbi,
        address: UniversalTipKuAddress,
        functionName: "totalTipsReceived",
        args: [creatorAddress!],
      },
    ],
    query: {
      enabled: !!creatorAddress,
    },
  });

  if (result.status === "error") {
    return {
      status: "error",
      errorMessage: result.error.message,
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
