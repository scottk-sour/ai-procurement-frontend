import React from 'react';
import './LeadsTable.css';

const LeadsTable = ({ leads }) => {
  return (
    <div className="lead-table">
      <h3>Leads</h3>
      {leads.length > 0 ? (
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
            {leads.map((lead) => (
              <tr key={lead._id} className="lead-row">
                <td>{lead.name}</td>
                <td>{lead.industry}</td>
                <td>{lead.status}</td>
                <td>{lead.value}</td>
                <td>{new Date(lead.lastContactDate).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No leads available.</p>
      )}
    </div>
  );
};

export default LeadsTable;