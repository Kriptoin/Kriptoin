import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { useReadContract } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";

interface SuccessReturnType {
  status: "success";
  bio: string;
}

type UseGetBioReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetBio = ({
  contractAddress,
}: {
  contractAddress: `0x${string}` | undefined;
}): UseGetBioReturnType => {
  const result = useReadContract({
    abi: KriptoinAbi,
    address: contractAddress,
    functionName: "bio",
    query: {
      enabled: !!contractAddress,
    },
  });

  if (!contractAddress) {
    return {
      status: "error",
      errorMessage: "Contract address is undefined",
    };
  }

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
    bio: result.data,
  };
};
