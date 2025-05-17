"use client";

import Loading from "@/components/ui/loading";
import { useGetCreatorInfoByAddress } from "@/hooks/use-get-creator-info-by-address";
import { useGetBio } from "@/hooks/use-get-bio";
import { useAccount } from "wagmi";
import Bio from "./_components/bio";
import Name from "./_components/name";
import Register from "./_components/register";
import Username from "./_components/username";

export const Settings = () => {
  const account = useAccount();

  const creatorInfo = useGetCreatorInfoByAddress(account.address);

  const bioResult = useGetBio({
    contractAddress:
      creatorInfo.status === "success"
        ? creatorInfo.contractAddress
        : undefined,
  });

  if (!account.isConnected) {
    return <Loading />;
  }

  const username =
    creatorInfo.status === "success" ? creatorInfo.username : undefined;

  const name = creatorInfo.status === "success" ? creatorInfo.name : undefined;

  const bio = bioResult.status === "success" ? bioResult.bio : "";

  const contractAddress =
    creatorInfo.status === "success" ? creatorInfo.contractAddress : undefined;

  return (
    <div className="w-full h-full flex flex-col gap-4 py-4">
      <div className="font-bold block sm:hidden">Settings</div>
      <Register />
      {username && <Username currentUsername={username} />}
      {name && <Name currentName={name} />}

      {bioResult.status === "success" && (
        <Bio bio={bio} contractAddress={contractAddress} />
      )}
    </div>
  );
};
