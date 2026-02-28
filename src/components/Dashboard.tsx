// "use client";

// import { useEffect, useState } from "react";
// import { info, error } from "tauri-plugin-log-api";
// import { useNavigate } from "react-router-dom";
// import Page from "./Page";
// import Compilation from "./Compilation";
// import { invoke } from "@tauri-apps/api/tauri";
// import { clamAVParser, esetParser, windowsDfParser } from "@/utils/parser";
// import { CombinedLog } from "@/types/parser";
// import { SCAN_COMMANDS } from "@/utils/constants";
// import SymlinkPaths from "./SymlinkPaths";
// import Logs from "./Logs";
// import {
//   downloadLogs,
//   generateLogFile,
//   generateReportJSON,
//   saveToFile,
// } from "@/utils/helper";
// import MautInfo from "./MautInfo";
// import DownloadPopup from "./Helper Components/DownloadPopup";
// import Cards from "./Helper Components/Cards";
// import PastLogs from "./Helper Components/PastLogs";

// const Dashboard = () => {
//   const { toast } = useToast();
//   const [scanning, setScanning] = useState<boolean>(false);
//   const [avScanned, setAvScanned] = useState<number[]>([]);
//   const [compiling, setCompiling] = useState<boolean>(false);
//   const [isResultReady, setIsResultReady] = useState<boolean>(false);
//   const [currentReport, setCurrentReport] = useState<string | null>(null);
//   const [folderPath, setFolderPath] = useState<string | null>(null);
//   const [logHistory, setLogHistory] = useState<
//     Array<{ date: string; report: string }>
//   >(() => {
//     const storedReports = window.localStorage.getItem("permanentReports");
//     return storedReports ? JSON.parse(storedReports) : [];
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (avScanned.length === 3) {
//       setScanning(false);
//       setCompiling(true);
//     }
//   }, [avScanned]);

//   useEffect(() => {
//     if (isResultReady) {
//       setTimeout(() => {
//         setIsResultReady(false);
//       }, 10000);
//     }
//   }, [isResultReady]);

//   // Update localStorage whenever logHistory changes
//   useEffect(() => {
//     localStorage.setItem("permanentReports", JSON.stringify(logHistory));
//   }, [logHistory]);

//   async function handleScan() {
//     try {
//       setScanning(true);
//       info("MAUT SCAN STARTED");
//       info("------------------------------------------------------");

//       const startTime = new Date().getTime();
//       console.log("startTime", startTime);

//       // Perform the scan and get results
//       const response: string[] = await invoke("scan", {
//         command: SCAN_COMMANDS,
//         fullScan: false
//       });
//       const endTime = new Date().getTime();
//       const scanDuration = endTime - startTime;
//       console.log("endTime", endTime);

//       handleReports(response, scanDuration);

//       // Parse logs
//       const defenderLogs = windowsDfParser(response[0]);
//       const esetLogs = esetParser(response[1]);
//       const clamAVLogs = clamAVParser(response[2]);

//       // Generate the final combined report
//       const finalReport: CombinedLog = generateReportJSON(
//         defenderLogs,
//         esetLogs,
//         clamAVLogs,
//         scanDuration
//       );
//       const finalReport: CombinedLog = generateReportJSON(
//         defenderLogs,
//         esetLogs,
//         clamAVLogs,
//         scanDuration
//       );
//       const finalLogs = generateLogFile(finalReport);

//       // Save the final logs to a file
//       saveToFile(finalLogs);
//       setCurrentReport(finalLogs);
//       setIsResultReady(true);

//       // Store the new log in history
//       const newLogEntry = {
//         date: new Date().toISOString(),
//         report: finalLogs,
//       };
//       setLogHistory((prevHistory) => [...prevHistory, newLogEntry]);

//       // Log the results in the console for debugging
//       console.log("---------------------------------------------")
//       console.log("endTime", endTime);
//       console.log("Total time", scanDuration);
//       console.log("Scan Results:", response);
//       console.log("WINDOWS AV:\n", defenderLogs);
//       console.log("ESET AV:\n", esetLogs);
//       console.log("CLAM AV:\n", clamAVLogs);
//       console.log("Final Combined Report:\n", finalReport);
//       console.log("Final Logs:\n", finalLogs);
//       console.log("---------------------------------------------")

//       // info(response[0]);
//       // info(response[1]);
//       // info(response[2]);
//     } catch (e) {
//       console.error("Error during scan:", e);
//       error(JSON.stringify(e));
//     } finally {
//       setScanning(false);
//     }
//   }

//   const handleReports = (response: string[], scanDuration: number) => {
//     // Parse logs
//     const defenderLogs = windowsDfParser(response[0]);
//     const esetLogs = esetParser(response[1]);
//     const clamAVLogs = clamAVParser(response[2]);

//     // Generate the final combined report
//     const finalReport: CombinedLog = generateReportJSON(
//       defenderLogs,
//       esetLogs,
//       clamAVLogs,
//       scanDuration
//     );
//     const finalLogs = generateLogFile(finalReport);

//     // Save the final logs to a file
//     saveToFile(finalLogs);
//     setCurrentReport(finalLogs);
//     setIsResultReady(true);

//     // Log the results in the console for debugging
//     console.log("---------------------------------------------")
//     console.log("Total time", scanDuration);
//     console.log("Scan Results:", response);
//     console.log("WINDOWS AV:\n", defenderLogs);
//     console.log("ESET AV:\n", esetLogs);
//     console.log("CLAM AV:\n", clamAVLogs);
//     console.log("Final Combined Report:\n", finalReport);
//     console.log("Final Logs:\n", finalLogs);
//     console.log("---------------------------------------------")

//   }

//   useEffect(() => {
//     if (isResultReady) {
//       setTimeout(() => {
//         setIsResultReady(false);
//       }, 10000);
//     }
//   }, [isResultReady]);

//   const handleFolderSelection = async () => {
//     info("Folder Selection...");
//     info("Folder Selection...");
//     try {
//       //   // Open the folder dialog using Tauri's file dialog API
//       const selectedFolder: string = await invoke("open_folder_dialog"); // Assume you have this Tauri API to get the folder path
//       console.log(selectedFolder);
//       info(selectedFolder);
//       const absolutePath: any = await invoke("get_absolute_path", {
//         directory: selectedFolder,
//       });
//       info(absolutePath);
//       console.log();
//       setFolderPath(absolutePath); // Store the absolute path in state
//     } catch (e) {
//       console.error("Error selecting folder or getting path:", e);
//       error(JSON.stringify(e));
//     }
//   };

//   const fullScan = async () => {
//     info("MAUT SCAN STARTED");
//     info("------------------------------------------------------");

//     const startTime = new Date().getTime();
//     console.log("startTime", startTime);

//     const response: string[] = await invoke("scan_all_drives");

//     const endTime = new Date().getTime();
//     const scanDuration = endTime - startTime;

//     handleReports(response, scanDuration);

//   };

//   return (
//     <Page>
//       <div className="overflow-auto w-full px-2 custom-scrollbar">
//         <div className="flex flex-col gap-4 items-center h-full mx-auto">
//           {isResultReady && (
//             <div className="mt-4 relative bg-gray-300/30 w-full rounded-md py-2 px-6">
//               <button
//                 onClick={() => setIsResultReady(false)}
//                 className="absolute top-1 bg-transparent right-1 "
//               >
//                 <ImCross size={"10px"} />
//               </button>

//               <div className="flex justify-between ">
//                 <div>
//                   <div className="text-xl font-semibold text-gray-200">
//                     Title
//                   </div>
//                   <div className="text-white">
//                     Scanning in all three antivirus is completed. Detailed
//                     report can be downloaded using download button.
//                   </div>
//                 </div>
//                 <div className="flex cursor-pointer items-center justify-center px-4 py-2">
//                   <button
//                     className="px-3 bg-primary text-white py-1 font-semibold "
//                     onClick={() => {
//                       downloadLogs(currentReport);
//                     }}
//                   >
//                     Download
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//           <div className="w-full flex flex-col text-white gap-2 text-xl">
//             {/* vm config cards */}
//             <div className="mt-4 vm-config">
//               <div className="text-2xl mt-6 font-bold text-white w-full flex flex-col pb-4">
//                 Virtual Machine Configuration.
//               </div>

//               <div className="flex gap-4">
//                 <Card
//                   heading="Operating System: Windows 11"
//                   antivirus="AntiVirus: Windows Defender"
//                   ram="RAM: 4GB"
//                   storage="Storage: 80GB"
//                   cta="View Logs"
//                 />
//                 <Card
//                   heading="Operating System: Windows 11"
//                   antivirus="AntiVirus: Trend Micro Security"
//                   ram="RAM: 6GB"
//                   storage="Storage: 60GB"
//                   cta="View Logs"
//                 />
//                 <Card
//                   heading="Operating System: Windows 11"
//                   antivirus="AntiVirus: Eset Internet Security"
//                   ram="RAM: 4GB"
//                   storage="Storage: 50GB"
//                   cta="View Logs"
//                 />
//               </div>
//             </div>

//             <button className="btn-lg p-4" onClick={() => fullScan()}>
//               FULLL SCAN
//             </button>

//             {/* MAUT INFO */}
//             {!scanning && !compiling && <MautInfo />}
//           </div>

//           <div className="rounded-md shadow-md w-full relative">
//             <div className="text-lg mt-2 font-bold text-white w-full flex flex-col pt-4 pb-2">
//               Select Folder
//             </div>
//             <div className="bg-card text-primary border-2 border-primary p-2 rounded-xl flex flex-row">
//               <div className="flex-grow text-left text-white font-medium py-2 px-2">
//                 {folderPath !== null ? folderPath : "No folder selected."}
//               </div>
//               <button
//                 disabled={scanning}
//                 onClick={handleFolderSelection}
//                 className="w-[150px] h-[40px] text-white mt-1 text-base bg-gradient-to-r from-[#A345E5] to-[#F04242] font-medium"
//               >
//                 Choose folder
//               </button>
//             </div>
//           </div>

//           <div>
//             <button
//               onClick={handleScan}
//               disabled={folderPath === null}
//               className={
//                 !scanning && !compiling
//                   ? "bg-primary mt-4 w-[200px] h-[50px] text-white text-lg font-semibold rounded-md disabled:cursor-not-allowed disabled:hover:bg-gray-500 transition"
//                   : scanning && !compiling
//                   ? "bg-[#F04242] mt-4 w-[200px] h-[50px] text-white text-lg font-semibold rounded-md"
//                   : "bg-[#A345E5]  mt-4 w-[240px] h-[50px] text-white text-lg font-semibold rounded-md cursor-wait"
//               }
//             >
//               {!scanning && !compiling
//                 ? "Start Scan"
//                 : scanning && !compiling
//                 ? "Stop Scanning !"
//                 : "Generating Report"}
//             </button>
//           </div>

//           {/* Symlink Paths */}
//           <SymlinkPaths />

//           <div className="w-full">{scanning && <Logs />}</div>

//           {avScanned.length === 3 && (
//             <Compilation setCompiling={setCompiling} />
//           )}
//         </div>
//       </div>
//     </Page>
//     </Page>
//   );
// };

// export default Dashboard;
