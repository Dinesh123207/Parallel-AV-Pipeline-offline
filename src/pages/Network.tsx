import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

import { NwFolder } from "@/components/Main Content Helper/Folder";
import { invoke } from "@tauri-apps/api/tauri";
import rawPCList from "../../public/network_mapping.json";
import { PcDetails } from "@/utils/types";
import { SelectedNetworkFolders } from "@/components/Network Scan Helper/NetworkFolderList";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";

export default function Network() {
  const [pcList, setPcList] = useState<PcDetails[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPc, setSelectedPc] = useState<PcDetails>({
    name: "",
    ip: "",
    folders: [],
  });

  useEffect(() => {
    // fetch pc list from public/network_mapping.json
    const formattedPCList = rawPCList.map((pc: any) => ({
      ...pc,
      folders: pc.folders as string[],
    }));
    setPcList(formattedPCList);
  }, []);

  //! adding pc over here
  const addPC = (pcDetails: PcDetails) => {
    console.log("this is pc details", pcDetails);
    invoke("add_network_device", {
      ip: pcDetails.ip,
      name: pcDetails.name,
    })
      .then((res) => {
        console.log("DEVICE ADDED: ", res);
        toast({
          title: "PC Added",
          description: "Network PC is successfully added.",
          duration: 3000,
        });
        setPcList(() => [pcDetails]);
        setIsDialogOpen(false); // Close the dialog after adding
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          description: err,
          duration: 3000,
        });
      })
      .finally(() => {
        console.log("its done");
      });
  };

  return (
    <OutletWrapper>
      <div className="flex gap-5">
        <SelectedNetworkFolders
          setSelectedPc={setSelectedPc}
          pcList={pcList}
          setPcList={setPcList}
        />
      </div>
      <NwFolder selectedPc={selectedPc} setSelectedPc={setSelectedPc} />
    </OutletWrapper>
  );
}
