"use client";

import Loading from "@/components/ui/loading";
import { useGetCreatorInfoByAddress } from "@/hooks/use-get-creator-info-by-address";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { TipPage } from "./tip-page";
import { useEffect } from "react";
import { requestEth } from "@/lib/actions";

export const AddressTipPage = ({
  address,
  baseUrl,
}: {
  address: `0x${string}`;
  baseUrl: string;
}) => {
  const router = useRouter();

  const creatorInfo = useGetCreatorInfoByAddress(address);

  const { address: senderAddress } = useAccount();

  const balance = useBalance({
    address: senderAddress,
  });

  useEffect(() => {
    if (
      senderAddress &&
      balance &&
      balance.data &&
      balance.data.value === BigInt(0)
    ) {
      const request = async () => {
        await requestEth({
          baseUrl: window.location.origin,
          address: senderAddress,
        });
      };

      request();
    }
  }, [senderAddress, balance]);

  if (!senderAddress) {
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

  if (creatorInfo.status === "pending") return <Loading />;

  if (creatorInfo.status === "success") {
    const username = creatorInfo.username;

    router.push(`${baseUrl}/tip/${username}`);
  }

  return <TipPage username={address} creatorAddress={address} />;
};
