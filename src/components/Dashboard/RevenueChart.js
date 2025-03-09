import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js
import './RevenueChart.css';

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => new Date(item._id).toLocaleDateString("en-GB")),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((item) => item.revenue),
        backgroundColor: 'rgba(249, 115, 22, 0.6)', /* TENDORAI orange */
        borderColor: '#f97316',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `Revenue: ${context.parsed.y}`,
        },
      },
    },
  };

  return (
    <div className="revenue-chart">
      <h3>Revenue Trend</h3>
      {data.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>No revenue data available.</p>
      )}
    </div>
  );
};

export default RevenueChart;