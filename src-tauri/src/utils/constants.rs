// make a public constant for the app name
pub const APP_NAME: &str = "MAUT";

// make a public constant array for the app menu
pub const NETWORK_DEVICE_ADD: [&str; 1] = [
    r"VBoxManage guestcontrol Win1 mkdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\PC3 --username vboxuser --password abcd79802",
    // r"VBoxManage guestcontrol Win2 mkdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\PC3 --username vboxuser --password abcd79802",
    // r"VBoxManage guestcontrol Win3 mkdir C:\\Users\\vboxuser\\Desktop\\networkFolders\\PC3 --username vboxuser --password abcd79802",
];
