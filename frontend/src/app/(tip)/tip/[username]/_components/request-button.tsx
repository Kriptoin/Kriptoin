"use client";

import { Button } from "@/components/ui/button";
import { requestToken } from "@/lib/actions";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Droplets, Loader2 } from "lucide-react";
import { useHasClaimed } from "@/hooks/use-has-claimed";

export const RequestButton = ({ baseUrl }: { baseUrl: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const account = useAccount();

  const hasClaimed = useHasClaimed(account.address);

  const handleRequest = async () => {
    setIsLoading(true);

    if (!account.address) {
      toast.error("Please connect your wallet");
      return;
    }

    const result = await requestToken({
      baseUrl,
      address: account.address,
    });

    setIsLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("IDRX requested successfully");

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (
    !account.address ||
    (hasClaimed.status === "success" && hasClaimed.hasClaimed)
  ) {
    return null;
  }

  if (hasClaimed.status === "pending") {
    return (
      <Button disabled>
        <Loader2 className="animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRequest}
      disabled={isLoading}
      className="flex gap-2 items-center"
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <Droplets />}
      <span>Request IDRX</span>
    </Button>
  );
};
