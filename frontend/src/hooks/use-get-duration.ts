import { ErrorReturnType, PendingReturnType } from "./types";
import { useGetCreatorInfo } from "./use-get-creator-info";
import { useGetDurationByContractAddress } from "./use-get-duration-by-contract-address";

interface SuccessReturnType {
  status: "success";
  duration: number;
}

export type UseGetDurationReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetDuration = (): UseGetDurationReturnType => {
  const creatorInfo = useGetCreatorInfo();

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  return useGetDurationByContractAddress({ contractAddress });
};
