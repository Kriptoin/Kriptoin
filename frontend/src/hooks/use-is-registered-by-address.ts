import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { UniversalKriptoinAddress } from "@/constants";
import { useReadContract } from "wagmi";

export const useIsRegisteredByAddress = (
  address: `0x${string}` | undefined
) => {
  return useReadContract({
    abi: UniversalKriptoinAbi,
    address: UniversalKriptoinAddress,
    functionName: "isRegistered",
    args: [address!],
    query: { enabled: !!address },
  });
};
