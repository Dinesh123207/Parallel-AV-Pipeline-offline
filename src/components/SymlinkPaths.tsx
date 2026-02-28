import { error, info } from "tauri-plugin-log-api";
import PATHS from "../../public/selected_paths.json";
import { invoke } from "@tauri-apps/api/tauri";
import { ImCross } from "react-icons/im";

const SymlinkPaths = () => {
  async function handleRemoveFolder(path: string) {
    try {
      console.log(path);
      const res: string = await invoke("remove_folder_path", {
        directory: path,
      });
      console.log("Response:", res);
      info(path);
    } catch (e) {
      console.error("Error:", e);
      error(JSON.stringify(e));
    }
  }

  return (
    <div className="w-full text-white flex flex-col gap-4 bg-slate-800 mb-2 py-2 rounded-md">
      {PATHS.paths.length !== 0 && (
        <div className="flex justify-center items-center text-xl font-semibold">
          Remove Paths
        </div>
      )}
      {PATHS.paths.map((p) => (
        <div className=" hover:bg-purple-800 group rounded hover:text-white py-1 px-4 italic flex items-center justify-between transition">
          <div className="file-path">{p}</div>
          <button
            className="remove-link hover:text-red-600 cursor-pointer p-1"
            onClick={() => handleRemoveFolder(p)}
            key={p}
          >
            <ImCross />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SymlinkPaths;
