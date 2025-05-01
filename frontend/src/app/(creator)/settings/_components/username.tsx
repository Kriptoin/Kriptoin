"use client";

import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UniversalKriptoinAddress } from "@/constants";
import { useTxHash } from "@/hooks/use-tx-hash";
import { config } from "@/lib/wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BaseError, useWriteContract } from "wagmi";
import { TxButton } from "../../_components/tx-button";

export default function Username({
  currentUsername,
}: {
  currentUsername: string;
}) {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);

  const { txHash, setTxHashWithTimeout } = useTxHash();

  const { writeContract } = useWriteContract();

  const queryClient = useQueryClient();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    writeContract(
      {
        abi: UniversalKriptoinAbi,
        address: UniversalKriptoinAddress,
        functionName: "changeUsername",
        args: [username],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          setTimeout(async () => {
            await queryClient.invalidateQueries();
          }, 1000);

          setTxHashWithTimeout(data);

          toast.success("Username updated");
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(
            (error as BaseError).details ||
              "Update username failed. See console for detailed error."
          );

          console.error(error.message);

          setIsLoading(false);
        },
      }
    );
  };

  if (!currentUsername) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update username</CardTitle>
        <CardDescription>
          <div>
            Update your current username.
          </div>
          <div>
            Username must be between 3 and 10 characters long. Username can only
            contain letters and numbers.
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
          <Input
            placeholder="Username"
            required
            minLength={3}
            maxLength={10}
            pattern="^[a-zA-Z0-9]+$"
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
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
