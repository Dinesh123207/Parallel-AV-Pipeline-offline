import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaFolderOpen } from "react-icons/fa6";
import { invoke } from "@tauri-apps/api/tauri";
import LoadingSpinner from "../LoadingSpinner";

interface NwFolderProps {
  selectedPc: { name: string; ip: string };
  setSelectedPc: React.Dispatch<
    React.SetStateAction<{
      name: string;
      ip: string;
    }>
  >;
}

const dummyFolder = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

export const Target_Folder_Picker = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);

  const isRoot = currentPath.length === 0;
  const [folders, setFolders] = useState<string[]>([]);

  const getCurrentFolders = async (): Promise<void> => {
    try {
      setIsFoldersLoading(true);
      //   const response: string[] = await invoke("list_folders", {
      //     path: `${selectedPc.ip}::system/${currentPath.join("/")}/`,
      //   });
      setFolders(dummyFolder); // Store the fetched folders in the state
      setIsFoldersLoading(false);
    } catch (error) {
      //   console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    getCurrentFolders();
  }, [currentPath]);

  const handleFolderClick = useCallback(
    (folder: string) => {
      if (selectedFolder === folder) {
        setSelectedFolder(null);
        return;
      }
      setSelectedFolder(folder);
    },
    [selectedFolder]
  );

  const handleFolderDoubleClick = useCallback((folder: string) => {
    if (folder === ".") {
      setCurrentPath((prev) => prev.slice(0, -1));
    } else {
      setCurrentPath((prev) => [...prev, folder]);
    }
    setSelectedFolder(null);
  }, []);

  const handleBackClick = useCallback(() => {
    setCurrentPath((prev) => prev.slice(0, -1));
    setSelectedFolder(null);
  }, []);

  const handlePathClick = useCallback((index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
    setSelectedFolder(null);
  }, []);

  const handleSelect = useCallback(async () => {
    let selectedPath;
    if (selectedFolder) {
      selectedPath = [...currentPath, selectedFolder].join("/");
      //   selectedPath = selectedPc.ip + "::system/" + selectedPath + "/";
    } else {
      selectedPath = currentPath.join("/");
      //   selectedPath = selectedPc.ip + "::system/" + selectedPath + "/";
    }

    console.log(selectedPath);

    try {
      //we need to change here ....
      //   const rs = await invoke("select_network_folder", {
      //     // ip: selectedPc.ip,
      //     // pcName: selectedPc.name,
      //     remoteFolderName: currentPath[currentPath.length - 1],
      //     remoteFolderPath: selectedPath,
      //   });git

      toast({
        duration: 3000,
        title: "Path Selected",
        description: "The selected path has been copied",
        className: "bg-primary-1",
      });
      // console.log(rs);
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        duration: 3000,
        title: "SOEMTHI ASDFASDF",
        description: selectedPath,
      });
    } finally {
      handleClose();
    }
  }, [currentPath, selectedFolder]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setSelectedFolder(null);
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setCurrentPath([]);
    setIsOpen(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="h-[60dvh] min-w-[50dvw] bg-secondary_bg-1 flex flex-col gap-2 p-0">
        <DialogHeader className="px-4 pt-4 m-0">
          <DialogTitle className="text-base">Select Folder</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-grow overflow-hidden pb-1">
          <div className="sticky top-0 z-10 bg-secondary_bg-1 p-4 py-1">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <Button
                variant="ghost"
                size="sm"
                disabled={isRoot}
                onClick={handleBackClick}
                className="px-2 py-1 text-sm mr-2 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePathClick(-1)}
                className="px-1 py-0.5 text-sm"
              >
                {/* {selectedPc.name} */}
                {"Target VM"}
              </Button>
              {currentPath.map((folder, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-4 w-4 text-gray-500 " />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePathClick(index)}
                    className="px-3 py-0.5 text-sm "
                  >
                    {folder}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar pt-3 ">
            {isFoldersLoading && (
              <div className="flex gap-2 flex-col justify-center items-center h-full">
                <LoadingSpinner size={3.5} />
                <span> Please wait while loading...</span>
              </div>
            )}
            <div
              className="grid grid-cols-6 gap-2 p-2"
              onClick={handleContainerClick}
            >
              {!isFoldersLoading &&
                folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => handleFolderClick(folder)}
                    onDoubleClick={() => handleFolderDoubleClick(folder)}
                    className={`flex flex-col items-center p-2 rounded w-full ${
                      selectedFolder === folder
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    disabled={folder === "." && isRoot}
                  >
                    <FaFolderOpen className="h-8 w-8 text-yellow-500" />
                    <span
                      className={`mt-1 text-sm text-center w-24 truncate`}
                      title={folder} // Shows the full name on hover
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent button click
                        if (selectedFolder !== folder) {
                          setSelectedFolder(folder);
                        }
                      }}
                    >
                      {folder}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          <div className="sticky bottom-0 right-0 px-2 py-2 bg-secondary_bg-1 flex justify-end">
            <Button
              variant="outline"
              onClick={handleSelect}
              className="hover:bg-primary-2 py-0"
              disabled={isRoot}
            >
              <Check className="mr-2 h-4 w-4" /> Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
