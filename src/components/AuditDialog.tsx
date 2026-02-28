import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

interface AuditDialogProps {
  isOpen: boolean;
  onClose: (selectedValue: string) => void;
}

const AuditDialog: React.FC<AuditDialogProps> = ({ isOpen, onClose }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedValue) {
      onClose(selectedValue);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose("")}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/85" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[90vh] w-[95vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] bg-card border-2 border-primary p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-white m-0 py-0 text-[20px] font-semibold">
            Select System
          </Dialog.Title>

          {/* Dropdown for selecting numbers from 2 to 5 */}
          <fieldset className="py-2">
            <label
              htmlFor="number-select"
              className="text-sm font-medium text-white"
            >
              Select number of VMs:
            </label>
            <select
              id="number-select"
              value={selectedValue || ""}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="block w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-opacity-50 focus:ring-indigo-500 bg-card text-white"
            >
              <option value="" disabled>
                Choose number of VMs
              </option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </fieldset>

          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button
                disabled={!selectedValue}
                className="bg-primary text-white hover:bg-violet-600 focus:shadow-white inline-flex items-center justify-center rounded-[4px] px-[15px] w-[100px] h-[40px] font-medium leading-none focus:border-white disabled:cursor-not-allowed disabled:bg-gray-500/50 disabled:text-gray-400"
                onClick={handleConfirm}
              >
                Scan
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close asChild>
            <button
              className="text-white hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-white "
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuditDialog;
