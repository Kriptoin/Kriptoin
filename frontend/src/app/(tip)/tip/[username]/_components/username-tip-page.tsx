"use client";

import Loading from "@/components/ui/loading";
import { useGetBio } from "@/hooks/use-get-bio";
import { useGetCreatorInfoByUsername } from "@/hooks/use-get-creator-info-by-username";
import { TriangleAlert } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { TipPage } from "./tip-page";
import { useEffect } from "react";
import { requestEth } from "@/lib/actions";

export const UsernameTipPage = ({ username }: { username: string }) => {
  const creatorInfo = useGetCreatorInfoByUsername(username);

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  const bioResult = useGetBio({
    contractAddress,
  });

  const { address } = useAccount();

  const bio = bioResult.status === "success" ? bioResult.bio : "";
  
  const balance = useBalance({
    address,
  });
  
  useEffect(() => {
    if (
      address &&
      balance &&
      balance.data &&
      balance.data.value === BigInt(0)
    ) {
      const request = async () => {
        await requestEth({
          baseUrl: window.location.origin,
          address,
        });
      };

      request();
    }
  }, [address, balance]);

  if (!address) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <span>
          Please connect your wallet by clicking the button in the top right
          corner. You can sign in with Google or email, or use an external
          wallet if you prefer.
        </span>
      </div>
    );
  }

  if (creatorInfo.status === "pending" || bioResult.status === "pending")
    return <Loading />;

  if (creatorInfo.status === "error")
    return (
      <div className="flex flex-col gap-1 items-center justify-center bg-white rounded-xl p-4 max-w-md max-h-[600px] w-full h-full border-2 border-r-4 border-b-4 border-black">
        <TriangleAlert className="fill-yellow-400" />
        <span className="font-semibold">Creator not found</span>
      </div>
    );

  return (
    <TipPage
      username={username}
      creatorAddress={creatorInfo.creatorAddress}
      bio={bio}
      creatorInfo={creatorInfo}
    />
  );
};
