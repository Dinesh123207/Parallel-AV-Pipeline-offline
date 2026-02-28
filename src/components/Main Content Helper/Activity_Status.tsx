import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { MdOutlineRefresh } from "react-icons/md";
import PATHS from "../../../public/selected_paths.json";
import pathMapping from '../../../public/path_mapping.json';
import { RiCloseFill } from "react-icons/ri";
import Status_Provider from "./Status_Provider";

const typedPathMapping: Record<string, string> = pathMapping;

export default function Activity_Status({ scanning, currScanningFolder }: { scanning: boolean; currScanningFolder: string; }) {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [currActive, setCurrActive] = useState<string>("");

  async function handleRemoveFolder(path: string) {
    try {
      const res: string = await invoke("remove_folder_path", {
        directory: path,
      });
      console.log("Response:", res);
      // info(path);
      setRefresh((refresh) => !refresh);
    } catch (e) {
      console.error("Error:", e);
      // error(JSON.stringify(e));
    }
  }

  useEffect(() => {
    const pathToBeScanned = Object.keys(typedPathMapping).find((item) => item === currScanningFolder ? typedPathMapping[item] as string : null);
    pathToBeScanned && setCurrActive(typedPathMapping[pathToBeScanned]);
  }, [currScanningFolder, scanning]);

  return (
    <div className="grid gap-2">
      <div className="flex justify-between">
        <div className="text-lg font-medium">Scanning Status</div>

        <div
          onClick={() => setRefresh((refresh) => !refresh)}
          className="mr-5 border px-1 text-center bg-primary-1 text-slate-800 rounded-lg py-1 text-sm hover:bg-primary-2 cursor-pointer transition hover:shadow"
        >
          <MdOutlineRefresh fontSize={18} />
        </div>
      </div>
      <div className="flex flex-col w-full h-[40dvh] overflow-auto relative custom-scrollbar rounded-md border-primary-1/40 border-2">
        {/* Sticky Header */}
        <div className="sticky font-bold  bg-secondary_bg-1 text-slate-200 flex justify-between items-center top-0 py-2 px-3 w-full border-b-2  border-primary-2/40">
          <div className="w-9/12">Path</div>
          <div className="flex w-3/12  justify-between gap-10 px-3">
            <div className="flex w-full justify-center items-center">
              Activity
            </div>
            <div className="flex items-center justify-center w-full">
              Action
            </div>
          </div>
        </div>
        {/* Dynamic Content */}
        <div>
          {PATHS.paths.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-secondary_bg-2 text-slate-200 py-2 px-3 w-full"
            >
              <div className="w-9/12 font-semibold">{item}</div>
              <div className="flex w-3/12 justify-between gap-10 px-3">
                <Status_Provider status={currActive === item ? "waiting" : "active"} />
                <div className="flex items-center justify-center w-full">
                  {/* Trigger the delete function here to delete the path from selected_folders */}
                  <RiCloseFill
                    fontSize={25}
                    onClick={() => handleRemoveFolder(item)}
                    className="cursor-pointer hover:text-error_signal transition "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
