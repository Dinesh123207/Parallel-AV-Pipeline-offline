import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { stringStateSetter } from "@/utils/constants";
import AV_Status from "@/components/Helper Components/AV_Status";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";
import ButtonWrapper from "@/components/WrapperComponent/ButtonWrapper";

import combinedData from "../../logs/combined_report.json";
import {
  parseTimestampDate,
  parseTimestampTime,
} from "@/utils/helper/viewLogsHelper";
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateReport } from "@/utils/helper/reportGenerate";

interface ViewLogsProps {
  setSelectedTimestamp: stringStateSetter;
  scanning: boolean;
  networkScanning: boolean;
}

export default function View_Logs({
  setSelectedTimestamp,
  scanning,
  networkScanning,
}: ViewLogsProps) {
  return (
    <OutletWrapper>
      <AV_Status />

      <div className="grid gap-2">
        <div className="text-xl font-medium">Scan Logs</div>
        <ScanTable
          setSelectedTimestamp={setSelectedTimestamp}
          scanning={scanning}
          networkScanning={networkScanning}
        />
      </div>
    </OutletWrapper>
  );
}

function ScanTable({
  setSelectedTimestamp,
  scanning,
  networkScanning,
}: ViewLogsProps) {
  const navigate = useNavigate();
  const [datas, setDatas] = useState(combinedData);
  const [scanningTime, setScanningTime] = useState<string>("");
  const [localStorageData, setLocalStorageData] = useState<
    { pcName: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    // Load data from localStorage
    const loadLocalStorageData = () => {
      const storedData = JSON.parse(localStorage.getItem("pcLog") || "[]");
      setLocalStorageData(storedData);
    };

    const loadData = async () => {
      const updatedData = await import("../../logs/combined_report.json");
      console.log("updatedData", updatedData);
      setDatas(updatedData.default);
    };

    if (scanning) {
      const date = new Date();
      setScanningTime(
        `${parseTimestampDate(date.toString())} / ${parseTimestampTime(
          date.toString()
        )}`
      );
    } else {
      loadData();
      loadLocalStorageData();
    }
  }, [scanning]);

  const handleReportGenerate = async (timestamp: string) => {
    generateReport(timestamp);
  };

  const findPCNameByTimestamp = (timestamp: string): string | undefined => {
    const entry = localStorageData.find((item) => item.timestamp === timestamp);
    return entry?.pcName;
  };

  return (
    <div className="container h-[20dvh] mx-auto">
      <div className="border-2 border-primary-1/40 rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-secondary_bg-1 border-b">
              <th className="w-1/3 p-2 py-3 text-left font-semibold border-r">
                Scan Type
              </th>
              <th className="w-1/3 p-2 text-left font-semibold border-r">
                Completion Time
              </th>
              <th className="w-1/3 p-2 text-left font-semibold">Action</th>
            </tr>
          </thead>
        </table>
        {combinedData.length === 0 && !scanning && (
          <div className="px-2 text-md py-2 text-slate-300">
            <sup>*</sup>No scan logs found.
          </div>
        )}

        <div className="overflow-y-auto max-h-[50dvh] custom-scrollbar">
          <table className="w-full table-fixed">
            <tbody>
              {scanning && (
                <tr className="transition">
                  <td className="px-2 py-1 border-r">
                    <div>Custom Scan Under Progress</div>
                  </td>
                  <td className="p-2 px-2 border-r">
                    <LoadingSpinner size={1.5} />
                  </td>
                  <td className="px-2">Waiting for scan to complete.</td>
                </tr>
              )}
              {networkScanning && (
                <tr className="transition">
                  <td className="px-2 py-1 border-r">
                    <div>Network Scan Under Progress</div>
                  </td>
                  <td className="p-2 px-2 border-r">
                    <LoadingSpinner size={1.5} />
                  </td>
                  <td className="px-2">
                    Waiting for network scan to complete.
                  </td>
                </tr>
              )}
              {datas.length !== 0 &&
                datas.reverse().map((row, index) => {
                  const pcName = findPCNameByTimestamp(row.timestamp);

                  return (
                    <tr key={index} className="hover:bg-primary-1/10 transition">
                      <td className="px-2 py-1 border-r">
                        <div>
                          {pcName ? "Network Device" : "Custom Scan"}
                        </div>
                        {pcName && (
                          <div className="text-sm text-gray-500">
                            [PC: {pcName}]
                          </div>
                        )}
                      </td>
                      <td className="p-2 border-r">
                        {parseTimestampDate(row.timestamp)} /{" "}
                        {parseTimestampTime(row.timestamp)}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-4">
                          <ButtonWrapper
                            buttonText="Analysis"
                            onclick={() => {
                              setSelectedTimestamp(row.timestamp);
                              navigate(`${row.timestamp}`);
                            }}
                          />
                          <ButtonWrapper
                            buttonText="Report"
                            onclick={() =>
                              handleReportGenerate(row.timestamp)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}