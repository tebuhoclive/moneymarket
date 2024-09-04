import React, { FC } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import "../../Overview.scss";

interface ApexChartProps {}

export const OvertimeGraph: FC<ApexChartProps> = () => {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [1, 1, 4],
    },
    title: {
      text: "Monthly Deposits and Withdrawals",
      align: "left",
      offsetX: 110,
      style: {
        color: "#004c98", // Add your custom color here
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          colors: [
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
            "#004c98",
          ],
        },
      },
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#008FFB",
        },
        labels: {
          style: {
            colors: "#008FFB",
          },
        },
        title: {
          text: "Amount (NAD)",
          style: {
            color: "#008FFB",
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      {
        seriesName: "Deposits",
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#00E396",
        },
        labels: {
          style: {
            colors: "#00E396",
          },
        },
        title: {
          text: "Deposits",
          style: {
            color: "#00E396",
          },
        },
      },
      {
        seriesName: "Withdrawals",
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#FEB019",
        },
        labels: {
          style: {
            colors: "#FEB019",
          },
        },
        title: {
          text: "Withdrawals",
          style: {
            color: "#FEB019",
          },
        },
      },
    ],
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft",
        offsetY: 30,
        offsetX: 60,
      },
    },
    legend: {
      horizontalAlign: "left",
      offsetX: 40,
    },
  };

  const series = [
    {
      name: "Deposits",
      type: "column",
      data: [
        500, 800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500,
      ], // Adjusted values for deposits (in USD)
    },
    {
      name: "Withdrawals",
      type: "column",
      data: [
        300, 500, 800, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
      ], // Adjusted values for withdrawals (in USD)
    },
  ];

  return (
    <div id="chart">
      <div className="uk-margin">
        <div>Filter Year</div>
        <input min={2021} type="number" />
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};
