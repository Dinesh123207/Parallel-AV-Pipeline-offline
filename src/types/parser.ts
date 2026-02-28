export type AntivirusLog = {
    total_files_scanned: number;
    infected_files: number;
    time_taken: string;
};

export type AvRegex = {
    filesScannedRegex: RegExp;
    infectedFilesRegex: RegExp;
    timeTakenRegex: RegExp
};

export enum LogType {
    WINDOWS_DF = "WINDOWS_DF",
    CLAM_AV = "CLAM_AV",
    ESET = "ESET"
};

export type CombinedLog = {
    antivirusLogs: {
        [key: string]: any; // Individual logs for each antivirus
    };
    combinedSummary: {
        totalThreatFiles: number;
        uniqueThreatFilePaths: string[];
        timeTaken: string;

    };
    infectedFilePaths: string[];
};