import { UseGetCreatorInfoReturnType } from "@/hooks/use-get-creator-info";
import TipForm from "./tip-form";
import Image from "next/image";
import { isAddress } from "viem";
import { useGetAlertStatusByAddress } from "@/hooks/use-get-alert-status-by-address";
import Loading from "@/components/ui/loading";
import { TriangleAlert } from "lucide-react";

interface TipPageProps {
  username: string;
  creatorAddress: `0x${string}`;
  bio?: string;
  creatorInfo?: Extract<UseGetCreatorInfoReturnType, { status: "success" }>;
}

export const TipPage = ({
  username,
  creatorAddress,
  bio,
  creatorInfo,
}: TipPageProps) => {
  const alertStatus = useGetAlertStatusByAddress(
    creatorInfo ? creatorAddress : undefined,
  );

  if (alertStatus.status === "pending") return <Loading />;

  if (alertStatus.status === "success" && !alertStatus.enabled)
    return (
      <div className="flex flex-col gap-1 items-center justify-center bg-white rounded-xl p-4 max-w-md max-h-[600px] w-full h-full border-2 border-r-4 border-b-4 border-black">
        <TriangleAlert className="fill-yellow-400" />
        <span className="font-semibold">
          Tipping is currently disabled by <b>{username}</b>
        </span>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl p-4 gap-2 max-w-md w-full border-2 border-r-4 border-b-4 border-black">
      <Image
        src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${username}`}
        alt={username}
        width={64}
        height={64}
        className="size-16 rounded-full"
      />
      <div>
        <div className="text-center">{creatorInfo?.name}</div>
        <div className="text-center text-sm text-gray-500 break-all">
          @{username}
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-1">{bio}</div>
      <TipForm
        creatorAddress={creatorAddress}
        contractAddress={creatorInfo?.contractAddress}
        isToAddress={isAddress(username)}
      />
    </div>
  );
};
