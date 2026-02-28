import { invoke } from "@tauri-apps/api/tauri"
import { STARTUP_COMMANDS } from "../constants"

export function share_network_folder() {
    invoke("execute_commands", { commands: STARTUP_COMMANDS }).then(res => console.log("share network response", res)).catch(err => console.log(err)).finally(() => console.log("Folder Sharing is done to VMs."))
}