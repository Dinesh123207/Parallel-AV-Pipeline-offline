export const SCAN_COMMANDS = [
  `VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c MpCmdRun.exe -Scan -ScanType 3 -File \\\\VBOXSVR\\share -DisableRemediation`,
  "VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c ecls.exe \\\\VBOXSVR\\share",
  "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd /c clamscan.exe --recursive \\\\VBOXSVR\\share",
];

export const STARTUP_COMMANDS = [
  "vboxmanage sharedfolder add Win1 --name share --hostpath C:\\Users\\ADMIN\\Desktop\\MAUT\\src-tauri\\symlinks --transient",
  "vboxmanage sharedfolder add Win2 --name share --hostpath C:\\Users\\ADMIN\\Desktop\\MAUT\\src-tauri\\symlinks --transient",
  "vboxmanage sharedfolder add Win3 --name share --hostpath C:\\Users\\ADMIN\\Desktop\\MAUT\\src-tauri\\symlinks --transient",
  "vboxmanage sharedfolder add Win4 --name share --hostpath C:\\Users\\ADMIN\\Desktop\\MAUT\\src-tauri\\symlinks --transient",
];

export const UPDATE_COMMANDS = {
  offline: [
    {
      id: 1,
      antivirus: "Windows Defender",
      command: "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd.exe /c C:\\Users\\vboxuser\\Downloads\\windows_defender_update.bat"
    },
    {
      id: 2,
      antivirus: "ESET Total Security",
      command: "VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd.exe /c C:\\Users\\vboxuser\\Downloads\\eset_update.bat"
    },
    {
      id: 3,
      antivirus: "ClamAV",
      command: "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- cmd.exe /c C:\\Users\\vboxuser\\Downloads\\clamav_update.bat"
    }
  ],
  online: [
    {
      id: 1,
      antivirus: "Windows Defender",
      command: "VBoxManage guestcontrol Win1 run --username vboxuser --password abcd79802 --exe cmd.exe -- /c MpCmdRun.exe -SignatureUpdate"
    },
    {
      id: 2,
      antivirus: "ESET Total Security",
      command: "VBoxManage guestcontrol Win3 run --username vboxuser --password abcd79802 --exe cmd.exe -- /c ecls.exe /update"
    },
    {
      id: 3,
      antivirus: "ClamAV",
      command: "VBoxManage guestcontrol Win2 run --username vboxuser --password abcd79802 --exe cmd.exe -- /c freshclam.exe"
    }
  ]
}

export const cardDetails = [
  {
    heading: "Operating System: Windows 11",
    antivirus: "AntiVirus: Windows Defender",
    ram: "RAM: 4GB",
    storage: "Storage: 80GB",
    cta: "View Logs",
  },
  {
    heading: "Operating System: Windows 11",
    antivirus: "AntiVirus: ESET Total Security",
    ram: "RAM: 6GB",
    storage: "Storage: 60GB",
    cta: "View Logs",
  },
  {
    heading: "Operating System: Windows 11",
    antivirus: "AntiVirus: ClamAV Total Security",
    ram: "RAM: 4GB",
    storage: "Storage: 50GB",
    cta: "View Logs",
  },
];

