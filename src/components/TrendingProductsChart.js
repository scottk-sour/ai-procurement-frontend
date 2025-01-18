// src/components/TrendingProductsChart.js
import React from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

// Sample data structure with product names and popularity
const data = [
  { name: 'Copiers', popularity: 40 },
  { name: 'Telecom Services', popularity: 30 },
  { name: 'CCTV Systems', popularity: 20 },
  { name: 'Printers', popularity: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TrendingProductsChart = () => {
  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={150}
        fill="#8884d8"
        dataKey="popularity"
        label={(entry) => entry.name}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default TrendingProductsChart;
