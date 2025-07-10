// Complete Enhanced Quote Request Form - React Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './EnhancedQuoteRequest.css';

const EnhancedQuoteRequest = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Enhanced form data structure
  const [formData, setFormData] = useState({
    // Company Details (existing - good)
    companyName: '',
    industryType: '',
    numEmployees: '',
    numLocations: '',
    multiFloor: false,
    
    // Volume Analysis (enhanced)
    monthlyVolume: {
      mono: 0,           // Keep existing
      colour: 0,         // Keep existing
      total: 0,          // Auto-calculated
      volumeRange: '',   // 0-6k, 6k-13k, 13k-20k, etc.
    },
    
    // Usage Patterns (new - critical for AI matching)
    usagePattern: {
      peakDays: '',      // Mon-Fri, Weekends, Daily
      peakHours: '',     // 9-5, 24/7, Custom
      seasonality: '',   // Consistent, Seasonal peaks, Project-based
      growthExpected: false,
      growthPercentage: 0,
    },
    
    // Paper Requirements (critical - missing from current form)
    paperRequirements: {
      primarySize: '',   // A4, A3, SRA3
      secondarySize: '', // Optional secondary size
      specialMedia: [],  // Cardstock, Labels, Envelopes, Transparencies
      heavyDuty: false,  // Thick paper, cardstock regularly
    },
    
    // Current Setup Analysis (enhanced)
    currentSetup: {
      machineAge: '',         // 0-2 years, 2-5 years, 5+ years
      currentBrand: '',       // Canon, Ricoh, Xerox, etc.
      currentModel: '',       
      currentSpeed: 0,        // ppm
      contractEndDate: '',    
      quarterlyLeaseCost: 0,
      buyoutRequired: false,
      
      // Current costs (detailed)
      currentCosts: {
        monoRate: 0,         // pence per page
        colourRate: 0,       // pence per page
        monthlyMonoCost: 0,  // auto-calculated
        monthlyColourCost: 0,// auto-calculated
        quarterlyService: 0,
      }
    },
    
    // Performance Requirements (enhanced based on volume)
    requirements: {
      minSpeed: 0,           // Auto-suggested based on volume
      maxSpeed: 0,           // Optional upper limit
      priority: '',          // cost, speed, quality, reliability
      
      // Features based on usage
      essentialFeatures: [], // Duplex, Stapling, Hole-punch, etc.
      niceToHave: [],       // Booklet, Large tray, etc.
      
      // Service requirements
      serviceLevel: '',      // Basic, Standard, Premium
      responseTime: '',      // 4hr, 8hr, Next day
    },
    
    // Budget & Terms (enhanced)
    budget: {
      maxLeasePrice: 0,      // Quarterly lease
      budgetRange: '',       // £0-500, £500-1000, etc.
      termPreference: '',    // 1+3, 2+8, etc.
      buyoutBudget: 0,       // For current machine
    },
    
    // Location & Installation
    installation: {
      floorType: '',         // Ground floor, Upper floor, Basement
      accessRestrictions: '', // Narrow doors, stairs, etc.
      powerRequirements: '', // Standard, High power needed
      networkSetup: '',      // Ethernet, WiFi, Both
    },
    
    // Additional notes
    additionalNotes: ''
  });

  // Auto-calculation functions
  const calculateVolumeRange = (monoVol, colourVol) => {
    const total = monoVol + colourVol;
    if (total <= 6000) return '0-6k';
    if (total <= 13000) return '6k-13k';
    if (total <= 20000) return '13k-20k';
    if (total <= 30000) return '20k-30k';
    if (total <= 40000) return '30k-40k';
    if (total <= 50000) return '40k-50k';
    return '50k+';
  };

  const suggestMinSpeed = (monthlyVolume) => {
    if (monthlyVolume <= 6000) return 20;
    if (monthlyVolume <= 13000) return 25;
    if (monthlyVolume <= 20000) return 30;
    if (monthlyVolume <= 30000) return 35;
    if (monthlyVolume <= 40000) return 45;
    if (monthlyVolume <= 50000) return 55;
    if (monthlyVolume <= 60000) return 65;
    return 75;
  };

  const calculateCurrentMonthlyCost = (volume, rate) => {
    return (volume * rate) / 100; // Convert pence to pounds
  };

  // Auto-update calculated fields
  useEffect(() => {
    const { mono, colour } = formData.monthlyVolume;
    const total = mono + colour;
    const volumeRange = calculateVolumeRange(mono, colour);
    const suggestedSpeed = suggestMinSpeed(total);
    
    setFormData(prev => ({
      ...prev,
      monthlyVolume: {
        ...prev.monthlyVolume,
        total,
        volumeRange
      },
      requirements: {
        ...prev.requirements,
        minSpeed: prev.requirements.minSpeed || suggestedSpeed
      },
      currentSetup: {
        ...prev.currentSetup,
        currentCosts: {
          ...prev.currentSetup.currentCosts,
          monthlyMonoCost: calculateCurrentMonthlyCost(mono, prev.currentSetup.currentCosts.monoRate),
          monthlyColourCost: calculateCurrentMonthlyCost(colour, prev.currentSetup.currentCosts.colourRate)
        }
      }
    }));
  }, [formData.monthlyVolume.mono, formData.monthlyVolume.colour, formData.currentSetup.currentCosts.monoRate, formData.currentSetup.currentCosts.colourRate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : 
                                         type === 'number' ? parseFloat(value) || 0 : value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle array inputs (features, special media)
  const handleArrayChange = (fieldPath, value, checked) => {
    const keys = fieldPath.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = current[keys[keys.length - 1]];
      if (checked) {
        if (!array.includes(value)) {
          current[keys[keys.length - 1]] = [...array, value];
        }
      } else {
        current[keys[keys.length - 1]] = array.filter(item => item !== value);
      }
      
      return updated;
    });
  };

  // File upload handling
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  // Validation functions
  const validateStep = (step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1: // Company Details
        if (!formData.companyName) stepErrors.companyName = 'Company name is required';
        if (!formData.industryType) stepErrors.industryType = 'Industry type is required';
        if (!formData.numEmployees) stepErrors.numEmployees = 'Number of employees is required';
        if (!formData.numLocations) stepErrors.numLocations = 'Number of locations is required';
        break;
        
      case 2: // Volume Analysis
        if (!formData.monthlyVolume.mono && !formData.monthlyVolume.colour) {
          stepErrors.monthlyVolume = 'At least one volume type is required';
        }
        if (formData.monthlyVolume.total < 100) {
          stepErrors.monthlyVolume = 'Total monthly volume seems too low (minimum 100 pages)';
        }
        break;
        
      case 3: // Paper Requirements
        if (!formData.paperRequirements.primarySize) {
          stepErrors.paperRequirements = 'Primary paper size is required';
        }
        break;
        
      case 4: // Current Setup
        if (!formData.currentSetup.machineAge) {
          stepErrors.currentSetup = 'Current machine age is required';
        }
        break;
        
      case 5: // Requirements
        if (!formData.requirements.priority) {
          stepErrors.requirements = 'Priority selection is required';
        }
        break;
        
      case 6: // Budget
        if (!formData.budget.maxLeasePrice) {
          stepErrors.budget = 'Maximum lease price is required';
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = auth?.token;
      const userId = auth?.user?.userId || auth?.user?.id;
      
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      
      // Prepare form data
      const submissionData = {
        ...formData,
        userId,
        submissionDate: new Date().toISOString()
      };
      
      let response;
      
      if (uploadedFiles.length > 0) {
        // Submit with files
        const formDataObj = new FormData();
        formDataObj.append('userRequirements', JSON.stringify(submissionData));
        formDataObj.append('userId', userId);
        uploadedFiles.forEach(file => formDataObj.append('documents', file));
        
        response = await fetch(`${API_BASE_URL}/api/quotes/request`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj
        });
      } else {
        // Submit without files
        response = await fetch(`${API_BASE_URL}/api/quotes/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
      
      const result = await response.json();
      
      // Navigate to results
      navigate(`/quote-details?status=created&quoteId=${result._id}`, {
        state: {
          quoteData: result,
          hasVendors: result.matchedVendors && result.matchedVendors.length > 0
        }
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Company Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={errors.companyName ? 'error' : ''}
                />
                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
              </div>
              
              <div className="form-group">
                <label>Industry Type *</label>
                <select
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleInputChange}
                  className={errors.industryType ? 'error' : ''}
                >
                  <option value="">Select Industry</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Legal">Legal Services</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance & Banking</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Technology">Technology</option>
                  <option value="Construction">Construction</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industryType && <span className="error-text">{errors.industryType}</span>}
              </div>
              
              <div className="form-group">
                <label>Number of Employees *</label>
                <select
                  name="numEmployees"
                  value={formData.numEmployees}
                  onChange={handleInputChange}
                  className={errors.numEmployees ? 'error' : ''}
                >
                  <option value="">Select Range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-25">11-25</option>
                  <option value="26-50">26-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-250">101-250</option>
                  <option value="251-500">251-500</option>
                  <option value="500+">500+</option>
                </select>
                {errors.numEmployees && <span className="error-text">{errors.numEmployees}</span>}
              </div>
              
              <div className="form-group">
                <label>Number of Office Locations *</label>
                <input
                  type="number"
                  name="numLocations"
                  value={formData.numLocations}
                  onChange={handleInputChange}
                  min="1"
                  className={errors.numLocations ? 'error' : ''}
                />
                {errors.numLocations && <span className="error-text">{errors.numLocations}</span>}
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="multiFloor"
                    checked={formData.multiFloor}
                    onChange={handleInputChange}
                  />
                  Multiple floors in main office
                </label>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Print Volume Analysis</h2>
            <div className="volume-info">
              <p className="info-text">
                Accurate volume data is critical for proper machine sizing. 
                Under-reporting volume may result in undersized equipment.
              </p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Monthly Mono/Black & White Pages *</label>
                <input
                  type="number"
                  name="monthlyVolume.mono"
                  value={formData.monthlyVolume.mono}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 3000"
                />
              </div>
              
              <div className="form-group">
                <label>Monthly Colour Pages *</label>
                <input
                  type="number"
                  name="monthlyVolume.colour"
                  value={formData.monthlyVolume.colour}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 1500"
                />
              </div>
              
              <div className="volume-summary">
                <h3>Volume Summary</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="label">Total Monthly:</span>
                    <span className="value">{formData.monthlyVolume.total.toLocaleString()} pages</span>
                  </div>
                  <div className="stat">
                    <span className="label">Volume Range:</span>
                    <span className="value">{formData.monthlyVolume.volumeRange}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Suggested Min Speed:</span>
                    <span className="value">{suggestMinSpeed(formData.monthlyVolume.total)} ppm</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Peak Usage Days</label>
                <select
                  name="usagePattern.peakDays"
                  value={formData.usagePattern.peakDays}
                  onChange={handleInputChange}
                >
                  <option value="">Select Pattern</option>
                  <option value="Monday-Friday">Monday-Friday</option>
                  <option value="Weekends">Weekends Included</option>
                  <option value="Daily">Daily Consistent</option>
                  <option value="Month-end">Month-end Heavy</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Peak Usage Hours</label>
                <select
                  name="usagePattern.peakHours"
                  value={formData.usagePattern.peakHours}
                  onChange={handleInputChange}
                >
                  <option value="">Select Hours</option>
                  <option value="9-5">9 AM - 5 PM</option>
                  <option value="8-6">8 AM - 6 PM</option>
                  <option value="24/7">24/7 Operation</option>
                  <option value="Shifts">Multiple Shifts</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Usage Pattern</label>
                <select
                  name="usagePattern.seasonality"
                  value={formData.usagePattern.seasonality}
                  onChange={handleInputChange}
                >
                  <option value="">Select Pattern</option>
                  <option value="Consistent">Consistent Year-round</option>
                  <option value="Seasonal">Seasonal Peaks</option>
                  <option value="Project-based">Project-based</option>
                  <option value="Academic">Academic Calendar</option>
                </select>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="usagePattern.growthExpected"
                    checked={formData.usagePattern.growthExpected}
                    onChange={handleInputChange}
                  />
                  Growth expected in next 2 years
                </label>
                {formData.usagePattern.growthExpected && (
                  <input
                    type="number"
                    name="usagePattern.growthPercentage"
                    value={formData.usagePattern.growthPercentage}
                    onChange={handleInputChange}
                    placeholder="Expected growth %"
                    min="0"
                    max="200"
                  />
                )}
              </div>
            </div>
            {errors.monthlyVolume && <span className="error-text">{errors.monthlyVolume}</span>}
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Paper & Media Requirements</h2>
            <div className="paper-info">
              <p className="info-text">
                Paper size requirements determine machine compatibility. 
                Selecting the wrong size may exclude suitable options.
              </p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Primary Paper Size *</label>
                <div className="radio-group">
                  {['A4', 'A3', 'SRA3'].map(size => (
                    <label key={size} className="radio-option">
                      <input
                        type="radio"
                        name="paperRequirements.primarySize"
                        value={size}
                        checked={formData.paperRequirements.primarySize === size}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">
                        {size}
                        <small>
                          {size === 'A4' && '210 × 297 mm (Standard)'}
                          {size === 'A3' && '297 × 420 mm (Tabloid)'}
                          {size === 'SRA3' && '320 × 450 mm (Oversized)'}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.paperRequirements && <span className="error-text">{errors.paperRequirements}</span>}
              </div>
              
              <div className="form-group">
                <label>Secondary Paper Size (Optional)</label>
                <select
                  name="paperRequirements.secondarySize"
                  value={formData.paperRequirements.secondarySize}
                  onChange={handleInputChange}
                >
                  <option value="">None</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Special Media Types</label>
                <div className="checkbox-grid">
                  {['Cardstock', 'Labels', 'Envelopes', 'Transparencies', 'Photo Paper', 'Letterhead'].map(media => (
                    <label key={media} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={formData.paperRequirements.specialMedia.includes(media)}
                        onChange={(e) => handleArrayChange('paperRequirements.specialMedia', media, e.target.checked)}
                      />
                      {media}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="paperRequirements.heavyDuty"
                    checked={formData.paperRequirements.heavyDuty}
                    onChange={handleInputChange}
                  />
                  Regular heavy-duty paper (200gsm+) or cardstock printing
                </label>
              </div>
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Current Setup & Costs</h2>
            <div className="current-info">
              <p className="info-text">
                Current setup information helps calculate accurate savings and buyout costs.
              </p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Current Machine Age *</label>
                <select
                  name="currentSetup.machineAge"
                  value={formData.currentSetup.machineAge}
                  onChange={handleInputChange}
                  className={errors.currentSetup ? 'error' : ''}
                >
                  <option value="">Select Age</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="5+ years">5+ years</option>
                  <option value="No current machine">No current machine</option>
                </select>
                {errors.currentSetup && <span className="error-text">{errors.currentSetup}</span>}
              </div>
              
              <div className="form-group">
                <label>Current Brand</label>
                <select
                  name="currentSetup.currentBrand"
                  value={formData.currentSetup.currentBrand}
                  onChange={handleInputChange}
                >
                  <option value="">Select Brand</option>
                  <option value="Canon">Canon</option>
                  <option value="Ricoh">Ricoh</option>
                  <option value="Xerox">Xerox</option>
                  <option value="Sharp">Sharp</option>
                  <option value="Kyocera">Kyocera</option>
                  <option value="Konica Minolta">Konica Minolta</option>
                  <option value="HP">HP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Current Model</label>
                <input
                  type="text"
                  name="currentSetup.currentModel"
                  value={formData.currentSetup.currentModel}
                  onChange={handleInputChange}
                  placeholder="e.g., imageRUNNER C3025i"
                />
              </div>
              
              <div className="form-group">
                <label>Current Speed (PPM)</label>
                <input
                  type="number"
                  name="currentSetup.currentSpeed"
                  value={formData.currentSetup.currentSpeed}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 25"
                />
              </div>
              
              <div className="form-group">
                <label>Contract End Date</label>
                <input
                  type="date"
                  name="currentSetup.contractEndDate"
                  value={formData.currentSetup.contractEndDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Current Quarterly Lease Cost (£)</label>
                <input
                  type="number"
                  name="currentSetup.quarterlyLeaseCost"
                  value={formData.currentSetup.quarterlyLeaseCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 450.00"
                />
              </div>
              
              <div className="form-group">
                <label>Current Mono Rate (pence per page)</label>
                <input
                  type="number"
                  name="currentSetup.currentCosts.monoRate"
                  value={formData.currentSetup.currentCosts.monoRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 1.2"
                />
              </div>
              
              <div className="form-group">
                <label>Current Colour Rate (pence per page)</label>
                <input
                  type="number"
                  name="currentSetup.currentCosts.colourRate"
                  value={formData.currentSetup.currentCosts.colourRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 6.5"
                />
              </div>
              
              <div className="form-group">
                <label>Quarterly Service Cost (£)</label>
                <input
                  type="number"
                  name="currentSetup.currentCosts.quarterlyService"
                  value={formData.currentSetup.currentCosts.quarterlyService}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 150.00"
                />
              </div>
              
              <div className="cost-summary">
                <h3>Current Monthly Costs</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="label">Mono Cost:</span>
                    <span className="value">£{formData.currentSetup.currentCosts.monthlyMonoCost.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Colour Cost:</span>
                    <span className="value">£{formData.currentSetup.currentCosts.monthlyColourCost.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Total CPC:</span>
                    <span className="value">£{(formData.currentSetup.currentCosts.monthlyMonoCost + formData.currentSetup.currentCosts.monthlyColourCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="currentSetup.buyoutRequired"
                    checked={formData.currentSetup.buyoutRequired}
                    onChange={handleInputChange}
                  />
                  Buyout of current machine required
                </label>
              </div>
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Performance Requirements</h2>
            <div className="requirements-info">
              <p className="info-text">
                Define your priorities to help us match the best machines for your needs.
              </p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Primary Priority *</label>
                <div className="radio-group">
                  {[
                    { value: 'cost', label: 'Running Costs', desc: 'Lowest total cost of ownership' },
                    { value: 'speed', label: 'Speed & Productivity', desc: 'Fastest printing and processing' },
                    { value: 'quality', label: 'Print Quality', desc: 'Best image and document quality' },
                    { value: 'reliability', label: 'Reliability & Service', desc: 'Maximum uptime and support' },
                    { value: 'balanced', label: 'Balanced', desc: 'Good balance of all factors' }
                  ].map(priority => (
                    <label key={priority.value} className="radio-option">
                      <input
                        type="radio"
                        name="requirements.priority"
                        value={priority.value}
                        checked={formData.requirements.priority === priority.value}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">
                        {priority.label}
                        <small>{priority.desc}</small>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.requirements && <span className="error-text">{errors.requirements}</span>}
              </div>
              
              <div className="form-group">
                <label>Speed Requirements</label>
                <div className="speed-inputs">
                  <div className="input-group">
                    <label>Minimum Speed (PPM)</label>
                    <input
                      type="number"
                      name="requirements.minSpeed"
                      value={formData.requirements.minSpeed}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Auto-suggested based on volume"
                    />
                    <small>Suggested: {suggestMinSpeed(formData.monthlyVolume.total)} PPM</small>
                  </div>
                  <div className="input-group">
                    <label>Maximum Speed (Optional)</label>
                    <input
                      type="number"
                      name="requirements.maxSpeed"
                      value={formData.requirements.maxSpeed}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Essential Features</label>
                <div className="checkbox-grid">
                  {[
                    'Duplex Printing', 'Scanning', 'Fax', 'Stapling', 
                    'Hole Punch', 'Wireless Printing', 'Mobile Printing',
                    'Large Paper Trays', 'Booklet Making', 'Color Printing'
                  ].map(feature => (
                    <label key={feature} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={formData.requirements.essentialFeatures.includes(feature)}
                        onChange={(e) => handleArrayChange('requirements.essentialFeatures', feature, e.target.checked)}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Nice-to-Have Features</label>
                <div className="checkbox-grid">
                  {[
                    'Touch Screen', 'Cloud Integration', 'Advanced Security',
                    'Multiple Paper Trays', 'Automatic Document Feeder',
                    'Large Capacity Trays', 'Envelope Printing', 'Banner Printing'
                  ].map(feature => (
                    <label key={feature} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={formData.requirements.niceToHave.includes(feature)}
                        onChange={(e) => handleArrayChange('requirements.niceToHave', feature, e.target.checked)}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Service Level</label>
                <select
                  name="requirements.serviceLevel"
                  value={formData.requirements.serviceLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select Service Level</option>
                  <option value="Basic">Basic - Standard support</option>
                  <option value="Standard">Standard - Next day response</option>
                  <option value="Premium">Premium - Same day response</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Required Response Time</label>
                <select
                  name="requirements.responseTime"
                  value={formData.requirements.responseTime}
                  onChange={handleInputChange}
                >
                  <option value="">Select Response Time</option>
                  <option value="4hr">4 Hour Response</option>
                  <option value="8hr">8 Hour Response</option>
                  <option value="Next day">Next Day Response</option>
                  <option value="48hr">48 Hour Response</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
        
      case 6:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Budget & Terms</h2>
            <div className="budget-info">
              <p className="info-text">
                Budget information helps us recommend appropriately priced solutions.
              </p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Maximum Quarterly Lease Price (£) *</label>
                <input
                  type="number"
                  name="budget.maxLeasePrice"
                  value={formData.budget.maxLeasePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 600.00"
                  className={errors.budget ? 'error' : ''}
                />
                {errors.budget && <span className="error-text">{errors.budget}</span>}
              </div>
              
              <div className="form-group">
                <label>Budget Range</label>
                <select
                  name="budget.budgetRange"
                  value={formData.budget.budgetRange}
                  onChange={handleInputChange}
                >
                  <option value="">Select Budget Range</option>
                  <option value="£0-250">£0-250 per quarter</option>
                  <option value="£250-500">£250-500 per quarter</option>
                  <option value="£500-750">£500-750 per quarter</option>
                  <option value="£750-1000">£750-1000 per quarter</option>
                  <option value="£1000-1500">£1000-1500 per quarter</option>
                  <option value="£1500+">£1500+ per quarter</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Preferred Lease Term</label>
                <select
                  name="budget.termPreference"
                  value={formData.budget.termPreference}
                  onChange={handleInputChange}
                >
                  <option value="">Select Term</option>
                  <option value="1+3">1+3 (1 year + 3 year extension)</option>
                  <option value="2+8">2+8 (2 years + 8 quarters extension)</option>
                  <option value="3+9">3+9 (3 years + 9 quarters extension)</option>
                  <option value="5 year">5 Year Fixed</option>
                  <option value="Flexible">Flexible Terms</option>
                </select>
              </div>
              
              {formData.currentSetup.buyoutRequired && (
                <div className="form-group">
                  <label>Buyout Budget (£)</label>
                  <input
                    type="number"
                    name="budget.buyoutBudget"
                    value={formData.budget.buyoutBudget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 2500.00"
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
        
      case 7:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-step">
            <h2>Installation & Final Details</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Floor Type</label>
                <select
                  name="installation.floorType"
                  value={formData.installation.floorType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Floor Type</option>
                  <option value="Ground floor">Ground Floor</option>
                  <option value="Upper floor">Upper Floor</option>
                  <option value="Basement">Basement</option>
                  <option value="Multiple floors">Multiple Floors</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Access Restrictions</label>
                <input
                  type="text"
                  name="installation.accessRestrictions"
                  value={formData.installation.accessRestrictions}
                  onChange={handleInputChange}
                  placeholder="e.g., Narrow doorways, stairs, security requirements"
                />
              </div>
              
              <div className="form-group">
                <label>Power Requirements</label>
                <select
                  name="installation.powerRequirements"
                  value={formData.installation.powerRequirements}
                  onChange={handleInputChange}
                >
                  <option value="">Select Power</option>
                  <option value="Standard">Standard 13A Socket</option>
                  <option value="High power">High Power Required</option>
                  <option value="Unknown">Unknown - Please Assess</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Network Setup</label>
                <select
                  name="installation.networkSetup"
                  value={formData.installation.networkSetup}
                  onChange={handleInputChange}
                >
                  <option value="">Select Network</option>
                  <option value="Ethernet">Ethernet Cable</option>
                  <option value="WiFi">WiFi Only</option>
                  <option value="Both">Both Ethernet & WiFi</option>
                  <option value="None">No Network Required</option>
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>File Upload</label>
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <div className="dropzone-content">
                    <p>📄 Drag & drop files here or click to browse</p>
                    <small>Upload invoices, contracts, or usage reports (PDF, Excel, CSV, Images)</small>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    <ul>
                      {uploadedFiles.map((file, index) => (
                        <li key={index}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          <button 
                            type="button" 
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="remove-file"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any specific requirements, concerns, or additional information..."
                />
              </div>
            </div>
            
            <div className="quote-summary">
              <h3>Quote Summary</h3>
              <div className="summary-grid">
                <div className="summary-section">
                  <h4>Volume Requirements</h4>
                  <p>{formData.monthlyVolume.total.toLocaleString()} pages/month ({formData.monthlyVolume.volumeRange})</p>
                  <p>Suggested speed: {suggestMinSpeed(formData.monthlyVolume.total)}+ PPM</p>
                </div>
                
                <div className="summary-section">
                  <h4>Paper & Features</h4>
                  <p>Primary: {formData.paperRequirements.primarySize || 'Not specified'}</p>
                  <p>Features: {formData.requirements.essentialFeatures.length} essential</p>
                </div>
                
                <div className="summary-section">
                  <h4>Budget</h4>
                  <p>Max quarterly lease: £{formData.budget.maxLeasePrice || 'Not specified'}</p>
                  <p>Priority: {formData.requirements.priority || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}
          </motion.div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="enhanced-quote-request">
      <div className="form-header">
        <h1>Request a Quote</h1>
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4, 5, 6, 7].map(step => (
              <div 
                key={step} 
                className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="progress-fill" style={{ width: `${(currentStep / 7) * 100}%` }} />
        </div>
        <p className="step-info">
          Step {currentStep} of 7: {
            ['Company Information', 'Volume Analysis', 'Paper Requirements', 
             'Current Setup', 'Performance Requirements', 'Budget & Terms', 
             'Installation & Submit'][currentStep - 1]
          }
        </p>
      </div>

      <div className="form-content">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      <div className="form-navigation">
        {currentStep > 1 && (
          <button 
            type="button" 
            onClick={prevStep}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            ← Previous
          </button>
        )}
        
        <div className="nav-spacer" />
        
        {currentStep < 7 ? (
          <button 
            type="button" 
            onClick={nextStep}
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            Next →
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            className="btn btn-primary btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Quote Request'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Export with display name for debugging
EnhancedQuoteRequest.displayName = 'EnhancedQuoteRequest';

export default EnhancedQuoteRequest;