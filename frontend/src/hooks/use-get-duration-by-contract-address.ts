import { TipKuAbi } from "@/abi/TipKu";
import { useReadContract } from "wagmi";
import { UseGetDurationReturnType } from "./use-get-duration";

export const useGetDurationByContractAddress = ({
  contractAddress,
}: {
  contractAddress: `0x${string}` | undefined;
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
