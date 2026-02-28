import React from "react";
import { TickIcon } from "./TickIcon"; // Assuming you have a TickIcon component
import { FaTimesCircle } from "react-icons/fa"; // For failure icons
import { Download } from "lucide-react";

type ScanningReportProps = {
  antivirusName: string;
  totalFiles: number;
  scannedFiles: number;
  threatsDetected: number;
  completed: boolean;
};

const ReportComponentForAV = ({ numberOfAV }: { numberOfAV: number }) => {
  // Dummy array of scanning reports
  const dummyReports: ScanningReportProps[] = [
    {
      antivirusName: "Windows Defender",
      totalFiles: 120,
      scannedFiles: 120,
      threatsDetected: 8,
      completed: true,
    },
    {
      antivirusName: "Avast Antivirus",
      totalFiles: 120,
      scannedFiles: 120,
      threatsDetected: 5,
      completed: true,
    },
    {
      antivirusName: "AVG AntiVirus",
      totalFiles: 120,
      scannedFiles: 120,
      threatsDetected: 1,
      completed: true,
    },
    {
      antivirusName: "Bitdefender Antivirus",
      totalFiles: 120,
      scannedFiles: 120,
      threatsDetected: 20,
      completed: true,
    },
    {
      antivirusName: "Kaspersky Security Cloud",
      totalFiles: 120,
      scannedFiles: 120,
      threatsDetected: 22,
      completed: true,
    },
  ];

  return (
    <div className="p-6 mx-auto flex bg-gray-800/60 text-white rounded-lg shadow-lg flex-col border border-primary relative">
      <div className="absolute right-5 top-2 border flex items-center gap-2 border-black px-3 py-1 rounded-md bg-gray-200/80 text-black text-lg hover:bg-gray-200 transition hover:shadow-md border-primary cursor-pointer">
        Download <Download />
      </div>
      <div className="text-3xl font-bold text-center my-2">Scanning Report</div>
      <div className="flex gap-4">
        {Array.from({ length: numberOfAV }).map((_, idx) => (
          <div className="w-full border border-primary px-3 py-2 rounded-md flex flex-col gap-4">
            <div className="font-semibold">
              {dummyReports[idx].antivirusName}
            </div>
            <div>
              <div>
                Total Files :{" "}
                <span className="font-semibold">
                  {dummyReports[idx].totalFiles}
                </span>
              </div>
              <div>
                Scanned Files :{" "}
                <span className="font-semibold">
                  {dummyReports[idx].scannedFiles}
                </span>
              </div>
              <div>
                Threats Detected:{" "}
                <span
                  className={`font-semibold ${
                    dummyReports[idx].threatsDetected <= 7
                      ? "text-green-500"
                      : dummyReports[idx].threatsDetected <= 20
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {dummyReports[idx].threatsDetected}
                </span>
              </div>
            </div>
            <div className="font-semibold flex">
              Scanning Completed. &nbsp; &nbsp; <TickIcon />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportComponentForAV;
