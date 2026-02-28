import { downloadLogs } from "@/utils/helper";
import React from "react";
import { IoMdDownload } from "react-icons/io";

type LogHistoryItem = {
  date: string;
  report: string;
};

export default function PastLogs({
  logHistory,
}: {
  logHistory: LogHistoryItem[];
}) {
  return (
    <div className="w-full text-white flex flex-col gap-4 bg-slate-800 mb-2 py-2 rounded-md">
      <div className="flex justify-center items-center text-xl font-semibold">
        Past Logs
      </div>
      <div className="px-4 py-1">
        {logHistory.length === 0 ? (
          <div>
            There are no records of past scans. <br /> Scan now to generate
            detailed report.
          </div>
        ) : (
          logHistory.map((l, idx) => (
            <div
              key={idx}
              className="hover:bg-purple-800 group rounded hover:text-white py-1 italic flex items-center justify-between transition"
            >
              <div className="flex justify-center items-center gap-4">
                <div>{idx + 1}.</div>
                <div>{l.date}</div>
              </div>
              <button
                className="remove-link hover:text-red-600 cursor-pointer p-1"
                onClick={() => downloadLogs(l.report)}
              >
                <IoMdDownload />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
