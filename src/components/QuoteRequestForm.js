// src/components/QuoteRequestForm.jsx
import React, { useState } from 'react';
import './QuoteRequestForm.css';

const QuoteRequestForm = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    companyName: '',
    industryType: '',
    numEmployees: '',
    numLocations: '', // 🔵 corrected: should be numLocations
    multiFloor: 'No', // 🔵 corrected: should be multiFloor
    colourPreference: '',
    minSpeed: '',
    maxLeasePrice: '',
    requiredFunctions: {
      scanning: false,
      fax: false,
      wirelessPrinting: false,
      duplexPrinting: false,
    },
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      requiredFunctions: {
        ...prevData.requiredFunctions,
        [name]: checked,
      },
    }));
  };

  const handleFileChange = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const validateStep = () => {
    let stepErrors = {};
    if (currentStep === 1) {
      if (!formData.companyName) stepErrors.companyName = 'Company Name is required';
      if (!formData.industryType) stepErrors.industryType = 'Industry Type is required';
      if (!formData.numEmployees) stepErrors.numEmployees = 'Number of Employees is required';
      if (!formData.numLocations) stepErrors.numLocations = 'Number of Office Locations is required';
    } else if (currentStep === 2) {
      if (!formData.colourPreference) stepErrors.colourPreference = 'Colour Preference is required';
      if (!formData.minSpeed) stepErrors.minSpeed = 'Minimum Speed is required';
      if (!formData.maxLeasePrice) stepErrors.maxLeasePrice = 'Maximum Lease Price is required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    if (!userId || !token) {
      alert('Missing authentication. Please log in again.');
      return;
    }

    const userRequirements = {
      companyName: formData.companyName,
      industryType: formData.industryType,
      numEmployees: Number(formData.numEmployees),
      numLocations: Number(formData.numLocations),
      multiFloor: formData.multiFloor === 'Yes',
      colour: formData.colourPreference,
      min_speed: parseInt(formData.minSpeed, 10) || 0,
      max_lease_price: parseFloat(formData.maxLeasePrice) || 0,
      required_functions: Object.keys(formData.requiredFunctions).filter(
        (key) => formData.requiredFunctions[key]
      ),
      additional_notes: formData.additionalNotes,
      monthlyVolume: { colour: 0, mono: 0 }, // Optional: you can extend later
      serviceType: "Photocopiers", // Default value
      type: "A3", // Default machine type for now
    };

    const formPayload = new FormData();
    formPayload.append('userId', userId);
    formPayload.append('userRequirements', JSON.stringify(userRequirements));
    selectedFiles.forEach((file) => formPayload.append('files', file));

    const apiUrl = 'http://localhost:5000/api/quotes/request';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit the form.');
      }

      const result = await response.json();
      console.log('✅ Form Data Submitted:', result);
      alert('Your quote request has been submitted successfully!');

      setFormData({
        companyName: '',
        industryType: '',
        numEmployees: '',
        numLocations: '',
        multiFloor: 'No',
        colourPreference: '',
        minSpeed: '',
        maxLeasePrice: '',
        requiredFunctions: {
          scanning: false,
          fax: false,
          wirelessPrinting: false,
          duplexPrinting: false,
        },
        additionalNotes: '',
      });
      setSelectedFiles([]);
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit the form. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2>Step 1: Company Information</h2>
            <label>
              Company Name:
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} />
              {errors.companyName && <div className="error">{errors.companyName}</div>}
            </label>
            <label>
              Industry Type:
              <input type="text" name="industryType" value={formData.industryType} onChange={handleInputChange} />
              {errors.industryType && <div className="error">{errors.industryType}</div>}
            </label>
            <label>
              Number of Employees:
              <input type="number" name="numEmployees" value={formData.numEmployees} onChange={handleInputChange} />
              {errors.numEmployees && <div className="error">{errors.numEmployees}</div>}
            </label>
            <label>
              Number of Office Locations:
              <input type="number" name="numLocations" value={formData.numLocations} onChange={handleInputChange} />
              {errors.numLocations && <div className="error">{errors.numLocations}</div>}
            </label>
            <label>
              Multiple Floors?
              <select name="multiFloor" value={formData.multiFloor} onChange={handleInputChange}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h2>Step 2: Equipment & Lease Requirements</h2>
            <label>
              Colour Preference:
              <select name="colourPreference" value={formData.colourPreference} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Black & White">Black & White</option>
                <option value="Colour">Colour</option>
                <option value="No Preference">No Preference</option>
              </select>
              {errors.colourPreference && <div className="error">{errors.colourPreference}</div>}
            </label>
            <label>
              Minimum Speed (PPM):
              <input type="number" name="minSpeed" value={formData.minSpeed} onChange={handleInputChange} />
              {errors.minSpeed && <div className="error">{errors.minSpeed}</div>}
            </label>
            <label>
              Maximum Lease Price (£):
              <input type="number" name="maxLeasePrice" value={formData.maxLeasePrice} onChange={handleInputChange} />
              {errors.maxLeasePrice && <div className="error">{errors.maxLeasePrice}</div>}
            </label>
            <fieldset>
              <legend>Required Functions:</legend>
              <label>
                <input type="checkbox" name="scanning" checked={formData.requiredFunctions.scanning} onChange={handleCheckboxChange} />
                Scanning
              </label>
              <label>
                <input type="checkbox" name="fax" checked={formData.requiredFunctions.fax} onChange={handleCheckboxChange} />
                Fax
              </label>
              <label>
                <input type="checkbox" name="wirelessPrinting" checked={formData.requiredFunctions.wirelessPrinting} onChange={handleCheckboxChange} />
                Wireless Printing
              </label>
              <label>
                <input type="checkbox" name="duplexPrinting" checked={formData.requiredFunctions.duplexPrinting} onChange={handleCheckboxChange} />
                Duplex Printing
              </label>
            </fieldset>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h2>Step 3: Additional Information & File Uploads</h2>
            <label>
              Additional Notes:
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} />
            </label>
            <label>
              Upload Lease Agreements, Invoices, Usage Reports:
              <input type="file" multiple onChange={handleFileChange} />
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
