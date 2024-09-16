// src/components/QuoteRequestForm.js
import React, { useState } from 'react';
import './QuoteRequestForm.css'; // Import the CSS file for styling

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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Functions to navigate between steps
  const nextStep = () => {
    // Simple validation example
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        alert('Please fill out all fields in this step.');
        return; // Prevents moving to the next step if validation fails
      }
    }
    if (currentStep === 2) {
      if (!formData.itemDescription || !formData.quantity) {
        alert('Please fill out all fields in this step.');
        return; // Prevents moving to the next step if validation fails
      }
    }

    // Move to the next step if validation passes
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Simulate API endpoint (replace with your actual endpoint)
    const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong with the form submission.');
      }

      const result = await response.json();
      console.log('Form Data Submitted:', result);
      
      // Display a success message
      alert('Your quote request has been submitted successfully!');

      // Reset the form if needed
      setFormData({
        name: '',
        email: '',
        itemDescription: '',
        quantity: '',
        notes: '',
      });
      setCurrentStep(1); // Reset to the first step
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit the form. Please try again.');
    }
  };

  // Functions to render form content based on the current step
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
      <div className="progress-indicator">
        Step {currentStep} of 3
      </div>
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="form-navigation">
        {currentStep > 1 && (
          <button onClick={prevStep}>Previous</button>
        )}
        {currentStep < 3 && (
          <button onClick={nextStep}>Next</button>
        )}
        {currentStep === 3 && (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default QuoteRequestForm;
