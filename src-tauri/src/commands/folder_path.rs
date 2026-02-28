use audit0::commands::button::scan;
use audit0::share_state::CLIENTS;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use std::collections::HashMap;
use std::env;
use std::fs::{self, File, OpenOptions};
use std::io::{BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};
use tauri::{api::dialog::FileDialogBuilder, command};
use tungstenite::protocol::Message;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
struct PathList {
    paths: Vec<String>,
}

#[command]
pub async fn open_folder_dialog() -> Result<String, String> {
    // Use a channel to wait for the callback result
    let (sender, receiver) = tokio::sync::oneshot::channel();

    FileDialogBuilder::new()
        .add_filter("Directories", &["."])
        .pick_folder(move |selected_folder| {
            let _ = sender.send(selected_folder);
        });

    // Await the result from the folder picker dialog
    match receiver.await {
        Ok(Some(selected_folder)) => Ok(selected_folder.to_string_lossy().to_string()),
        Ok(None) => Err("No folder was selected".to_string()),
        Err(_) => Err("Failed to receive folder selection".to_string()),
    }
}

#[command]
fn save_path_to_json(new_path: &str) -> Result<bool, String> {
    let file_path = env::current_dir()
        .unwrap()
        .join("..\\public\\")
        .join("selected_paths.json");

    // Ensure the directory exists
    if let Some(parent_dir) = file_path.parent() {
        if !parent_dir.exists() {
            println!(
                "Directory does not exist. Creating directory: {:?}",
                parent_dir
            );
            fs::create_dir_all(parent_dir).map_err(|e| {
                println!("Failed to create directory: {:?}", e);
                "Failed to create directory".to_string()
            })?;
        }
    }

    // Read the current paths from the file
    let mut path_list = if file_path.exists() {
        match fs::read_to_string(&file_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or(PathList { paths: vec![] }),
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                PathList { paths: vec![] }
            }
        }
    } else {
        println!("File does not exist. Initializing new path list.");
        PathList { paths: vec![] }
    };

    if !path_list.paths.contains(&new_path.to_string()) {
        path_list.paths.push(new_path.to_string());
    } else {
        println!("Path already exists in the JSON file.");
        return Ok(false);
    }

    let json_content = serde_json::to_string_pretty(&path_list).map_err(|e| {
        println!("Serialization error: {:?}", e);
        "Failed to serialize paths".to_string()
    })?;

    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&file_path)
        .map_err(|e| {
            println!("Failed to open file: {:?}", e);
            "Failed to open file".to_string()
        })?;

    file.write_all(json_content.as_bytes()).map_err(|e| {
        println!("Write error: {:?}", e);
        "Failed to write to file".to_string()
    })?;

    println!("Successfully saved path to JSON.");

    Ok(true)
}

