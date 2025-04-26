import { TipKuAbi } from "@/abi/TipKu";
import { useReadContract } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";

interface SuccessReturnType {
  status: "success";
  duration: number;
}

type UseGetDurationReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetDuration = ({
  contractAddress,
}: {
  contractAddress?: `0x${string}`;
}): UseGetDurationReturnType => {
  const result = useReadContract({
    abi: TipKuAbi,
    address: contractAddress,
    functionName: "messageDuration",
    query: {
      enabled: !!contractAddress,
    },
  });

  if (result.status === "pending") {
    return { status: "pending" };
  }

  if (result.status === "error") {
    return { status: "error", errorMessage: result.error.message };
  }

  return { status: "success", duration: result.data };
};
