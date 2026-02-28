import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainContent from "./components/MainContent";
import View_Logs from "./pages/View_Logs";
import Threat_Protection from "./pages/Threat_Protection";
import Updates from "./pages/Updates";
import Report from "./pages/Report";
import AV_Details from "./pages/Report";
import Analysis from "./pages/Analysis";
import Network from "./pages/Network";
import { toast, Toaster } from "sonner";
import { listen } from "@tauri-apps/api/event";
import useAppStore from "./utils/store";
import { updatePCLog } from "./utils/helper";
import { LogData } from "./utils/types";

function App() {
  const {
    scanning,
    setScanning,
    percentScanned,
    setPercentScanned,
    currScanningFolder,
    setCurrScanningFolder,
    setShowPopup,
    showPopup,
    responseTimestamp,
    setResponseTimestamp,
    isCompleted,
    setIsCompleted,
    setNetworkScanning,
    setNetworkPcScanning,
  } = useAppStore();

  interface MainContentProps {
    currScanningFolder: string;
    isCompleted: boolean;
    scanning: boolean;
    percentScanned: number;
    setPercentScanned: React.Dispatch<React.SetStateAction<number>>;
  }
  const [logData, setLogData] = useState<LogData>({ dirs: [], storage: "", uuid: "" });


  listen<{ uuid: string }>("scan_started", (event) => {
    setCurrScanningFolder(event.payload.uuid);
    setScanning(true);
    setShowPopup(event.event);
    console.log("Scan started event received...");
  });

  listen<{ timestamp: string }>("scan_completed", (event) => {
    setResponseTimestamp(event.payload.timestamp);
    console.log("Scan complete event received:", event.payload.timestamp);
    setIsCompleted(true);
    setTimeout(() => {
      setScanning(false);
      setShowPopup(event.event);
    }, 2000);
  });

  listen<{ name: string }>("network_scan_started", (e) => {
    setNetworkScanning(true);
    setNetworkPcScanning(e.payload.name);
    toast.message("Network Scan started.", {
      description: "Scanning of network PC is started.",
      duration: 3000,
    });
  });

  listen("network_scan_completed", (event: any) => {
    console.log(event.payload.timestamp);
    setNetworkScanning(false);
    updatePCLog(event.payload.pcName, event.payload.timestamp);
    toast.message("Network Scan completed.", {
      description: "Scanning of network pc is started.",
      duration: 3000,
      //change here the function of onclick
    });
  });

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8008");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      setIsCompleted(false);
      if (data.event === "scan_started") {
        setCurrScanningFolder(data.data.uuid);
        setScanning(true);
        setShowPopup(data.event);
        setLogData(data.data);
        console.log("Scan started event received...");
      } else if (data.event === "scan_complete") {
        setResponseTimestamp(data.timestamp);
        // console.log("Scan complete event received:", data.timestamp);
        setIsCompleted(true);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                scanning={scanning}
                responseTimestamp={responseTimestamp}
                showPopup={showPopup}
              />
            }
          >
            <Route
              index
              element={
                <MainContent logData={logData} />
              }
            />
            <Route path="view_logs">
              <Route
                path=""
                element={
                  <View_Logs
                    networkScanning={false}
                    scanning={scanning}
                    setSelectedTimestamp={(timestamp) => {
                      console.log("Selected timestamp:", timestamp);
                    }}
                  />
                }
              />
              <Route path=":timestamp" element={<Analysis />} />
            </Route>
            <Route path="threat_protection" element={<Threat_Protection />} />
            <Route path="updates" element={<Updates />} />
            <Route path="av_details" element={<AV_Details />} />
            <Route path="report" element={<Report />} />
            <Route path="network" element={<Network />} />
          </Route>
        </Routes>
      </Router>
      <Toaster expand={true} />
    </>
  );
}

export default App;
