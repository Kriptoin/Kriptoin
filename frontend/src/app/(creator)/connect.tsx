"use client";

import { requestEth } from "@/lib/actions";
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";

export default function Connect({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { address } = useAccount();
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

  return (
    <>
      {!address && (
        <div className="flex h-full items-center justify-center text-center">
          <span>
            Please connect your wallet by clicking the button in the top right
            corner. You can sign in with Google or email, or use an external
            wallet if you prefer.
          </span>
        </div>
      )}
      {address && children}
    </>
  );
}
