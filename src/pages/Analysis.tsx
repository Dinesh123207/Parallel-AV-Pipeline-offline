import { useNavigate, useParams } from "react-router-dom";

import { IoCheckmarkDoneOutline } from "react-icons/io5";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";
import ButtonWrapper from "@/components/WrapperComponent/ButtonWrapper";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";

import combinedData from "../../logs/combined_report.json";
import { Root } from "react-dom/client";
import {
  parseTimestampDate,
  parseTimestampTime,
} from "@/utils/helper/viewLogsHelper";
import { Scan_Overview } from "@/components/View Logs Helper/Scan_Overview";
import { Antivirus } from "@/components/View Logs Helper/Threat_Accordian";
import { generateReport } from "@/utils/helper/reportGenerate";

export default function Analysis() {
  const timestamp = useParams().timestamp;

  const [data, setData] = useState(
    combinedData.find((c) => c.timestamp === timestamp)?.data
  );

  if (timestamp === undefined) {
    return <>PAGE NOT FOUND</>;
  }

  function handleDownload(timestamp: string) {
    console.log(timestamp);
    const rs = generateReport(timestamp);
  }

  return (
    <OutletWrapper>
      <Scan_Overview data={data} timestamp={timestamp} />
      {/* <Report_Buttons /> */}
      <Antivirus data={data} />

      <div className="flex justify-center items-center">
        <ButtonWrapper
          buttonText="Download Report"
          onclick={() => handleDownload(timestamp)}
        />
      </div>
    </OutletWrapper>
  );
}

function Report_Buttons() {
  return (
    <div className="flex justify-center items-center gap-5">
      <ButtonWrapper
        buttonText="VIEW REPORT"
        onclick={() => console.log("view report button clicked ")}
      />
      <ButtonWrapper
        buttonText="VIEW ANALYSIS"
        onclick={() => console.log("view analysis button clicked ")}
      />
      <ButtonWrapper
        buttonText="CLEAN FILES"
        onclick={() => console.log("Clean file button clicked ")}
      />
    </div>
  );
}
