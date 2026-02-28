import { downloadLogs } from "@/utils/helper";
import { ImCross } from "react-icons/im";
function DownloadPopup({
  setIsResultReady,
  currentReport,
}: {
  setIsResultReady: (ready: boolean) => void;
  currentReport: any;
}) {
  return (
    <div className="mt-4 relative bg-gray-300/30 w-full rounded-md py-2 px-6">
      <button
        onClick={() => setIsResultReady(false)}
        className="absolute top-1 bg-transparent right-1 "
      >
        <ImCross size={"10px"} />
      </button>

      <div className="flex justify-between ">
        <div>
          <div className="text-xl font-semibold text-gray-200">Title</div>
          <div className="text-white">
            Scanning in all three antivirus is completed. Detailed report can be
            downloaded using download button.
          </div>
        </div>
        <div className="flex cursor-pointer items-center justify-center px-4 py-2">
          <button
            className="px-3 bg-primary text-white py-1 font-semibold "
            onClick={() => {
              downloadLogs(currentReport);
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadPopup;
