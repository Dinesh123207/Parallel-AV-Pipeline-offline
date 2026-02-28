import { stringStateSetter } from "@/utils/constants";
import { invoke } from "@tauri-apps/api/tauri";

export default function Folder_Picker({
  selectedFolder,
  setSelectedFolder,
}: {
  selectedFolder: string;
  setSelectedFolder: stringStateSetter;
}) {
  const handleFolderSelection = async () => {
    // info("Folder Selection...");
    try {
      const selectedFolder: string = await invoke("open_folder_dialog");
      console.log(selectedFolder);
      // info(selectedFolder);
      const absolutePath: any = await invoke("get_absolute_path", {
        directory: selectedFolder,
      });
      // info(absolutePath);
      setSelectedFolder(absolutePath);
    } catch (e) {
      console.error("Error selecting folder or getting path:", e);
      // error(JSON.stringify(e));
    }
  };

  return (
    <div className="flex items-center justify-between bg-primary_bg gap-2">
      <div className="font-semibold bg-secondary_bg-1 text-slate-200 rounded-lg border-2 border-primary-1/40 flex-1 py-2 px-2">
        {selectedFolder === "" ? "No folder Selected" : selectedFolder}
      </div>
      {/* Change the onClick behavior here for letting it to work  */}
      <div
        className="bg-primary-1 text-slate-800 px-4 py-2 border-2 border-black font-semibold rounded-lg cursor-pointer hover:bg-primary-2 hover:shadow transition"
        onClick={() => handleFolderSelection()}
      >
        Choose Folder
      </div>
    </div>
  );
}
