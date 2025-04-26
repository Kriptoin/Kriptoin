"use client";

import Image from "next/image";
import SideNavItems from "./side-nav-items";
import { useAccount, useReadContract } from "wagmi";
import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";

export default function SideNav() {
  const { isConnected, address } = useAccount();

  const result = useReadContract({
    abi: UniversalTipKuAbi,
    address: UniversalTipKuAddress,
    functionName: "creatorInfoByAddress",
    args: [address ?? "0x0"],
  });

  let username;

  if (isConnected && result.data && result.data[0]) {
    username = result.data[0];
  } else {
    username = address ? `${address.slice(0, 8)}...` : "Guest";
  }

  return (
    <>
      <div className="hidden sm:block shrink-0 max-w-[225px] sm:w-full h-dvh" />
      <div className="hidden sm:flex max-w-[225px] sm:w-full border-r-4 border-black flex-col items-center gap-4 p-2 fixed h-dvh bg-background z-50">
        <Image
          src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${username}`}
          alt="avatar"
          width={80}
          height={80}
          className="size-8 sm:size-20 rounded-full mt-4"
        />
        <div className="hidden sm:block">{username}</div>
        <SideNavItems />
      </div>
    </>
  );
}
