import { Button } from "@/components/ui/button";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa6";
import { Card } from "./components/card";
import { Chart } from "./components/chart";
import { Status, Suggestion } from "./components/suggestion";
import PageHeader from "@/components/PageHeader";
import Page from "@/components/Page";
import { open } from "@tauri-apps/api/shell";
import { resolveResource } from "@tauri-apps/api/path";
import { ScanSummary } from "./components/scansummary";
import PdfViewer from "@/components/PdfViewer";
import { useState } from "react";

const Report = () => {
  const allSuggestion = [
    {
      text: "Checking for password protection",
      status: Status.NONE,
    },
    {
      text: "Password file consistency",
      status: Status.SUGGESTION,
    },
    {
      text: "Checking password hashing rounds",
      status: Status.DISABLED,
    },
    {
      text: "PAM password strength tools",
      status: Status.OK,
    },
    {
      text: "Checking user password aging (minimum)",
      status: Status.DISABLED,
    },
    {
      text: "User password aging (maximum)",
      status: Status.DISABLED,
    },
    {
      text: "Checking USB devices authorization ",
      status: Status.ENABLED,
    },
    {
      text: "Checking /home mount point",
      status: Status.SUGGESTION,
    },
    {
      text: "Checking /tmp mount point",
      status: Status.SUGGESTION,
    },
    {
      text: "Checking /var mount point",
      status: Status.SUGGESTION,
    },
    {
      text: "Checking firewire ohci driver (modprobe config)",
      status: Status.DISABLED,
    },
    {
      text: "Administrator accounts",
      status: Status.OK,
    },
    {
      text: "Unique UIDs",
      status: Status.OK,
    },
    {
      text: "Logging failed login attempts",
      status: Status.ENABLED,
    }
  ];


  const [viewDocument, setViewDocument] = useState(false);

  const handleViewReport = () => {
    // handle pdf dialog
    setViewDocument(true);
  };

  return (
    <Page>
      <PageHeader title="Report and Analysis" />
      <div className="report-info h-[100px] text-justify text-white"><b className="text-medium text-[#c48dea]">MAUT</b> scans the selected folder, and upon completion, generates a comprehensive report that consolidates the results from all three antivirus scans. While the total number of files scanned remains consistent, the scanning time and files accessed may vary between scans. The final report provides detailed insights and logs for each individual scan. The chart displays the overall security status of the system based on the compiled results. You can <b className="text-medium text-[#c48dea]">View and Download</b> the consolidated report from here.
      </div>
      <div className=" pt-4 report-info h-[100px] text-justify text-white">
      To view file segregation, navigate to:  
      <b className="text-medium text-[#c48dea]">Target folder → Raw files + (Infected folder → Infected files)</b></div>

      <div className="px-20 pb-2 flex items-center justify-center gap-x-4">
        <AiOutlineFilePdf className="size-16 text-primary-foreground" />
        <PdfViewer pdfSrc="" />
      </div>

      {/* pdf dialog */}

      {/* <div className="px-20 pb-2 flex items-center justify-center gap-x-4 ">
        <AiOutlineFilePdf className="size-16 text-primary-foreground" />
        <Button size="lg" className="w-[230px] h-[50px] text-white mt-1 text-base bg-gradient-to-r from-[#A345E5] to-[#F04242] font-lg font-semibold">
          View OR Downloads
        </Button>
      </div> */}

      <div className="flex gap-x-4 py-6">
        <div className="w-1/2 bg-card py-2 pl-0 pr-0 border-2 border-primary rounded-xl">
          <div className="p-2.5 border-b-2 border-primary flex justify-between items-center">
            <h4 className="text-center w-full">System Scan Status</h4>
          </div>
          <Chart />
        </div>
        <div className="w-1/2 bg-card py-2 pl-0 pr-0 border-2 border-primary rounded-xl">
          <div className="p-2.5 border-b-2 border-primary flex justify-between items-center">
            <h4 className="text-center w-full">Scan Highlights</h4>
          </div>
          <ScanSummary />
        </div>
      </div>
    </Page>
  );
};

export default Report;
