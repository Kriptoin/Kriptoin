"use client";

import { AlertUrl } from "./_components/alert-url";
import { Duration } from "./_components/duration";
import { useGetDuration } from "@/hooks/use-get-duration";
import { WidgetColors } from "./_components/widget-colors";
import { useGetColors } from "@/hooks/use-get-colors";
import { TestTip } from "./_components/test-tip";
import { useGetCreatorInfo } from "@/hooks/use-get-creator-info";
import { useAccount } from "wagmi";
import { useGetCreatorContractAddress } from "@/hooks/use-get-creator-contract-address";

export default function Alert({ baseUrl }: { baseUrl: string }) {
  const account = useAccount();

  const creatorInfo = useGetCreatorInfo();

  const duration = useGetDuration();

  const contractAddress = useGetCreatorContractAddress();

  const colors = useGetColors({
    contractAddress,
  });

  const username =
    creatorInfo.status === "success" ? creatorInfo.username : account.address;

  const fullUrl = `${baseUrl}/alert/${username}`;

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="font-bold block sm:hidden">Alert</div>
      <div className="w-full flex flex-col md:flex-row gap-4">
        <AlertUrl fullUrl={fullUrl} username={username} />
        <TestTip creatorInfo={creatorInfo} />
      </div>
      <Duration duration={duration} contractAddress={contractAddress} />
      <WidgetColors
        colors={colors}
        contractAddress={contractAddress}
      />
    </div>
  );
}
