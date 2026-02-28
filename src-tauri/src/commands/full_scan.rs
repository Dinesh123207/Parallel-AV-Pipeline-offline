use audit0::commands::button::scan;
use std::collections::HashMap;
use std::env;
use std::ffi::CString;
use std::fs;
use std::io::{BufReader, BufWriter};
use std::os::windows::fs::symlink_dir;
use std::path::{Path, PathBuf};
use std::process::Command; // Import Command to run shell commands
use tauri::command;
use winapi::um::fileapi::{GetDriveTypeA, GetLogicalDrives};
use winapi::um::winbase::DRIVE_FIXED;

// const SYMLINK_DIRECTORY: &str = "C:\\full_scan_symlinks"; // Directory to save symlinks

fn rename_symlink_and_register(
    symlink_path: &PathBuf,
    symlinks_folder: &PathBuf,
    drive_path: &Path,
) -> Result<(), String> {
    let uuid = uuid::Uuid::new_v4().to_string();
    let renamed_symlink_path = symlinks_folder.join(&uuid);

    fs::rename(&symlink_path, &renamed_symlink_path).map_err(|e| {
        println!("Failed to rename symlink folder: {:?}", e);
        "Failed to rename symlink folder".to_string()
    })?;

    println!(
        "Symlink renamed to {:?}",
        renamed_symlink_path.file_name().unwrap()
    );

    // Map the UUID to the original folder in a JSON file
    let file_path = env::current_dir()
        .unwrap()
        .join("..\\public\\")
        .join("path_mapping.json");

    let mut mappings: HashMap<String, String> = if file_path.exists() {
        // Read existing mappings from file
        let file = fs::File::open(&file_path).map_err(|e| {
            println!("Failed to open mapping file: {:?}", e);
            "Failed to open mapping file".to_string()
        })?;
        let reader = BufReader::new(file);
        serde_json::from_reader(reader).unwrap_or_else(|_| HashMap::new())
    } else {
        // Create a new mapping file
        HashMap::new()
    };

    // Add the new mapping
    mappings.insert(uuid, drive_path.to_string_lossy().to_string());

    // Write the updated mappings back to the file
    let file = fs::File::create(&file_path).map_err(|e| {
        println!("Failed to create mapping file: {:?}", e);
        "Failed to create mapping file".to_string()
    })?;
    let writer = BufWriter::new(file);
    serde_json::to_writer_pretty(writer, &mappings).map_err(|e| {
        println!("Failed to write mappings to file: {:?}", e);
        "Failed to write mappings to file".to_string()
    })?;

    println!("Mapping updated in {:?}", file_path);

    Ok(())
}

#[command]
pub async fn scan_all_drives() -> Result<Vec<String>, String> {
    let symlinks_folder = env::current_dir().unwrap().join("full-scan-symlinks");

    // Step 1: Create the symlink directory if it doesn't exist
    fs::create_dir_all(&symlinks_folder)
        .map_err(|e| format!("Failed to create symlink directory: {}", e))?;

    // Step 2: Detect local drives
    let drives = detect_drives()?;
    eprintln!("Detected drives: {:?}", drives);

    // Step 3: Create symlinks for each local drive
    for drive in drives {
        let drive_letter: &str = drive.trim_end_matches('\\'); // Remove trailing backslash
        let symlink_name = format!("Drive_{}", drive_letter.chars().next().unwrap()); // Create a descriptive name (e.g., "Drive_C")
                                                                                      // convert the drive letter to the actual path instance
        let drive_path = Path::new(drive_letter);
        let symlink_path = symlinks_folder.join(&symlink_name); // Full path for the symlink

        // Create the symlink, bypassing if it already exists
        if let Err(e) = create_symlink(&drive, &symlink_path) {
            if e.contains("already exists") {
                eprintln!(
                    "Symlink {} already exists. Skipping creation.",
                    symlink_path.display()
                );
            } else {
                return Err(e); // Return other errors
            }
        } else {
            eprintln!(
                "Created symlink for drive {} at {}",
                drive,
                symlink_path.display()
            );
            rename_symlink_and_register(&symlink_path, &symlinks_folder, &drive_path)?;
        }
    }

    // Step 4: Share the created folder with multiple VMs
    share_symlink_folder()?;

    // Step 5: Run antivirus scans on the shared folder

    eprintln!("#########################################################################################################################################################");

    eprintln!("Running Full Scan. Please wait an eternity.......");

    let av_commands = vec![
        r"VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3  -DisableRemediation -File \\VBOXSVR\full-scan-symlinks".to_string(),
        r"VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe \\VBOXSVR\full-scan-symlinks".to_string(),
        r"VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive \\VBOXSVR\full-scan-symlinks".to_string(),
    ];

    // Directly return the result of the scan function
    let scan_result: Result<Vec<String>, String> = scan(av_commands, false).await;

    eprintln!("Full scan completed.");
    eprintln!("#########################################################################################################################################################");

    scan_result
}

pub fn detect_drives() -> Result<Vec<String>, String> {
    let mut drives = Vec::new();
    let mask = unsafe { GetLogicalDrives() };

    eprintln!("Detected drives mask: {:b}", mask);

    for letter in 0..26 {
        if (mask & (1 << letter)) != 0 {
            // Create drive letter string (e.g., "C:\")
            let drive_letter = format!("{}:\\", (letter + 'A' as usize) as u8 as char);
            let c_drive_letter = CString::new(drive_letter.clone()).unwrap();

            // Call GetDriveTypeA with a C-style string
            let drive_type = unsafe { GetDriveTypeA(c_drive_letter.as_ptr()) };

            // Check if it's a fixed drive
            if drive_type == DRIVE_FIXED {
                drives.push(drive_letter);
            }
        }
    }

    if drives.is_empty() {
        eprintln!("No fixed drives detected.");
    } else {
        eprintln!("Detected fixed drives: {:?}", drives);
    }

    Ok(drives)
}

fn create_symlink(target: &str, link: &PathBuf) -> Result<(), String> {
    let target_path = Path::new(target);

    // Attempt to create the symlink
    #[cfg(windows)]
    {
        match symlink_dir(target_path, &link) {
            Ok(()) => Ok(()),
            Err(e) => Err(format!(
                "Failed to create symlink from {} to {}: {}",
                target,
                link.display(),
                e
            )),
        }
    }
    #[cfg(unix)]
    {
        match symlink(target_path, &link) {
            Ok(()) => Ok(()),
            Err(e) => Err(format!(
                "Failed to create symlink from {} to {}: {}",
                target,
                link.display(),
                e
            )),
        }
    }
}

fn share_symlink_folder() -> Result<(), String> {
    // Define VM names and the command to share the folder
    let vms = vec!["Win1", "Win2", "Win3"];

    for vm in vms {
        let command = format!(
            "VBoxManage sharedfolder add {} --name full-scan --hostpath {} --transient",
            vm,
            env::current_dir()
                .unwrap()
                .join("full-scan-symlinks")
                .display()
        );

        // Execute the command using Command
        let output = Command::new("cmd")
            .args(&["/C", &command])
            .output()
            .map_err(|e| format!("Failed to execute command: {}", e))?;

        if !output.status.success() {
            let error_message = String::from_utf8_lossy(&output.stderr).to_string();
            if error_message.contains("already exists") {
                // Log that the folder is already shared and continue
                eprintln!("Folder is already shared with {}. Skipping.", vm);
                continue; // Skip to the next VM
            }
            return Err(format!(
                "Error sharing folder with {}: {}",
                vm, error_message
            ));
        }

        eprintln!("Successfully shared folder with {}", vm);
    }

    Ok(())
}
