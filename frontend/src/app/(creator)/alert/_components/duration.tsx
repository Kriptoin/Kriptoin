import { KriptoinAbi } from "@/abi/KriptoinAbi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetCreatorInfo } from "@/hooks/use-get-creator-info";
import { UseGetDurationReturnType } from "@/hooks/use-get-duration";
import { useTxHash } from "@/hooks/use-tx-hash";
import { config } from "@/lib/wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BaseError, useWriteContract } from "wagmi";
import { TxButton } from "../../_components/tx-button";
import { ErrorCard } from "../../_components/error-card";
import { LoadingCard } from "../../_components/loading-card";
import { RegisterCard } from "../../_components/register-card";

export const Duration = ({
  duration,
  contractAddress,
}: {
  duration: UseGetDurationReturnType;
  contractAddress?: `0x${string}`;
}) => {
  const [currentDuration, setCurrentDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const { txHash, setTxHashWithTimeout } = useTxHash();

  const { writeContract } = useWriteContract();

  const creatorInfo = useGetCreatorInfo();

  useEffect(() => {
    if (duration.status === "success") {
      setCurrentDuration(duration.duration);
    }
  }, [duration.status]);

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, min, max } = event.target;

    let newValue = Math.max(Number(min), Math.min(Number(max), Number(value)));

    setCurrentDuration(newValue);
  };

  const handleSaveDuration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contractAddress) {
      toast.error("Contract address is missing");
      return;
    }

    setIsLoading(true);

    writeContract(
      {
        abi: KriptoinAbi,
        address: contractAddress,
        functionName: "setMessageDuration",
        args: [currentDuration],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, {
            hash: data,
          });

          setTxHashWithTimeout(data);

          toast.success("Duration updated successfully");

          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(
            (error as BaseError).details ||
              "Failed to update duration. See console for detailed error.",
          );

          console.error(error.message);

          setIsLoading(false);
        },
      },
    );
  };

  if (duration.status === "error") return <ErrorCard title="Duration" />;

  if (
    creatorInfo.status === "pending" ||
    (creatorInfo.status === "success" && duration.status === "pending")
  )
    return <LoadingCard title="Duration" />;

  if (duration.status === "pending") return <RegisterCard title="Duration" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duration</CardTitle>
        <CardDescription>
          Set the duration of a tip message displayed on-screen (in seconds).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col items-start gap-4"
          onSubmit={handleSaveDuration}
        >
          <Input
            placeholder="Duration"
            autoComplete="off"
            min={1}
            max={120}
            type="number"
            required
            onChange={handleDurationChange}
            value={currentDuration}
          />
          <TxButton
            isLoading={isLoading}
            txHash={txHash}
            icon={Save}
            text="Save"
          />
        </form>
      </CardContent>
    </Card>
  );
};
