import { toast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/tauri";
import { IoClose } from "react-icons/io5";
import ButtonWrapper from "../WrapperComponent/ButtonWrapper";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { useState } from "react";
import { PcDetails } from "@/utils/types";

export function SelectedNetworkFolders({
  pcList,
  setPcList,
  setSelectedPc,
}: {
  pcList: PcDetails[];
  setPcList: React.Dispatch<React.SetStateAction<PcDetails[]>>;
  setSelectedPc: React.Dispatch<React.SetStateAction<PcDetails>>;
}) {
  const [pcDetails, setPcDetails] = useState<PcDetails>({
    name: "",
    ip: "",
    folders: [],
  });

  //function to remove the network folder
  const handleRemoveNetworkFolder = async (
    ip: string,
    pcName: string,
    remoteFolderName: string
  ) => {
    try {
      console.log("Removing Folder....", ip, pcName, remoteFolderName);
      const response = await invoke("remove_folder", {
        ip,
        pcName,
        remoteFolderName,
      });
      console.log(response);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 3000,
      });
    } finally {
      console.log("Bas karo bhai ho gaya.. ");
    }
  };

  //function to scan the network pc
  const handleNetworkPcScan = async (pcName: string) => {
    try {
      console.log("Scanning Network PC....", pcName);
      const response = await invoke("scan_network_pc", { pcName });
      console.log(response);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 3000,
      });
    } finally {
      console.log("Bas karo bhai ho gaya.. ");
    }
  };

  //onChange function to store pc information
  const handlePcDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPcDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  //
  const handlePcAdd = () => {
    // invoke test ping for provided ip
    if (pcDetails.name.trim() && pcDetails.ip.trim()) {
      addPC(pcDetails); // Call parent function to add PC
      setPcDetails({ name: "", ip: "", folders: [] }); // Reset form fields
    } else {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "Invalid Input",
        description: "All Fields are mandatory.",
      });
    }
  };

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
        // setPcList(() => [pcDetails]);
        // setIsDialogOpen(false); // Close the dialog after adding
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

  const removePc = (e: any, idx: number) => {
    e.stopPropagation();
    invoke("remove_network_device", { name: pcList[idx].name })
      .then((res) => {
        console.log("this is remove pc response", res);
        setPcList((prevList) => prevList.filter((_, i) => i !== idx));
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
    <div className="w-full h-[calc(100dvh-64px)] overflow-y-auto flex flex-col gap-2 border-primary-1/20">
      <div className="text-xl justify-between font-semibold flex">
        <div>Selected Folders</div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-sm mr-2 border px-4 py-1 b rounded-md bg-primary-1 hover:bg-primary-2 text-slate-800 transition font-semibold">
              Add PC
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-secondary_bg-2 border-2 border-primary-1/40">
            <DialogHeader>
              <DialogTitle className="font-semibold">Add New PC</DialogTitle>
              <DialogDescription className="text-slate-200">
                A network ping will be done to check if the provided PC is in
                the local network or not.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  value={pcDetails.name}
                  onChange={handlePcDetailsChange}
                  id="name"
                  name="name"
                  placeholder="PC Name"
                  className="col-span-3 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip" className="text-right">
                  IP
                </Label>
                <Input
                  value={pcDetails.ip}
                  onChange={handlePcDetailsChange}
                  id="ip"
                  name="ip"
                  placeholder="IP"
                  className="col-span-3 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <ButtonWrapper buttonText="Add" onclick={handlePcAdd} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {pcList.map((pc, idx) => (
        <div className="flex gap-1 flex-col px-2 py-1 rounded-md bg-secondary_bg-2  border border-primary-1/40">
          <div className="flex justify-between">
            <div className="flex items-end gap-2">
              <div className="text-lg font-semibold">{pc.name}</div>
              <div className="text-sm text-gray-400 mb-1">({pc.ip})</div>
            </div>
            <div className="flex gap-2">
              <button
                className="border font-semibold px-4 py-1 rounded-md flex items-center justify-center bg-red-500 text-gray-200 hover:bg-error_signal hover:shadow transition duration-400"
                onClick={(e) => removePc(e, idx)}
              >
                Remove
              </button>
            </div>
          </div>
          <div className="h-24 overflow-auto ">
            <ul className="flex flex-col gap-0">
              {pc.folders &&
                pc.folders.map((folder) => (
                  <li className="flex justify-between hover:bg-secondary_bg-1 rounded transition px-4 py-0.5">
                    <div>{folder}</div>
                    <button
                      onClick={() =>
                        handleRemoveNetworkFolder(pc.ip, pc.name, folder)
                      }
                      className="text-red-600 hover:text-red-500 transition  focus:outline-none"
                    >
                      <IoClose fontSize={20} />
                    </button>{" "}
                  </li>
                ))}
            </ul>
          </div>
          <div className="flex gap-4 justify-end px-4 pb-2">
            <button
              onClick={() => {
                handleNetworkPcScan(pc.name);
              }}
              className="bg-primary-1 hover:bg-primary-2 text-slate-800 px-4 py-1 rounded-md font-semibold transition"
            >
              Scan
            </button>
            <button
              onClick={() => setSelectedPc(pc)}
              className="bg-primary-1 hover:bg-primary-2 text-slate-800 px-4 py-1 rounded-md font-semibold transition"
            >
              Add folder
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
