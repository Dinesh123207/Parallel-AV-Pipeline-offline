use crate::commands::{json_log_generator, logs, logs_parser};
use std::{
    collections::{HashMap, HashSet},
    env, fs,
    io::Write,
    process::Command,
};
use tauri::async_runtime::spawn_blocking;

use super::{
    json_log_generator::CombinedLog,
    logs_parser::{ClamAVScanType, ESETScanType, KasperskyScanType, WindowsDFScanType},
};

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
                let error = String::from_utf8_lossy(&output.stdout).to_string();
                Err(error)
            }
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

pub async fn execute_command(commands: Vec<String>) -> Vec<String> {
    let handles = commands
        .into_iter()
        .map(|cmd| spawn_blocking(move || exec_command(cmd)))
        .collect::<Vec<_>>();

    let mut results = Vec::new();
    for handle in handles {
        match handle.await {
            Ok(result) => match result {
                Ok(output) => results.push(format!("Success: {}", output)),
                Err(error) => results.push(format!("{}", error)),
            },
            Err(_) => results.push("Task panicked".to_string()),
        }
    }
    results
}

pub fn parse_logs(
    results: Vec<String>,
) -> (
    WindowsDFScanType,
    ESETScanType,
    ClamAVScanType,
    KasperskyScanType,
) {
    // eprintln!("$%^$^@$^@#%@$^@#%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%% \n\n\n");

    // eprintln!("results: {:?}", results);

    // let defender_logs =
    //     logs_parser::windows_df_parser(&results[0].as_ref().unwrap_or(&"".to_string()));
    // let eset_logs = logs_parser::eset_parser(&results[1].as_ref().unwrap_or(&"".to_string()));
    // let clam_av_logs: ClamAVScanType =
    //     logs_parser::clam_av_parser(&results[2].as_ref().unwrap_or(&"".to_string()));
    // (defender_logs, eset_logs, clam_av_logs)
    let defender_logs = logs_parser::windows_df_parser(&results[0]);
    let eset_logs = logs_parser::eset_parser(&results[1]);
    let clam_av_logs = logs_parser::clam_av_parser(&results[2]);
    let kaspersky_logs = logs_parser::kaspersky_parser(&results[3]);

    // eprintln!("defender_logs: {:?}", defender_logs);
    // eprintln!("eset_logs: {:?}", eset_logs);
    // eprintln!("clam_av_logs: {:?}", clam_av_logs);

    // eprintln!("$%^$^@$^@#%@$^@#%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%");

    (defender_logs, eset_logs, clam_av_logs, kaspersky_logs)
}

pub fn generate_reports(
    defender_logs: WindowsDFScanType,
    eset_logs: ESETScanType,
    clam_av_logs: ClamAVScanType,
    time_taken: u64,

    kaspersky_logs: KasperskyScanType,
    now: chrono::DateTime<chrono::Local>,
) -> CombinedLog {
    let json_report = json_log_generator::generate_report_json(
        defender_logs.clone(),
        eset_logs.clone(),
        clam_av_logs.clone(),
        kaspersky_logs.clone(),
        time_taken,
    );

    let log_report: String = json_log_generator::generate_log_file(&json_report);
    let _ = logs::generate_logs(&log_report);
    let _ = logs::save_scan_logs(
        json_report.clone(),
        defender_logs,
        eset_logs,
        clam_av_logs,
        now,
    );

    json_report
}

pub fn handle_infected_files(
    infected_file_paths: &[String],
    full_scan: bool,
) -> Result<(), String> {
    let prefixes_to_strip = if full_scan {
        vec!["\\VBoxSvr\\full-scan\\", "\\\\VBOXSVR\\full-scan\\"]
    } else {
        vec!["\\VBoxSvr\\share\\", "\\\\VBOXSVR\\share\\"]
    };

    let mut unique_threat_paths = HashSet::new();

    for path in infected_file_paths {
        for prefix in &prefixes_to_strip {
            if path.contains(prefix) {
                unique_threat_paths.insert(path.replace(prefix, ""));
            }
        }
    }

    if unique_threat_paths.is_empty() {
        return Ok(());
    }

    let uuid = unique_threat_paths
        .iter()
        .next()
        .unwrap()
        .split('\\')
        .next()
        .unwrap();
    let path_mapping = load_path_mapping()?;

    let resolved_paths = resolve_paths(&unique_threat_paths, &path_mapping);
    println!("resolved_paths: {:?}", resolved_paths);
    move_infected_files(&resolved_paths, uuid)
}

