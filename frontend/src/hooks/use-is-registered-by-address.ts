import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useIsRegisteredByAddress = (
  address: `0x${string}` | undefined
) => {
  return useReadContract({
    abi: UniversalTipKuAbi,
    address: UniversalTipKuAddress,
    functionName: "isRegistered",
    args: [address!],
    query: { enabled: !!address },
  });
};
