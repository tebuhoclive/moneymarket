import { ApexOptions } from "apexcharts";
import React, { FC } from "react";
import ReactApexChart from "react-apexcharts";

interface ApexChartProps {}

const DepositBarChart: FC<ApexChartProps> = () => {
  const state: { series: number[]; options: ApexOptions } = {
    series: [20, 30], // Adjust the values based on the number of deposits pending and verified
    options: {
      chart: {
        type: "donut",
        height: 300, // Adjust the height as needed
        width: "100%", // Use 100% for full width
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
       width:200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      labels: ["Pending", "Verified"], // Labels for each segment in the donut chart
      dataLabels: {
        enabled: false, // Set to false to hide percentage labels
      },
    },
  };

  return (
    <div id="chart" style={{ height: "300px", width: "100%" }}>
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="donut"
      />
    </div>
  );
};

export default DepositBarChart;
