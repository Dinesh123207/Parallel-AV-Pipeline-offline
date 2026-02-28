use std::env;
use std::fs::{self, OpenOptions};
use std::io::{Write, Read};
use tauri::command;
use serde_json::{json, Value};
use std::path::PathBuf;

use super::json_log_generator::CombinedLog;
use super::logs_parser::{ClamAVScanType, ESETScanType, WindowsDFScanType};

#[command]
pub fn generate_logs(log: &str) -> Result<(), String> {
    // Get the current directory and move two levels up
    let log_folder = env::current_dir().unwrap().join("..\\logs\\");

    let log_file_path = log_folder.join("application.log");

    println!("Log folder: {:?}", log_file_path);

    // Ensure the log folder exists
    if !log_folder.exists() {
        fs::create_dir_all(&log_folder).map_err(|e| {
            format!(
                "Failed to create log folder: {:?}. Error: {}",
                log_folder, e
            )
        })?;
    }

    // Open the log file in append mode (create it if it doesn't exist)
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .append(true)
        .open(&log_file_path)
        .map_err(|e| format!("Failed to open log file: {:?}. Error: {}", log_file_path, e))?;

    // Append the log message with a newline
    writeln!(file, "{}", log).map_err(|e| format!("Failed to write to log file: {}", e))?;

    println!("Log message saved to {:?}", log_file_path);
    Ok(())
}

pub fn save_scan_logs(
    combined_report: CombinedLog,
    defender_logs: WindowsDFScanType,
    eset_logs: ESETScanType,
    clam_av_logs: ClamAVScanType,
    now: chrono::DateTime<chrono::Local>
) -> Result<(), String> {
    let log_folder = env::current_dir().unwrap().join("..\\logs\\");

    // Ensure the logs directory exists
    if !log_folder.exists() {
        fs::create_dir_all(&log_folder).map_err(|e| format!("Failed to create log folder: {}", e))?;
    }

    // Define file paths
    let combined_report_file = log_folder.join("combined_report.json");
    let defender_logs_file = log_folder.join("defender_logs.json");
    let eset_logs_file = log_folder.join("eset_logs.json");
    let clam_av_logs_file = log_folder.join("clam_av_logs.json");

    // Helper function to append data to a JSON file
    fn append_to_json_file(file_path: &PathBuf, new_data: &Value) -> Result<(), String> {
        let mut data = Vec::new();

        // Read existing data if file exists
        if file_path.exists() {
            let mut file = OpenOptions::new()
                .read(true)
                .write(true)
                .create(true)
                .open(file_path)
                .map_err(|e| format!("Failed to open file: {}", e))?;

            file.read_to_end(&mut data)
                .map_err(|e| format!("Failed to read file: {}", e))?;
        }

        // Parse existing data or start with an empty array
        let mut json_array: Vec<Value> = if !data.is_empty() {
            serde_json::from_slice(&data).unwrap_or_else(|_| vec![])
        } else {
            vec![]
        };

        // Append new data
        json_array.push(new_data.clone());

        // Write updated data back to the file
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .open(file_path)
            .map_err(|e| format!("Failed to open file for writing: {}", e))?;

        file.write_all(
            serde_json::to_string_pretty(&json_array)
                .map_err(|e| format!("Failed to serialize JSON: {}", e))?
                .as_bytes(),
        )
        .map_err(|e| format!("Failed to write to file: {}", e))?;

        Ok(())
    }

    // Prepare entries with timestamps
    let combined_entry = json!({
        "timestamp": now.to_rfc3339(),
        "data": combined_report
    });

    let defender_entry = json!({
        "timestamp": now.to_rfc3339(),
        "data": defender_logs
    });

    let eset_entry = json!({
        "timestamp": now.to_rfc3339(),
        "data": eset_logs
    });

    let clam_av_entry = json!({
        "timestamp": now.to_rfc3339(),
        "data": clam_av_logs
    });

    // Append entries to their respective files
    append_to_json_file(&combined_report_file, &combined_entry)?;
    append_to_json_file(&defender_logs_file, &defender_entry)?;
    append_to_json_file(&eset_logs_file, &eset_entry)?;
    append_to_json_file(&clam_av_logs_file, &clam_av_entry)?;

    Ok(())
}