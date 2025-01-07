'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BeamChart({ chartData, length, invertYAxis }) {
  if (!chartData) {
    return null;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartData.title,
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: length,
        ticks: {
          beginAtZero: true,
          callback: function (value) {
            return value;
          },
        },
        position: 'bottom',
      },
      y: {
        reverse: invertYAxis || false,
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label,
        data: chartData.data.map((value, index) => ({
          x: parseFloat(chartData.labels[index]),
          y: parseFloat(value),
        })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: {
          target: {
            value: 0,
          },
          above: 'rgba(53, 162, 235, 0.2)',
        },
      },
      {
        label: 'Dầm',
        data: [{ x: 0, y: 0 }, { x: length, y: 0 }],
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 10,
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
    ],
  };

  return <Line options={options} data={data} />;
}