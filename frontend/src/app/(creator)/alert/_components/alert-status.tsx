import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UseGetAlertStatusReturnType } from "@/hooks/use-get-alert-status";
import React, { useEffect, useState } from "react";
import { LoadingCard } from "../../_components/loading-card";
import { RegisterCard } from "../../_components/register-card";
import { BaseError, useWriteContract } from "wagmi";
import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { useGetCreatorInfo, UseGetCreatorInfoReturnType } from "@/hooks/use-get-creator-info";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { useTxHash } from "@/hooks/use-tx-hash";
import Link from "next/link";
import { EXPLORER_TX_BASE_URL } from "@/constants";

export const AlertStatus = ({
  alertStatus,
}: {
    alertStatus: UseGetAlertStatusReturnType;
}) => {
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const creatorInfo = useGetCreatorInfo();

  const { txHash, setTxHashWithTimeout } = useTxHash();

  const onStatusChange = async (checked: boolean) => {
    setStatus(checked);
    setLoading(true);

    try {
      const contractAddress =
        creatorInfo.status === "success"
          ? creatorInfo.contractAddress
          : undefined;

      if (!contractAddress) {
        toast.error("Creator contract address not found");
        return;
      }

      const hash = await writeContractAsync({
        abi: KriptoinAbi,
        address: contractAddress,
        functionName: "setEnabled",
        args: [checked],
      });

      await waitForTransactionReceipt(config, {
        hash,
      });

      setTxHashWithTimeout(hash);

      toast.success("Alert status updated successfully");
      setLoading(false);
    } catch (error: unknown) {
      toast.error(
        (error as BaseError).details || "Failed to update alert status"
      );

      console.error(error);

      setStatus(!checked);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alertStatus.status === "success") {
      setStatus(alertStatus.enabled);
    }
  }, [alertStatus.status]);

  if (creatorInfo.status === "pending" || (creatorInfo.status === "success" && alertStatus.status === "pending"))
    return <LoadingCard title="Alert Status" />;

  if (alertStatus.status === "pending")
    return <RegisterCard title="Alert Status" />;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Alert Status</CardTitle>
        <CardDescription>Change the status of the alert.</CardDescription>
      </CardHeader>
      <CardFooter className="gap-2 flex-grow items-end">
        <div className="flex gap-2 items-center h-10">
          <Switch
            id="alert-status"
            onCheckedChange={onStatusChange}
            checked={status}
            disabled={loading}
          />
          <Label htmlFor="alert-status">
            {status ? "Enabled" : "Disabled"}
          </Label>
          {txHash && (
            <Link
              href={`${EXPLORER_TX_BASE_URL}/${txHash}`}
              className="underline text-xs"
              target="blank"
            >
              Success! Click here to view the transaction.
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
