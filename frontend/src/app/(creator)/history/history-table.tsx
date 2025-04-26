import { useGetUniversalTipHistory } from "@/hooks/use-get-universal-tip-history";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useGetTipHistory } from "@/hooks/use-get-tip-history";
import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useWatchContractEvent } from "wagmi";
import { UniversalTipKuAbi } from "@/abi/UniversalTipKu";
import { UniversalTipKuAddress } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { TipKuAbi } from "@/abi/TipKu";
import { getBlockNumber } from "@wagmi/core";
import { config } from "@/lib/wagmi";

interface HistoryTableProps {
  isRegisteredCreator: boolean;
  contractAddress: `0x${string}`;
  creatorAddress?: `0x${string}`;  
}

export const HistoryTable = ({
  isRegisteredCreator,
  contractAddress,
  creatorAddress,
}: HistoryTableProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  const tipHistory = useGetTipHistory({
    contractAddress,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const universalTipHistory = useGetUniversalTipHistory({
    creatorAddress,
    contractAddress,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  useEffect(() => {
    const heartbeat = async () => {
      try {
        await getBlockNumber(config);
      } catch (error) {
        console.error(error);
      }
    };

    let intervalId = setInterval(heartbeat, 1 * 10 * 1000); // 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useWatchContractEvent({
    abi: UniversalTipKuAbi,
    address: UniversalTipKuAddress,
    eventName: "TipReceived",
    args: {
      recipientAddress: creatorAddress,
    },
    onLogs: async () => {
      setTimeout(async () => {
        await queryClient.invalidateQueries();
      }, 1000);
    },
    enabled: !!creatorAddress,
  });

  useWatchContractEvent({
    abi: TipKuAbi,
    address: contractAddress,
    eventName: "TipReceived",
    onLogs: async () => {
      setTimeout(async () => {
        await queryClient.invalidateQueries();
      }, 1000);
    },
    enabled: isRegisteredCreator,
  });

  const tipHistoryResult = isRegisteredCreator
    ? tipHistory
    : universalTipHistory;

  const data =
    tipHistoryResult.status === "success" ? tipHistoryResult.paginatedTips : [];

  const rowCount =
    tipHistoryResult.status === "success"
      ? tipHistoryResult.tipLength
      : undefined;

  return (
    <>
      {data && (
        <DataTable
          columns={columns}
          data={[...data].reverse()}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={Number(rowCount ?? 1)}
        />
      )}
    </>
  );
};
