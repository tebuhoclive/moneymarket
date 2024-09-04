import React, { FC } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TransactionChartProps {}

const TransactionChart: FC<TransactionChartProps> = () => {
  // Test data for deposits, withdrawals, and dates
  const deposits = [100, 150, 200, 180, 220];
  const withdrawals = [50, 80, 120, 90, 100];
  const dates = [
    "2023-01-01T00:00:00.000Z",
    "2023-01-02T00:00:00.000Z",
    "2023-01-03T00:00:00.000Z",
    "2023-01-04T00:00:00.000Z",
    "2023-01-05T00:00:00.000Z",
  ];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: "area",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      type: "datetime",
      categories: dates,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  const series = [
    {
      name: "Deposits",
      data: deposits,
    },
    {
      name: "Withdrawals",
      data: withdrawals,
    },
  ];

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={350}
      />
    </div>
  );
};

export default TransactionChart;
