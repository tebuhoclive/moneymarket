import React, { useEffect, useRef } from "react";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
);

export const PurchasesGraph = observer(() => {
const { store, api } = useAppContext();

const chartRef = useRef(null);

const options = {
  indexAxis: "x" as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Total Purchases ",
    },
  },
};

const data = {
  labels: ["Treasury Bills", "Bonds", "Fixed Deposits", "Equities", "Unit Trusts"],
  datasets: [
    {
      label: "Instruments",
      data: [30, 20, 34, 15, 25],
      borderColor: "green",
      backgroundColor: "green",
    },
  ],
};

return (
 <Bar options={options} data={data} 
  />
)
;
});
