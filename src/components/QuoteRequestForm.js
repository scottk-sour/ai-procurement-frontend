// src/components/QuoteRequestForm.jsx

import React, { useState } from 'react';
import './QuoteRequestForm.css';

const QuoteRequestForm = () => {
  // State to manage the current step
  const [currentStep, setCurrentStep] = useState(1);

  // State to manage form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    itemDescription: '',
    quantity: '',
    notes: '',
  });

  // Functions to handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Functions to navigate between steps
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        alert('Please fill out all fields in this step.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.itemDescription || !formData.quantity) {
        alert('Please fill out all fields in this step.');
        return;
      }
    }
    setCurrentStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Retrieve the actual userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    // Construct the payload for the backend.
    const payload = {
      userId: userId,
      userRequirements: {
        colour: formData.notes || "N/A", // Using notes as a placeholder for colour
        min_speed: parseInt(formData.quantity, 10) || 0,
        max_lease_price: 1000, // Placeholder value; adjust as needed
        required_functions: formData.itemDescription,
      },
    };

    const apiUrl = 'http://localhost:5000/api/quotes/request';

    // Retrieve the token from localStorage using the correct key
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Authentication token is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit the form.');
      }

      const result = await response.json();
      console.log('Form Data Submitted:', result);
      alert('Your quote request has been submitted successfully!');

      // Reset the form and current step (using setTimeout to defer non-critical tasks)
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          itemDescription: '',
          quantity: '',
          notes: '',
        });
        setCurrentStep(1);
      }, 0);

    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to submit the form. Please try again.');
    }
  };

  // Render form content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2>Step 1: Basic Information</h2>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </label>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h2>Step 2: Procurement Details</h2>
            <label>
              Item Description:
              <input
                type="text"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </label>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h2>Step 3: Additional Notes</h2>
            <label>
              Notes:
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </label>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="quote-request-form">
      <div className="progress-indicator">Step {currentStep} of 3</div>
      {renderStepContent()}

      <div className="form-navigation">
        {currentStep > 1 && <button onClick={prevStep}>Previous</button>}
        {currentStep < 3 && <button onClick={nextStep}>Next</button>}
        {currentStep === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  );
};

export default QuoteRequestForm;
