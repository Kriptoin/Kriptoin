import { useReadContract } from "wagmi";
import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { UseGetCreatorInfoReturnType } from "./use-get-creator-info";

export const useGetCreatorInfoByAddress = (
  address: `0x${string}` | undefined,
): UseGetCreatorInfoReturnType => {
  const result = useReadContract({
    abi: UniversalTipKuAbi,
    address: UniversalTipKuAddress,
    functionName: "creatorInfoByAddress",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  if (!address) return { status: "error", errorMessage: "Address is required" };

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

  if (result.data[0] === "") {
    return {
      status: "error",
      errorMessage: "Creator not found",
    };
  }

  return {
    status: "success",
    username: result.data[0],
    name: result.data[1],
    creatorAddress: result.data[2],
    contractAddress: result.data[3],
  };
};
