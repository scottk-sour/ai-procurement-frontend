// src/components/EnhancedQuoteRequest.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './EnhancedQuoteRequest.css'; // Fixed: Removed incorrect RequestQuote.css import
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// AI-driven copier suggestion function using an external API
const suggestCopiers = async (data) => {
  const API_URL = process.env.REACT_APP_AI_API_URL;
  const API_KEY = process.env.REACT_APP_AI_API_KEY;

  if (!API_URL || !API_KEY) {
    console.error('AI API URL or API KEY is missing in .env');
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/suggest-copiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch copier suggestions');
    }

    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.error('Error fetching copier suggestions:', error);
    return [];
  }
};

const EnhancedQuoteRequest = () => { // Fixed: Renamed from RequestQuote to EnhancedQuoteRequest
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth?.isAuthenticated;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industryType: '',
    numEmployees: '',
    numLocations: '',
    multiFloor: 'No',
    monthlyPrintVolume: '',
    annualPrintVolume: '',
    monthlyVolume: { colour: '', mono: '' },
    currentColorCPC: '',
    currentMonoCPC: '',
    quarterlyLeaseCost: '',
    leasingCompany: '',
    serviceProvider: '',
    contractStartDate: '',
    contractEndDate: '',
    additionalServices: [],
    paysForScanning: 'No',
    serviceType: 'Photocopiers',
    colour: '',
    type: '',
    min_speed: '',
    max_lease_price: '',
    required_functions: [],
    preference: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestedMachines, setSuggestedMachines] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedData;
    if (type === 'checkbox' && name === 'additionalServices') {
      updatedData = {
        ...formData,
        additionalServices: checked
          ? [...formData.additionalServices, value]
          : formData.additionalServices.filter((item) => item !== value),
      };
    } else if (type === 'checkbox' && name === 'required_functions') {
      updatedData = {
        ...formData,
        required_functions: checked
          ? [...formData.required_functions, value]
          : formData.required_functions.filter((item) => item !== value),
      };
    } else if (name.startsWith('monthlyVolume.')) {
      const field = name.split('.')[1];
      updatedData = {
        ...formData,
        monthlyVolume: { ...formData.monthlyVolume, [field]: value },
      };
    } else {
      updatedData = {
        ...formData,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
      };
    }
    setFormData(updatedData);

    if (['monthlyPrintVolume', 'min_speed', 'type', 'colour', 'required_functions'].includes(name)) {
      suggestCopiers(updatedData).then((suggestions) => {
        setSuggestedMachines(suggestions);
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const calculateBuyout = () => {
    const { quarterlyLeaseCost, contractEndDate } = formData;
    if (!quarterlyLeaseCost || !contractEndDate) return 'N/A';

    const end = new Date(contractEndDate);
    const today = new Date();
    if (today > end) return 'Contract Ended';

    const monthsRemaining = (end - today) / (1000 * 60 * 60 * 24 * 30);
    const quarterlyCost = parseFloat(quarterlyLeaseCost) || 0;
    const buyout = (quarterlyCost / 3) * monthsRemaining;
    return buyout.toFixed(2);
  };

  const formatFormData = (data) => {
    return {
      ...data,
      numEmployees: data.numEmployees ? parseInt(data.numEmployees, 10) : undefined,
      numLocations: data.numLocations ? parseInt(data.numLocations, 10) : undefined,
      monthlyPrintVolume: data.monthlyPrintVolume ? parseInt(data.monthlyPrintVolume, 10) : undefined,
      annualPrintVolume: data.annualPrintVolume ? parseInt(data.annualPrintVolume, 10) : undefined,
      monthlyVolume: {
        colour: data.monthlyVolume.colour ? parseInt(data.monthlyVolume.colour, 10) : 0,
        mono: data.monthlyVolume.mono ? parseInt(data.monthlyVolume.mono, 10) : 0,
      },
      currentColorCPC: data.currentColorCPC ? parseFloat(data.currentColorCPC) : undefined,
      currentMonoCPC: data.currentMonoCPC ? parseFloat(data.currentMonoCPC) : undefined,
      quarterlyLeaseCost: data.quarterlyLeaseCost ? parseFloat(data.quarterlyLeaseCost) : undefined,
      min_speed: data.min_speed ? parseInt(data.min_speed, 10) : undefined,
      max_lease_price: data.max_lease_price ? parseInt(data.max_lease_price, 10) : undefined,
      multiFloor: data.multiFloor.toLowerCase() === 'yes',
      paysForScanning: data.paysForScanning.toLowerCase() === 'yes',
    };
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.industryType && formData.numEmployees && formData.numLocations;
      case 2:
        return formData.monthlyVolume.colour !== '' && formData.monthlyVolume.mono !== '';
      case 3:
        return true;
      case 4:
        return formData.serviceType && formData.colour && formData.type;
      case 5:
        return formData.preference && formData.preference !== '';
      case 6:
        return formData.max_lease_price;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setErrorMessage('');
    } else {
      setErrorMessage('Please fill out all required fields before proceeding.');
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(6)) {
      setErrorMessage('Please fill out all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!isLoggedIn) {
      alert('You must be logged in to submit a quote request.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }

    const token = auth?.token;
    const userId = auth?.user?.userId || auth?.user?.id;

    if (!token || !userId) {
      alert('Authentication failed. Please log in again.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }

    const formattedData = formatFormData(formData);
    console.log('🚀 Full Formatted Data:', JSON.stringify(formattedData, null, 2));

    try {
      let response, data;
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      if (uploadedFiles.length > 0) {
        const requestData = new FormData();
        requestData.append('userRequirements', JSON.stringify(formattedData));
        requestData.append('userId', userId);
        uploadedFiles.forEach((file) => requestData.append('documents', file));
        console.log('📤 Sending API Request with files...', Array.from(requestData.entries()));
        response = await fetch(`${API_BASE_URL}/api/quotes/request`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: requestData,
        });
      } else {
        console.log('📤 Sending API Request without files...');
        response = await fetch(`${API_BASE_URL}/api/quotes/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formattedData, userId }),
        });
      }

      data = await response.json();
      console.log('📩 Response data:', data);

      if (!response.ok) {
        const errorMessage = data.details?.join('; ') || data.message || 'Failed to submit the request.';
        throw new Error(errorMessage);
      }

      console.log('✅ Quote request submitted successfully!');
      setSuccessMessage('Quote request submitted successfully!');
      setErrorMessage('');

      navigate(`/quote-details?status=created&quoteId=${data._id}`, { // Fixed: Corrected query param typo
        state: {
          quoteData: data,
          hasVendors: data.matchedVendors && data.matchedVendors.length > 0,
        },
      });

      setFormData({
        companyName: '',
        industryType: '',
        numEmployees: '',
        numLocations: '',
        multiFloor: 'No',
        monthlyPrintVolume: '',
        annualPrintVolume: '',
        monthlyVolume: { colour: '', mono: '' },
        currentColorCPC: '',
        currentMonoCPC: '',
        quarterlyLeaseCost: '',
        leasingCompany: '',
        serviceProvider: '',
        contractStartDate: '',
        contractEndDate: '',
        additionalServices: [],
        paysForScanning: 'No',
        serviceType: 'Photocopiers',
        colour: '',
        type: '',
        min_speed: '',
        max_lease_price: '',
        required_functions: [],
        preference: '',
      });
      setUploadedFiles([]);
      setStep(1);
    } catch (error) {
      console.error('Error submitting quote request:', error.message);
      setErrorMessage(error.message);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const additionalServicesOptions = [
    'Automatic toner replenishment',
    'On-site service & repairs',
    'Cost per copy fees',
    'Bulk paper delivery',
    'Print tracking & reporting',
    'Monthly lease payments',
    'Printer setup & network configuration',
    'Toner cartridge recycling',
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Company Details</h3>
            <label>
              Company Name: <span className="required">*</span>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </label>
            <label>
              Industry Type: <span className="required">*</span>
              <input
                type="text"
                name="industryType"
                value={formData.industryType}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </label>
            <label>
              Number of Employees: <span className="required">*</span>
              <input
                type="number"
                name="numEmployees"
                value={formData.numEmployees}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </label>
            <label>
              Number of Office Locations: <span className="required">*</span>
              <input
                type="number"
                name="numLocations"
                value={formData.numLocations}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </label>
            <label>
              Multiple Floors?
              <select name="multiFloor" value={formData.multiFloor} onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Current Print Usage</h3>
            <label>
              Monthly Print Volume (pages):
              <input
                type="number"
                name="monthlyPrintVolume"
                value={formData.monthlyPrintVolume}
                onChange={handleChange}
                placeholder="e.g., 5000"
              />
            </label>
            <label>
              Annual Print Volume (pages):
              <input
                type="number"
                name="annualPrintVolume"
                value={formData.annualPrintVolume}
                onChange={handleChange}
                placeholder="e.g., 60000"
              />
            </label>
            <label>
              Monthly Color Volume (pages): <span className="required">*</span>
              <input
                type="number"
                name="monthlyVolume.colour"
                value={formData.monthlyVolume.colour}
                onChange={handleChange}
                placeholder="e.g., 2000"
                required
                aria-required="true"
              />
            </label>
            <label>
              Monthly Mono Volume (pages): <span className="required">*</span>
              <input
                type="number"
                name="monthlyVolume.mono"
                value={formData.monthlyVolume.mono}
                onChange={handleChange}
                placeholder="e.g., 3000"
                required
                aria-required="true"
              />
            </label>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Current Costs & Contract</h3>
            <label>
              Current Color CPC (pence):
              <input
                type="number"
                name="currentColorCPC"
                value={formData.currentColorCPC}
                onChange={handleChange}
                placeholder="e.g., 5.5"
                step="0.1"
              />
            </label>
            <label>
              Current Mono CPC (pence):
              <input
                type="number"
                name="currentMonoCPC"
                value={formData.currentMonoCPC}
                onChange={handleChange}
                placeholder="e.g., 1.4"
                step="0.1"
              />
            </label>
            <label>
              Quarterly Lease Cost (£):
              <input
                type="number"
                name="quarterlyLeaseCost"
                value={formData.quarterlyLeaseCost}
                onChange={handleChange}
                placeholder="e.g., 300"
              />
            </label>
            <label>
              Leasing Company:
              <input
                type="text"
                name="leasingCompany"
                value={formData.leasingCompany}
                onChange={handleChange}
                placeholder="e.g., Sharp Leasing"
              />
            </label>
            <label>
              Service Provider:
              <input
                type="text"
                name="serviceProvider"
                value={formData.serviceProvider}
                onChange={handleChange}
                placeholder="e.g., Sharp Service"
              />
            </label>
            <label>
              Contract Start Date:
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
              />
            </label>
            <label>
              Contract End Date:
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
              />
            </label>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Additional Services & Needs</h3>
            <label>
              Do You Pay for Scanning?
              <select name="paysForScanning" value={formData.paysForScanning} onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <fieldset>
              <legend>Current Additional Services:</legend>
              {additionalServicesOptions.map((service) => (
                <label key={service}>
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value={service}
                    checked={formData.additionalServices.includes(service)}
                    onChange={handleChange}
                  />
                  {service}
                </label>
              ))}
            </fieldset>
            <label>
              Service Type: <span className="required">*</span>
              <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                <option value="Photocopiers">Photocopiers</option>
                <option value="Printers">Printers</option>
                <option value="Scanners">Scanners</option>
              </select>
            </label>
            <label>
              Colour Preference: <span className="required">*</span>
              <select name="colour" value={formData.colour} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Black & White">Black & White</option>
                <option value="Color">Color</option>
              </select>
            </label>
            {formData.colour && (
              <label>
                Paper Size: <span className="required">*</span>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                </select>
              </label>
            )}
            <label>
              Minimum Speed (PPM):
              <input
                type="number"
                name="min_speed"
                value={formData.min_speed}
                onChange={handleChange}
                placeholder="e.g., 20"
              />
            </label>
            <fieldset>
              <legend>Required Functions:</legend>
              {['Scanning', 'Fax', 'Wireless Printing', 'Duplex Printing'].map((func) => (
                <label key={func}>
                  <input
                    type="checkbox"
                    name="required_functions"
                    value={func}
                    checked={formData.required_functions.includes(func)}
                    onChange={handleChange}
                  />
                  {func}
                </label>
              ))}
            </fieldset>
            {suggestedMachines.length > 0 && (
              <div>
                <h4>Suggested Machines (AI-Powered):</h4>
                <ul>
                  {suggestedMachines.map((model, index) => (
                    <li key={index}>{model}</li>
                  ))}
                </ul>
              </div>
            )}
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>Drag & drop recent invoice or click to upload</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div>
                <p>{uploadedFiles.length} file(s) selected:</p>
                <ul>
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Smart Preference</h3>
            <label>
              What is most important to you? <span className="required">*</span>
              <select name="preference" value={formData.preference} onChange={handleChange} required>
                <option value="">Select priority</option>
                <option value="cost">Running Costs</option>
                <option value="quality">Print Quality</option>
                <option value="speed">Speed</option>
                <option value="service">Service & Support</option>
                <option value="balanced">Balanced</option>
              </select>
            </label>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Review Your Request</h3>
            <div className="review-section">
              <p>
                <strong>Estimated Buyout:</strong> £{calculateBuyout()}
              </p>
              <pre>{JSON.stringify(formatFormData(formData), null, 2)}</pre>
            </div>
            <label>
              Maximum Lease Price (£): <span className="required">*</span>
              <input
                type="number"
                name="max_lease_price"
                value={formData.max_lease_price}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </label>
            <button onClick={handleBack}>Back</button>
            <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>
      {errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="success-message" role="alert">
          {successMessage}
        </p>
      )}
      <div className="progress-bar">
        <span>Step {step} of 6</span>
        <div style={{ width: `${(step / 6) * 100}%` }} className="progress" />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}
      </form>
    </div>
  );
};

export default EnhancedQuoteRequest;