import { create } from "zustand";

interface LogData {
  uuid: string;
  dirs: string[];
  storage: string;
}

interface AppState {
  scanning: boolean;
  percentScanned: number;
  currScanningFolder: string;
  networkScanning: boolean;
  networkPcScanning: string;
  showPopup: string;
  responseTimestamp: string;
  isCompleted: boolean;

  progresses: number[]; // Progress for each AV
  avLogData: LogData[]; // Log data for each AV
  logData: LogData; // Individual log data

  // Methods for updating state
  setScanning: (value: boolean) => void;
  setPercentScanned: (value: number) => void;
  setCurrScanningFolder: (folder: string) => void;
  setNetworkScanning: (value: boolean) => void;
  setNetworkPcScanning: (pcName: string) => void;
  setShowPopup: (popup: string) => void;
  setResponseTimestamp: (timestamp: string) => void;
  setIsCompleted: (value: boolean) => void;

  // Methods for updating progresses, avLogData, and logData
  setProgresses: (progresses: number[]) => void;
  updateProgress: (index: number, value: number) => void;

  setAvLogData: (data: LogData[]) => void;
  updateAvLogData: (index: number, logData: LogData) => void;

  setLogData: (data: LogData) => void;
  updateLogData: (key: keyof LogData, value: string | string[]) => void;
}

const useAppStore = create<AppState>((set) => ({
  scanning: false,
  percentScanned: 0,
  currScanningFolder: "",
  networkScanning: false,
  networkPcScanning: "",
  showPopup: "",
  responseTimestamp: "",
  isCompleted: false,

  progresses: [0, 0, 0], // Initialize with default progress
  avLogData: [
    { uuid: "", dirs: [], storage: "" },
    { uuid: "", dirs: [], storage: "" },
    { uuid: "", dirs: [], storage: "" },
  ], // Initialize with default log data
  logData: { uuid: "", dirs: [], storage: "" }, // Default individual log data

  setScanning: (value) => set({ scanning: value }),
  setPercentScanned: (value) => set({ percentScanned: value }),
  setCurrScanningFolder: (folder) => set({ currScanningFolder: folder }),
  setNetworkScanning: (value) => set({ networkScanning: value }),
  setNetworkPcScanning: (pcName) => set({ networkPcScanning: pcName }),
  setShowPopup: (popup) => set({ showPopup: popup }),
  setResponseTimestamp: (timestamp) => set({ responseTimestamp: timestamp }),
  setIsCompleted: (value) => set({ isCompleted: value }),

  setProgresses: (progresses) => set({ progresses }),
  updateProgress: (index, value) =>
    set((state) => {
      const newProgresses = [...state.progresses];
      newProgresses[index] = value;
      return { progresses: newProgresses };
    }),

  setAvLogData: (data) => set({ avLogData: data }),
  updateAvLogData: (index, logData) =>
    set((state) => {
      const newAvLogData = [...state.avLogData];
      newAvLogData[index] = logData;
      return { avLogData: newAvLogData };
    }),

  setLogData: (data) => set({ logData: data }),
  updateLogData: (key, value) =>
    set((state) => ({
      logData: {
        ...state.logData,
        [key]: value,
      },
    })),
}));

export default useAppStore;
