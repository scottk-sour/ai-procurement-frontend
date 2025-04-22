// src/components/KPIs.js
import React from "react";
import "./KPIs.css";

const KPIs = ({ data }) => {
  const defaultData = {
    totalRevenue: "£0",
    activeListings: 0,
    totalOrders: 0,
  };
  const kpiData = Object.keys(data).length > 0 ? data : defaultData;

  return (
    <div className="kpi-container">
      {Object.entries(kpiData).map(([key, value]) => (
        <div className="kpi-card" key={key}>
          <h3>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</h3>
          <p>{value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default KPIs;