fn handle_uuid_and_mapping(
    symlinks_folder: &PathBuf,
    symlink_path: &PathBuf,
    target_directory: &Path,
) -> Result<String, String> {
    // Generate a UUID and rename the symlink folder with the UUID
    let uuid: String = Uuid::new_v4().to_string();
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
        let file = File::open(&file_path).map_err(|e| {
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
    mappings.insert(uuid.clone(), target_directory.to_string_lossy().to_string());

    // Write the updated mappings back to the file
    let file = File::create(&file_path).map_err(|e| {
        println!("Failed to create mapping file: {:?}", e);
        "Failed to create mapping file".to_string()
    })?;
    let writer = BufWriter::new(file);
    serde_json::to_writer_pretty(writer, &mappings).map_err(|e| {
        println!("Failed to write mappings to file: {:?}", e);
        "Failed to write mappings to file".to_string()
    })?;

    println!("Mapping updated in {:?}", file_path);

    Ok(uuid)
}

#[command]
pub fn create_symlink(path: &str) -> Result<String, String> {
    #[cfg(unix)]
    use std::os::unix::fs::symlink; // Use for Unix-based systems
    #[cfg(windows)]
    use std::os::windows::fs::symlink_dir; // Use for Windows

    // Get the current directory and create/join the 'symlinks' folder
    let symlinks_folder = env::current_dir().unwrap().join("symlinks");

    // Ensure the symlinks folder exists
    if !symlinks_folder.exists() {
        fs::create_dir_all(&symlinks_folder).map_err(|e| {
            println!("Failed to create 'symlinks' directory: {:?}", e);
            "Failed to create 'symlinks' directory".to_string()
        })?;
    }

    // Define the target directory and the symlink path
    let target_directory = Path::new(path);
    if !target_directory.is_dir() {
        return Err("Provided path is not a valid directory".to_string());
    }

    let symlink_name = target_directory
        .file_name()
        .ok_or("Failed to determine symlink name from the path")?;
    let symlink_path = symlinks_folder.join(symlink_name);

    // Create the symlink based on the operating system
    #[cfg(unix)]
    {
        symlink(target_directory, &symlink_path).map_err(|e| {
            println!("Failed to create symlink: {:?}", e);
            "Failed to create symlink".to_string()
        })?;
    }

    #[cfg(windows)]
    {
        symlink_dir(target_directory, &symlink_path).map_err(|e| {
            println!("Failed to create symlink: {:?}", e);
            "Failed to create symlink".to_string()
        })?;
    }

    println!("Symlink created at {:?}", symlink_path);

    // Handle UUID generation and mapping
    let uuid = handle_uuid_and_mapping(&symlinks_folder, &symlink_path, target_directory)?;

    Ok(uuid)
}

#[tauri::command]
pub async fn get_absolute_path(directory: String, app_handle: AppHandle) -> Result<String, String> {
    let path = Path::new(&directory);
    if path.is_dir() {
        // Return the absolute path
        match fs::canonicalize(path) {
            Ok(absolute_path) => {
                println!("Absolute path obtained: {:?}", absolute_path);
                let abs_path_str = absolute_path
                    .to_string_lossy()
                    .trim_start_matches(r"\\?\")
                    .to_string();
                let success = save_path_to_json(&abs_path_str)?;

                if success {
                    match create_symlink(&abs_path_str) {
                        Ok(uuid) => {
                            // Simulate broadcasting the `scan_started` event
                            // let payload = format!(
                            //     r#"{{"event": "scan_started", "data": {{ "uuid": "{}" }} }}"#,
                            //     uuid
                            // );

                            // let client_txs: Vec<_> = {
                            //     let clients = CLIENTS.lock().unwrap();
                            //     clients.values().cloned().collect()
                            // };
                            // for client_tx in client_txs {
                            //     if let Err(e) = client_tx.send(Message::text(payload.clone())) {
                            //         println!("Failed to send message: {:?}", e);
                            //     }
                            // }


                            app_handle.emit_all("scan_started", serde_json::json!({ "uuid": uuid })).unwrap();

                            // run scan
                            // Append the change directory path to the AV commands
                            let av_commands = vec![
                                r"VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3  -DisableRemediation -File \\VBOXSVR\share",
                                r"VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe \\VBOXSVR\share",
                                r"VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive \\VBOXSVR\share",
                            ];
                            let av_commands = av_commands
                                .iter()
                                .map(|cmd| format!("{}\\{}", cmd, uuid))
                                .collect::<Vec<String>>();

                            println!("Scanning with AV commands: {:?}", av_commands);
                            // Run the scan function asynchronously
                            match scan(av_commands, false).await {
                                Ok(final_results) => {
                                    // Simulate broadcasting the `scan_complete` event
                                    eprintln!("result: {:?}", final_results);
                                    
                                    app_handle.emit_all("scan_completed", serde_json::json!({ "timestamp": final_results[3] })).unwrap();

                                    for result in final_results {
                                        println!("{}", result);
                                    }
                                }
                                Err(err) => {
                                    eprintln!("Error during scan: {}", err);
                                }
                            }

                            eprintln!("Scan Completed");
                            eprintln!("###################################################################################################################################################################################################################################################################################################################");
                        }
                        Err(err) => {
                            println!("{}", err);
                        }
                    }
                }
                // Save the absolute path to the JSON file
                Ok(abs_path_str)
            }
            Err(_) => Err("Failed to get absolute path".to_string()),
        }
    } else {
        Err("Provided path is not a directory".to_string())
    }
}

#[command]
pub fn remove_folder_path(directory: String) -> Result<(), String> {
    println!(
        "Removing path from JSON and symlinks folder: {:?}",
        directory
    );

    // Define the file path for `selected_paths.json` and `path_mapping.json`
    let current_dir = env::current_dir().unwrap();
    let selected_paths_file_path = current_dir.join("..\\public\\").join("selected_paths.json");
    let path_mapping_file_path = current_dir.join("..\\public\\").join("path_mapping.json");

    // Read the `selected_paths.json` file
    let mut path_list = if selected_paths_file_path.exists() {
        match fs::read_to_string(&selected_paths_file_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or(PathList { paths: vec![] }),
            Err(e) => {
                println!("Failed to read file: {:?}", e);
                PathList { paths: vec![] }
            }
        }
    } else {
        println!("File does not exist. Initializing new path list.");
        PathList { paths: vec![] }
    };

    // Remove the directory from the `selected_paths.json` file
    if path_list.paths.contains(&directory) {
        path_list.paths.retain(|x| x != &directory);
    } else {
        println!("Path does not exist in the `selected_paths.json` file.");
    }

    // Write the updated `selected_paths.json`
    let json_content = serde_json::to_string_pretty(&path_list).map_err(|e| {
        println!("Serialization error: {:?}", e);
        "Failed to serialize paths".to_string()
    })?;

    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&selected_paths_file_path)
        .map_err(|e| {
            println!("Failed to open file: {:?}", e);
            "Failed to open file".to_string()
        })?;

    file.write_all(json_content.as_bytes()).map_err(|e| {
        println!("Write error: {:?}", e);
        "Failed to write to file".to_string()
    })?;

    println!("Successfully removed path from `selected_paths.json`.");

    // Read the `path_mapping.json` file
    let mut path_mapping: HashMap<String, String> = if path_mapping_file_path.exists() {
        match fs::read_to_string(&path_mapping_file_path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or(HashMap::new()),
            Err(e) => {
                println!("Failed to read `path_mapping.json`: {:?}", e);
                HashMap::new()
            }
        }
    } else {
        println!("`path_mapping.json` does not exist. Initializing new mapping.");
        HashMap::new()
    };

    // Find and remove the corresponding symlink and its mapping
    let mut removed_uuid = None;

    for (uuid, path) in &path_mapping {
        if path == &directory {
            removed_uuid = Some(uuid.clone());
            break;
        }
    }

    if let Some(uuid) = removed_uuid {
        // Remove the mapping
        path_mapping.remove(&uuid);

        // Remove the symlink
        let symlink_path = current_dir.join("symlinks").join(&uuid);
        if symlink_path.exists() {
            println!("Removing symlink: {:?}", symlink_path);
            if symlink_path.is_dir() || symlink_path.is_file() {
                fs::remove_dir_all(&symlink_path).map_err(|e| {
                    println!("Failed to remove symlink: {:?}", e);
                    "Failed to remove symlink".to_string()
                })?;
            } else {
                println!("The path is not a valid symlink: {:?}", symlink_path);
            }
        } else {
            println!("Symlink not found: {:?}", symlink_path);
        }
    } else {
        println!("Mapping for directory not found in `path_mapping.json`.");
    }

    // Write the updated `path_mapping.json`
    let mapping_json_content = serde_json::to_string_pretty(&path_mapping).map_err(|e| {
        println!("Serialization error: {:?}", e);
        "Failed to serialize path mappings".to_string()
    })?;

    let mut mapping_file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path_mapping_file_path)
        .map_err(|e| {
            println!("Failed to open `path_mapping.json`: {:?}", e);
            "Failed to open mapping file".to_string()
        })?;

    mapping_file
        .write_all(mapping_json_content.as_bytes())
        .map_err(|e| {
            println!("Write error: {:?}", e);
            "Failed to write to mapping file".to_string()
        })?;

    println!("Successfully removed mapping from `path_mapping.json`.");
    Ok(())
}
