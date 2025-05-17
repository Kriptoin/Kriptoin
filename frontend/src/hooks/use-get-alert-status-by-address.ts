import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { useReadContract } from "wagmi";
import { UseGetAlertStatusReturnType } from "./use-get-alert-status";
import { useGetCreatorInfoByAddress } from "./use-get-creator-info-by-address";

export const useGetAlertStatusByAddress = (
  address: `0x${string}` | undefined
): UseGetAlertStatusReturnType => {
  if (!address) {
    return {
      status: "error",
      errorMessage: "Address is undefined",
    };
  }
  
  const creatorInfo = useGetCreatorInfoByAddress(address);

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  const result = useReadContract({
    abi: KriptoinAbi,
    address: contractAddress,
    functionName: "isEnabled",
    query: {
      enabled: !!contractAddress,
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
    enabled: result.data,
  };
};
