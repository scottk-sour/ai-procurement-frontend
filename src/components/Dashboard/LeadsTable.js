import React from 'react';

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
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.industry}</td>
                <td>{lead.status}</td>
                <td>{lead.value}</td>
                <td>{lead.lastContactDate}</td>
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