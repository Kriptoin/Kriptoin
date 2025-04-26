"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { useTxHash } from "@/hooks/use-tx-hash";
import { TxButton } from "../../_components/tx-button";
import { BaseError } from "wagmi";

export default function Name({ currentName }: { currentName?: string }) {
  const [name, setName] = useState(currentName ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const { txHash, setTxHashWithTimeout } = useTxHash();

  const { writeContract } = useWriteContract();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    writeContract(
      {
        abi: UniversalTipKuAbi,
        address: UniversalTipKuAddress,
        functionName: "changeName",
        args: [name],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          setTxHashWithTimeout(data);

          toast.success("Name updated");

          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(
            (error as BaseError).details ||
              "Failed update name. See console for detailed error."
          );

          console.error(error.message);

          setIsLoading(false);
        },
      }
    );
  };

  if (!currentName) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update name</CardTitle>
        <CardDescription>
          <div>
            Update your current name. This action requires a small transaction
            fee (~0.0001 EDU).
          </div>
          <div>
            Name must be between 3 and 35 characters long. Name can only contain
            letters and spaces.
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
          <Input
            placeholder="Name"
            required
            minLength={3}
            maxLength={35}
            pattern="^[a-zA-Z ]+$"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            value={name}
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
}
