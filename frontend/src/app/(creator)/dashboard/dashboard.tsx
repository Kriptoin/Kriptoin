"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CopyButton from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/ui/loading";
import { useGetCreatorInfoByAddress } from "@/hooks/use-get-creator-info-by-address";
import { useGetCreatorStats } from "@/hooks/use-get-creator-stats";
import { useGetUnregisteredCreatorStats } from "@/hooks/use-get-unregistered-creator-stats";
import { useIsRegisteredByAddress } from "@/hooks/use-is-registered-by-address";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

export default function Dashboard({ baseUrl }: { baseUrl: string }) {
  const accountResult = useAccount();

  const creatorInfoResult = useGetCreatorInfoByAddress(accountResult.address);

  const isRegisteredResult = useIsRegisteredByAddress(accountResult.address);

  const statsResult = useGetCreatorStats(
    creatorInfoResult.status === "success"
      ? creatorInfoResult.contractAddress
      : undefined
  );

  const unregisteredCreatorStatsResult = useGetUnregisteredCreatorStats(
    accountResult.address
  );

  if (
    creatorInfoResult.status === "pending" ||
    isRegisteredResult.status === "pending" ||
    unregisteredCreatorStatsResult.status === "pending" ||
    !accountResult.isConnected
  ) {
    return <Loading />;
  }

  const username =
    creatorInfoResult.status === "success"
      ? creatorInfoResult.username
      : accountResult.address;

  const fullUrl = `${baseUrl}/tip/${username}`;

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="font-bold block sm:hidden">Dashboard</div>
      <Card>
        <CardHeader>
          <CardTitle>Tip URL</CardTitle>
          <CardDescription>
            <div>
              Use this URL to receive tips. You can put it in your live stream's
              description or pin it in your live chat.
            </div>
            {creatorInfoResult.status === "error" && (
              <div>
                To shorten the URL, go to Settings and register your username.
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <Input readOnly value={fullUrl} />
          <CopyButton text={fullUrl} disabled={!username} />
        </CardContent>
      </Card>
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Tips Received</CardTitle>
          </CardHeader>
          <CardContent>
            {statsResult.status === "success" &&
              `${formatEther(statsResult.totalTipsReceived)} IDRX`}
            {unregisteredCreatorStatsResult.status === "success" &&
              isRegisteredResult.status === "success" &&
              !isRegisteredResult.data &&
              `${formatEther(
                unregisteredCreatorStatsResult.totalTipsReceived
              )} IDRX`}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tip Count</CardTitle>
          </CardHeader>
          <CardContent>
            {statsResult.status === "success" && statsResult.tipCount}
            {unregisteredCreatorStatsResult.status === "success" &&
              isRegisteredResult.status === "success" &&
              !isRegisteredResult.data &&
              unregisteredCreatorStatsResult.tipCount}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
