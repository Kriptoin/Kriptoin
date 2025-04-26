import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { useReadContract } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";

interface SuccessReturnType {
  status: "success";
  username: string;
  name: string;
  creatorAddress: `0x${string}`;
  contractAddress: `0x${string}`;
}

type UseGetCreatorInfoReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetCreatorInfoByUsername = (
  username: string
): UseGetCreatorInfoReturnType => {
  const result = useReadContract({
    abi: UniversalTipKuAbi,
    address: UniversalTipKuAddress,
    functionName: "creatorInfoByUsername",
    args: [username],
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
