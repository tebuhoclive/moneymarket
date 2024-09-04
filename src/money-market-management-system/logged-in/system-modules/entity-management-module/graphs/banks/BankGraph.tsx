import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ApexChartProps {
  // Define any additional props here if needed
}

export const BanksGraph: React.FC<ApexChartProps> = (props) => {
  const chartData: { series: any[]; options: ApexOptions } = {
    series: [
      {
        name: "PEP",
        data: [12, 45, 66, 43, 12],
      },
      {
        name: "NE",
        data: [53, 44, 21, 23, 12],
      },
      {
        name: "Domestic",
        data: [12, 33, 45, 33, 23],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            total: {
              enabled: true,
              offsetX: 0,
              style: {
                fontSize: "13px",
                fontWeight: 900,
              },
            },
          },
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      title: {
        text: "Client Statistics",
        style: {
          color: "#004c98", // Add your custom color here
        },
      },
      xaxis: {
        categories: [
          "First National Bank",
          "Bank Windhoek",
          "Bank Of Namibia",
          "NEDBANK",
          "Standard Bank",
        ],

        labels: {
          style: {
            colors: ["#004c98", "#004c98", "#004c98", "#004c98", "#004c98"],
          },
        },
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};
