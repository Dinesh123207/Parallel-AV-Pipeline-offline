use audit0::commands::button::{execute_commands, scan};
use futures::{SinkExt, StreamExt};
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde_json::Value;
// use serde_json::Value;
use serde_json::to_string;
use std::{
    collections::{HashMap, HashSet},
    env, fs,
    path::Path,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;
use tungstenite::protocol::Message;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // websocket client initialization
    let url = "ws://127.0.0.1:8008";
    let (ws_stream, _) = connect_async(url)
        .await
        .expect("Failed to connect to WebSocket server");

    let (mut write, _) = ws_stream.split();

    // print to confirm websocket connection
    println!("Connected to WebSocket server");

    // Define the path to the JSON file
    let json_file_path = env::current_dir()
        .unwrap()
        .join("..\\public\\selected_paths.json");

    // Shared folder paths set
    let folder_paths = Arc::new(Mutex::new(HashSet::new()));
    let folder_paths_clone = Arc::clone(&folder_paths);

    // Thread for monitoring changes in the JSON file
    thread::spawn(move || {
        loop {
            let paths = read_folder_paths(json_file_path.to_str().unwrap());
            if let Ok(new_paths) = paths {
                let mut folder_paths = folder_paths_clone.lock().unwrap();
                // Update the set of folder paths dynamically
                if *folder_paths != new_paths {
                    println!("Updated folder paths: {:?}", new_paths);
                    *folder_paths = new_paths;
                }
            } else {
                eprintln!("Failed to read or parse JSON file.");
            }
            thread::sleep(Duration::from_secs(5)); // Adjust frequency as needed
        }
    });

    // Create a channel for communication between watcher and async logic
    let (tx, mut rx) = mpsc::channel::<Event>(100);

    // Create a watcher instance
    let folder_paths_clone = Arc::clone(&folder_paths);
    tokio::spawn(async move {
        let mut watcher: RecommendedWatcher = Watcher::new(
            move |res: Result<Event, notify::Error>| {
                if let Ok(event) = res {
                    let _ = tx.blocking_send(event); // Send event to the async channel
                }
            },
            notify::Config::default(),
        )
        .unwrap();

        let mut watched_paths = HashSet::new();
        loop {
            let folder_paths = folder_paths_clone.lock().unwrap().clone();
            for path in &folder_paths {
                if !watched_paths.contains(path) {
                    let path = Path::new(path);
                    if watcher.watch(path, RecursiveMode::Recursive).is_ok() {
                        println!("Started monitoring folder: {}", path.display());
                        watched_paths.insert(path.to_string_lossy().to_string());
                    } else {
                        eprintln!("Failed to monitor folder: {}", path.display());
                    }
                }
            }

            // Remove folders no longer in the list
            for path in watched_paths.clone() {
                if !folder_paths.contains(&path) {
                    let path = Path::new(&path);
                    if watcher.unwatch(path).is_ok() {
                        println!("Stopped monitoring folder: {}", path.display());
                        watched_paths.remove(&path.to_string_lossy().to_string());
                    }
                }
            }

            tokio::time::sleep(Duration::from_secs(5)).await; // Adjust frequency as needed
        }
    });

    // Process events asynchronously
    while let Some(event) = rx.recv().await {
        if let Some(path) = event.paths.get(0) {
            println!("{:?}", event);
            if let Some(change_directory) = path.to_str() {
                let mut parts: Vec<&str> = change_directory.split('\\').collect();

                // Define the path to the path_mapping.json file
                let path_mapping_file_path = env::current_dir()
                    .unwrap()
                    .join("..\\public\\path_mapping.json");

                // Read the path_mapping.json file
                let path_mapping: HashMap<String, String> = if path_mapping_file_path.exists() {
                    match fs::read_to_string(&path_mapping_file_path) {
                        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
                        Err(e) => {
                            eprintln!("Failed to read `path_mapping.json`: {:?}", e);
                            HashMap::new()
                        }
                    }
                } else {
                    eprintln!("`path_mapping.json` does not exist.");
                    HashMap::new()
                };

                let mut found_uuid = None;

                // Search for the UUID by progressively reducing the path
                while parts.len() > 1 {
                    // Check if the current path exists in the path_mapping
                    let current_path: String = parts.join("\\");

                    if let Some(uuid) = path_mapping.iter().find_map(|(key, value)| {
                        if value == &current_path {
                            Some(key.clone())
                        } else {
                            None
                        }
                    }) {
                        found_uuid = Some(uuid);
                        break;
                    }

                    // Remove the last segment and continue
                    parts.pop();
                }

                match found_uuid {
                    Some(uuid) => {
                        println!("Found UUID: {}", &uuid);

                        let current_path: String = parts.join("\\");

                        let (all_paths, total_size) =
                            list_all_files_and_dirs_with_size(&current_path)
                                .unwrap_or_else(|_| (vec![], 0.0));
                        // println!("All paths with size: {:?}", all_paths);
                        println!("Total size: {}", total_size);

                        // let current_path: String = parts.join("\\");

                        // let get_space = vec![format!(
                        //     "powershell -command \"& {{ $size = (Get-ChildItem -Path '{}' -Recurse | Measure-Object -Property Length -Sum).Sum; Write-Output $size }}\"",
                        //     current_path
                        // )];

                        // Execute `get_space` command to calculate storage size
                        // let space_result = execute_commands(vec![get_space_command])
                        //     .await
                        //     .unwrap_or_else(|_| vec!["0".to_string()]); // Default to "0" on failure

                        // let space = space_result
                        //     .get(0)
                        //     .cloned()
                        //     .unwrap_or_else(|| "0".to_string());
                        // let dir_command = vec![format!(r"dir -r {}", current_path)];
                        // let space_result = execute_commands(get_space)
                        //     .await
                        //     .unwrap_or_else(|_| vec!["0".to_string()]);

                        // let dirs_result = execute_commands(dir_command)
                        //     .await
                        //     .unwrap_or_else(|_| vec!["0".to_string()]);

                        // let space = space_result
                        //     .get(0)
                        //     .cloned()
                        //     .unwrap_or_else(|| "0".to_string())
                        //     .replace("\r\n", "");

                        // let dirs = dirs_result
                        //     .get(0)
                        //     .cloned()
                        //     .unwrap_or_else(|| "0".to_string())
                        //     .replace("\r\n", "");

                        // Simulate broadcasting the `scan_started` event
                        // let payload = format!(
                        //     r#"{{"event": "scan_started", "data": {{ "uuid": "{}", "dirs": "{}", "storage": "{}" }} }}"#,
                        //     uuid, dirs, space
                        // );

                        let all_paths_json =
                            to_string(&all_paths).expect("Failed to serialize all_paths to JSON");
                        let payload = format!(
                            r#"{{"event": "scan_started", "data": {{ "uuid": "{}", "dirs": {}, "storage": "{}" }} }}"#,
                            uuid, all_paths_json, total_size
                        );

                        // Send the payload via WebSocket after results are fully fetched
                        write.send(Message::text(payload)).await?;

                        let av_commands = vec![
                            r"VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3  -DisableRemediation -File \\VBOXSVR\share",
                            r"VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe \\VBOXSVR\share",
                            r"VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive --disable-cache \\VBOXSVR\share",
                            r"VBoxManage guestcontrol Win4 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd.exe /c avp.com scan \\VBOXSVR\share",
                        ];

                        // Append the change directory path to the AV commands
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
                                let payload = format!(
                                    r#"{{"event": "scan_complete", "timestamp": {}}}"#,
                                    serde_json::to_string(&final_results[4]).unwrap()
                                );

                                // Send the payload via WebSocket after results are fully fetched
                                if let Err(err) = write.send(Message::text(payload)).await {
                                    eprintln!("Failed to send message: {}", err);
                                }

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
                    None => {
                        println!("No matching UUID found for the path.");
                    }
                }
            }
        }
    }

    Ok(())
}

/// Reads folder paths from a JSON file.
fn read_folder_paths(json_path: &str) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
    let data = fs::read_to_string(json_path)?;
    let json: Value = serde_json::from_str(&data)?;
    let paths = json["paths"]
        .as_array()
        .ok_or("Expected 'paths' to be an array")?
        .iter()
        .filter_map(|v| v.as_str().map(String::from))
        .collect();
    Ok(paths)
}

