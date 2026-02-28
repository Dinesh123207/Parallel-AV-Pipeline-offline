import React, { useEffect, useRef, useState } from "react";
import { FOLDERS } from "../utils/dummies";

const TABS = ["Windows Defender", "ESET", "ClamAV"];

export default function Logs() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="w-full h-[55dvh] m-4 border border-gray-200 bg-gray-200  rounded-lg shadow-sm flex flex-col overflow-hidden">
      {/* // add estimmated time */}
      
      <div className="flex border-b border-gray-200 ">
        {TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-2 px-4 text-sm font-medium text-center focus:outline-none focus:ring-2 text-black  ${activeTab === idx
                ? "bg-slate-600/30 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
            aria-selected={activeTab === idx}
            role="tab"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {TABS.map((_tab, idx) => (
          <div
            key={idx}
            className={`h-full ${activeTab === idx ? "block" : "hidden"}`}
          >
            <Terminal />
          </div>
        ))}
      </div>
    </div>
  );
}

function Terminal() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (currentIndex >= FOLDERS.length) {
      setIsComplete(true);
      return;
    }

    const speed = FOLDERS.length > 100 ? 50 : 500; // Adjust speed based on array size

    const timer = setTimeout(() => {
      if (currentIndex === -1) {
        setOutput(["Creating VM", "Starting Antivirus", "Scanning started..."]);
      } else {
        setOutput((prev) => [...prev, `Scanning: ${FOLDERS[currentIndex]}`]);
      }
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="w-full h-full p-4 bg-black text-green-500 font-mono overflow-hidden">
      <pre
        ref={containerRef}
        className="h-full w-full overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-green-500 custom-scrollbar scrollbar-track-black"
      >
        {output.map((line, index) => (
          <React.Fragment key={index}>
            {"> "}
            {line}
            <br />
          </React.Fragment>
        ))}
        <hr />
        {isComplete && "> Scanning Complete"}
      </pre>
    </div>
  );
}
