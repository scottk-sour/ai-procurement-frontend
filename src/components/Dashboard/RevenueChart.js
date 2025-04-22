// src/components/Dashboard/RevenueChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./RevenueChart.css";

const RevenueChart = ({ data = [] }) => {
  const placeholderData = Array(6).fill({ _id: new Date(), revenue: 0 });
  const chartData = data.length > 0 ? data : placeholderData;

  const chartConfig = {
    labels: chartData.map((item) =>
      new Date(item._id).toLocaleDateString("en-GB")
    ),
    datasets: [
      {
        label: "Revenue",
        data: chartData.map((item) => item.revenue),
        backgroundColor: "rgba(0, 123, 255, 0.6)", // Matches --secondary-color
        borderColor: "#007bff",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Revenue (£)" },
      },
      x: {
        title: { display: true, text: "Date" },
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Revenue: £${context.parsed.y.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="revenue-chart">
      <h3>Revenue Trend</h3>
      <Bar data={chartConfig} options={options} />
      {data.length === 0 && <p className="no-data">No revenue data yet.</p>}
    </div>
  );
};

export default RevenueChart;
