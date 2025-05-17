"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UniversalKriptoinAddress } from "@/constants";
import { HistoryTable } from "./history-table";
import { useGetCreatorInfo } from "@/hooks/use-get-creator-info";
import { useIsRegistered } from "@/hooks/use-is-registered";
import { useAccount } from "wagmi";
import { LoadingCard } from "../_components/loading-card";
import { ErrorCard } from "../_components/error-card";

export default function History() {
  const creatorInfo = useGetCreatorInfo();

  const isRegistered = useIsRegistered();

  const { address: creatorAddress } = useAccount();

  const contractAddress =
    creatorInfo.status === "success"
      ? creatorInfo.contractAddress
      : UniversalKriptoinAddress;

  const isRegisteredCreator =
    isRegistered.status === "success" ? isRegistered.data : false;

  if (isRegistered.status === "pending" || creatorInfo.status === "pending")
    return <LoadingCard title="Tip History" />;

  if (isRegistered.status === "error") return <ErrorCard title="Tip History" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tip History</CardTitle>
        <CardDescription>View tip messages from your viewers.</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <HistoryTable
          contractAddress={contractAddress}
          creatorAddress={creatorAddress}
          isRegisteredCreator={isRegisteredCreator}
        />
      </CardContent>
    </Card>
  );
}
