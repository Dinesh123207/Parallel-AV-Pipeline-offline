import { toast } from "@/hooks/use-toast";
import { PcDetails } from "@/utils/types";
import { invoke } from "@tauri-apps/api/tauri";
import { IoClose } from "react-icons/io5";

export default function DisplayPcList({
  pcList,
  setPcList,
  setSelectedPc,
}: {
  pcList: PcDetails[];
  setPcList: React.Dispatch<React.SetStateAction<PcDetails[]>>;
  setSelectedPc: React.Dispatch<React.SetStateAction<PcDetails>>;
}) {
  const removePc = (e: any, index: number) => {
    e.stopPropagation();
    invoke("remove_network_device", { name: pcList[index].name })
      .then((res) => {
        console.log("this is remove pc response", res);
        setPcList((prevList) => prevList.filter((_, i) => i !== index));
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: "destructive",
          description: err,
          duration: 3000,
        });
      })
      .finally(() => {
        console.log("done");
      });
  };
  return (
    <div className="mt-2">
      {pcList.length === 0 ? (
        <div className="text-gray-500">No PCs added yet.</div>
      ) : (
        <ul className="space-y-2">
          {pcList.map((pc, index) => (
            <li
              onClick={() => setSelectedPc(pc)}
              key={index}
              className="flex justify-between items-center px-2 py-0.5 border rounded bg-secondary_bg-1"
            >
              <div>
                <div className="text-slate-200 font-medium">{pc.name}</div>
                <div className="text-slate-400 text-sm">IP: {pc.ip}</div>
              </div>
              <button
                onClick={(e) => removePc(e, index)}
                className="text-red-600 hover:text-red-500 transition  focus:outline-none"
              >
                <IoClose fontSize={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
