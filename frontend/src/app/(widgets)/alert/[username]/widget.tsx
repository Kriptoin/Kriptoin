"use client";

import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalKriptoinAddress } from "@/constants";
import { useGetColors } from "@/hooks/use-get-colors";
import { useGetCreatorInfoByUsername } from "@/hooks/use-get-creator-info-by-username";
import { useGetDurationByContractAddress } from "@/hooks/use-get-duration-by-contract-address";
import { useIsRegisteredByAddress } from "@/hooks/use-is-registered-by-address";
import { config } from "@/lib/wagmi";
import { getBlockNumber } from "@wagmi/core";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import { formatUnits, isAddress, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";

interface Message {
  senderAddress: `0x${string}`;
  senderName: string;
  message: string;
  amount: bigint;
}

export default function Widget({ username }: { username: string }) {
  const creatorInfo = useGetCreatorInfoByUsername(username);

  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const isRegistered = useIsRegisteredByAddress(
    isAddress(username) ? username : undefined
  );

  const colorsResult = useGetColors({
    contractAddress:
      creatorInfo.status === "success"
        ? creatorInfo.contractAddress
        : undefined,
  });

  const durationResult = useGetDurationByContractAddress({
    contractAddress:
      creatorInfo.status === "success"
        ? creatorInfo.contractAddress
        : undefined,
  });

  useEffect(() => {
    const heartbeat = async () => {
      try {
        await getBlockNumber(config);

        if (isError) {
          window.location.reload();
        }
      } catch (error) {
        console.error(error);
      }
    };

    let intervalId = setInterval(heartbeat, 1 * 10 * 1000); // 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [isError]);

  useWatchContractEvent({
    abi: UniversalKriptoinAbi,
    address: UniversalKriptoinAddress,
    eventName: "TipReceived",
    args: {
      recipientAddress: isAddress(username) ? username : zeroAddress,
    },
    onError: (error) => {
      setIsError(true);
      console.error(error);
    },
    onLogs: (logs) => {
      setIsError(false);

      const { senderAddress, senderName, message, amount } = logs[0].args;

      if (senderAddress && senderName && message && amount)
        setMessageQueue((prevQueue) => [
          ...prevQueue,
          { senderAddress, senderName, message, amount },
        ]);
    },
    enabled: isAddress(username),
  });

  useWatchContractEvent({
    abi: KriptoinAbi,
    address:
      creatorInfo.status === "success"
        ? creatorInfo.contractAddress
        : zeroAddress,
    eventName: "TipReceived",
    onError: (error) => {
      setIsError(true);
      console.error(error);
    },
    onLogs: (logs) => {
      setIsError(false);
      const { senderAddress, senderName, message, amount } = logs[0].args;

      if (senderAddress && senderName && message && amount)
        setMessageQueue((prevQueue) => [
          ...prevQueue,
          { senderAddress, senderName, message, amount },
        ]);
    },
    enabled: creatorInfo.status === "success",
  });

  const [play] = useSound("/alert.mp3");

  const duration =
    durationResult.status === "success" ? durationResult.duration : 15;

  useEffect(() => {
    if (currentMessage === null && messageQueue.length > 0) {
      setCurrentMessage(messageQueue[0]);

      play({ forceSoundEnabled: true });

      setTimeout(() => {
        setCurrentMessage(null);
        setMessageQueue((prevQueue) => prevQueue.slice(1));
      }, duration * 1000);
    }
  }, [currentMessage, messageQueue]);

  const colors =
    colorsResult.status === "success"
      ? colorsResult.colors
      : {
          primary: "#ffffff",
          secondary: "#c1fc29",
          background: "#209bb9",
        };

  if (isError) {
    return (
      <div className="p-1">
        <Card className="w-full text-center bg-red-500 text-white">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            Connection lost. Please refresh the Browser Source.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    isRegistered.status === "success" &&
    isRegistered.data &&
    isAddress(username)
  ) {
    return (
      <div className="p-1">
        <Card className="w-full text-center bg-red-500 text-white">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            Please update your Browser Source URL to a new one. This usually
            happens when you register your username.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (creatorInfo.status === "error" && !isAddress(username)) {
    return (
      <div className="p-1">
        <Card className="w-full text-center bg-red-500 text-white">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            Error fetching username. Please double-check your Browser Source URL
            or refresh the Browser Source.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (creatorInfo.status === "pending") {
    return (
      <div className="p-1">
        <Card className="w-full text-center">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
          </CardHeader>
          <CardContent className="">Please wait</CardContent>
        </Card>
      </div>
    );
  }

  if (!currentMessage) return null;

  return (
    <div className="p-1">
      <Card
        className="w-full text-center"
        style={{ backgroundColor: colors.background }}
      >
        <CardHeader className="p-4">
          <CardTitle className="font-normal flex flex-col gap-2">
            <span className="font-medium" style={{ color: colors.primary }}>
              {currentMessage.senderName}
            </span>
            <span className="font-medium" style={{ color: colors.secondary }}>
              {formatUnits(currentMessage.amount, 2)} IDRX
            </span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm p-4 pt-0 flex-grow items-end justify-center" style={{ color: colors.primary }}>
          {currentMessage.message}
        </CardFooter>
      </Card>
    </div>
  );
}
