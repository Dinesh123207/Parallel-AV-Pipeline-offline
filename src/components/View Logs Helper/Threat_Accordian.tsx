import { useState } from "react";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { IoIosWarning } from "react-icons/io";
import { handleRemove, mapThreatFiles } from "@/utils/helper/viewLogsHelper";
import pathMapping from "../../../public/path_mapping.json";
import { MdDelete } from "react-icons/md";

const AccordionClass =
  "w-full bg-secondary_bg-2 rounded-md cursor-pointer hover:bg-secondary_bg-1/80 transition ease-in-out";

export function Antivirus({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState<string>("");
  const [threatPath, setThreatPath] = useState<string[]>([]);

  const toggleAccordion = (av: string) => {
    if (isOpen === av) {
      // Closing the accordion
      setIsOpen("");
      // Use setTimeout to clear threatPath after the closing animation
      setTimeout(() => setThreatPath([]), 300); // 300ms matches the transition duration
    } else {
      // Opening the accordion
      setIsOpen(av);
      if (av === "combined") {
        setThreatPath(mapThreatFiles(data.infected_file_paths, pathMapping));
      } else if (av === "wd") {
        setThreatPath(
          mapThreatFiles(
            data.antivirus_logs["Windows Defender"].WindowsDefender
              .threat_files,
            pathMapping
          )
        );
      } else if (av === "eset") {
        setThreatPath(
          mapThreatFiles(
            data.antivirus_logs["ESET AV"].ESET.threat_files.map(
              (p: any) => p.path
            ),
            pathMapping
          )
        );
      } else if (av === "clamav" || av === "kaspersky") {
        setThreatPath(
          mapThreatFiles(
            data.antivirus_logs["CLAMAV"].ClamAV.threat_files.map(
              (p: any) => p.path
            ),
            pathMapping
          )
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ACCORDION FOR COMBINED REPORT */}
      <div
        className={AccordionClass}
        onClick={() => toggleAccordion("combined")}
      >
        {/* ACCORDION HEADER */}
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>Combined Threats</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.infected_file_paths.length > 0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>

        {/* ACCORDION CONTENT */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isOpen === "combined" ? "max-h-[40dvh]" : "max-h-0"
          }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-1 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION FOR WINDOWS DEFENDER */}
      <div className={AccordionClass} onClick={() => toggleAccordion("wd")}>
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>Windows Defender</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.antivirus_logs["Windows Defender"].WindowsDefender
                .threat_files.length > 0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>
        {/* ACCORDION CONTENT */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen === "wd" ? "max-h-[40dvh]" : "max-h-0"
            }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-2 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION FOR ESET AV */}
      <div className={AccordionClass} onClick={() => toggleAccordion("eset")}>
        {/* ACCORDION HEADER */}
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>ESET Total Security</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.antivirus_logs["ESET AV"].ESET.threat_file_paths.length >
                0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>

        {/* ACCORDION CONTENT */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen === "eset" ? "max-h-[40dvh]" : "max-h-0"
            }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-2 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION FOR CLAM AV */}
      <div className={AccordionClass} onClick={() => toggleAccordion("clamav")}>
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>ClamAV</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.antivirus_logs["CLAMAV"].ClamAV.threat_files.length > 0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>
        {/* ACCORDION CONTENT */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen === "clamav" ? "max-h-[40dvh]" : "max-h-0"
            }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-2 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION FOR AVG Internet Security */}
      {/* <div className={AccordionClass} onClick={() => toggleAccordion("avg")}>
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>AVG Internet Security</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.antivirus_logs["CLAMAV"].ClamAV.threat_files.length > 0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen === "avg" ? "max-h-[40dvh]" : "max-h-0"
            }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-2 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div> */}

      {/* ACCORDION FOR Kaspersky Internet Security */}
      <div
        className={AccordionClass}
        onClick={() => toggleAccordion("kaspersky")}
      >
        <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
          <div>Kaspersky Internet Security</div>
          <div className="flex gap-2 items-center">
            <span>
              {data.antivirus_logs["CLAMAV"].ClamAV.threat_files.length > 0 ? (
                <IoIosWarning color="#FFE219" fontSize={20} />
              ) : (
                <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
              )}
            </span>
            {data.infected_file_paths.length > 0
              ? "Detected"
              : "No Threats Detected"}
          </div>
        </div>
        {/* ACCORDION CONTENT */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isOpen === "avg" ? "max-h-[40dvh]" : "max-h-0"
          }`}
        >
          <div className="px-8 py-2 text-sm text-gray-200">
            <div className="flex flex-col gap-2">
              {threatPath.length > 0 ? (
                threatPath.map((file: string, index: number) => (
                  <div className="flex justify-between" key={index}>
                    <div>{file}</div>
                    <div className="flex gap-4">
                      <button
                        className="bg-error_signal/80 text-black px-2 py-0.5 rounded font-semibold transition hover:bg-error_signal"
                        onClick={(e) => {
                          handleRemove(e, file);
                        }}
                      >
                        <MdDelete color="white" fontSize={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <li>No infected files detected.</li>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AntivirusAccordionProps {
  title: string;
  data: any;
  isOpen: string;
}

function Accordion_Helper({ title, data, isOpen }: AntivirusAccordionProps) {
  return (
    <div className="w-full bg-secondary_bg-2 rounded-md">
      {/* Accordion Header */}
      <div className="flex justify-between px-8 py-4 font-semibold cursor-pointer">
        <div>{title}</div>
        <div className="flex gap-2 items-center">
          <span>
            {data.infected_file_paths.length > 0 ? (
              <IoIosWarning color="#E71802" fontSize={20} />
            ) : (
              <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
            )}
          </span>
          {data.infected_file_paths.length > 0
            ? "Detected"
            : "No Threats Detected"}
        </div>
      </div>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen !== "" ? "max-h-[40dvh]" : "max-h-0"
          }`}
      >
        <div className="px-8 py-4 text-sm text-gray-300">
          <p>
            Here is detailed information about the threats and scan results.
          </p>
          <ul className="list-disc pl-6">
            {data.infected_file_paths.length > 0 ? (
              data.infected_file_paths.map((file: string, index: number) => (
                <li key={index}>{file}</li>
              ))
            ) : (
              <li>No infected files detected.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
