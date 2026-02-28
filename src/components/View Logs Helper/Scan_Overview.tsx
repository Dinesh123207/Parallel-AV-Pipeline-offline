import {
  parseTimestampDate,
  parseTimestampTime,
} from "@/utils/helper/viewLogsHelper";
import { useNavigate } from "react-router-dom";

const dummy_avg_logs = {
  total_files_scanned: 13,
  total_threat_files: 0,
  scan_time: "0 second(s)",
  scanned_directories: 1,
  data_scanned: "2.7 MB",
};

const dummy_kaspersky_logs = {
  total_files_scanned: 14,
  total_detected_files: 1,
  total_ok_files: 13,
  total_suspicions: 0,
  total_skipped: 0,
  password_protected: 0,
  corrupted: 0,
  errors: 0,
  scan_time: "10 seconds",
  threat_files: ["a", "b"],
};

export function Scan_Overview({
  data,
  timestamp,
}: {
  data: any;
  timestamp: string;
}) {
  const navigate = useNavigate();
  console.log(timestamp);
  console.log("hello", data.data);

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center text-lg font-medium">
        <div>Scan Summary</div>
        <div
          onClick={() => navigate(-1)}
          className="border px-6 w-1/12 text-center bg-primary-1 text-slate-800 rounded-lg py-1 text-sm hover:bg-primary-2 cursor-pointer transition hover:shadow "
        >
          BACK
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 border-2 rounded-md ease-in-out`}
      >
        <div className="py-2 px-4 text-lg flex gap-10 bg-secondary_bg-1 ">
          <b>Time: {parseTimestampTime(timestamp)}</b>
          <b>Date: {parseTimestampDate(timestamp)}</b>
        </div>

        <div className=" grid grid-cols-4 border-t bg-secondary_bg-2 ">
          <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>Combined Summary</b>
            </div>
            <div>
              <b>Time-taken:</b> {data.combined_summary.time_taken} sec
              <br />
              <b>Total files scanned:</b>{" "}
              {data.antivirus_logs["CLAMAV"].ClamAV.total_files_scanned}
              <br />
              <b>Total Threats Found:</b>{" "}
              {data.combined_summary.total_threat_files}
              <br />
            </div>
          </div>

          <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>Windows Defender</b>
            </div>
            <div>
              <b>Time-taken:</b> -
              <br />
              <b>Total files scanned:</b>{" "}
              {data.antivirus_logs["CLAMAV"].ClamAV.total_files_scanned}
              <br />
              <b>Total Threat Files:</b>{" "}
              {
                data.antivirus_logs["Windows Defender"].WindowsDefender
                  .total_threat_files
              }
              <br />
            </div>
          </div>

          <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>ESET Total Security</b>
            </div>
            <div>
              <b>Time-taken:</b> {data.antivirus_logs["ESET AV"].ESET.scan_time}
              <br />
              <b>Total files scanned:</b>{" "}
              {data.antivirus_logs["ESET AV"].ESET.total_files_scanned}
              <br />
              <b>Total Threat Files:</b>{" "}
              {data.antivirus_logs["ESET AV"].ESET.total_threats_detected}
              <br />
            </div>
          </div>
          <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>ClamAV</b>
            </div>
            <div>
              <b>Time-taken:</b>{" "}
              {data.antivirus_logs["CLAMAV"].ClamAV.scan_time}
              <br />
              <b>Total files scanned:</b>{" "}
              {data.antivirus_logs["CLAMAV"].ClamAV.total_files_scanned}
              <br />
              <b>Total Threat Files:</b>{" "}
              {data.antivirus_logs["CLAMAV"].ClamAV.total_threat_files}
              <br />
            </div>
          </div>

          {/* <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>AVG Internet Security</b>
            </div>
            <div>
              <b>Time-taken:</b> {dummy_avg_logs.scan_time}
              <br />
              <b>Total files scanned:</b> {dummy_avg_logs.total_files_scanned}
              <br />
              <b>Total Threats Found:</b> {dummy_avg_logs.total_threat_files}
              <br />
            </div>
          </div> */}

          <div className="border-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>Kaspersky Internet Security</b>
            </div>
            <div>
              <b>Time-taken:</b> {dummy_kaspersky_logs.scan_time}
              <br />
              <b>Total files scanned:</b>{" "}
              {dummy_kaspersky_logs.total_files_scanned}
              <br />
              <b>Total Threats Found:</b>{" "}
              {dummy_kaspersky_logs.total_detected_files}
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
