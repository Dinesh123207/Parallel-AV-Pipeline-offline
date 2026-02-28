import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PcDetails {
  name: string;
  ip: string;
  folders?: string[];
}

interface PcDetailsComponentProps {
  selectedPc: PcDetails | null;
  setSelectedPc: React.Dispatch<React.SetStateAction<PcDetails | null>>;
}

export function PcDetailsComponent({
  selectedPc,
  setSelectedPc,
}: PcDetailsComponentProps) {
  const [folders, setFolders] = useState<string[]>(selectedPc?.folders || []);

  const removeFolder = (folderToRemove: string) => {
    setFolders(folders.filter((folder) => folder !== folderToRemove));
    // Here you would typically also update the backend
    toast({
      title: "Folder Removed",
      description: `${folderToRemove} has been removed from ${selectedPc?.name}.`,
      duration: 3000,
    });
  };

  if (!selectedPc) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Select a PC to view details
      </div>
    );
  }

  return (
    <div className="bg-secondary_bg-1 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{selectedPc.name}</h2>
      <p className="text-gray-400 mb-6">IP: {selectedPc.ip}</p>
      <h3 className="text-xl font-semibold mb-2">Folders:</h3>
      {folders.length === 0 ? (
        <p className="text-gray-500">No folders selected for this PC.</p>
      ) : (
        <ul className="space-y-2">
          {folders.map((folder, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-secondary_bg-2 p-2 rounded"
            >
              <span>{folder}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeFolder(folder)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
