use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::Write;
use std::process::Command;
use tauri::async_runtime::spawn_blocking;

#[derive(Serialize, Deserialize)]
struct LogEntry {
    timestamp: String,
    antivirus: String,
    status: String,
    update_type: String,
}

/// Executes a single command
pub fn exec_command(command: String) -> Result<String, String> {
    let args: Vec<&str> = command.split_whitespace().collect();

    if args.is_empty() {
        return Err("Command is empty".to_string());
    }

    let output = Command::new(args[0]).args(&args[1..]).output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let result = String::from_utf8_lossy(&output.stdout).to_string();
                Ok(result)
            } else {
                let error = String::from_utf8_lossy(&output.stderr).to_string();
                Err(error)
            }
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

/// Executes multiple commands asynchronously
pub async fn execute_commands(commands: Vec<String>) -> Vec<(String, String)> {
    let handles = commands
        .into_iter()
        .map(|cmd| {
            eprint!("{}", cmd);
            spawn_blocking(move || {
                let result = exec_command(cmd.clone());
                (cmd, result)
            })
        })
        .collect::<Vec<_>>();

    let mut results = Vec::new();
    for handle in handles {
        match handle.await {
            Ok((command, result)) => {
                let status = match result {
                    Ok(output) => format!("Success: {}", output),
                    Err(error) => format!("Error: {}", error),
                };
                eprint!("Log: {}", status);
                results.push((command, status));
            }
            Err(_) => results.push(("Task panicked".to_string(), "Error".to_string())),
        }
    }
    results
}

/// Updates antivirus and logs results to JSON
#[tauri::command]
pub async fn update_antivirus(
    command: Vec<String>,
    antivirus_names: Vec<String>,
    log_file_path: String,
    update_type: String,
) -> Result<String, String> {
    // Commands are a list of (antivirus name, update command)
    let command_list = command.into_iter().collect::<Vec<_>>();
    let antivirus_names = antivirus_names.into_iter().collect::<Vec<_>>();

    // Execute commands
    let results = execute_commands(command_list).await;

    // Prepare log data
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let mut antivirus_logs = Vec::new();

    for (index, (_, status)) in results.into_iter().enumerate() {
        antivirus_logs.push(AntivirusLog {
            antivirus: antivirus_names
                .get(index)
                .unwrap_or(&"Unknown".to_string())
                .to_string(),
            status,
            update_type: update_type.clone(),
        });
    }

    // Combined log structure
    let combined_log = CombinedLog {
        timestamp,
        logs: antivirus_logs,
    };

    // Read existing log data if it exists
    let mut existing_logs: Vec<CombinedLog> = if std::path::Path::new(&log_file_path).exists() {
        let existing_data = std::fs::read_to_string(&log_file_path)
            .map_err(|e| format!("Failed to read existing log file: {}", e))?;
        serde_json::from_str(&existing_data).unwrap_or_else(|_| Vec::new())
    } else {
        Vec::new()
    };

    // Append the new combined log
    existing_logs.push(combined_log);

    // Serialize the updated log data
    let updated_log_json = serde_json::to_string_pretty(&existing_logs)
        .map_err(|e| format!("Failed to serialize log data to JSON: {}", e))?;

    // Write the updated log data back to the file
    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(&log_file_path)
        .map_err(|e| format!("Failed to open log file: {}", e))?;

    file.write_all(updated_log_json.as_bytes())
        .map_err(|e| format!("Failed to write log: {}", e))?;

    Ok(format!(
        "Antivirus update completed. Logs saved to {}",
        log_file_path
    ))
}

#[derive(Serialize, Deserialize)]
struct CombinedLog {
    timestamp: String,
    logs: Vec<AntivirusLog>,
}

#[derive(Serialize, Deserialize)]
struct AntivirusLog {
    antivirus: String,
    status: String,
    update_type: String,
}

#[tauri::command]
pub async fn has_internet() -> bool {
    match reqwest::get("https://example.com").await {
        Ok(_) => true,
        Err(e) => {
            eprintln!("Internet check failed: {}", e);
            false
        }
    }
}
