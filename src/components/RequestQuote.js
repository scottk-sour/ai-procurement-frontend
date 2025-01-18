import React, { useState } from 'react';
import './RequestQuote.css'; // Import the CSS for styling

const RequestQuote = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    quantity: '',
    preferredVendor: '',
    deadline: '',
    specialRequirements: '',
    budgetRange: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked'); // Log when the submit button is clicked
    setIsSubmitting(true);

    try {
      // Retrieve the token from localStorage or another storage mechanism
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to submit a quote request.');
        setIsSubmitting(false);
        return;
      }

      // Send the request to the backend
      const response = await fetch('http://localhost:5000/api/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the authorization token
        },
        body: JSON.stringify(formData),
      });

      console.log('Response received:', response); // Log the raw response

      if (!response.ok) {
        const errorData = await response.json(); // Parse backend error message
        throw new Error(errorData.message || 'Failed to submit the request');
      }

      const data = await response.json();
      console.log('Form submitted successfully:', data); // Log parsed response
      alert('Request submitted successfully!');

      // Reset form after submission
      setFormData({
        serviceType: '',
        quantity: '',
        preferredVendor: '',
        deadline: '',
        specialRequirements: '',
        budgetRange: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit the request. Please try again later.');
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Service/Product Type:
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a service type
            </option>
            <option value="CCTV">CCTV</option>
            <option value="Photocopiers">Photocopiers</option>
            <option value="IT">IT</option>
            <option value="Telecoms">Telecoms</option>
          </select>
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter the quantity"
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
            placeholder="Vendor name"
          />
        </label>
        <label>
          Deadline:
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Special Requirements:
          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Enter any additional details (optional)"
          />
        </label>
        <label>
          Budget Range (£):
          <select
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a budget range
            </option>
            <option value="Under 500">Under £500</option>
            <option value="500-1000">£500 - £1000</option>
            <option value="1000-5000">£1000 - £5000</option>
            <option value="Over 5000">Over £5000</option>
          </select>
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestQuote;
