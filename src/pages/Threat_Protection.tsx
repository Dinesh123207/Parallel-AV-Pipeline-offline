import { DUMMY_SCAN_DATA } from "@/utils/constants";
import AV_Status from "@/components/Helper Components/AV_Status";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";
import ButtonWrapper from "@/components/WrapperComponent/ButtonWrapper";

export default function Threat_Protection() {
  return (
    <OutletWrapper>
      <AV_Status />

      <div className="grid gap-2">
        <div className="text-xl font-medium">Scan Logs</div>

        <ScanTable />
      </div>
    </OutletWrapper>
  );
}

function ScanTable() {
  return (
    <div className="container h-[20dvh] mx-auto">
      <div className="border-2 border-primary-1/40 rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-secondary_bg-1  border-b">
              <th className="w-1/3 p-2 py-3 text-left font-semibold border-r">
                Scan Type
              </th>
              <th className="w-1/3 p-2 text-left font-semibold border-r">
                Scan Time
              </th>
              <th className="w-1/3 p-2 text-left font-semibold">Action</th>
            </tr>
          </thead>
        </table>
        {DUMMY_SCAN_DATA.length === 0 && (
          <div className="px-2 text-md py-2 text-slate-300">
            <sup>*</sup>No scan logs found.
          </div>
        )}

        <div className="overflow-y-auto max-h-[50dvh] custom-scrollbar">
          <table className="w-full table-fixed">
            <tbody>
              {DUMMY_SCAN_DATA.map((row, index) => (
                <tr key={index} className="hover:bg-primary-1/10 transition">
                  <td className="px-2 py-1 border-r">
                    <div>
                      {row.type === "custom" ? "Custom Scan" : "Full Scan"}
                    </div>
                    {row.type === "custom" && (
                      <div className="text-sm text-gray-500">[{row.path}]</div>
                    )}
                  </td>
                  <td className="p-2 border-r">{row.time}</td>
                  <td className="p-2">
                    <div className="flex gap-4">
                      <ButtonWrapper
                        buttonText="Analysis"
                        onclick={() => console.log("analysis clicked", row.id)}
                      />
                      <ButtonWrapper
                        buttonText="Report"
                        onclick={() => console.log("report clicked", row.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
