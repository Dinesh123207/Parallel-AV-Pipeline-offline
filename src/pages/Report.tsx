import { useNavigate } from "react-router-dom";

import { IoCheckmarkDoneOutline } from "react-icons/io5";
import OutletWrapper from "@/components/WrapperComponent/OutletWrapper";
import ButtonWrapper from "@/components/WrapperComponent/ButtonWrapper";

export default function AV_Details() {
  return (
    <OutletWrapper>
      <Scan_Overview />

      <Report_Buttons />

      <Antivirus />
    </OutletWrapper>
  );
}

function Antivirus() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between px-8 py-4 bg-secondary_bg-2 font-semibold w-full rounded-md">
        <div>Windows Defender</div>
        <div className="flex gap-2 items-center">
          <span>
            <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
          </span>
          Detected
        </div>
      </div>
      <div className="flex justify-between px-8 py-4 bg-secondary_bg-2 font-semibold w-full rounded-md">
        <div>ESET Total Security</div>
        <div className="flex gap-2 items-center">
          <span>
            <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
          </span>
          Detected
        </div>
      </div>
      <div className="flex justify-between px-8 py-4 bg-secondary_bg-2 font-semibold w-full rounded-md">
        <div>ClamAV</div>
        <div className="flex gap-2 items-center">
          <span>
            <IoCheckmarkDoneOutline color="#33F471" fontSize={20} />
          </span>
          Detected
        </div>
      </div>
    </div>
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

function Scan_Overview() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center text-lg font-medium">
        <div>Live Scan Logs</div>
        <div
          onClick={() => navigate(-1)}
          className="border px-6 w-1/12 text-center bg-primary-1 text-slate-800 rounded-lg py-1 text-sm hover:bg-primary-2 cursor-pointer transition hover:shadow "
        >
          BACK
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <div className=" flex rounded-md border-2 border-primary-1/40">
          <div className="border-r-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>USER:</b> LAPTOP-8F210CG
            </div>
            <div>
              <b>Date:</b> 10-08-2024
              <br />
              <b>Time :</b> 16:04:24
              <br />
              <b>Total files scanned:</b> 124543
              <br />
              <b>Time-taken:</b> 88s
              <br />
              <b>Report generation time:</b> 20s
            </div>
          </div>
          <div className="border-r-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>Windows Defender</b>
            </div>
            <div>
              <b>Time-taken:</b> 88s
              <br />
              <b>Total files scanned:</b> 124543
              <br />
              <b>Total Threat Files:</b> 11
              <br />
            </div>
          </div>
          <div className="border-r-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>ESET Total Security</b>
            </div>
            <div>
              <b>Time-taken:</b> 88s
              <br />
              <b>Total files scanned:</b> 124543
              <br />
              <b>Total Threat Files:</b> 11
              <br />
            </div>
          </div>
          <div className="border-r-2 flex flex-col gap-4 px-4 py-2 w-full border-primary-1/40">
            <div>
              <b>ClamAV</b>
            </div>
            <div>
              <b>Time-taken:</b> 88s
              <br />
              <b>Total files scanned:</b> 124543
              <br />
              <b>Total Threat Files:</b> 11
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
