import LOGO from "../assets/logo.png";
import LOGO2 from "../assets/logo2.png";

import { MdOutlineHistory, MdOutlineFileDownload } from "react-icons/md";
import { BiBarChartAlt2 } from "react-icons/bi";
import { RiHomeFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { tabClass } from "@/utils/helper";
import { FaNetworkWired } from "react-icons/fa";
import { FaComputer } from "react-icons/fa6";

import SidebarToggleButton from "./Helper Components/SidebarToggleButton";

export default function SidebarComponent({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();

  const tabs = [
    { id: "view_logs", icon: MdOutlineHistory, label: "View Logs" },
    { id: "updates", icon: MdOutlineFileDownload, label: "Updates" },
    // { id: "av_details", icon: BiBarChartAlt2, label: "AV Details" },
    { id: "network", icon: FaNetworkWired, label: "Network" },
  ];

  // !  make the logs to seem like

  return (
    <div
      className={`border-r-2 border-primary-1/20 flex flex-col h-full fixed left-0 top-0 bg-primary_bg transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`my-16 ${isSidebarOpen ? "px-8" : "px-2"} grid space-y-20 `}
      >
        <div className="flex hover:shadow  hover:scale-105 transition-transform px-1 py-1 cursor-pointer">
          <img
            src={isSidebarOpen ? LOGO : LOGO2}
            alt="MAUT LOGO"
            className={isSidebarOpen ? "w-auto" : "w-12"}
            onClick={() => {
              setActiveTab("dashboard");
              navigate("/");
            }}
          />
        </div>

        <div className="grid space-y-8">
          <div
            onClick={() => {
              setActiveTab("dashboard");
              navigate("/");
            }}
            className={
              isSidebarOpen
                ? tabClass(activeTab, "dashboard")
                : `flex justify-center  items-center cursor-pointer  ${
                    activeTab === "dashboard"
                      ? "text-primary-1"
                      : "text-gray-500 hover:text-primary-2"
                  }`
            }
            title="dashboard"
          >
            <RiHomeFill fontSize={isSidebarOpen ? 20 : 30} />
            {isSidebarOpen && <span className="ml-2">Dashboard</span>}
          </div>

          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(`/${tab.id}`);
              }}
              className={
                isSidebarOpen
                  ? tabClass(activeTab, tab.id)
                  : `flex justify-center items-center cursor-pointer ${
                      activeTab === tab.id
                        ? "text-primary-1"
                        : "text-gray-500 hover:text-primary-2"
                    }`
              }
              title={tab.label}
            >
              <tab.icon fontSize={isSidebarOpen ? 20 : 30} />
              {isSidebarOpen && <span className="ml-2">{tab.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons to open and close the sidebar */}

      <SidebarToggleButton
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
