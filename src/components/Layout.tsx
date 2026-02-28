import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarComponent from "./SidebarComponent";
import MainWrapper from "./Helper Components/MainWrapper";
import { MdClose } from "react-icons/md";
import ButtonWrapper from "./WrapperComponent/ButtonWrapper";

interface LayoutProps {
  scanning: boolean;
  responseTimestamp: string;
  showPopup: string;
}

interface ToastProps {
  type: {
    event: string;
    timestamp?: string;
  };
}

const Layout = ({ scanning, responseTimestamp, showPopup }: LayoutProps) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <MainWrapper>
      <Toast type={{ event: showPopup, timestamp: responseTimestamp }} />

      <SidebarComponent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div
        className={`flex-1  transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Outlet />
      </div>
    </MainWrapper>
  );
};

const Toast: React.FC<ToastProps> = ({ type }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timerWidth, setTimerWidth] = useState(100);

  useEffect(() => {
    if (!type.event || type.event === "") {
      setIsVisible(false);
      return;
    }

    // Show the toast when the event changes
    setIsVisible(true);
    setTimerWidth(100);

    // Start the timer for auto-hide
    const timerInterval = setInterval(() => {
      setTimerWidth((prev) => (prev > 0 ? prev - 1 : 0));
    }, 50); // Adjust to sync with the 5-second duration

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      clearInterval(timerInterval);
      clearTimeout(timeout);
    };
  }, [type.event]);

  if (!isVisible || type.event === "") return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className="relative bg-secondary_bg-2 border border-gray-300 shadow-md rounded-md  flex flex-col space-y-2"
        style={{ width: "30dvw" }}
      >
        <button
          className="absolute top-2 right-2 flex items-center justify-center"
          onClick={handleClose}
          title="Close"
        >
          <MdClose color="#E71802" fontSize={20} />
        </button>

        {type.event === "scan_started" && (
          <div className="flex flex-col gap-1">
            <div className="px-4 text-lg text-slate-100 font-bold">
              Scan Started
            </div>
            <p className="px-4 text-gray-200">
              Scanning in progress... Please wait.
            </p>
          </div>
        )}

        {type.event === "scan_complete" && (
          <div className="flex flex-col gap-1">
            <div className="px-4 text-lg text-slate-100 font-semibold">
              Scan Completed
            </div>
            <p className="px-4 text-gray-200">
              Scanning completed! You can download the report or view the logs.
            </p>
            <div className="flex justify-end gap-2 px-4 py-2">
              <ButtonWrapper
                buttonText="Analyze "
                onclick={() => console.log("Analyze action triggered")}
              />
              <ButtonWrapper
                buttonText="Download "
                onclick={() => console.log("Analyze action triggered")}
              />
            </div>
          </div>
        )}
        {/* Timer Line */}
        <div
          className="h-1 bg-primary-1"
          style={{ width: `${timerWidth}%`, transition: "width 50ms linear" }}
        ></div>
      </div>
    </div>
  );
};

export default Layout;
