import React from 'react';
import './KPIs.css'; // Import CSS for KPIs

const KPIs = ({ data }) => {
  return (
    <div className="kpi-container">
      {Object.entries(data).map(([key, value]) => (
        <div className="kpi-card" key={key}>
          <h3>{key}</h3>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPIs;