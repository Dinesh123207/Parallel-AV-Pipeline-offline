use regex::Regex;
use serde::Serialize;
use std::collections::HashSet;
use tauri::command;

#[derive(Debug, Serialize, Clone)]
pub struct ESETScanType {
    pub threat_files: Vec<ThreatFile>,
    pub total_files_scanned: u32,
    pub total_threats_detected: u32,
    pub scan_time: String,
    pub threat_file_paths: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct WindowsDFScanType {
    pub total_threat_files: u32,
    pub threat_name: Option<String>,
    pub threat_files: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct ClamAVScanType {
    pub threat_files: Vec<ThreatFile>,
    pub total_files_scanned: u32,
    pub total_threat_files: u32,
    pub scan_time: String,
    pub scanned_directories: u32,
    pub data_scanned: String,
}

// Struct to hold AVG scan results
#[derive(Debug, Serialize, Clone)]

pub struct AVGScanType {
    pub total_files_scanned: usize,
    pub total_threat_files: usize,
    pub scan_time: String,
    pub scanned_directories: usize,
    pub data_scanned: String,
}

// Struct to hold Kaspersky scan results
#[derive(Debug, Serialize, Clone)]

pub struct KasperskyScanType {
    pub total_files_scanned: usize,
    pub total_detected_files: usize,
    pub total_ok_files: usize,
    pub total_suspicions: usize,
    pub total_skipped: usize,
    pub password_protected: usize,
    pub corrupted: usize,
    pub errors: usize,
    pub scan_time: String,
    pub threat_files: Vec<ThreatFile>,
}

#[derive(Debug, Serialize, Clone)]
pub struct ThreatFile {
    pub path: String,
    pub name: Option<String>,
    pub result: Option<String>,
}

/// ESET Parser
#[command]
pub fn eset_parser(log: &str) -> ESETScanType {
    let mut result = ESETScanType {
        threat_files: Vec::new(),
        total_files_scanned: 0,
        total_threats_detected: 0,
        scan_time: String::new(),
        threat_file_paths: Vec::new(),
    };

    // Extract scan time
    if let Some(scan_time) = Regex::new(r"Scan time:\s+(.*)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.scan_time = scan_time.as_str().trim().to_string();
    }

    // Extract total files scanned
    if let Some(total_files) = Regex::new(r"Total:\s+files\s*-\s*(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_files_scanned = total_files.as_str().parse().unwrap_or(0);
    }

    // Extract total threats detected
    if let Some(total_threats) = Regex::new(r"Detected:\s+files\s*-\s*(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_threats_detected = total_threats.as_str().parse().unwrap_or(0);
    }

    // Extract threat files
    let file_regex = Regex::new(r#"name="([^"]+)", result="([^"]+)""#).unwrap();
    for cap in file_regex.captures_iter(log) {
        let cleaned_path = cap[1].split('�').next().unwrap_or("").trim().to_string();
        result.threat_files.push(ThreatFile {
            path: cleaned_path.clone(),
            name: None,
            result: Some(cap[2].to_string()),
        });
        result.threat_file_paths.push(cleaned_path);
    }

    result.threat_file_paths = result
        .threat_file_paths
        .into_iter()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    result
}

/// Windows Defender Parser
#[command]
pub fn windows_df_parser(log: &str) -> WindowsDFScanType {
    use std::collections::HashSet;

    let mut result = WindowsDFScanType {
        total_threat_files: 0,
        threat_name: None,
        threat_files: Vec::new(),
    };

    let mut unique_paths = HashSet::new();

    // Extract threat name
    if let Some(threat_name) = Regex::new(r"Threat\s+:\s+([^\n]+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.threat_name = Some(threat_name.as_str().trim().to_string());
    }

    // Extract files with threats
    let file_regex = Regex::new(r"file\s+:\s+([^\n]+)").unwrap();
    for cap in file_regex.captures_iter(log) {
        let full_path = cap[1].trim().to_string();
        // Split the path on "->" if it exists
        let actual_path = full_path.split("->").next().unwrap().trim().to_string();

        // Add the path to the set if it's unique
        if unique_paths.insert(actual_path.clone()) {
            result.threat_files.push(actual_path);
        }
    }

    result.total_threat_files = result.threat_files.len() as u32;

    result
}

/// ClamAV Parser
#[command]
pub fn clam_av_parser(log: &str) -> ClamAVScanType {
    let mut result = ClamAVScanType {
        threat_files: Vec::new(),
        total_files_scanned: 0,
        total_threat_files: 0,
        scan_time: String::new(),
        scanned_directories: 0,
        data_scanned: String::new(),
    };

    // Extract infected files
    let infected_regex = Regex::new(r"\\\?\\UNC[^\n]+: Win\.Test\.[^\n]+ FOUND").unwrap();
    for cap in infected_regex.captures_iter(log) {
        if let Some(file_line) = Regex::new(r"(\\\?\\UNC[^\n]+): (Win\.Test\.[^\n]+) FOUND")
            .unwrap()
            .captures(&cap[0])
        {
            let cleaned_path = file_line[1].replace("\\?\\UNC", "").trim().to_string();
            result.threat_files.push(ThreatFile {
                path: cleaned_path,
                name: Some(file_line[2].to_string()),
                result: None,
            });
        }
    }

    // Extract total scanned files
    if let Some(total_files) = Regex::new(r"Scanned files:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_files_scanned = total_files.as_str().parse().unwrap_or(0);
    }

    // Extract total infected files
    if let Some(total_infected) = Regex::new(r"Infected files:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_threat_files = total_infected.as_str().parse().unwrap_or(0);
    }

    // Extract scan time
    if let Some(scan_time) = Regex::new(r"Time:\s+([\d.]+ sec)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.scan_time = scan_time.as_str().trim().to_string();
    }

    // Extract scanned directories
    if let Some(scanned_dirs) = Regex::new(r"Scanned directories:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.scanned_directories = scanned_dirs.as_str().parse().unwrap_or(0);
    }

    // Extract data scanned
    if let Some(data_scanned) = Regex::new(r"Data scanned:\s+([\d.]+ MB)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.data_scanned = data_scanned.as_str().trim().to_string();
    }

    result
}

/// AVG Scan Report Parser
#[command]
pub fn avg_parser(log: &str) -> AVGScanType {
    let mut result = AVGScanType {
        total_files_scanned: 0,
        total_threat_files: 0,
        scan_time: String::new(),
        scanned_directories: 0,
        data_scanned: String::new(),
    };

    // Extract infected files
    if let Some(total_infected) = Regex::new(r"Infected files:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_threat_files = total_infected.as_str().parse().unwrap_or(0);
    }

    // Extract total scanned files
    if let Some(total_files) = Regex::new(r"Total files:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_files_scanned = total_files.as_str().parse().unwrap_or(0);
    }

    // Extract scanned directories
    if let Some(scanned_dirs) = Regex::new(r"Total folders:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.scanned_directories = scanned_dirs.as_str().parse().unwrap_or(0);
    }

    // Extract data scanned
    if let Some(data_scanned) = Regex::new(r"Total size:\s+([\d.]+ MB)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.data_scanned = data_scanned.as_str().trim().to_string();
    }

    // Extract scan time
    if let Some(scan_time) = Regex::new(r"Run-time was (\d+ second\(s\))")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.scan_time = scan_time.as_str().trim().to_string();
    }

    result
}

/// Kaspersky Internet Security Log Parser
#[command]
pub fn kaspersky_parser(log: &str) -> KasperskyScanType {
    let mut result = KasperskyScanType {
        total_files_scanned: 0,
        total_detected_files: 0,
        total_ok_files: 0,
        total_suspicions: 0,
        total_skipped: 0,
        password_protected: 0,
        corrupted: 0,
        errors: 0,
        scan_time: String::new(),
        threat_files: Vec::new(),
    };

    // Extract total processed objects
    if let Some(total_processed) = Regex::new(r"Processed objects:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_files_scanned = total_processed.as_str().parse().unwrap_or(0);
    }

    // Extract total OK files
    if let Some(total_ok) = Regex::new(r"Total OK:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_ok_files = total_ok.as_str().parse().unwrap_or(0);
    }

    // Extract total detected files
    if let Some(total_detected) = Regex::new(r"Total detected:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_detected_files = total_detected.as_str().parse().unwrap_or(0);
    }

    // Extract total suspicions
    if let Some(total_suspicions) = Regex::new(r"Suspicions:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_suspicions = total_suspicions.as_str().parse().unwrap_or(0);
    }

    // Extract total skipped files
    if let Some(total_skipped) = Regex::new(r"Total skipped:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.total_skipped = total_skipped.as_str().parse().unwrap_or(0);
    }

    // Extract password protected files
    if let Some(password_protected) = Regex::new(r"Password protected:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.password_protected = password_protected.as_str().parse().unwrap_or(0);
    }

    // Extract corrupted files
    if let Some(corrupted) = Regex::new(r"Corrupted:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.corrupted = corrupted.as_str().parse().unwrap_or(0);
    }

    // Extract errors
    if let Some(errors) = Regex::new(r"Errors:\s+(\d+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        result.errors = errors.as_str().parse().unwrap_or(0);
    }

    // Extract and calculate scan time
    if let Some(time_start) = Regex::new(r"Time Start:\s+([\d\-:\s]+)")
        .unwrap()
        .captures(log)
        .and_then(|cap| cap.get(1))
    {
        if let Some(time_finish) = Regex::new(r"Time Finish:\s+([\d\-:\s]+)")
            .unwrap()
            .captures(log)
            .and_then(|cap| cap.get(1))
        {
            let start =
                chrono::NaiveDateTime::parse_from_str(time_start.as_str(), "%Y-%m-%d %H:%M:%S")
                    .unwrap_or_else(|_| chrono::NaiveDateTime::from_timestamp(0, 0));
            let finish =
                chrono::NaiveDateTime::parse_from_str(time_finish.as_str(), "%Y-%m-%d %H:%M:%S")
                    .unwrap_or_else(|_| chrono::NaiveDateTime::from_timestamp(0, 0));
            let duration = finish - start;
            result.scan_time = format!("{} seconds", duration.num_seconds());
        }
    }

    // Extract threat files
    let threat_regex = Regex::new(r"([\S ]+)\s+detected\s+([\S ]+)").unwrap();
    for cap in threat_regex.captures_iter(log) {
        result.threat_files.push(ThreatFile {
            path: cap[1].to_string(),
            name: Some(cap[2].to_string()),
            result: None,
        });
    }

    eprintln!("/n/n/n {:?} /n/n/n", result);

    result
}
