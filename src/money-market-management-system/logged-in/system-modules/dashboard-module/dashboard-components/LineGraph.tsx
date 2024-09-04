import React, { useEffect } from 'react';
import Chart from 'apexcharts';

interface LineGraphProps {
  fontColor?: string; // Prop to pass the font color dynamically
}

const LineGraphChart: React.FC<LineGraphProps> = ({ fontColor }) => {
  useEffect(() => {
    new Chart(document.querySelector('#reportsChart') as HTMLElement, {
      series: [
        { name: 'Bonds', data: [31, 40, 28, 51, 42, 82, 56] },
        { name: 'Equities', data: [11, 32, 45, 32, 34, 52, 41] },
        { name: 'Treasury Bills', data: [14, 15, 32, 18, 9, 24, 12] },
        { name: 'Fixed Deposits', data: [12, 21, 33, 24, 7, 12, 11] },
        { name: 'Unit Trusts', data: [15, 11, 22, 56, 9, 23, 10] },
      ],
      chart: {
        height: 350,
        type: 'area',
        foreColor:fontColor,
        toolbar: {
          show: false,
        },
        // Set the color for each series
        colors: ['#4154f1', '#2eca6a', '#ff771d', '#color-for-fixed-deposits', '#color-for-unit-trusts'],
      },
      markers: {
        size: 4,
      },
      fill: {
        type: 'gradient',
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
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      
xaxis: {
  type: 'datetime',
  categories: [
    '2018-09-19T00:00:00.000Z',
    '2018-09-19T01:30:00.000Z',
    '2018-09-19T02:30:00.000Z',
    '2018-09-19T03:30:00.000Z',
    '2018-09-19T04:30:00.000Z',
    '2018-09-19T05:30:00.000Z',
    '2018-09-19T06:30:00.000Z',
  ],
  labels: {
    style: {
      colors: [fontColor],
    },
  },
},
yaxis: {
  labels: {
    style: {
      colors: [fontColor],
    },
  },
},
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
      legend: {
        labels: {
          colors: [fontColor],
        },
      },
    }).render();
  }, []);

  return <div id="reportsChart" />;
};

export default LineGraphChart;