export const DUMMY_FOLDERS = [
  "C:\\data\\folder15\\folder80",
  "C:\\data\\folder16",
  "C:\\data\\folder19\\folder50",
  "C:\\data\\folder19\\folder54\\folder38",
  "C:\\data\\folder21\\folder93\\folder41\\folder72",
  "C:\\data\\folder26\\folder1\\folder60",
  "C:\\data\\folder29\\folder53\\folder98\\folder97\\folder31",
  "C:\\data\\folder2\\folder48\\folder9\\folder96\\folder59",
  "C:\\data\\folder35\\folder42",
  "C:\\data\\folder48\\folder25\\folder80\\folder95",
  "C:\\data\\folder52",
  "C:\\data\\folder64",
  "C:\\data\\folder64\\folder97\\folder33\\folder28",
  "C:\\data\\folder65\\folder50\\folder41\\folder91",
  "C:\\data\\folder67\\folder29\\folder58\\folder46\\folder62",
  "C:\\data\\folder74\\folder70\\folder89\\folder6\\folder7",
  "C:\\data\\folder76\\folder45\\folder100",
  "C:\\data\\folder78",
  "C:\\data\\folder86\\folder94\\folder8\\folder92",
  "C:\\data\\folder9\\folder43\\folder43",
  "C:\\projects\\folder16\\folder71",
  "C:\\projects\\folder26\\folder53\\folder4\\folder98",
  "C:\\projects\\folder29",
  "C:\\projects\\folder34",
  "C:\\projects\\folder43\\folder26",
  "C:\\projects\\folder43\\folder42\\folder34\\folder59\\folder7",
  "C:\\projects\\folder50\\folder15\\folder8\\folder40\\folder53",
  "C:\\projects\\folder50\\folder70\\folder100",
  "C:\\projects\\folder52\\folder49",
  "C:\\projects\\folder57",
  "C:\\projects\\folder61",
  "C:\\projects\\folder62",
  "C:\\projects\\folder65\\folder49\\folder61\\folder31",
  "C:\\projects\\folder66\\folder23\\folder93\\folder8",
  "C:\\projects\\folder70",
  "C:\\projects\\folder71",
  "C:\\projects\\folder77",
  "C:\\projects\\folder78",
  "C:\\projects\\folder80\\folder74\\folder5\\folder15",
  "C:\\projects\\folder82",
  "C:\\test\\folder10\\folder15",
  "C:\\test\\folder15",
  "C:\\test\\folder20\\folder43\\folder51\\folder65\\folder46",
  "C:\\test\\folder21\\folder55\\folder86\\folder68",
  "C:\\test\\folder23\\folder80\\folder5",
  "C:\\test\\folder26\\folder96\\folder81",
  "C:\\test\\folder33\\folder14\\folder69\\folder95",
  "C:\\test\\folder35\\folder6\\folder8\\folder67\\folder68",
  "C:\\test\\folder43\\folder71",
  "C:\\test\\folder60\\folder8",
  "C:\\test\\folder63\\folder19",
  "C:\\test\\folder64\\folder13\\folder22",
  "C:\\test\\folder65\\folder45\\folder74",
  "C:\\test\\folder74",
  "C:\\test\\folder75\\folder35\\folder37",
  "C:\\test\\folder76",
  "C:\\test\\folder82\\folder7",
  "C:\\test\\folder85",
  "C:\\test\\folder89\\folder53\\folder39",
  "C:\\test\\folder96\\folder29\\folder29\\folder43",
  "C:\\user\\abc\\folder10",
  "C:\\user\\abc\\folder25\\folder19",
  "C:\\user\\abc\\folder30\\folder86\\folder100\\folder79\\folder3",
  "C:\\user\\abc\\folder43\\folder4\\folder6",
  "C:\\user\\abc\\folder45\\folder84\\folder100\\folder97\\folder35",
  "C:\\user\\abc\\folder51\\folder100\\folder82\\folder1",
  "C:\\user\\abc\\folder58\\folder81\\folder21\\folder52",
  "C:\\user\\abc\\folder59\\folder6\\folder16",
  "C:\\user\\abc\\folder59\\folder92\\folder65\\folder97",
  "C:\\user\\abc\\folder75\\folder4",
  "C:\\user\\abc\\folder77",
  "C:\\user\\abc\\folder86\\folder55\\folder50",
  "C:\\user\\abc\\folder87",
  "C:\\user\\abc\\folder89",
  "C:\\user\\abc\\folder89\\folder59\\folder97\\folder73\\folder4",
  "C:\\user\\abc\\folder92\\folder8",
  "C:\\user\\abc\\folder94\\folder42",
  "C:\\user\\abc\\folder98\\folder20\\folder57\\folder51\\folder99",
  "C:\\user\\abc\\folder98\\folder71\\folder9\\folder28",
  "C:\\user\\abc\\folder9\\folder63",
  "C:\\user\\folder13\\folder19\\folder90",
  "C:\\user\\folder16\\folder5\\folder77\\folder60",
  "C:\\user\\folder19\\folder96",
  "C:\\user\\folder26",
  "C:\\user\\folder29\\folder1\\folder90\\folder2\\folder56",
  "C:\\user\\folder2\\folder27\\folder23\\folder64",
  "C:\\user\\folder41\\folder26\\folder40\\folder54",
  "C:\\user\\folder43",
  "C:\\user\\folder43\\folder93\\folder58",
  "C:\\user\\folder52\\folder63\\folder92",
  "C:\\user\\folder67\\folder99\\folder40\\folder28",
  "C:\\user\\folder71",
  "C:\\user\\folder71\\folder16",
  "C:\\user\\folder71\\folder92\\folder66\\folder12",
  "C:\\user\\folder75\\folder71",
  "C:\\user\\folder77\\folder72",
  "C:\\user\\folder79\\folder73",
  "C:\\user\\folder87\\folder1\\folder3\\folder74\\folder11",
  "C:\\user\\folder93\\folder27\\folder90\\folder34",
  "C:\\user\\folder9\\folder58\\folder55\\folder36",
  "C:\\user\\xyz\\folder10",
];

import { AntivirusOption, ScanRow, UpdateHistory } from "./types";

export const AV_OPTIONS: AntivirusOption[] = [
  { id: "1", name: "Windows Defender" },
  { id: "2", name: "ESET Total Security" },
  { id: "3", name: "ClamAV" },
];

export type stringStateSetter = React.Dispatch<React.SetStateAction<string>>;

export const DUMMY_AUTOMATIC_SCAN_STATUS = [
  {
    path: "C:\\User\\test1",
    status: "active",
  },
  {
    path: "C:\\User\\test2",
    status: "active",
  },
  {
    path: "C:\\User\\test1\\etst",
    status: "active",
  },
  {
    path: "C:\\User\\test23",
    status: "active",
  },
  {
    path: "C:\\User\\test34",
    status: "active",
  },
  {
    path: "C:\\User\\test1jshd",
    status: "scanning",
  },
  {
    path: "C:\\User\\test1jsdhj",
    status: "active",
  },
  {
    path: "C:\\User\\test1jshdj",
    status: "active",
  },
  {
    path: "C:\\User\\test1",
    status: "deactivated",
  },

  {
    path: "C:\\User\\test1",
    status: "scanning",
  },
];

export const DUMMY_SCAN_DATA: ScanRow[] = [
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  { id: "", type: "full", time: "22/11/2024; 12:04:32 PM" },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "",
    type: "custom",
    path: "C:\\Users\\YourUsername\\Documents",
    time: "22/11/2024; 12:04:32 PM",
  },
];

export const DUMMY_UPDATE_HISTORY: UpdateHistory[] = [
  {
    id: "1",
    updateStatus: true,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: false,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: true,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: false,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: false,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: true,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: true,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: false,
    time: "22/11/2024; 12:04:32 PM",
  },
  {
    id: "1",
    updateStatus: false,
    time: "22/11/2024; 12:04:32 PM",
  },
];
