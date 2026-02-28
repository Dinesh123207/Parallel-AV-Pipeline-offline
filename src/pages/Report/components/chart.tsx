import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FaPlay, FaPause } from 'react-icons/fa';

const data = [
  { name: "Password Protection", y: 1 },
  { name: "Password File Consistency", y: 0 },
  { name: "Password Hashing Rounds", y: 1 },
  { name: "User Password Aging (Minimum)", y: 1 },
  { name: "User Password Aging (Maximum)", y: 1 },
  { name: "/home Mount Point", y: 1 },
  { name: "/tmp Mount Point", y: 1 },
  { name: "/var Mount Point", y: 1 },
  { name: "PAM password strength tools", y: 1 },
  { name: "Checking USB devices authorization", y: 1 },
  { name: "Firewire OHCI Driver", y: 1 },
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1},
  { name: "Administrator accounts", y: 1 },
  { name: "Unique UIDs", y: 1 },
  { name: "Logging failed login attempts", y: 1}
];

export const Chart = () => {
  // Count the occurrences of each status
  const statusCounts = data.reduce(
    (acc, item) => {
      if (item.y === 0) acc[0]++;
      if (item.y === 1) acc[1]++;
      return acc;
    },
    { 0: 0, 1: 0, 2: 0 }
  );

  const options: Highcharts.Options = {
    chart: {
      plotBackgroundColor: "#141414",
      plotShadow: false,
      type: "pie",
      backgroundColor: "#141414",
    },
    title: {
      text: "",
      align: "center",
      style: {
        color: "#DDD",
        fontSize: "20px",
      },
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        colors: [
          "#ff3333", // Monochromatic color shades
          "#9c3dde",
        ],
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b><br>{point.percentage:.1f} %",
          distance: -50,
          filter: {
            property: "percentage",
            operator: ">",
            value: 4,
          },
        },
      },
    },
    series: [
      {
        name: "System Scan Status",
        type: "pie",
        data: [
          { name: "Infected", y: statusCounts[0] }, // count of status '0'
          { name: "Safe", y: statusCounts[1] }, // count of status '1'
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
