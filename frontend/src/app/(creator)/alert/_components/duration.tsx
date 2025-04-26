import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useState } from "react";
import { BaseError, useWriteContract } from "wagmi";
import { TipKuAbi } from "@/abi/TipKu";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { Save } from "lucide-react";
import { useTxHash } from "@/hooks/use-tx-hash";
import { TxButton } from "../../_components/tx-button";
import { UseGetDurationReturnType } from "@/hooks/use-get-duration";
import { ErrorCard } from "./error-card";
import { useGetCreatorInfo } from "@/hooks/use-get-creator-info";
import { LoadingCard } from "./loading-card";
import { RegisterCard } from "./register-card";

export const Duration = ({
  duration,
  contractAddress,
}: {
  duration: UseGetDurationReturnType;
  contractAddress?: `0x${string}`;
}) => {
  const [currentDuration, setCurrentDuration] = useState(() =>
    duration.status === "success" ? duration.duration : 5,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { txHash, setTxHashWithTimeout } = useTxHash();

  const { writeContract } = useWriteContract();

  const creatorInfo = useGetCreatorInfo();

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
        abi: TipKuAbi,
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
          This action requires a small transaction fee (~0.0001 EDU).
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
