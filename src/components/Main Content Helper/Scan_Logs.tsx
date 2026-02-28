import { LogData } from "@/utils/types";
import { useState } from "react";
import { Progress } from "../ui/progress";
import Terminal from "../Helper Components/Terminal";
import useAppStore from "@/utils/store";

const TABS = ["Windows Defender", "KASPERSKY", "ClamAV"];

export default function Scan_Logs() {
  const { progresses, avLogData } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);
  console.log(avLogData[0].dirs)

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center text-lg font-medium">
        <div>Live Scan Logs</div>
      </div>

      <div className="flex border-b border-primary-1/40">
        {TABS.map((_tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`text-slate-200 flex-1 py-2 px-4 font-medium text-center focus:outline-none focus:ring-2 ${activeTab === idx
              ? "border-b-2 border-primary-1/40 bg-secondary_bg-1"
              : "bg-secondary_bg-2"
              }`}
            aria-selected={activeTab === idx}
            role="tab"
          >
            {_tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden border-primary-1/40">
        {TABS.map((_tab, idx) => (
          <>
            <p>Scan Progress:</p>
            <div
              key={idx}
              className={`h-full ${activeTab === idx ? "block" : "hidden"}`}
            >
              <div className="flex items-center space-x-2 pb-2">
                <Progress value={progresses[idx]} />
                <span >{progresses.length > 0 ? (progresses.reduce((acc, progress) => acc + progress, 0) / progresses.length).toFixed() : 0}%
                </span>
              </div>
              <Terminal progress={progresses[idx]} paths={avLogData[idx].dirs} />
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
