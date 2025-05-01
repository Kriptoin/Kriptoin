import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { UniversalKriptoinAddress } from "@/constants";
import { useGetTipHistory } from "@/hooks/use-get-tip-history";
import { useGetUniversalTipHistory } from "@/hooks/use-get-universal-tip-history";
import { config } from "@/lib/wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { getBlockNumber } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { columns } from "./columns";
import { DataTable } from "./data-table";

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
    abi: UniversalKriptoinAbi,
    address: UniversalKriptoinAddress,
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
    abi: KriptoinAbi,
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
