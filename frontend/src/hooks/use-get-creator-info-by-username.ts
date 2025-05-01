import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { UniversalKriptoinAddress } from "@/constants";
import { useReadContract } from "wagmi";
import { UseGetCreatorInfoReturnType } from "./use-get-creator-info";

export const useGetCreatorInfoByUsername = (
  username: string
): UseGetCreatorInfoReturnType => {
  const result = useReadContract({
    abi: UniversalKriptoinAbi,
    address: UniversalKriptoinAddress,
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