pub fn load_path_mapping() -> Result<HashMap<String, String>, String> {
    let file_path = env::current_dir()
        .unwrap()
        .join("..\\public\\path_mapping.json");
    let content = fs::read_to_string(file_path)
        .map_err(|_| "Failed to read path mapping file".to_string())?;
    serde_json::from_str(&content).map_err(|_| "Failed to parse path mapping JSON".to_string())
}

pub fn resolve_paths(
    unique_threat_paths: &HashSet<String>,
    path_mapping: &HashMap<String, String>,
) -> HashSet<String> {
    let mut resolved_paths = HashSet::new();
    for path in unique_threat_paths {
        if let Some((uuid, relative_path)) = path.split_once('\\') {
            if let Some(actual_path) = path_mapping.get(uuid) {
                resolved_paths.insert(format!("{}\\{}", actual_path, relative_path));
            }
        }
    }
    resolved_paths
}

pub fn move_infected_files(resolved_paths: &HashSet<String>, uuid: &str) -> Result<(), String> {
    let infected_folder = env::current_dir()
        .unwrap()
        .join("..\\public\\InfectedFolder");
    if !infected_folder.exists() {
        fs::create_dir_all(&infected_folder)
            .map_err(|_| "Failed to create InfectedFolder".to_string())?;
    }

    let uuid_folder = infected_folder.join(uuid);
    if !uuid_folder.exists() {
        fs::create_dir_all(&uuid_folder).map_err(|_| "Failed to create UUID folder".to_string())?;
    }

    for resolved_path in resolved_paths {
        let file_name = resolved_path.split('\\').last().unwrap();
        let dest_path = uuid_folder.join(file_name);
        fs::rename(resolved_path, &dest_path).map_err(|_| "Failed to move file".to_string())?;
    }

    // Create a doc file in the same uuid directory and dump the resolved paths
    let mut doc_file = fs::File::create(uuid_folder.join("infected_files.txt"))
        .map_err(|_| "Failed to create infected_files.doc".to_string())?;
    for resolved_path in resolved_paths {
        writeln!(doc_file, "{}", resolved_path)
            .map_err(|_| "Failed to write to doc file".to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn scan(command: Vec<String>, full_scan: bool) -> Result<Vec<String>, String> {
    let now = chrono::Local::now();
    let start = std::time::Instant::now();

    let res = execute_command(command).await;
    // eprintln!("\n\n res: {:?} \n\n", res);
    let (defender_logs, eset_logs, clam_av_logs, kaspersky_logs) = parse_logs(res.clone());

    let time_taken = start.elapsed().as_secs();

    let defender_logs_clone = defender_logs.clone();
    let eset_logs_clone = eset_logs.clone();
    let clam_av_logs_clone = clam_av_logs.clone();
    let kaspersky_logs_clone = kaspersky_logs.clone();

    let json_report = generate_reports(
        defender_logs_clone,
        eset_logs_clone,
        clam_av_logs_clone,
        time_taken,
        kaspersky_logs_clone,
        now,
    );

    eprintln!("json_report: {:?} \n\n", json_report);

    if !json_report.infected_file_paths.is_empty() {
        println!("Handling infected files...");
        println!("Infected files: {:?}", json_report.infected_file_paths);
        handle_infected_files(&json_report.infected_file_paths, full_scan)?;
    }

    let mut final_result = res;
    final_result.push(now.to_rfc3339());

    Ok(final_result)
}

#[tauri::command]
pub async fn execute_commands(commands: Vec<String>) -> Result<Vec<String>, String> {
    // Spawn a thread for each command
    let handles = commands
        .into_iter()
        .map(|cmd| {
            // Offload each command execution to a blocking thread
            spawn_blocking(move || exec_command(cmd))
        })
        .collect::<Vec<_>>();

    // Collect results from all threads
    let mut results = Vec::new();
    for handle in handles {
        match handle.await {
            Ok(result) => match result {
                Ok(output) => results.push(format!("Success: {}", output)),
                Err(error) => results.push(format!("Error: {}", error)),
            },
            Err(e) => results.push(format!("Task panicked: {:?}", e)),
        }
    }

    // Return all results as a vector
    Ok(results)
}
