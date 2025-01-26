import React from 'react';

const RevenueChart = ({ data }) => {
  return (
    <div className="revenue-chart">
      <h3>Revenue Trend</h3>
      {/* Placeholder for chart */}
      {data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              {new Date(item._id).toLocaleDateString("en-GB")} : {item.revenue}
            </li>
          ))}
        </ul>
      ) : (
        <p>No revenue data available.</p>
      )}
    </div>
  );
};

export default RevenueChart;