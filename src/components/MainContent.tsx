import { useEffect, useRef, useState } from "react";

import { scanType } from "../utils/helper";
import AV_Status from "./Helper Components/AV_Status";
import OutletWrapper from "./WrapperComponent/OutletWrapper";
import { invoke } from "@tauri-apps/api/tauri";
import { share_network_folder } from "@/utils/helper/dashboardHelper";
import { info } from "tauri-plugin-log-api";
import Scan_Logs from "./Main Content Helper/Scan_Logs";
import Activity_Status from "./Main Content Helper/Activity_Status";
import Folder_Picker from "./Main Content Helper/Folder_Picker";
import { Progress } from "./ui/progress";
import useAppStore from "@/utils/store";
import { LogData } from "@/utils/types";

const TABS = ["WD", "KASPERSKY", "ClamAV"];
export default function MainContent({ logData }: { logData: LogData }) {
  const [activeScanType, setActiveScanType] = useState<string>("custom");
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const { progresses, setAvLogData, currScanningFolder, scanning, setScanning, setShowPopup } = useAppStore();

  useEffect(() => {
    console.log(logData)
    scanning && setAvLogData([logData, logData, logData]);
  }, [logData, scanning]);

  useEffect(() => {
    const totalStorageInBytes = logData.storage
      ? parseFloat(useAppStore.getState().logData.storage)
      : 0; // Convert storage string to numeric bytes
    const averageClamAVFactor = 0.8; // Factor for ClamAV's slower scanning

    const intervals =
      scanning &&
      TABS.map((tab, targetIndex) => {
        return setInterval(() => {
          // Use the functional updater to ensure we always work with the latest state
          useAppStore.setState((state) => ({
            progresses: state.progresses.map((progress, idx) => {
              if (idx === targetIndex) {
                const avgIncrement = totalStorageInBytes
                  ? ((totalStorageInBytes / TABS.length) * (idx === 2 ? averageClamAVFactor : 1)) /
                  totalStorageInBytes *
                  100 // Increment proportionally
                  : Math.random() * 5; // Default small increment if no storage info

                if (progress < 100) {
                  return Math.min(progress + avgIncrement, 100); // Cap at 100
                } else if (progress === 100) {
                  if (!state.isCompleted) {
                    setScanning(false);
                    setShowPopup("Scanning Successfully Completed");
                  }
                }
              }
              return progress;
            }),
          }));
        }, 3000); // Adjust this interval if needed
      });

    return () => {
      intervals && intervals.forEach(clearInterval);
    };
  }, [scanning]);
  // Also track isCompleted


  useEffect(() => {
    share_network_folder();
  }, []);

  // useEffect(() => {
  //   const updateProgress = (timestamp: number) => {
  //     if (isCompleted) {
  //       setPercentScanned(100);
  //       progressRef.current = 100;
  //       animationFrameId.current &&
  //         cancelAnimationFrame(animationFrameId.current);
  //       return;
  //     }

  //     if (scanning) {
  //       const increment = progressRef.current < 50 ? 0.25 : 0.05; // Faster until 50%, slower after
  //       progressRef.current = Math.min(progressRef.current + increment, 100);

  //       setPercentScanned(progressRef.current);

  //       if (progressRef.current >= 100) {
  //         animationFrameId.current &&
  //           cancelAnimationFrame(animationFrameId.current);
  //       } else {
  //         animationFrameId.current = requestAnimationFrame(updateProgress);
  //       }
  //     }
  //   };

  //   if (scanning) {
  //     animationFrameId.current = requestAnimationFrame(updateProgress);
  //   }

  //   return () => {
  //     if (animationFrameId.current) {
  //       cancelAnimationFrame(animationFrameId.current);
  //     }
  //   };
  // }, [scanning, isCompleted]);

  const remove_folder = async (
    ip: string,
    pcName: string,
    remoteFolderName: string
  ) => {
    console.log("Renoving Folder....", ip, pcName, remoteFolderName);
    const response = await invoke("remove_folder", {
      ip,
      pcName,
      remoteFolderName,
    });
    console.log(response);
  };

  const scan_network = async (pcName: string) => {
    console.log("Scanning Network....", pcName);
    const response = await invoke("scan_network_pc", { pcName });
    console.log(response);
  };

  return (
    <OutletWrapper>
      <AV_Status />

      <Active_Scan_Type
        activeScanType={activeScanType}
        setActiveScanType={setActiveScanType}
      />

      {activeScanType === "custom" ? (
        <>
          <Folder_Picker
            setSelectedFolder={setSelectedFolder}
            selectedFolder={selectedFolder}
          />

          <Activity_Status
            currScanningFolder={currScanningFolder}
            scanning={scanning}
          />
        </>
      ) : (
        <>
          <Full_Scan />
        </>
      )}
      {scanning && <>
        <div className="flex flex-col space-y-2">
          {TABS.map((tab, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <span>{tab}:</span>
              <Progress value={progresses[idx]} />
              <span>{progresses[idx].toFixed()}%</span>
            </div>
          ))}
        </div>
        <Scan_Logs />
      </>}

      {/* {logData.uuid.length !== 0 && <Scan_Logs logData={logData} />} */}
    </OutletWrapper>
  );
}

function Full_Scan() {
  const handleFullScan = async () => {
    info("MAUT SCAN STARTED");
    info("------------------------------------------------------");

    const startTime = new Date().getTime();
    console.log("startTime", startTime);

    const response: string[] = await invoke("scan_all_drives");

    const endTime = new Date().getTime();
    const scanDuration = endTime - startTime;

    console.log("SCAN RESULT:- ");
    console.log(scanDuration);
    console.log(response);

    // handleReports(response, scanDuration);
  };

  return (
    <div className="flex justify-center items-center">
      <button
        className="w-1/4 border flex items-center justify-center py-3 rounded-md bg-primary-2 text-lg text-slate-800 font-semibold hover:bg-primary-1 hover:shadow transition"
        onClick={() => handleFullScan()}
      >
        SCAN
      </button>
    </div>
  );
}

function Active_Scan_Type({
  activeScanType,
  setActiveScanType,
}: {
  activeScanType: string;
  setActiveScanType: React.Dispatch<React.SetStateAction<string>>;
}) {
  // console.log(activeScanType);

  return (
    <div className="flex justify-center border-primary-2 mx-auto w-[23dvw] items-center overflow-hidden border-primary border-2 rounded-xl bg-primary-1">
      <div
        className={scanType(activeScanType, "custom")}
        onClick={() => setActiveScanType("custom")}
      >
        CUSTOM SCAN
      </div>
      <div
        onClick={() => setActiveScanType("full")}
        className={scanType(activeScanType, "full")}
      >
        FULL SCAN
      </div>
    </div>
  );
}
