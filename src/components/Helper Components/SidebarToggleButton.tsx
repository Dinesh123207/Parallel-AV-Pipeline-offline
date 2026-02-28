import React from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

export default function SidebarToggleButton({
  setIsSidebarOpen,
  isSidebarOpen,
}: {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarOpen: boolean;
}) {
  return (
    <button
      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isSidebarOpen ? (
        <IoMdArrowDropleft size={24} />
      ) : (
        <IoMdArrowDropright size={24} />
      )}
    </button>
  );
}
