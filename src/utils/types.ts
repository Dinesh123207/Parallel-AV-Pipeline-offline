export interface ESET_SCAN_TYPE {
  threatFiles: { name: string; result: string }[];
  totalFilesScanned: number;
  totalThreatsDetected: number;
  scanTime: string;
  threatFilePaths: string[];
}

export interface WINDOWS_DF_SCAN_TYPE {
  totalThreatFiles: number;
  threatName: string | null;
  threatFiles: string[];
}

export interface CLAM_AV_SCAN_TYPE {
  threatFiles: { path: string; name: string }[];
  totalFilesScanned: number;
  totalThreatFiles: number;
  scanTime: string;
  scannedDirectories: number;
  dataScanned: string;
}

export type CommonLog = {
  threatName?: string | null; // Name of the threat
  totalFilesScanned?: number; // Total files scanned
  totalThreatFiles: number; // Total threat files detected
  scanTime?: string; // Time taken for the scan
  scannedDirectories?: number; // Number of directories scanned (optional)
  dataScanned?: string; // Total data scanned (optional)
  threatFiles: ThreatFile[]; // Standardized list of threat files
};

export interface ScanRow {
  id: string;
  type: "custom" | "full";
  path?: string;
  time: string;
}

export interface ButtonWrapperProps {
  buttonText: string;
  onclick: () => void;
}

export interface AntivirusOption {
  id: string;
  name: string;
}

export interface UpdateHistory {
  updateStatus: boolean;
  time: string;
  id: string;
}

export interface ThreatFile {
  path: string;
  name: string | null;
  result: string | null;
}

interface AntivirusLog {
  path: string | null;
  name: string | null;
  result: string | null;
}

interface AntivirusDetails {
  total_threat_files?: number;
  threat_files: AntivirusLog[];
  total_files_scanned?: number;
  total_threats_detected?: number;
  scan_time?: string;
  threat_file_paths?: string[];
  scanned_directories?: number;
  data_scanned?: string;
}

interface AntivirusLogs {
  [key: string]: {
    [key: string]: AntivirusDetails;
  };
}

interface CombinedSummary {
  total_threat_files: number;
  unique_threat_file_paths: string[];
  time_taken: string;
}

interface AntivirusData {
  antivirus_logs: AntivirusLogs;
  combined_summary: CombinedSummary;
  infected_file_paths: string[];
}

export interface Root {
  timestamp: string;
  data: AntivirusData;
}

export interface PcDetails {
  name: string;
  ip: string;
  folders: string[];
}

export interface LogData { uuid: string, dirs: string[], storage: string; }