import { useAccount } from "wagmi";
import { ErrorReturnType, PendingReturnType } from "./types";
import { useGetAlertStatusByAddress } from "./use-get-alert-status-by-address";

interface SuccessReturnType {
  status: "success";
  enabled: boolean;
}

export type UseGetAlertStatusReturnType =
  | SuccessReturnType
  | ErrorReturnType
  | PendingReturnType;

export const useGetAlertStatus = (): UseGetAlertStatusReturnType => {
  const { address } = useAccount();

  return useGetAlertStatusByAddress(address);
};
