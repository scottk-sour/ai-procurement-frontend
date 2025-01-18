import React from 'react';

const QuotesResults = ({ quotes }) => {
  if (!quotes || quotes.length === 0) {
    return <div>No quotes available yet.</div>;
  }

  return (
    <div>
      <h2>Available Quotes</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {quotes.map((quote, index) => (
          <li key={index} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
            {/* Adjust the fields below based on the data your quotes contain. */}
            <p><strong>Vendor:</strong> {quote.vendorName}</p>
            <p><strong>Price:</strong> £{quote.price}</p>
            <p><strong>Description:</strong> {quote.description || 'No description provided.'}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuotesResults;
