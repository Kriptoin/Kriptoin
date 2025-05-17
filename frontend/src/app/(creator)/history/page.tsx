import { Metadata } from "next";
import History from "./history";

export const metadata: Metadata = {
  title: "Tip History",
};

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="font-bold block sm:hidden">Tip History</div>
      <History />
    </div>
  );
}
