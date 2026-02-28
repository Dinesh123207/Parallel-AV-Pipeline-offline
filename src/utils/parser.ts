import { CLAM_AV_SCAN_TYPE, ESET_SCAN_TYPE, WINDOWS_DF_SCAN_TYPE } from "./types";

export function esetParser(log: string) {
    const result: ESET_SCAN_TYPE = {
        threatFiles: [],
        totalFilesScanned: 0,
        totalThreatsDetected: 0,
        scanTime: "",
        threatFilePaths: [],
    };

    // Extract scan time
    const scanTimeMatch = log.match(/Scan time:\s+(.*)/);
    if (scanTimeMatch) {
        result.scanTime = scanTimeMatch[1].trim();
    }

    // Extract total files scanned
    const totalFilesMatch = log.match(/Total:\s+files\s*-\s*(\d+)/);
    if (totalFilesMatch) {
        result.totalFilesScanned = parseInt(totalFilesMatch[1], 10);
    }

    // Extract total threats detected
    const totalThreatsMatch = log.match(/Detected:\s+files\s*-\s*(\d+)/);
    if (totalThreatsMatch) {
        result.totalThreatsDetected = parseInt(totalThreatsMatch[1], 10);
    }

    // Extract detected files and clean their paths
    const fileMatches = log.match(/name="([^"]+)", result="([^"]+)"/g);
    if (fileMatches) {
        result.threatFiles = fileMatches.map((fileLine) => {
            const match = fileLine.match(/name="([^"]+)", result="([^"]+)"/);
            if (match) {
                // Extract and clean the file path
                const cleanedPath = match[1].split(" �")[0].trim();
                return {
                    name: cleanedPath, // Cleaned file path
                    result: match[2],
                };
            }
            return { name: "", result: "" }; // Fallback for malformed lines
        });

        // Extract unique cleaned file paths
        result.threatFilePaths = Array.from(
            new Set(result.threatFiles.map((file) => file.name))
        );
    }
    return result;
}

export function windowsDfParser(log: string) {
    const result: WINDOWS_DF_SCAN_TYPE = {
        totalThreatFiles: 0,
        threatName: null,
        threatFiles: [],
    };

    // Extract threat name
    const threatNameMatch = log.match(/Threat\s+:\s+([^\n]+)/);
    if (threatNameMatch) {
        result.threatName = threatNameMatch[1].trim();
    }

    // Extract files with threats
    const fileMatches = log.match(/file\s+:\s+([^\n]+)/g);
    if (fileMatches) {
        result.threatFiles = fileMatches.map((fileLine) =>
            fileLine.replace(/file\s+:\s+/, "").trim()
        );
        result.totalThreatFiles = result.threatFiles.length;
    }

    return result;
}

export function clamAVParser(log: string) {
    const result: CLAM_AV_SCAN_TYPE = {
        threatFiles: [],
        totalFilesScanned: 0,
        totalThreatFiles: 0,
        scanTime: "",
        scannedDirectories: 0,
        dataScanned: "",
    };

    // Extract infected files
    const infectedFileMatches = log.match(/\\\?\\UNC[^\n]+: Win\.Test\.[^\n]+ FOUND/g);
    if (infectedFileMatches) {
        result.threatFiles = infectedFileMatches.map((line) => {
            const match = line.match(/(\\\?\\UNC[^\n]+): (Win\.Test\.[^\n]+) FOUND/);
            if (match) {
                const cleanedPath = match[1].replace(/\\\?\\UNC/g, ""); // Remove `\\?\UNC` prefix
                return {
                    path: cleanedPath.trim(),
                    name: match[2].trim(),
                };
            }
            return { path: "", name: "" };
        });
    }

    // Extract total scanned files
    const totalFilesMatch = log.match(/Scanned files:\s+(\d+)/);
    if (totalFilesMatch) {
        result.totalFilesScanned = parseInt(totalFilesMatch[1], 10);
    }

    // Extract total infected files
    const totalInfectedMatch = log.match(/Infected files:\s+(\d+)/);
    if (totalInfectedMatch) {
        result.totalThreatFiles = parseInt(totalInfectedMatch[1], 10);
    }

    // Extract scan time
    const scanTimeMatch = log.match(/Time:\s+([\d.]+ sec)/);
    if (scanTimeMatch) {
        result.scanTime = scanTimeMatch[1].trim();
    }

    // Extract scanned directories
    const scannedDirsMatch = log.match(/Scanned directories:\s+(\d+)/);
    if (scannedDirsMatch) {
        result.scannedDirectories = parseInt(scannedDirsMatch[1], 10);
    }

    // Extract data scanned
    const dataScannedMatch = log.match(/Data scanned:\s+([\d.]+ MB)/);
    if (dataScannedMatch) {
        result.dataScanned = dataScannedMatch[1].trim();
    }

    return result;
}

