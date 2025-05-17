import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { Button } from "@/components/ui/button";
import { UniversalKriptoinAddress } from "@/constants";
import { useGetCreatorInfoByAddress } from "@/hooks/use-get-creator-info-by-address";
import { useIsRegisteredByAddress } from "@/hooks/use-is-registered-by-address";
import { config } from "@/lib/wagmi";
import { type Row } from "@tanstack/react-table";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { parseUnits } from "viem";
import { BaseError, useAccount, useWriteContract } from "wagmi";
import { type History } from "../columns";

export const ActionCell = ({ row }: { row: Row<History> }) => {
  const account = useAccount();

  const isRegistered = useIsRegisteredByAddress(account.address);

  const creatorInfo = useGetCreatorInfoByAddress(account.address);

  const { writeContract } = useWriteContract();

  const [isLoading, setIsLoading] = useState(false);

  const { original } = row;
  const { senderName, amount, message } = original;

  if (isRegistered.status === "pending" || creatorInfo.status === "pending") {
    return <Loader2 className="animate-spin" />;
  }

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  const handleTrigger = () => {
    setIsLoading(true);

    if (isRegistered.data) {
      if (!contractAddress) {
        setIsLoading(false);
        toast.error("Contract address is undefined");
        return;
      }

      writeContract(
        {
          address: contractAddress,
          abi: KriptoinAbi,
          functionName: "emitTipEvent",
          args: [senderName, message, parseUnits(amount, 2)],
        },
        {
          onSuccess: async (data) => {
            await waitForTransactionReceipt(config, {
              hash: data,
            });

            toast.success("Tip triggered successfully");

            setIsLoading(false);
          },
          onError: (error) => {
            toast.error(
              (error as BaseError).details ||
                "Failed to trigger tip. See console for detailed error."
            );

            console.error(error.message);

            setIsLoading(false);
          },
        }
      );
    } else {
      if (!account.address) {
        setIsLoading(false);
        toast.error("Account address is undefined");
        return;
      }

      writeContract(
        {
          address: UniversalKriptoinAddress,
          abi: UniversalKriptoinAbi,
          functionName: "emitTipEvent",
          args: [account.address, senderName, message, parseUnits(amount, 2)],
        },
        {
          onSuccess: async (data) => {
            await waitForTransactionReceipt(config, {
              hash: data,
            });

            toast.success("Tip triggered successfully");

            setIsLoading(false);
          },
          onError: (error) => {
            toast.error(
              (error as BaseError).details ||
                "Failed to trigger tip. See console for detailed error."
            );

            console.error(error.message);

            setIsLoading(false);
          },
        }
      );
    }
  };

  return (
    <Button
      onClick={handleTrigger}
      className="flex gap-2 items-center"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Zap />}
      <span className="hidden sm:inline">Trigger</span>
    </Button>
  );
};