// fn get_folder_info(path: &str) -> Result<(f64, Vec<String>), Box<dyn std::error::Error>> {
//     let path = Path::new(path);

//     // Check if the given path is a directory
//     if !path.is_dir() {
//         return Err(std::io::Error::new(
//             std::io::ErrorKind::NotFound,
//             "Provided path is not a directory",
//         ).into());
//     }

//     let mut total_size = 0;
//     let mut entries: Vec<String> = Vec::new();

//     // Iterate through the directory contents
//     for entry in fs::read_dir(path)? {
//         let entry = entry?;
//         let entry_path = entry.path();

//         // Collect the file/directory names
//         entries.push(entry.file_name().into_string().unwrap_or_else(|_| String::new()));

//         // If it's a file, add its size to total_size
//         if entry_path.is_file() {
//             total_size += entry.metadata()?.len();
//         }
//     }

//     let total_size_mb = total_size as f64 / (1024.0 * 1024.0);

//     Ok((total_size_mb, entries))
// }

// fn list_all_files_and_dirs(path: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
//     let path = Path::new(path);

//     // Check if the given path is a directory
//     if !path.is_dir() {
//         return Err(std::io::Error::new(
//             std::io::ErrorKind::NotFound,
//             "Provided path is not a directory",
//         ).into());
//     }

//     let mut all_paths: Vec<String> = Vec::new();

//     // Recursively iterate through the directory contents
//     fn visit_dirs(dir: &Path, all_paths: &mut Vec<String>) -> std::io::Result<()> {
//         if dir.is_dir() {
//             for entry in fs::read_dir(dir)? {
//                 let entry = entry?;
//                 let path = entry.path();
//                 if path.is_dir() {
//                     visit_dirs(&path, all_paths)?;
//                 }
//                 all_paths.push(path.to_string_lossy().to_string());
//             }
//         }
//         Ok(())
//     }

//     visit_dirs(path, &mut all_paths)?;

//     Ok(all_paths)
// }

fn list_all_files_and_dirs_with_size(
    path: &str,
) -> Result<(Vec<String>, f64), Box<dyn std::error::Error>> {
    let path = Path::new(path);

    // Check if the given path is a directory
    if !path.is_dir() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Provided path is not a directory",
        )
        .into());
    }

    let mut all_paths: Vec<String> = Vec::new();
    let mut total_size: u64 = 0;

    // Recursively iterate through the directory contents and calculate size
    fn visit_dirs(
        dir: &Path,
        all_paths: &mut Vec<String>,
        total_size: &mut u64,
    ) -> std::io::Result<()> {
        if dir.is_dir() {
            for entry in fs::read_dir(dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.is_dir() {
                    visit_dirs(&path, all_paths, total_size)?;
                } else if path.is_file() {
                    *total_size += fs::metadata(&path)?.len(); // Add file size
                }
                all_paths.push(path.to_string_lossy().to_string());
            }
        }
        Ok(())
    }

    visit_dirs(path, &mut all_paths, &mut total_size)?;

    // convert the total size to MB
    let total_size_mb = total_size as f64 / (1024.0 * 1024.0);

    Ok((all_paths, total_size_mb))
}
