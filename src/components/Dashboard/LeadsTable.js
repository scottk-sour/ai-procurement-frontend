// src/components/LeadsTable.js
import React from "react";
import "./LeadsTable.css";

const LeadsTable = ({ leads }) => {
  const skeletonRows = Array(5).fill({ name: "Loading...", industry: "N/A", status: "N/A", value: "N/A", lastContactDate: new Date() });

  return (
    <div className="lead-table">
      <h3>Leads</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Value</th>
              <th>Last Contact</th>
            </tr>
          </thead>
          <tbody>
            {(leads.length > 0 ? leads : skeletonRows).map((lead, index) => (
              <tr key={lead._id || index} className={`lead-row ${leads.length === 0 ? "skeleton" : ""}`}>
                <td>{lead.name}</td>
                <td>{lead.industry}</td>
                <td>{lead.status}</td>
                <td>{lead.value}</td>
                <td>{new Date(lead.lastContactDate).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && <p className="no-data">No leads available yet.</p>}
    </div>
  );
};

export default LeadsTable;