import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import ButtonWrapper from "../WrapperComponent/ButtonWrapper";
interface PcDetails {
  name: string;
  ip: string;
}
interface NetworkPCTableProps {
  addPC: (pcDetails: PcDetails) => void;
}

export default function NetworkPCTable({ addPC }: NetworkPCTableProps) {
  const [pcDetails, setPcDetails] = useState<PcDetails>({
    name: "",
    ip: "",
  });

  const handlePcDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPcDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handlePcAdd = () => {
    // invoke test ping for provided ip
    if (pcDetails.name.trim() && pcDetails.ip.trim()) {
      addPC(pcDetails); // Call parent function to add PC
      setPcDetails({ name: "", ip: "" }); // Reset form fields
    } else {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "Invalid Input",
        description: "All Fields are mandatory.",
      });
    }
  };

  return (
    <DialogContent className="bg-secondary_bg-2 border-2 border-primary-1/40">
      <DialogHeader>
        <DialogTitle className="font-semibold">Add New PC</DialogTitle>
        <DialogDescription className="text-slate-200">
          A network ping will be done to check if the provided PC is in the
          local network or not.
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
  );
}
