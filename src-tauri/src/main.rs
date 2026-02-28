#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod commands;
use audit0::commands::logs_parser;
use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use std::process::Command;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::protocol::Message;

type Clients = Arc<Mutex<HashMap<String, mpsc::UnboundedSender<Message>>>>;

#[tokio::main]
async fn main() {
    // Shared client map for broadcasting
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));

    // Spawn the WebSocket server
    tokio::spawn({
        let clients = clients.clone();
        async move {
            let addr = "0.0.0.0:8008"; // Set your desired WebSocket server address
            let listener = TcpListener::bind(addr)
                .await
                .expect("Failed to bind WebSocket server");
            println!("WebSocket server listening on {}", addr);

            while let Ok((stream, _)) = listener.accept().await {
                let clients = clients.clone();
                tokio::spawn(async move {
                    let ws_stream = accept_async(stream).await.expect("Error during handshake");
                    println!("New WebSocket connection established!");

                    let (mut write, mut read) = ws_stream.split();

                    // Create a channel for the client
                    let (tx, mut rx) = mpsc::unbounded_channel();
                    let client_id = uuid::Uuid::new_v4().to_string();
                    clients.lock().unwrap().insert(client_id.clone(), tx);

                    // Handle outgoing messages to the client
                    tokio::spawn(async move {
                        while let Some(msg) = rx.recv().await {
                            let _ = write.send(msg).await;
                        }
                    });

                    // Handle incoming messages from the client
                    while let Some(Ok(msg)) = read.next().await {
                        if msg.is_text() || msg.is_binary() {
                            println!("Received message: {}", msg);

                            // Broadcast the message to all clients
                            let clients = clients.lock().unwrap();
                            for (id, client_tx) in clients.iter() {
                                if id != &client_id {
                                    let _ = client_tx
                                        .send(Message::text(msg.to_text().unwrap().to_string()));
                                }
                            }
                        }
                    }

                    // Remove the client on disconnect
                    clients.lock().unwrap().remove(&client_id);
                    println!("Client {} disconnected", client_id);
                });
            }
        }
    });

    // Spawn the folder monitor binary
    // std::thread::spawn(|| {
    //     println!("Starting folder monitor process...");
    //     let result = Command::new("folder_monitor")
    //         .spawn()
    //         .expect("Failed to start folder monitor process");
    //     println!("Folder monitor started with PID: {}", result.id());
    // });

//     let parsed_log = logs_parser::avg_parser("*
//         * AVG Scan Report
//         * This file is generated automatically
//         *
//         * Scan name: aswcmd.exe
//         * Started on: 12 December 2024 01:52:11
//         * VPS: 241211-6, 12/11/2024
//         *

//         Infected files: 0
//         Total files: 13
//         Total folders: 1
//         Total size: 2.7 MB

//         *
//         * Scan stopped: 12 December 2024 01:52:11
//         * Run-time was 0 second(s)
//         *
//         ");
//     println!("{:?}", parsed_log);

// let kaspersky = logs_parser::kaspersky_parser(r#"
//     ; --- Settings ---
// ; Action on detect:	Ask after scan
// ; Scan objects:	All objects
// ; Use iChecker:	Yes
// ; Use iSwift:	Yes
// ; Try disinfect:	Yes
// ; Try delete:	Yes
// ; Try delete container:	No
// ; Scan archives:	No
// ; Exclude by mask:	No
// ; Include by mask:	No
// ; Objects to scan:	
// ; 	//"E:\Wallpaper\"	Enable = Yes	Recursive = Yes
// ; ------------------
// 2024-12-12 02:19:13	Scan_Objects$0026                          starting   1%         
// 2024-12-12 02:19:13	E:\Wallpaper\1340763.jpeg:Zone.Identifier	ok
// 2024-12-12 02:19:13	E:\Wallpaper\1340763.jpeg	ok
// 2024-12-12 02:19:13	E:\Wallpaper\eicar_com.zip:Zone.Identifier	ok
// 2024-12-12 02:19:13 	E:\Wallpaper\eicar_com.zip	archive	ZIP
// 2024-12-12 02:19:13	E:\Wallpaper\goku1.jpg:Zone.Identifier	ok
// 2024-12-12 02:19:13	E:\Wallpaper\goku1.jpg	ok
// 2024-12-12 02:19:13	E:\Wallpaper\itachi.jpg:Zone.Identifier	ok
// 2024-12-12 02:19:13	E:\Wallpaper\itachi.jpg	ok
// 2024-12-12 02:19:13	E:\Wallpaper\ScanReport.txt	ok
// 2024-12-12 02:19:13	E:\Wallpaper\wp12592688-gojo-satoru-desktop-4k-wallpapers.jpg:Zone.Identifier	ok
// 2024-12-12 02:19:13	E:\Wallpaper\wp12592688-gojo-satoru-desktop-4k-wallpapers.jpg	ok
// 2024-12-12 02:19:13	E:\Wallpaper\wp13408897-gojo-anime-hd-wallpapers.jpg:Zone.Identifier	ok
// 2024-12-12 02:19:13	E:\Wallpaper\wp13408897-gojo-anime-hd-wallpapers.jpg	ok
// 2024-12-12 02:19:13	Scan_Objects$0026                          running    99%        
// 2024-12-12 02:19:14 	E:\Wallpaper\eicar_com.zip//eicar.com	detected	EICAR-Test-File
// 2024-12-12 02:19:14	E:\Wallpaper\eicar_com.zip//eicar.com	postponed
// 2024-12-12 02:19:15 	E:\Wallpaper\eicar_com.zip	archive	ZIP
// 2024-12-12 02:19:23	E:\Wallpaper\eicar_com.zip	was saved in the backup storage
// 2024-12-12 02:19:23	E:\Wallpaper\eicar_com.zip//eicar.com	can't be disinfected: noncurable
// 2024-12-12 02:19:23	E:\Wallpaper\eicar_com.zip//eicar.com	was deleted
// 2024-12-12 02:19:23	Scan_Objects$0026                          completed             
// ;  --- Statistics ---
// ; Time Start:	2024-12-12 02:19:13
// ; Time Finish:	2024-12-12 02:19:23
// ; Processed objects:	14
// ; Total OK:	13
// ; Total detected:	1
// ; Suspicions:	0
// ; Total skipped:	0
// ; Password protected:	0
// ; Corrupted:	0
// ; Errors:	0
// ;  ------------------
// "#);

// println!("\n\n\n {:?} \n\n\n", kaspersky);



    // Run the Tauri application
    tauri::Builder::default()
        // .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::button::scan,
            commands::button::execute_commands,
            commands::folder_path::open_folder_dialog,
            commands::folder_path::get_absolute_path,
            commands::folder_path::remove_folder_path,
            commands::logs::generate_logs,
            commands::full_scan::scan_all_drives,
            commands::network::list_folders,
            commands::network::add_network_device,
            commands::network::remove_network_device,
            commands::network::select_network_folder,
            commands::network::remove_folder,
            commands::network::scan_network_pc,
            commands::update::update_antivirus,
            commands::update::has_internet,
            // Additional Tauri commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
