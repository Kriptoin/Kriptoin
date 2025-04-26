import { useAccount } from "wagmi";
import { useIsRegisteredByAddress } from "./use-is-registered-by-address";

export const useIsRegistered = () => {
  const account = useAccount();

  return useIsRegisteredByAddress(account.address);
};
