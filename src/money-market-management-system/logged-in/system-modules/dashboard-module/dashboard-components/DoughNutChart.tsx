import React, { useEffect, useRef } from "react";
import Chart from "apexcharts";

interface DoughnutChartProps {
  fontColor?: string; // Prop to pass the font color dynamically
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ fontColor }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartContainer = chartContainerRef.current;

    // Ensure the container is empty before rendering the chart
    chartContainer.innerHTML = "";

    const options = {
      chart: {
        type: "donut",
        height: 350,
        foreColor:fontColor,
        toolbar: {
          show: false,
        },
        parentHeightOffset: 0,
      },
      series: [44, 55, 41],
      labels: ["IJG COR", "IJG IND", "IJG TAX"],
      colors: ["#4154f1", "#2eca6a", "#ff771d"],
      fill: {
        type: "solid",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.4,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "right",
        labels:{colors: [fontColor,fontColor,fontColor]}
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
       width:200,
              align: "center",
            },
            legend: {
              position: "bottom",
              labels:{colors:[fontColor]}
            },
          },
        },
      ],
      stroke: {
        width: 0,
      },
    };

    const chart = new Chart(chartContainer, options);

    // Manually add a class to the chart container
    // chartContainer.classList.add("main-title-sm");

    chart.render();

    // Cleanup function to destroy the chart on component unmount
    return () => {
      chart.destroy();
    };
  }, [chartContainerRef]);

  return <div id="doughnutChart" ref={chartContainerRef} />;
};

export default DoughnutChart;
