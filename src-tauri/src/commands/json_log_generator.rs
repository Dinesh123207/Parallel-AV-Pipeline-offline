use crate::commands::logs_parser::{ClamAVScanType, ESETScanType, WindowsDFScanType};
use chrono::Local;
use serde::Serialize;
use std::collections::{HashMap, HashSet};

use super::logs_parser::KasperskyScanType;

#[derive(Debug, Serialize, Clone)]
pub struct CombinedLog {
    pub antivirus_logs: HashMap<String, AntivirusLog>,
    pub combined_summary: CombinedSummary,
    pub infected_file_paths: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct CombinedSummary {
    pub total_threat_files: usize,
    pub unique_threat_file_paths: Vec<String>,
    pub time_taken: String,
}

#[derive(Debug, Serialize, Clone)]
pub enum AntivirusLog {
    WindowsDefender(WindowsDFScanType),
    ESET(ESETScanType),
    ClamAV(ClamAVScanType),
    Kaspersky(KasperskyScanType),
}

pub fn generate_report_json(
    defender_logs: WindowsDFScanType,
    eset_logs: ESETScanType,
    clam_av_logs: ClamAVScanType,
    kaspersky_logs: KasperskyScanType,
    time_taken: u64, // In seconds or milliseconds as per your requirement
) -> CombinedLog {
    // Collect unique threat file paths
    let mut unique_file_paths = HashSet::new();
    // Add Windows Defender threat files
    for file in &defender_logs.threat_files {
        if let Some(file_path) = file.split("->").next() {
            unique_file_paths.insert(file_path.trim().to_string());
        }
    }

    // Add ESET threat file paths
    for file_path in &eset_logs.threat_file_paths {
        unique_file_paths.insert(file_path.trim().to_string());
    }

    // Add ClamAV threat files
    for threat in &clam_av_logs.threat_files {
        unique_file_paths.insert(threat.path.trim().to_string());
    }

    // Prepare the CombinedLog
    CombinedLog {
        antivirus_logs: {
            let mut logs = HashMap::new();
            logs.insert(
                "Windows Defender".to_string(),
                AntivirusLog::WindowsDefender(defender_logs),
            );
            logs.insert("ESET AV".to_string(), AntivirusLog::ESET(eset_logs));
            logs.insert("CLAMAV".to_string(), AntivirusLog::ClamAV(clam_av_logs));
            logs.insert(
                "KASPERSKY".to_string(),
                AntivirusLog::Kaspersky(kaspersky_logs),
            );
            logs
        },
        combined_summary: CombinedSummary {
            total_threat_files: unique_file_paths.len(),
            unique_threat_file_paths: unique_file_paths.iter().cloned().collect(),
            time_taken: time_taken.to_string(),
        },
        infected_file_paths: unique_file_paths.iter().cloned().collect(),
    }
}

pub fn generate_log_file(combined_log: &CombinedLog) -> String {
    let mut log_lines = Vec::new();

    // Header with current date and time
    let current_date = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    log_lines.push("=".repeat(80));
    log_lines.push(
        "                     ANTIVIRUS SCAN SUMMARY REPORT                     ".to_string(),
    );
    log_lines.push("=".repeat(80));
    log_lines.push(format!("Generated on: {}", current_date));
    log_lines.push("".to_string());

    // Combined Summary
    log_lines.push("COMBINED SUMMARY:".to_string());
    log_lines.push("-".repeat(80));
    log_lines.push(format!(
        "Total Unique Threat Files Detected: {}",
        combined_log.combined_summary.total_threat_files
    ));
    log_lines.push("Unique Infected File Paths:".to_string());
    for (index, path) in combined_log
        .combined_summary
        .unique_threat_file_paths
        .iter()
        .enumerate()
    {
        log_lines.push(format!("  {}. {}", index + 1, path));
    }
    log_lines.push("".to_string());

    // Individual Antivirus Logs
    log_lines.push("DETAILED ANTIVIRUS LOGS:".to_string());
    log_lines.push("-".repeat(80));
    for (antivirus, log) in &combined_log.antivirus_logs {
        log_lines.push(format!("ANTIVIRUS: {}", antivirus));
        log_lines.push("-".repeat(40));

        match log {
            AntivirusLog::WindowsDefender(log) => {
                log_lines.push(format!("  Total Threat Files: {}", log.total_threat_files));
                log_lines.push(format!(
                    "  Threat Name: {}",
                    log.threat_name.clone().unwrap_or_else(|| "N/A".to_string())
                ));
                log_lines.push("  Threat Files:".to_string());
                for (index, file) in log.threat_files.iter().enumerate() {
                    log_lines.push(format!("    {}. {}", index + 1, file));
                }
            }
            AntivirusLog::ESET(log) => {
                log_lines.push(format!("  Total Threat Files: {}", log.threat_files.len()));
                log_lines.push(format!(
                    "  Total Files Scanned: {}",
                    log.total_files_scanned
                ));
                log_lines.push(format!(
                    "  Total Threats Detected: {}",
                    log.total_threats_detected
                ));
                log_lines.push(format!("  Scan Time: {}", log.scan_time));
                log_lines.push("  Threat Files:".to_string());
                for (index, file) in log.threat_files.iter().enumerate() {
                    log_lines.push(format!(
                        "    {}. {} (Result: {})",
                        index + 1,
                        file.path,
                        file.result.clone().unwrap_or_else(|| "N/A".to_string())
                    ));
                }
            }
            AntivirusLog::ClamAV(log) => {
                log_lines.push(format!("  Total Threat Files: {}", log.threat_files.len()));
                log_lines.push(format!(
                    "  Total Files Scanned: {}",
                    log.total_files_scanned
                ));
                log_lines.push(format!("  Scan Time: {}", log.scan_time));
                log_lines.push(format!(
                    "  Scanned Directories: {}",
                    log.scanned_directories
                ));
                log_lines.push(format!("  Data Scanned: {}", log.data_scanned));
                log_lines.push("  Threat Files:".to_string());
                for (index, file) in log.threat_files.iter().enumerate() {
                    log_lines.push(format!(
                        "    {}. {} (Name: {})",
                        index + 1,
                        file.path,
                        file.name.clone().unwrap_or_else(|| "N/A".to_string())
                    ));
                }
            }
            AntivirusLog::Kaspersky(log) => {
                log_lines.push(format!("  Total Threat Files: {}", log.threat_files.len()));
                log_lines.push(format!(
                    "  Total Files Scanned: {}",
                    log.total_files_scanned
                ));
                log_lines.push(format!("  Scan Time: {}", log.scan_time));
                log_lines.push("  Threat Files:".to_string());
                for (index, file) in log.threat_files.iter().enumerate() {
                    log_lines.push(format!(
                        "    {}. {} (Result: {})",
                        index + 1,
                        file.path,
                        file.result.clone().unwrap_or_else(|| "N/A".to_string())
                    ));
                }
            }
        }

        log_lines.push("".to_string());
    }

    // Footer
    log_lines.push("=".repeat(80));
    log_lines.push(
        "                            END OF REPORT                              ".to_string(),
    );
    log_lines.push("=".repeat(80));

    // Combine lines into a single string
    log_lines.join("\n")
}
