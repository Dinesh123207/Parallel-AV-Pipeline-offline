import { invoke } from "@tauri-apps/api/tauri";
import {
  CLAM_AV_SCAN_TYPE,
  ESET_SCAN_TYPE,
  WINDOWS_DF_SCAN_TYPE,
} from "@/utils/types";
import { CombinedLog, LogType } from "@/types/parser";

// Helper function to save the logs to a file
export function saveToFile(log: string) {
  try {
    const res = invoke("generate_logs", { log });
    console.log(`Log file saved as ${res}`);
  } catch (err) {
    console.error("Error saving log file:", err);
  }
}

// Helper function to download the current logs
export function downloadLogs(log: string | null) {
  if (log === null) {
    console.error("No logs to download");
    return;
  }
  const blob = new Blob([log], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "antivirus_scan_logs.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// Helper function to get the logs from VMS
export function generateReportJSON(
  defenderLogs: WINDOWS_DF_SCAN_TYPE,
  esetLogs: ESET_SCAN_TYPE,
  clamAVLogs: CLAM_AV_SCAN_TYPE,
  timeTaken: number
): CombinedLog {
  const combinedLog: CombinedLog = {
    antivirusLogs: {
      "Windows Defender": defenderLogs,
      "ESET AV": esetLogs,
      CLAMAV: clamAVLogs,
    },
    combinedSummary: {
      totalThreatFiles: Array.from(
        new Set([
          ...defenderLogs.threatFiles.map((file) => file.split("->")[0].trim()),
          ...esetLogs.threatFilePaths,
          ...clamAVLogs.threatFiles.map((file) => file.path),
        ])
      ).length,
      uniqueThreatFilePaths: Array.from(
        new Set([
          ...defenderLogs.threatFiles.map((file) => file.split("->")[0].trim()),
          ...esetLogs.threatFilePaths,
          ...clamAVLogs.threatFiles.map((file) => file.path),
        ])
      ),
      timeTaken: timeTaken.toString(),
    },
    infectedFilePaths: Array.from(
      new Set([
        ...defenderLogs.threatFiles.map((file) => file.split("->")[0].trim()),
        ...esetLogs.threatFilePaths,
        ...clamAVLogs.threatFiles.map((file) => file.path),
      ])
    ),
  };
  return combinedLog;
}

export function generateLogFile(combinedLog: CombinedLog): string {
  const logLines: string[] = [];

  // Header with current date and time
  const currentDate = new Date().toLocaleString();
  logLines.push("=".repeat(80));
  logLines.push(
    "                     ANTIVIRUS SCAN SUMMARY REPORT                     "
  );
  logLines.push("=".repeat(80));
  logLines.push(`Generated on: ${currentDate}`);
  logLines.push("");

  // Combined Summary
  logLines.push("COMBINED SUMMARY:");
  logLines.push("-".repeat(80));
  logLines.push(
    `Total Unique Threat Files Detected: ${combinedLog.combinedSummary.totalThreatFiles}`
  );
  logLines.push("Unique Infected File Paths:");
  combinedLog.combinedSummary.uniqueThreatFilePaths.forEach((path, index) => {
    logLines.push(`  ${index + 1}. ${path}`);
  });
  logLines.push("");

  // Individual Antivirus Logs
  logLines.push("DETAILED ANTIVIRUS LOGS:");
  logLines.push("-".repeat(80));
  for (const [antivirus, log] of Object.entries(combinedLog.antivirusLogs)) {
    logLines.push(`ANTIVIRUS: ${antivirus}`);
    logLines.push("-".repeat(40));

    if (antivirus === "Windows Defender") {
      logLines.push(`  Total Threat Files: ${log.totalThreatFiles}`);
      logLines.push(`  Threat Name: ${log.threatName}`);
      logLines.push("  Threat Files:");
      log.threatFiles.forEach((file: string, index: number) => {
        logLines.push(`    ${index + 1}. ${file}`);
      });
    } else if (antivirus === "ESET AV") {
      logLines.push(`  Total Threat Files: ${log.threatFiles.length}`);
      logLines.push(`  Total Files Scanned: ${log.totalFilesScanned}`);
      logLines.push(`  Total Threats Detected: ${log.totalThreatsDetected}`);
      logLines.push(`  Scan Time: ${log.scanTime}`);
      logLines.push("  Threat Files:");
      log.threatFiles.forEach(
        (file: { name: string; result: string }, index: number) => {
          logLines.push(
            `    ${index + 1}. ${file.name} (Result: ${file.result})`
          );
        }
      );
    } else if (antivirus === "CLAMAV") {
      logLines.push(`  Total Threat Files: ${log.threatFiles.length}`);
      logLines.push(`  Total Files Scanned: ${log.totalFilesScanned}`);
      logLines.push(`  Scan Time: ${log.scanTime}`);
      logLines.push(`  Scanned Directories: ${log.scannedDirectories}`);
      logLines.push(`  Data Scanned: ${log.dataScanned}`);
      logLines.push("  Threat Files:");
      log.threatFiles.forEach(
        (file: { path: string; name: string }, index: number) => {
          logLines.push(`    ${index + 1}. ${file.path} (Name: ${file.name})`);
        }
      );
    }

    logLines.push("");
  }

  // Footer
  logLines.push("=".repeat(80));
  logLines.push(
    "                            END OF REPORT                              "
  );
  logLines.push("=".repeat(80));

  // Combine lines into a single string
  return logLines.join("\n");
}

export const tabClass = (activeTab: string, currentTab: string) =>
  `flex text-lg  items-center space-x-2 cursor-pointer transition-colors duration-200 ${
    activeTab === currentTab
      ? "text-blue-600 font-semibold text-success_signal"
      : "text-secondary hover:text-primary-1"
  }`;

export const secTabClass = (activeTab: string, currentTab: string) =>
  `flex items-center space-x-2 cursor-pointer transition-colors duration-200 ${
    activeTab === currentTab
      ? "text-blue-600 font-semibold"
      : "text-gray-500 hover:text-blue-600"
  }`;

export const scanType = (activeScan: string, scan: string) =>
  `text-md font-semibold w-full h-full py-2 flex items-center text-center justify-center cursor-pointer ${
    activeScan === scan
      ? "text-slate-800 bg-primary-2"
      : "hover:outline outline-1 transition text-slate-800 hover:bg-primary/30"
  }`;
type PCLogEntry = {
  pcName: string;
  timestamp: string; // Use string for ISO date format
};

export function updatePCLog(pcName: string, timestamp: string): void {
  const localStorageKey = "pcLog"; // Define the key to store the array in localStorage

  // Retrieve the existing data from localStorage or initialize an empty array
  const pcLog: PCLogEntry[] = JSON.parse(
    localStorage.getItem(localStorageKey) || "[]"
  );

  // Add the new entry to the array
  pcLog.push({ pcName, timestamp });

  // Save the updated array back to localStorage
  localStorage.setItem(localStorageKey, JSON.stringify(pcLog));
}
