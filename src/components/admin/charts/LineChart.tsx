import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title: string;
  labels: string[];
  data: number[];
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  labels,
  data,
  color = 'rgb(75, 85, 99)',
  borderColor = 'rgb(99, 102, 241)',
  backgroundColor = 'rgba(99, 102, 241, 0.2)',
  height = 300,
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor,
        backgroundColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;