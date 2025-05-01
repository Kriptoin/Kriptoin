import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { useReadContract } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";

interface SuccessReturnType {
  status: "success";
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export type UseGetColorsReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetColors = ({
  contractAddress,
}: {
  contractAddress: `0x${string}` | undefined;
}): UseGetColorsReturnType => {
  const result = useReadContract({
    abi: KriptoinAbi,
    address: contractAddress,
    functionName: "getColors",
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
    colors: {
      primary: result.data[0],
      secondary: result.data[1],
      background: result.data[2],
    },
  };
};
