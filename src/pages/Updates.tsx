import { useEffect, useState } from "react";
import { UPDATE_COMMANDS } from "@/utils/constants";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";
import AV_Status from "@/components/Helper Components/AV_Status";
import ButtonWrapper from "@/components/WrapperComponent/ButtonWrapper";
import { invoke } from "@tauri-apps/api/tauri";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import UPDATE_LOGS from "../../logs/update_logs.json";
import {
  parseTimestampDate,
  parseTimestampTime,
} from "@/utils/helper/viewLogsHelper";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";

type Log = {
  antivirus: string;
  status: string;
  update_type: string; // Accept any string
};

type Data = {
  timestamp: string; // Timestamp of the update
  logs: Log[]; // Array of log entries
};

export default function Updates() {
  return (
    <OutletWrapper>
      <AV_Status />

      <AV_Selector />

      <div className="grid gap-2">
        <div className="text-xl font-medium">Update History</div>

        <Update_History />
      </div>
    </OutletWrapper>
  );
}

function AV_Selector() {
  const selectedAV = ["Windows Defender", "ESET Total Security", "ClamAV"];
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    setIsLoading(true);
    const hasInternet = await invoke("has_internet");
    if (hasInternet) {
      toast.message("Updating Online", {
        duration: 3000,
        description:
          "Machine is connected to internet. Updates being downloaded  ",
        className: "bg-primary-1",
      });
    } else {
      toast.message("Updating Offline", {
        duration: 3000,
        description:
          "Machine is not connected to internet. Updating Antivirus offline.",
        className: "bg-primary-1",
      });
    }

    const filteredCommands = UPDATE_COMMANDS[hasInternet ? "online" : "offline"]
      .filter((cmd) => selectedAV.includes(cmd.antivirus))
      .map((cmd) => cmd.command);

    const res = await invoke("update_antivirus", {
      command: filteredCommands,
      antivirusNames: selectedAV,
      logFilePath: "../logs/update_logs.json",
      updateType: hasInternet ? "online" : "offline",
    });
    setTimeout(() => {
      setIsLoading(false);
      toast.message("Update Completed", {
        description: hasInternet
          ? "Updates downloaded and installed successfully."
          : "Updates installed successfully. Please check your machine's logs for more details.",
        className: "bg-primary-1",
      });
    }, 5000); // 3 seconds delay
  };

  return (
    <div className="p-4 bg-secondary_bg-1 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="space-y-1">
          <div className="font-semibold text-lg">
            Check For Updates:{" "}
            <span className="text-sm font-thin text-slate-400">
              (Last updated on:{" "}
              {parseTimestampTime(
                UPDATE_LOGS[UPDATE_LOGS.length - 1].timestamp
              )}{" "}
              {parseTimestampDate(
                UPDATE_LOGS[UPDATE_LOGS.length - 1].timestamp
              )}
              )
            </span>
          </div>
          <div>
            Click to install and update your antivirus software with a single
            click! We'll check for any pending updates, and if everything is up
            to date, you're all set.
          </div>
        </div>
        <Button
          onClick={handleInstall}
          disabled={isLoading}
          className="border font-semibold px-4 py-0.5 rounded-md flex items-center justify-center bg-primary-1 text-slate-800 hover:bg-primary-2 hover:shadow transition"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size={1} />
              Installing
            </>
          ) : (
            "Install"
          )}
        </Button>
      </div>
    </div>
  );
}

function Update_History() {
  return (
    <div className="border-2 border-primary-1/40 rounded-lg overflow-hidden">
      <UpdateHistoryAccordion />
    </div>
  );
}
const UpdateHistoryAccordion = () => {
  const [updateLogs, setUpdateLogs] = useState<Data[]>([]);

  useEffect(() => {
    setUpdateLogs(UPDATE_LOGS.reverse());
  }, [UPDATE_LOGS]);
  return (
    <div className="overflow-y-auto max-h-[50dvh] bg-secondary_bg-1 custom-scrollbar">
      <Accordion type="multiple" className="w-full">
        {updateLogs.map((row, index) => (
          <AccordionItem key={index} value={`row-${index}`}>
            <AccordionTrigger className="hover:bg-primary-1/10 border border-slate-100/10 transition w-full flex items-center gap-3 px-2 py-3 text-sm">
              {/* Applied 'text-sm' for smaller font size */}

              <div className="flex">
                Update Status :: Date: {parseTimestampTime(row.timestamp)} Time:{" "}
                {parseTimestampDate(row.timestamp)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="border border-slate-100/10 bg-secondary_bg-2 p-4">
              <div className="text-sm text-slate-300 flex gap-2 flex-col">
                {row.logs.map((log, idx) => (
                  <div className="  ">
                    <p className="font-semibold underline">
                      {log.antivirus} ::
                    </p>{" "}
                    {row.logs[idx].antivirus} is up to date.
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
