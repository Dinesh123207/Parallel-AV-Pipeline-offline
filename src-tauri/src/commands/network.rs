use audit0::commands::button::execute_command;
use audit0::commands::button::scan;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::process::Command;
use std::str;
use tauri::async_runtime::spawn_blocking;
use tauri::{AppHandle, Manager};
// import a constant vec from constants.rs
// use audit0::utils::constants::NETWORK_DEVICE_ADD;

// Struct for network device
#[derive(Serialize, Deserialize, Debug)]
struct NetworkDevice {
    ip: String,
    name: String,
    folders: Vec<String>,
}

// Function to check if the IP is reachable
fn is_ip_reachable(ip: &str) -> bool {
    println!("Pinging IP: {}", ip);
    let output = if cfg!(target_os = "windows") {
        Command::new("ping").args(["-n", "1", ip]).output()
    } else {
        Command::new("ping").args(["-c", "1", ip]).output()
    };

    match output {
        Ok(output) => {
            println!("Ping output: {:?}", output);
            output.status.success()
        }
        Err(err) => {
            println!("Ping failed: {}", err);
            false
        }
    }
}

// Function to add a network device
#[tauri::command]
pub async fn add_network_device(ip: String, name: String) -> Result<String, String> {
    println!("Adding network device: IP={}, Name={}", ip, name);

    // Check if the IP is reachable
    if !is_ip_reachable(&ip) {
        return Err("Not able to connect to that device".to_string());
    }

    // Resolve the file path for network_mapping.json
    let mut file_path = env::current_dir().map_err(|e| e.to_string())?;
    file_path.pop();
    file_path.push("public");
    file_path.push("network_mapping.json");

    println!("Network mapping file path: {}", file_path.display());

    // Ensure the `public` directory exists
    if !file_path.parent().unwrap().exists() {
        println!("Creating 'public' directory...");
        fs::create_dir_all(file_path.parent().unwrap())
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // Initialize a new device
    let new_device = NetworkDevice {
        ip: ip.clone(),
        name: name.clone(),
        folders: vec![],
    };
    println!("New device: {:?}", new_device);

    if file_path.exists() {
        println!("Network mapping file exists. Reading file...");
        let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| e.to_string())?;

        let mut devices: Vec<NetworkDevice> = if contents.trim().is_empty() {
            vec![]
        } else {
            serde_json::from_str(&contents).map_err(|e| e.to_string())?
        };

        println!("Existing devices: {:?}", devices);

        if devices.iter().any(|d| d.ip == ip || d.name == name) {
            return Err("Device with the same IP or name already exists.".to_string());
        }

        println!("Adding new device to the list...");
        devices.push(new_device);

        let updated_data = serde_json::to_string_pretty(&devices).map_err(|e| e.to_string())?;
        File::create(&file_path)
            .and_then(|mut file| file.write_all(updated_data.as_bytes()))
            .map_err(|e| e.to_string())?;
    } else {
        println!("Network mapping file does not exist. Creating file...");
        let initial_data = vec![new_device];
        let json_data = serde_json::to_string_pretty(&initial_data).map_err(|e| e.to_string())?;
        File::create(&file_path)
            .and_then(|mut file| file.write_all(json_data.as_bytes()))
            .map_err(|e| e.to_string())?;
    }

    // Create networkFolders folder in the VMs if it does not exist
    let network_folders_create = vec![
        format!("VBoxManage guestcontrol Win1 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
        format!("VBoxManage guestcontrol Win2 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
        format!("VBoxManage guestcontrol Win3 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
        // Add other commands here if needed
    ];

    // Execute the commands asynchronously
    execute_command(network_folders_create).await;

    // Create a folder for the new device in VMs
    let network_device_add = vec![
        format!(
            "VBoxManage guestcontrol Win1 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
            name
        ),
        format!(
            "VBoxManage guestcontrol Win2 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
            name
        ),
        format!(
            "VBoxManage guestcontrol Win3 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
            name
        ),
        // Add other commands here if needed
    ];

    // Execute the commands asynchronously
    execute_command(network_device_add).await;

    println!("Device added successfully.");
    Ok(format!(
        "Device added successfully and folder created at VMs"
    ))
}

// Function to remove a network device
#[tauri::command]
pub async fn remove_network_device(name: String) -> Result<String, String> {
    println!("Removing network device: Name={}", name);

    let name_clone = name.clone();
    let _ = spawn_blocking(move || {
        let mut file_path = env::current_dir().map_err(|e| e.to_string())?;
        file_path.pop();
        file_path.push("public");
        file_path.push("network_mapping.json");

        println!("Network mapping file path: {}", file_path.display());

        if !file_path.exists() {
            return Err("Network mapping file does not exist.".to_string());
        }

        println!("Reading network mapping file...");
        let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| e.to_string())?;

        let mut devices: Vec<NetworkDevice> = if contents.trim().is_empty() {
            vec![]
        } else {
            serde_json::from_str(&contents).map_err(|e| e.to_string())?
        };

        println!("Existing devices: {:?}", devices);

        if let Some(index) = devices.iter().position(|d| d.name == name) {
            println!("Device found. Removing...");
            devices.remove(index);

            let updated_data = serde_json::to_string_pretty(&devices).map_err(|e| e.to_string())?;
            File::create(&file_path)
                .and_then(|mut file| file.write_all(updated_data.as_bytes()))
                .map_err(|e| e.to_string())?;
        } else {
            return Err("Device not found.".to_string());
        }

        Ok(())
    })
    .await
    .map_err(|_| "Task panicked".to_string())?;

    // Remove the folder from the VMs
    let network_device_remove = vec![
        format!(
            "VBoxManage guestcontrol Win1 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
            name_clone
        ),
        format!(
            "VBoxManage guestcontrol Win2 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
            name_clone
        ),
        format!(
            "VBoxManage guestcontrol Win3 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
            name_clone
        ),
        // Add other commands for additional VMs as needed
    ];

    execute_command(network_device_remove).await;

    println!("Device removed successfully.");
    Ok(format!(
        "Device {} removed successfully from VMs.",
        name_clone
    ))
}

// Function to list folders using rsync
#[tauri::command]
pub async fn list_folders(path: String) -> Result<Vec<String>, String> {
    println!("Listing folders at path: {}", path);

    spawn_blocking(move || {
        let output = Command::new("rsync").args(["--list-only", &path]).output();

        match output {
            Ok(output) if output.status.success() => {
                let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
                println!("Rsync output: {}", stdout);

                // Filter only directories (lines starting with "dr")
                let folders = stdout
                    .lines()
                    .filter_map(|line| {
                        // Check if the line starts with "d" (indicating a directory)
                        if line.starts_with("d") {
                            // Extract the last whitespace-separated field as the folder name
                            line.split_whitespace().last().map(|s| s.to_string())
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<String>>();

                println!("Folders found: {:?}", folders);
                Ok(folders)
            }
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                println!("Rsync failed: {}", stderr);
                Err(format!("Rsync failed: {}", stderr))
            }
            Err(err) => {
                println!("Failed to execute rsync: {}", err);
                Err(format!("Failed to execute rsync: {}", err))
            }
        }
    })
    .await
    .map_err(|_| "Task panicked".to_string())?
}

// Function to select and copy a network folder
#[tauri::command]
pub async fn select_network_folder(
    ip: String,
    pc_name: String,
    remote_folder_name: String,
    remote_folder_path: String,
) -> Result<String, String> {
    eprintln!(
        "Selecting network folder: IP={}, PC Name={}, Remote Folder Name={}, Remote Folder Path={}",
        ip, pc_name, remote_folder_name, remote_folder_path
    );

    // Construct the destination path inside the VM
    let destination_path = format!(
        "/cygdrive/b/networkFolders/{}/{}",
        pc_name, remote_folder_name
    );

    // Ensure the destination folder exists in the VM
    let create_folder_commands = vec![
        format!(
            "VBoxManage guestcontrol Win1 mkdir {} --username vboxuser --password abcd79802 ",
            destination_path
        ),
        format!(
            "VBoxManage guestcontrol Win2 mkdir {} --username vboxuser --password abcd79802 ",
            destination_path
        ),
        format!(
            "VBoxManage guestcontrol Win3 mkdir {} --username vboxuser --password abcd79802 ",
            destination_path
        ),
    ];

    // Execute the folder creation command
    execute_command(create_folder_commands).await;

    // Construct the rsync command
    let rsync_commands = vec![format!(
        "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
        remote_folder_path, destination_path
    ),format!(
        "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
        remote_folder_path, destination_path
    ),format!(
        "VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
        remote_folder_path, destination_path
    )];

    // Execute the rsync command
    execute_command(rsync_commands).await;

    // Add the folder to the network_mapping.json
    if let Err(err) = add_folder_to_network_mapping(&ip, &pc_name, &destination_path) {
        return Err(format!("Failed to update network_mapping.json: {}", err));
    }

    println!("Folder successfully copied to VM and added to network mapping.");
    Ok(format!(
        "Folder '{}' from '{}' copied successfully to '{}'.",
        remote_folder_name, ip, destination_path
    ))
}

// Adds the folder path to the network_mapping.json file under the respective PC entry.
fn add_folder_to_network_mapping(ip: &str, pc_name: &str, folder_path: &str) -> Result<(), String> {
    // Resolve the file path for network_mapping.json
    let mut file_path = std::env::current_dir().map_err(|e| e.to_string())?;
    file_path.pop(); // Move up one directory level
    file_path.push("public");
    file_path.push("network_mapping.json");

    println!("Updating network_mapping.json at: {}", file_path.display());

    // Read the existing JSON file or create an empty list if it doesn't exist
    let mut devices: Vec<NetworkDevice> = if file_path.exists() {
        let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| e.to_string())?;

        if contents.trim().is_empty() {
            vec![]
        } else {
            serde_json::from_str(&contents).map_err(|e| e.to_string())?
        }
    } else {
        vec![]
    };

    println!("Existing devices before update: {:?}", devices);

    // Find the PC entry and update its folders list
    if let Some(pc_entry) = devices
        .iter_mut()
        .find(|entry| entry.ip == ip && entry.name == pc_name)
    {
        println!("Found PC entry: {:?}", pc_entry);
        if !pc_entry.folders.contains(&folder_path.to_string()) {
            println!("Adding folder path '{}' to PC entry.", folder_path);
            pc_entry.folders.push(folder_path.to_string());
        } else {
            println!(
                "Folder path '{}' already exists in the PC entry.",
                folder_path
            );
        }
    } else {
        return Err(format!(
            "PC entry for IP '{}' and Name '{}' not found.",
            ip, pc_name
        ));
    }

    // Write the updated devices list back to the file
    println!("Updated devices: {:?}", devices);
    let updated_data = serde_json::to_string_pretty(&devices)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(&file_path)
        .map_err(|e| e.to_string())?;
    file.write_all(updated_data.as_bytes())
        .map_err(|e| e.to_string())?;

    println!("Successfully updated network_mapping.json.");
    Ok(())
}

// Function to remove a network folder
#[tauri::command]
pub async fn remove_folder(
    ip: String,
    pc_name: String,
    remote_folder_name: String,
) -> Result<String, String> {
    println!(
        "Removing folder: IP={}, PC Name={}, Folder Path={}",
        ip, pc_name, remote_folder_name
    );

    // remove folder from Vms that will be on C://
    // let destination_path = format!(
    //     "/cygdrive/b/networkFolders/{}/{}",
    //     pc_name, remote_folder_name
    // );
    let destination_path = remote_folder_name.clone();

    // Construct commands to remove the folder from VMs
    let remove_folder_commands = vec![
        format!(
            "VBoxManage guestcontrol Win1 rmdir {} --username vboxuser --password abcd79802 --recursive",
            destination_path
        ),
        format!(
            "VBoxManage guestcontrol Win2 rmdir {} --username vboxuser --password abcd79802 --recursive",
            destination_path
        ),
        format!(
            "VBoxManage guestcontrol Win3 rmdir {} --username vboxuser --password abcd79802 --recursive",
            destination_path
        ),
    ];

    // Execute folder removal commands
    execute_command(remove_folder_commands).await;

    println!("Folder removed from VMs. Updating network_mapping.json...");

    // Remove folder path from network_mapping.json
    if let Err(err) = remove_folder_from_network_mapping(&ip, &pc_name, &destination_path) {
        return Err(format!("Failed to update network_mapping.json: {}", err));
    }

    println!("Folder removed successfully from network mapping.");
    Ok(format!(
        "Folder '{}' removed successfully from VMs and network mapping.",
        destination_path
    ))
}

/// Removes the folder path from the network_mapping.json file under the respective PC entry.
fn remove_folder_from_network_mapping(
    ip: &str,
    pc_name: &str,
    folder_path: &str,
) -> Result<(), String> {
    // Resolve the file path for network_mapping.json
    let mut file_path = std::env::current_dir().map_err(|e| e.to_string())?;
    file_path.pop(); // Move up one directory level
    file_path.push("public");
    file_path.push("network_mapping.json");

    println!("Updating network_mapping.json at: {}", file_path.display());

    // Read the existing JSON file
    let mut devices: Vec<NetworkDevice> = if file_path.exists() {
        let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| e.to_string())?;

        if contents.trim().is_empty() {
            vec![]
        } else {
            serde_json::from_str(&contents).map_err(|e| e.to_string())?
        }
    } else {
        return Err("Network mapping file does not exist.".to_string());
    };

    println!("Existing devices before update: {:?}", devices);

    // Find the PC entry and update its folders list
    if let Some(pc_entry) = devices
        .iter_mut()
        .find(|entry| entry.ip == ip && entry.name == pc_name)
    {
        println!("Found PC entry: {:?}", pc_entry);
        if let Some(index) = pc_entry.folders.iter().position(|f| f == folder_path) {
            println!("Removing folder path '{}' from PC entry.", folder_path);
            pc_entry.folders.remove(index);
        } else {
            println!("Folder path '{}' not found in the PC entry.", folder_path);
            return Err(format!(
                "Folder path '{}' not found for PC '{}'.",
                folder_path, pc_name
            ));
        }
    } else {
        return Err(format!(
            "PC entry for IP '{}' and Name '{}' not found.",
            ip, pc_name
        ));
    }

    // Write the updated devices list back to the file
    println!("Updated devices: {:?}", devices);
    let updated_data = serde_json::to_string_pretty(&devices)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(&file_path)
        .map_err(|e| e.to_string())?;
    file.write_all(updated_data.as_bytes())
        .map_err(|e| e.to_string())?;

    println!("Successfully updated network_mapping.json.");
    Ok(())
}

// Function to list folders for a network device
#[tauri::command]
pub async fn scan_network_pc(
    pc_name: String,
    app_handle: AppHandle,
) -> Result<Vec<String>, String> {
    // Construct commands to scan network folders
    let remove_folder_commands = vec![
        format!(
            "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3 -DisableRemediation -File B:\\networkFolders\\{}",
            pc_name
        ),
        format!(
            "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe B:\\networkFolders\\{}",
            pc_name
        ),
        format!(
            "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive B:\\networkFolders\\{}",
            pc_name
        ),
    ];

    // emit app_handle event to show the scan progress
    app_handle
        .emit_all(
            "network_scan_started",
            serde_json::json!({ "pcName": pc_name }),
            )
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    // Execute folder removal commands
    let scan_result = scan(remove_folder_commands, true)
        .await
        .expect("Not able to scan network pc");

    // emit app_handle event to show the scan progress
    app_handle
        .emit_all(
            "network_scan_completed",
            serde_json::json!({ "timestamp": scan_result[3],"pcName":pc_name }),
        )
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    eprintln!("Network scan completed.");
    eprintln!("#########################################################################################################################################################");

    Ok(scan_result)
}

// use audit0::commands::button::execute_command;
// use audit0::commands::button::scan;
// use serde::{Deserialize, Serialize};
// use uuid::Uuid;
// use std::collections::HashMap;
// use std::env;
// use std::fs::{self, File, OpenOptions};
// use std::io::{Read, Write};
// use std::process::Command;
// use std::str;
// use tauri::async_runtime::spawn_blocking;
// // import a constant vec from constants.rs
// // use audit0::utils::constants::NETWORK_DEVICE_ADD;

// // Struct for network device
// #[derive(Serialize, Deserialize, Debug)]
// struct NetworkDevice {
//     ip: String,
//     name: String,
//     folders: HashMap<String, String>,
// }

// // Function to check if the IP is reachable
// fn is_ip_reachable(ip: &str) -> bool {
//     println!("Pinging IP: {}", ip);
//     let output = if cfg!(target_os = "windows") {
//         Command::new("ping").args(["-n", "1", ip]).output()
//     } else {
//         Command::new("ping").args(["-c", "1", ip]).output()
//     };

//     match output {
//         Ok(output) => {
//             println!("Ping output: {:?}", output);
//             output.status.success()
//         }
//         Err(err) => {
//             println!("Ping failed: {}", err);
//             false
//         }
//     }
// }

// // Function to add a network device
// #[tauri::command]
// pub async fn add_network_device(ip: String, name: String) -> Result<String, String> {
//     println!("Adding network device: IP={}, Name={}", ip, name);

//     // Check if the IP is reachable
//     if !is_ip_reachable(&ip) {
//         return Err("Not able to connect to that device".to_string());
//     }

//     // Resolve the file path for network_mapping.json
//     let mut file_path = env::current_dir().map_err(|e| e.to_string())?;
//     file_path.pop();
//     file_path.push("public");
//     file_path.push("network_mapping.json");

//     println!("Network mapping file path: {}", file_path.display());

//     // Ensure the `public` directory exists
//     if !file_path.parent().unwrap().exists() {
//         println!("Creating 'public' directory...");
//         fs::create_dir_all(file_path.parent().unwrap())
//             .map_err(|e| format!("Failed to create directory: {}", e))?;
//     }

//     // Initialize a new device
//     let new_device = NetworkDevice {
//         ip: ip.clone(),
//         name: name.clone(),
//         folders:vec![],
//     };
//     println!("New device: {:?}", new_device);

//     if file_path.exists() {
//         println!("Network mapping file exists. Reading file...");
//         let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
//         let mut contents = String::new();
//         file.read_to_string(&mut contents)
//             .map_err(|e| e.to_string())?;

//         let mut devices: Vec<NetworkDevice> = if contents.trim().is_empty() {
//             vec![]
//         } else {
//             serde_json::from_str(&contents).map_err(|e| e.to_string())?
//         };

//         println!("Existing devices: {:?}", devices);

//         if devices.iter().any(|d| d.ip == ip || d.name == name) {
//             return Err("Device with the same IP or name already exists.".to_string());
//         }

//         println!("Adding new device to the list...");
//         devices.push(new_device);

//         let updated_data = serde_json::to_string_pretty(&devices).map_err(|e| e.to_string())?;
//         File::create(&file_path)
//             .and_then(|mut file| file.write_all(updated_data.as_bytes()))
//             .map_err(|e| e.to_string())?;
//     } else {
//         println!("Network mapping file does not exist. Creating file...");
//         let initial_data = vec![new_device];
//         let json_data = serde_json::to_string_pretty(&initial_data).map_err(|e| e.to_string())?;
//         File::create(&file_path)
//             .and_then(|mut file| file.write_all(json_data.as_bytes()))
//             .map_err(|e| e.to_string())?;
//     }

//     // Create networkFolders folder in the VMs if it does not exist
//     let network_folders_create = vec![
//         format!("VBoxManage guestcontrol Win1 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
//         format!("VBoxManage guestcontrol Win2 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
//         format!("VBoxManage guestcontrol Win3 mkdir B:\\networkFolders --username vboxuser --password abcd79802"),
//         // Add other commands here if needed
//     ];

//     // Execute the commands asynchronously
//     execute_command(network_folders_create).await;

//     // Create a folder for the new device in VMs
//     let network_device_add = vec![
//         format!(
//             "VBoxManage guestcontrol Win1 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name
//         ),
//         format!(
//             "VBoxManage guestcontrol Win3 mkdir B:\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name
//         ),
//         // Add other commands here if needed
//     ];

//     // Execute the commands asynchronously
//     execute_command(network_device_add).await;

//     // Transfer a file from src-tauri/ to the new device folder

//     let local_file_path = "192.168.54.72::system/c/Users/ADMIN/Desktop/MAUT/src-tauri/transfer-script.exe"; // Replace with your file path
//     let rsync_commands = vec![
//         format!(
//             "VBoxManage guestcontrol {} run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} /cygdrive/c/",
//             name, local_file_path,
//         )
//     ];

//     // Execute the file transfer commands
//     execute_command(rsync_commands).await;

//     println!("Device added successfully.");
//     Ok(format!(
//         "Device added successfully and folder created at VMs"
//     ))
// }

// // Function to remove a network device
// #[tauri::command]
// pub async fn remove_network_device(name: String) -> Result<String, String> {
//     println!("Removing network device: Name={}", name);

//     let name_clone = name.clone();
//     let _ = spawn_blocking(move || {
//         let mut file_path = env::current_dir().map_err(|e| e.to_string())?;
//         file_path.pop();
//         file_path.push("public");
//         file_path.push("network_mapping.json");

//         println!("Network mapping file path: {}", file_path.display());

//         if !file_path.exists() {
//             return Err("Network mapping file does not exist.".to_string());
//         }

//         println!("Reading network mapping file...");
//         let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
//         let mut contents = String::new();
//         file.read_to_string(&mut contents)
//             .map_err(|e| e.to_string())?;

//         let mut devices: Vec<NetworkDevice> = if contents.trim().is_empty() {
//             vec![]
//         } else {
//             serde_json::from_str(&contents).map_err(|e| e.to_string())?
//         };

//         println!("Existing devices: {:?}", devices);

//         if let Some(index) = devices.iter().position(|d| d.name == name) {
//             println!("Device found. Removing...");
//             devices.remove(index);

//             let updated_data = serde_json::to_string_pretty(&devices).map_err(|e| e.to_string())?;
//             File::create(&file_path)
//                 .and_then(|mut file| file.write_all(updated_data.as_bytes()))
//                 .map_err(|e| e.to_string())?;
//         } else {
//             return Err("Device not found.".to_string());
//         }

//         Ok(())
//     })
//     .await
//     .map_err(|_| "Task panicked".to_string())?;

//     // Remove the folder from the VMs
//     let network_device_remove = vec![
//         format!(
//             "VBoxManage guestcontrol Win1 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name_clone
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name_clone
//         ),
//         format!(
//             "VBoxManage guestcontrol Win3 rmdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\{} --username vboxuser --password abcd79802",
//             name_clone
//         ),
//         // Add other commands for additional VMs as needed
//     ];

//     execute_command(network_device_remove).await;

//     println!("Device removed successfully.");
//     Ok(format!(
//         "Device {} removed successfully from VMs.",
//         name_clone
//     ))
// }

// // Function to list folders using rsync
// #[tauri::command]
// pub async fn list_folders(path: String) -> Result<Vec<String>, String> {
//     println!("Listing folders at path: {}", path);

//     spawn_blocking(move || {
//         let output = Command::new("rsync").args(["--list-only", &path]).output();

//         match output {
//             Ok(output) if output.status.success() => {
//                 let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
//                 println!("Rsync output: {}", stdout);

//                 // Filter only directories (lines starting with "dr")
//                 let folders = stdout
//                     .lines()
//                     .filter_map(|line| {
//                         // Check if the line starts with "d" (indicating a directory)
//                         if line.starts_with("d") {
//                             // Extract the last whitespace-separated field as the folder name
//                             line.split_whitespace().last().map(|s| s.to_string())
//                         } else {
//                             None
//                         }
//                     })
//                     .collect::<Vec<String>>();

//                 println!("Folders found: {:?}", folders);
//                 Ok(folders)
//             }
//             Ok(output) => {
//                 let stderr = String::from_utf8_lossy(&output.stderr);
//                 println!("Rsync failed: {}", stderr);
//                 Err(format!("Rsync failed: {}", stderr))
//             }
//             Err(err) => {
//                 println!("Failed to execute rsync: {}", err);
//                 Err(format!("Failed to execute rsync: {}", err))
//             }
//         }
//     })
//     .await
//     .map_err(|_| "Task panicked".to_string())?
// }

// // Function to select and copy a network folder
// #[tauri::command]
// pub async fn select_network_folder(
//     ip: String,
//     pc_name: String,
//     remote_folder_name: String,
//     remote_folder_path: String,
// ) -> Result<String, String> {
//     eprintln!(
//         "Selecting network folder: IP={}, PC Name={}, Remote Folder Name={}, Remote Folder Path={}",
//         ip, pc_name, remote_folder_name, remote_folder_path
//     );

//     // Construct the destination path inside the VM
//     let destination_path = format!(
//         "/cygdrive/b/networkFolders/{}/{}",
//         pc_name, remote_folder_name
//     );

//     // Ensure the destination folder exists in the VM
//     let create_folder_commands = vec![
//         format!(
//             "VBoxManage guestcontrol Win1 mkdir {} --username vboxuser --password abcd79802 ",
//             destination_path
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 mkdir {} --username vboxuser --password abcd79802 ",
//             destination_path
//         ),
//         format!(
//             "VBoxManage guestcontrol Win3 mkdir {} --username vboxuser --password abcd79802 ",
//             destination_path
//         ),
//     ];

//     // Execute the folder creation command
//     execute_command(create_folder_commands).await;

//     // Generate a UUID for the folder renaming
//     let uuid = Uuid::new_v4().to_string();
//     let renamed_destination_path = format!("{}/{}", "/cygdrive/b/networkFolders", uuid);

//     // Rename the folder in VM using the UUID
//     let rename_commands = vec![
//         format!("VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ren {} {}", destination_path, renamed_destination_path),
//         format!("VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ren {} {}", destination_path, renamed_destination_path),
//         format!("VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ren {} {}", destination_path, renamed_destination_path),
//     ];

//     // Execute the rename command
//     execute_command(rename_commands).await;

//     // Construct the rsync command
//     let rsync_commands = vec![format!(
//         "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
//         remote_folder_path, renamed_destination_path
//     ),format!(
//         "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
//         remote_folder_path, renamed_destination_path
//     ),format!(
//         "VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c rsync -avh {} {}",
//         remote_folder_path, renamed_destination_path
//     )];

//     // Execute the rsync command
//     execute_command(rsync_commands).await;

//     // Add the folder to the network_mapping.json
//     if let Err(err) = add_folder_to_network_mapping(&ip, &pc_name, &renamed_destination_path, &uuid) {
//         return Err(format!("Failed to update network_mapping.json: {}", err));
//     }

//     println!("Folder successfully copied to VM and added to network mapping.");
//     Ok(format!(
//         "Folder '{}' from '{}' copied successfully to '{}'. Renamed with UUID: {}",
//         remote_folder_name, ip, renamed_destination_path, uuid
//     ))
// }

// // Adds the folder path to the network_mapping.json file under the respective PC entry.
// fn add_folder_to_network_mapping(ip: &str, pc_name: &str, folder_path: &str, uuid: &str) -> Result<(), String> {
//     // Resolve the file path for network_mapping.json
//     let mut file_path = std::env::current_dir().map_err(|e| e.to_string())?;
//     file_path.pop(); // Move up one directory level
//     file_path.push("public");
//     file_path.push("network_mapping.json");

//     println!("Updating network_mapping.json at: {}", file_path.display());

//     // Read the existing JSON file or create an empty list if it doesn't exist
//     let mut devices: Vec<NetworkDevice> = if file_path.exists() {
//         let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
//         let mut contents = String::new();
//         file.read_to_string(&mut contents)
//             .map_err(|e| e.to_string())?;

//         if contents.trim().is_empty() {
//             vec![]
//         } else {
//             serde_json::from_str(&contents).map_err(|e| e.to_string())?
//         }
//     } else {
//         vec![]
//     };

//     println!("Existing devices before update: {:?}", devices);

//     // Find the PC entry and update its folders map
//     if let Some(pc_entry) = devices
//         .iter_mut()
//         .find(|entry| entry.ip == ip && entry.name == pc_name)
//     {
//         println!("Found PC entry: {:?}", pc_entry);
//         if pc_entry.folders.contains_key(uuid) {
//             println!("UUID '{}' already exists in the PC entry.", uuid);
//         } else {
//             println!(
//                 "Adding folder path '{}' with UUID '{}' to PC entry.",
//                 folder_path, uuid
//             );
//             pc_entry.folders.insert(uuid.to_string(), folder_path.to_string());
//         }
//     } else {
//         return Err(format!(
//             "PC entry for IP '{}' and Name '{}' not found.",
//             ip, pc_name
//         ));
//     }

//     // Write the updated devices list back to the file
//     println!("Updated devices: {:?}", devices);
//     let updated_data = serde_json::to_string_pretty(&devices)
//         .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
//     let mut file = OpenOptions::new()
//         .write(true)
//         .truncate(true)
//         .open(&file_path)
//         .map_err(|e| e.to_string())?;
//     file.write_all(updated_data.as_bytes())
//         .map_err(|e| e.to_string())?;

//     println!("Successfully updated network_mapping.json.");
//     Ok(())
// }

// // Function to remove a network folder
// #[tauri::command]
// pub async fn remove_folder(
//     ip: String,
//     pc_name: String,
//     remote_folder_name: String,
// ) -> Result<String, String> {
//     println!(
//         "Removing folder: IP={}, PC Name={}, Folder Path={}",
//         ip, pc_name, remote_folder_name
//     );

//     // remove folder from Vms that will be on C://
//     let destination_path = format!(
//         "/cygdrive/b/networkFolders/{}/{}",
//         pc_name, remote_folder_name
//     );

//     // Construct commands to remove the folder from VMs
//     let remove_folder_commands = vec![
//         format!(
//             "VBoxManage guestcontrol Win1 rmdir {} --username vboxuser --password abcd79802 --recursive",
//             destination_path
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 rmdir {} --username vboxuser --password abcd79802 --recursive",
//             destination_path
//         ),
//         format!(
//             "VBoxManage guestcontrol Win3 rmdir {} --username vboxuser --password abcd79802 --recursive",
//             destination_path
//         ),
//     ];

//     // Execute folder removal commands
//     execute_command(remove_folder_commands).await;

//     println!("Folder removed from VMs. Updating network_mapping.json...");

//     // Remove folder path from network_mapping.json
//     if let Err(err) = remove_folder_from_network_mapping(&ip, &pc_name, &destination_path) {
//         return Err(format!("Failed to update network_mapping.json: {}", err));
//     }

//     println!("Folder removed successfully from network mapping.");
//     Ok(format!(
//         "Folder '{}' removed successfully from VMs and network mapping.",
//         destination_path
//     ))
// }

// /// Removes the folder path from the network_mapping.json file under the respective PC entry.
// fn remove_folder_from_network_mapping(
//     ip: &str,
//     pc_name: &str,
//     folder_path: &str,
// ) -> Result<(), String> {
//     // Resolve the file path for network_mapping.json
//     let mut file_path = std::env::current_dir().map_err(|e| e.to_string())?;
//     file_path.pop(); // Move up one directory level
//     file_path.push("public");
//     file_path.push("network_mapping.json");

//     println!("Updating network_mapping.json at: {}", file_path.display());

//     // Read the existing JSON file
//     let mut devices: Vec<NetworkDevice> = if file_path.exists() {
//         let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
//         let mut contents = String::new();
//         file.read_to_string(&mut contents)
//             .map_err(|e| e.to_string())?;

//         if contents.trim().is_empty() {
//             vec![]
//         } else {
//             serde_json::from_str(&contents).map_err(|e| e.to_string())?
//         }
//     } else {
//         return Err("Network mapping file does not exist.".to_string());
//     };

//     println!("Existing devices before update: {:?}", devices);

//     // Find the PC entry and update its folders list
//     if let Some(pc_entry) = devices
//         .iter_mut()
//         .find(|entry| entry.ip == ip && entry.name == pc_name)
//     {
//         println!("Found PC entry: {:?}", pc_entry);
//         if let Some(key) = pc_entry.folders.keys().find(|&&ref f| f == folder_path).cloned() {
//             println!("Removing folder path '{}' from PC entry.", folder_path);
//             pc_entry.folders.remove(&key);
//         } else {
//             println!("Folder path '{}' not found in the PC entry.", folder_path);
//             return Err(format!(
//                 "Folder path '{}' not found for PC '{}'.",
//                 folder_path, pc_name
//             ));
//         }
//     } else {
//         return Err(format!(
//             "PC entry for IP '{}' and Name '{}' not found.",
//             ip, pc_name
//         ));
//     }

//     // Write the updated devices list back to the file
//     println!("Updated devices: {:?}", devices);
//     let updated_data = serde_json::to_string_pretty(&devices)
//         .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
//     let mut file = OpenOptions::new()
//         .write(true)
//         .truncate(true)
//         .open(&file_path)
//         .map_err(|e| e.to_string())?;
//     file.write_all(updated_data.as_bytes())
//         .map_err(|e| e.to_string())?;

//     println!("Successfully updated network_mapping.json.");
//     Ok(())
// }

// // Function to list folders for a network device
// #[tauri::command]
// pub async fn scan_network_pc(pc_name: String) -> Result<Vec<String>, String> {
//     // Construct commands to scan network folders
//     let remove_folder_commands = vec![
//         format!(
//             "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3 -DisableRemediation -File B:\\networkFolders\\{}",
//             pc_name
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe B:\\networkFolders\\{}",
//             pc_name
//         ),
//         format!(
//             "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive B:\\networkFolders\\{}",
//             pc_name
//         ),
//     ];

//     // Execute folder removal commands
//     let scan_result: Result<Vec<String>, String> = scan(remove_folder_commands, true).await;

//     eprintln!("Network scan completed.");
//     eprintln!("#########################################################################################################################################################");

//     scan_result
// }
