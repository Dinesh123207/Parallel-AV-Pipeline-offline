import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface PDFViewerProps {
  pdfSrc: string;
}

const PdfViewer: React.FC<PDFViewerProps> = () => {
  const [viewDocument, setViewDocument] = useState(false);

  const handleViewReport = () => {
    // handle pdf dialog
    setViewDocument(true);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="text-lg font-semibold bg-gradient-to-r from-[#A345E5] to-[#F04242] text-white"
          onClick={handleViewReport}
        >
          View / Downloads
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[750px]">
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
        </DialogHeader>

        <div className="p-0">
          <iframe
            title="PDF Viewer"
            src={"/report_10-09-2024_16_00_11.pdf"}
            // src={props.pdfSrc}
            width="100%"
            height="800px"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
