import React, { useState } from 'react';

const SubmitRequestForm = () => {
  const [formData, setFormData] = useState({
    serviceType: "CCTV",
    quantity: "",
    preferredVendor: "",
    deadline: "",
    specialRequirements: "",
    budgetRange: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation to ensure all required fields are filled
    if (!formData.deadline) {
      alert("Please select a deadline.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit the request.');
      }

      const data = await response.json();
      console.log('Form submitted successfully:', data);

      alert('Request submitted successfully!');
      // Reset the form
      setFormData({
        serviceType: "CCTV",
        quantity: "",
        preferredVendor: "",
        deadline: "",
        specialRequirements: "",
        budgetRange: "",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="serviceType">Service Type:</label>
        <select
          id="serviceType"
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          required
        >
          <option value="CCTV">CCTV</option>
          <option value="Photocopiers">Photocopiers</option>
          <option value="IT">IT</option>
          <option value="Telecoms">Telecoms</option>
        </select>
      </div>
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Enter the quantity"
          required
          min="1"
        />
      </div>
      <div>
        <label htmlFor="preferredVendor">Preferred Vendor:</label>
        <input
          id="preferredVendor"
          type="text"
          name="preferredVendor"
          value={formData.preferredVendor}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <div>
        <label htmlFor="deadline">Deadline:</label>
        <input
          id="deadline"
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="budgetRange">Budget Range (£):</label>
        <input
          id="budgetRange"
          type="number"
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          placeholder="Enter your budget"
          required
        />
      </div>
      <div>
        <label htmlFor="specialRequirements">Special Requirements:</label>
        <textarea
          id="specialRequirements"
          name="specialRequirements"
          value={formData.specialRequirements}
          onChange={handleChange}
          placeholder="Enter any additional details (optional)"
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default SubmitRequestForm;
