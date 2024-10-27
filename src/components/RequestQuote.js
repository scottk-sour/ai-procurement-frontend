import React, { useState } from 'react';
import './RequestQuote.css';

const RequestQuote = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    quantity: '',
    preferredVendor: '',
    deadline: '',
    specialRequirements: '',
    budgetRange: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic, e.g., send formData to the backend.
    console.log('Form Submitted:', formData);
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Service/Product Type:
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Preferred Vendor (optional):
          <input
            type="text"
            name="preferredVendor"
            value={formData.preferredVendor}
            onChange={handleChange}
          />
        </label>
        <label>
          Deadline:
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </label>
        <label>
          Special Requirements:
          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
          />
        </label>
        <label>
          Budget Range:
          <input
            type="text"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestQuote;
