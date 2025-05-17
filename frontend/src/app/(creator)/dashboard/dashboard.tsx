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
import { IDRXTokenAddress } from "@/constants";
import { useGetCreatorContractAddress } from "@/hooks/use-get-creator-contract-address";
import { useGetCreatorInfoByAddress } from "@/hooks/use-get-creator-info-by-address";
import { useGetCreatorStats } from "@/hooks/use-get-creator-stats";
import { useGetUnregisteredCreatorStats } from "@/hooks/use-get-unregistered-creator-stats";
import { useIsRegisteredByAddress } from "@/hooks/use-is-registered-by-address";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

export default function Dashboard({ baseUrl }: { baseUrl: string }) {
  const account = useAccount();

  const creatorInfo = useGetCreatorInfoByAddress(account.address);

  const isRegistered = useIsRegisteredByAddress(account.address);

  const contractAddress = useGetCreatorContractAddress();

  const stats = useGetCreatorStats(contractAddress);

  const unregisteredCreatorStats = useGetUnregisteredCreatorStats(
    account.address,
  );

  const balance = useBalance({
    token: IDRXTokenAddress,
    address: account.address,
    query: {
      enabled: !!account.address,
    },
  });

  if (
    creatorInfo.status === "pending" ||
    isRegistered.status === "pending" ||
    unregisteredCreatorStats.status === "pending" ||
    !account.isConnected
  ) {
    return <Loading />;
  }

  const username =
    creatorInfo.status === "success" ? creatorInfo.username : account.address;

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
            {creatorInfo.status === "error" && (
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
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balance.status === "success" && (
              <div>{formatUnits(balance.data.value, 2)} IDRX</div>
            )}
            {balance.status === "error" && <div>Error fetching balance</div>}
            {balance.status === "pending" && <div>Loading balance...</div>}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Tips Received</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.status === "success" &&
              `${formatUnits(stats.totalTipsReceived, 2)} IDRX`}
            {unregisteredCreatorStats.status === "success" &&
              isRegistered.status === "success" &&
              !isRegistered.data &&
              `${formatUnits(unregisteredCreatorStats.totalTipsReceived, 2)} IDRX`}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tip Count</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.status === "success" && stats.tipCount}
            {unregisteredCreatorStats.status === "success" &&
              isRegistered.status === "success" &&
              !isRegistered.data &&
              unregisteredCreatorStats.tipCount}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
