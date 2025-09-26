</motion.div>
  );

  const renderStep6 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 6: New Equipment Requirements</h2>
      {suggestedMachines.length > 0 && (
        <div className="mb-lg">
          <h3>⚡ AI Suggested Copiers</h3>
          <ul>
            {suggestedMachines.slice(0, 3).map((machine, index) => (
              <li key={index}>
                <strong>{machine.brand} {machine.model}</strong>: {machine.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="serviceType">Service Type <span className="required">*</span></label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            className={errorMessages.serviceType ? 'error' : ''}
          >
            <option value="">Select service type</option>
            <option value="Photocopiers">Photocopiers</option>
            <option value="Printers">Printers</option>
            <option value="Multifunction Devices">Multifunction Devices</option>
          </select>
          {errorMessages.serviceType && <span className="error-text">{errorMessages.serviceType}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="colour">Colour Preference <span className="required">*</span></label>
          <select
            id="colour"
            name="colour"
            value={formData.colour}
            onChange={handleChange}
            required
            className={errorMessages.colour ? 'error' : ''}
          >
            <option value="">Select colour preference</option>
            <option value="Full Colour">Full Colour</option>
            <option value="Black & White">Black & White</option>
          </select>
          {errorMessages.colour && <span className="error-text">{errorMessages.colour}</span>}
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="type">Maximum Paper Size <span className="required">*</span></label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className={errorMessages.type ? 'error' : ''}
          >
            <option value="">Select paper size</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="A2">A2</option>
            <option value="SRA3">SRA3</option>
          </select>
          {errorMessages.type && <span className="error-text">{errorMessages.type}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="min_speed">Minimum Speed (PPM) <span className="required">*</span></label>
          <input
            type="number"
            id="min_speed"
            name="min_speed"
            value={formData.min_speed}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 30"
            className={errorMessages.min_speed ? 'error' : ''}
          />
          {errorMessages.min_speed && <span className="error-text">{errorMessages.min_speed}</span>}
        </div>
      </div>
      <div className="form-group">
        <label>Required Functions & Features</label>
        <fieldset className="checkbox-group">
          <legend className="sr-only">Required Functions & Features</legend>
          <label><input type="checkbox" name="required_functions" value="Mobile Printing" checked={formData.required_functions.includes('Mobile Printing')} onChange={handleChange} /> Mobile Printing</label>
          <label><input type="checkbox" name="required_functions" value="Cloud Integration" checked={formData.required_functions.includes('Cloud Integration')} onChange={handleChange} /> Cloud Integration</label>
          <label><input type="checkbox" name="required_functions" value="Advanced Security" checked={formData.required_functions.includes('Advanced Security')} onChange={handleChange} /> Advanced Security</label>
          <label><input type="checkbox" name="required_functions" value="Large Paper Trays" checked={formData.required_functions.includes('Large Paper Trays')} onChange={handleChange} /> Large Paper Trays</label>
          <label><input type="checkbox" name="required_functions" value="High Capacity Toner" checked={formData.required_functions.includes('High Capacity Toner')} onChange={handleChange} /> High Capacity Toner</label>
          <label><input type="checkbox" name="required_functions" value="Scanning" checked={formData.required_functions.includes('Scanning')} onChange={handleChange} /> Scanning</label>
          <label><input type="checkbox" name="required_functions" value="Fax" checked={formData.required_functions.includes('Fax')} onChange={handleChange} /> Fax</label>
          <label><input type="checkbox" name="required_functions" value="Copying" checked={formData.required_functions.includes('Copying')} onChange={handleChange} /> Copying</label>
        </fieldset>
      </div>
    </motion.div>
  );

  const renderStep7 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 7: Service & Maintenance</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="responseTimeExpectation">Response Time Expectation <span className="required">*</span></label>
          <select
            id="responseTimeExpectation"
            name="responseTimeExpectation"
            value={formData.responseTimeExpectation}
            onChange={handleChange}
            required
            className={errorMessages.responseTimeExpectation ? 'error' : ''}
          >
            <option value="">Select expectation</option>
            <option value="4 hours">4 hours</option>
            <option value="8 hours">8 hours</option>
            <option value="24 hours">24 hours</option>
            <option value="48 hours">48 hours</option>
            <option value="72 hours">72 hours</option>
          </select>
          {errorMessages.responseTimeExpectation && <span className="error-text">{errorMessages.responseTimeExpectation}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="maintenancePreference">Maintenance Preference <span className="required">*</span></label>
          <select
            id="maintenancePreference"
            name="maintenancePreference"
            value={formData.maintenancePreference}
            onChange={handleChange}
            required
            className={errorMessages.maintenancePreference ? 'error' : ''}
          >
            <option value="">Select preference</option>
            <option value="Scheduled Maintenance">Scheduled Maintenance</option>
            <option value="On-demand Service">On-demand Service</option>
            <option value="Managed Print Service (MPS)">Managed Print Service (MPS)</option>
          </select>
          {errorMessages.maintenancePreference && <span className="error-text">{errorMessages.maintenancePreference}</span>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="supplyManagement">Supply Management Preference</label>
        <textarea
          id="supplyManagement"
          name="supplyManagement"
          value={formData.supplyManagement}
          onChange={handleChange}
          rows="2"
          placeholder="e.g., 'Automated toner ordering', 'Manual inventory management'."
        />
      </div>
      <div className="form-group">
        <label htmlFor="trainingNeeds">Training Requirements</label>
        <textarea
          id="trainingNeeds"
          name="trainingNeeds"
          value={formData.trainingNeeds}
          onChange={handleChange}
          rows="2"
          placeholder="e.g., 'Basic user training', 'Administrator training', 'No training needed'."
        />
      </div>
    </motion.div>
  );

  const renderStep8 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 8: Budget & Decision Making</h2>
      <div className="form-group">
        <label>Decision Makers <span className="required">*</span></label>
        {errorMessages.decisionMakers && <span className="error-text">{errorMessages.decisionMakers}</span>}
        <fieldset className="checkbox-group">
          <legend className="sr-only">Decision Makers</legend>
          <label><input type="checkbox" name="decisionMakers" value="IT Manager" checked={formData.decisionMakers.includes('IT Manager')} onChange={handleChange} /> IT Manager</label>
          <label><input type="checkbox" name="decisionMakers" value="CFO/Finance Director" checked={formData.decisionMakers.includes('CFO/Finance Director')} onChange={handleChange} /> CFO/Finance Director</label>
          <label><input type="checkbox" name="decisionMakers" value="CEO/Owner" checked={formData.decisionMakers.includes('CEO/Owner')} onChange={handleChange} /> CEO/Owner</label>
          <label><input type="checkbox" name="decisionMakers" value="Procurement Manager" checked={formData.decisionMakers.includes('Procurement Manager')} onChange={handleChange} /> Procurement Manager</label>
          <label><input type="checkbox" name="decisionMakers" value="Office Manager" checked={formData.decisionMakers.includes('Office Manager')} onChange={handleChange} /> Office Manager</label>
        </fieldset>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="preference">What is most important to you? <span className="required">*</span></label>
          <select
            id="preference"
            name="preference"
            value={formData.preference}
            onChange={handleChange}
            required
            className={errorMessages.preference ? 'error' : ''}
          >
            <option value="">Select priority</option>
            <option value="cost">Cost</option>
            <option value="quality">Quality</option>
            <option value="speed">Speed</option>
            <option value="reliability">Reliability</option>
            <option value="balanced">Balanced</option>
          </select>
          {errorMessages.preference && <span className="error-text">{errorMessages.preference}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="max_lease_price">Maximum Monthly Investment (£) <span className="required">*</span></label>
          <input
            type="number"
            id="max_lease_price"
            name="max_lease_price"
            value={formData.max_lease_price}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 200"
            className={errorMessages.max_lease_price ? 'error' : ''}
          />
          {errorMessages.max_lease_price && <span className="error-text">{errorMessages.max_lease_price}</span>}
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="contractLengthPreference">Contract Length Preference</label>
          <select
            id="contractLengthPreference"
            name="contractLengthPreference"
            value={formData.contractLengthPreference}
            onChange={handleChange}
          >
            <option value="">Select contract length</option>
            <option value="12 months">12 months</option>
            <option value="24 months">24 months</option>
            <option value="36 months">36 months</option>
            <option value="48 months">48 months</option>
            <option value="60 months">60 months</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="pricingModelPreference">Pricing Model Preference</label>
          <select
            id="pricingModelPreference"
            name="pricingModelPreference"
            value={formData.pricingModelPreference}
            onChange={handleChange}
          >
            <option value="">Select pricing model</option>
            <option value="Lease">Lease</option>
            <option value="Cost Per Copy (CPC)">Cost Per Copy (CPC)</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep9 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 9: Future Planning & Strategic Vision</h2>
      <div className="form-group">
        <label htmlFor="expectedGrowth">Expected Business Growth <span className="required">*</span></label>
        <select
          id="expectedGrowth"
          name="expectedGrowth"
          value={formData.expectedGrowth}
          onChange={handleChange}
          required
          className={errorMessages.expectedGrowth ? 'error' : ''}
        >
          <option value="">Select growth expectation</option>
          <option value="Decline">Decline</option>
          <option value="Stable">Stable</option>
          <option value="Moderate Growth">Moderate Growth (5-15%)</option>
          <option value="Strong Growth">Strong Growth (16-30%)</option>
          <option value="Rapid Growth">Rapid Growth (30%+)</option>
        </select>
        {errorMessages.expectedGrowth && <span className="error-text">{errorMessages.expectedGrowth}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="threeYearVision">3-Year Vision <span className="required">*</span></label>
        <textarea
          id="threeYearVision"
          name="threeYearVision"
          value={formData.threeYearVision}
          onChange={handleChange}
          rows="4"
          required
          placeholder="Describe your 3-year vision for your business and document workflow needs."
          className={errorMessages.threeYearVision ? 'error' : ''}
        />
        {errorMessages.threeYearVision && <span className="error-text">{errorMessages.threeYearVision}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="expansionPlans">Expansion Plans</label>
        <textarea
          id="expansionPlans"
          name="expansionPlans"
          value={formData.expansionPlans}
          onChange={handleChange}
          rows="2"
          placeholder="Any plans for new offices, locations, or significant business expansion?"
        />
      </div>
      <div className="form-group">
        <label htmlFor="technologyRoadmap">Technology Roadmap</label>
        <textarea
          id="technologyRoadmap"
          name="technologyRoadmap"
          value={formData.technologyRoadmap}
          onChange={handleChange}
          rows="2"
          placeholder="Any upcoming technology initiatives or digital transformation plans?"
        />
      </div>
      <div className="form-group">
        <h4>Upload Relevant Documents (Optional)</h4>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
          <p className="text-muted">(Max 5 files, 5MB each. PDF, XLSX, CSV, images)</p>
        </div>
        {errorMessages.fileUpload && <span className="error-text">{errorMessages.fileUpload}</span>}
        {uploadedFiles.length > 0 && (
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={file.name} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button type="button" onClick={() => removeFile(file)} className="remove-file">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="enhanced-quote-request">
      <div className="progress-indicator">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 9) * 100}%` }}></div>
        </div>
        <span className="progress-text">Step {step} of 9</span>
      </div>

      <form onSubmit={handleSubmit} className="quote-form">
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
          {step === 8 && renderStep8()}
          {step === 9 && renderStep9()}
        </AnimatePresence>

        {submissionStatus === 'error' && errorMessages.general && (
          <div className="error-message">
            <p>{errorMessages.general}</p>
          </div>
        )}

        {submissionStatus === 'success' && successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button type="button" onClick={handleBack} className="btn-secondary" disabled={isSubmitting}>
              Back
            </button>
          )}
          
          {step < 9 ? (
            <button type="button" onClick={handleNext} className="btn-primary" disabled={isSubmitting}>
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedQuoteRequest;="required_functions" value="Duplex Printing" checked={formData.required_functions.includes('Duplex Printing')} onChange={handleChange} /> Duplex Printing</label>
          <label><input type="checkbox" name="required_functions" value="Wireless Printing" checked={formData.required_functions.includes('Wireless Printing')} onChange={handleChange} /> Wireless Printing</label>
          <label><input type="checkbox" nameimport React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './EnhancedQuoteRequest.css';

// Hard-coded production URL
const PRODUCTION_API_URL = 'https://ai-procurement-backend-q35u.onrender.com';

// Component for a loading spinner
const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="loading-spinner"></div>
  </div>
);

// AI-driven copier suggestion function using user token
const suggestCopiers = async (data, token) => {
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/api/suggest-copiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.warn(`AI suggestions failed: ${response.status} ${response.statusText}`);
      return [];
    }
    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.warn('AI suggestions error:', error.message);
    return [];
  }
};

// Helper function to suggest minimum speed based on volume
const suggestMinSpeed = (totalVolume) => {
  if (totalVolume <= 6000) return 20;
  if (totalVolume <= 13000) return 25;
  if (totalVolume <= 20000) return 30;
  if (totalVolume <= 30000) return 35;
  if (totalVolume <= 40000) return 45;
  if (totalVolume <= 50000) return 55;
  if (totalVolume <= 60000) return 65;
  return 75;
};

// Helper functions for data mapping
const mapIndustryType = (industry) => {
  const industryMapping = {
    'Technology': 'Other',
    'Healthcare': 'Healthcare',
    'Legal': 'Legal',
    'Education': 'Education',
    'Finance': 'Finance',
    'Government': 'Government',
    'Manufacturing': 'Manufacturing',
    'Retail': 'Retail',
    'Real Estate': 'Other',
    'Non-profit': 'Other'
  };
  return industryMapping[industry] || 'Other';
};

const mapPaperSize = (size) => {
  const sizeMapping = {
    'A4': 'A4',
    'A3': 'A3',
    'A2': 'A3',
    'SRA3': 'SRA3'
  };
  return sizeMapping[size] || 'A4';
};

const mapPriority = (priority) => {
  const priorityMapping = {
    'cost': 'cost',
    'quality': 'quality',
    'speed': 'speed',
    'reliability': 'reliability',
    'balanced': 'balanced'
  };
  return priorityMapping[priority?.toLowerCase()] || 'cost';
};

const mapEquipmentAge = (age) => {
  const ageMapping = {
    'Less than 1 year': 'Under 2 years',
    '1-2 years': 'Under 2 years',
    '2-5 years': '2-5 years',
    '3-4 years': '2-5 years',
    '5-6 years': '5+ years',
    'Over 6 years': '5+ years',
    'Mixed ages': '5+ years',
    'No current equipment': 'No current machine'
  };
  return ageMapping[age] || 'No current machine';
};

const mapTimeframe = (timeline) => {
  const timelineMapping = {
    'ASAP': 'Immediately',
    'As soon as possible': 'Immediately',
    '1-2 months': 'Within 1 month',
    '3-6 months': '1-3 months',
    '6-12 months': '3+ months',
    '12+ months': '3+ months'
  };
  return timelineMapping[timeline] || 'Within 1 month';
};

const mapFeatures = (features) => {
  const validFeatures = [
    'Duplex Printing', 'Wireless Printing', 'Mobile Printing', 'Cloud Integration',
    'Advanced Security', 'Large Paper Trays', 'High Capacity Toner',
    'Color Printing', 'Scanning', 'Fax', 'Copying', 'Email Integration',
    'Stapling', 'Hole Punch', 'Booklet Making', 'Large Capacity Trays',
    'Touch Screen', 'Auto Document Feeder', 'ID Card Copying', 'Follow-Me Print'
  ];
  const featureMapping = {
    'High printing costs': 'Advanced Security',
    'Frequent equipment breakdowns': 'High Capacity Toner',
    'Poor print quality': 'Color Printing',
    'Slow printing speeds': 'Duplex Printing',
    'Limited functionality': 'Mobile Printing',
    'Complex user interface': 'Touch Screen',
    'Poor vendor support': 'Cloud Integration',
    'Supply chain issues': 'Large Paper Trays',
    'Security concerns': 'Advanced Security',
    'Integration problems': 'Email Integration'
  };
  return features.map(feature => featureMapping[feature] || feature)
    .filter(feature => validFeatures.includes(feature));
};

// Validate UK postcode format
const validatePostcode = (postcode) => {
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode);
};

// Map form data to backend Quote schema
const mapFormDataToBackend = (formData, userProfile) => {
  const totalVolume = (parseInt(formData.monthlyVolume?.mono) || 0) + (parseInt(formData.monthlyVolume?.colour) || 0);

  return {
    companyName: formData.companyName || 'Unknown Company',
    contactName: userProfile?.name || userProfile?.username || formData.contactName || 'Unknown Contact',
    email: userProfile?.email || formData.email || 'unknown@example.com',
    industryType: mapIndustryType(formData.industryType),
    numEmployees: Math.max(1, parseInt(formData.numEmployees) || 1),
    numLocations: Math.max(1, parseInt(formData.numLocations) || 1),
    serviceType: formData.serviceType || 'Photocopiers',
    numOfficeLocations: Math.max(1, parseInt(formData.numLocations) || 1),
    multipleFloors: formData.multiFloor === 'Yes',
    price: parseInt(formData.max_lease_price) || 100,
    minSpeed: parseInt(formData.min_speed) || suggestMinSpeed(totalVolume),
    type: formData.type || undefined,
    monthlyVolume: {
      mono: parseInt(formData.monthlyVolume?.mono) || 0,
      colour: parseInt(formData.monthlyVolume?.colour) || 0,
      total: totalVolume || 1
    },
    paperRequirements: {
      primarySize: mapPaperSize(formData.type || formData.paperSize),
      additionalSizes: [],
      specialPaper: false,
      specialPaperTypes: []
    },
    currentSetup: {
      machineAge: mapEquipmentAge(formData.currentEquipmentAge),
      currentSupplier: formData.currentSetup.currentSupplier || undefined,
      currentModel: formData.currentSetup.currentModel || undefined,
      currentSpeed: parseInt(formData.currentSetup.currentSpeed) || undefined,
      contractStartDate: formData.currentSetup.contractStartDate ? new Date(formData.currentSetup.contractStartDate) : undefined,
      contractEndDate: formData.currentSetup.contractEndDate ? new Date(formData.currentSetup.contractEndDate) : undefined,
      currentCosts: {
        monoRate: parseFloat(formData.currentSetup.currentMonoCPC) || undefined,
        colourRate: parseFloat(formData.currentSetup.currentColorCPC) || undefined,
        quarterlyLeaseCost: parseFloat(formData.currentSetup.quarterlyLeaseCost) || undefined,
        quarterlyService: undefined
      },
      painPoints: formData.reasonsForQuote || [],
      satisfactionLevel: undefined,
      currentFeatures: formData.currentSetup.currentFeatures || [],
      buyoutRequired: formData.currentSetup.buyoutRequired || false,
      buyoutCost: formData.currentSetup.buyoutCost || undefined,
      includeBuyoutInCosts: formData.currentSetup.includeBuyoutInCosts || false
    },
    requirements: {
      priority: mapPriority(formData.preference),
      essentialFeatures: mapFeatures(formData.required_functions || []),
      niceToHaveFeatures: [],
      minSpeed: parseInt(formData.min_speed) || suggestMinSpeed(totalVolume),
      maxNoisLevel: undefined, // Fixed typo from maxNoiseLevel
      environmentalConcerns: formData.sustainabilityGoals ? true : false
    },
    budget: {
      maxLeasePrice: parseInt(formData.max_lease_price) || 100,
      preferredTerm: formData.contractLengthPreference || '36 months',
      includeService: true,
      includeConsumables: true
    },
    urgency: {
      timeframe: mapTimeframe(formData.implementationTimeline),
      reason: formData.currentPainPoints || undefined
    },
    location: {
      postcode: formData.postcode || 'Unknown',
      city: undefined,
      region: undefined,
      installationRequirements: undefined
    },
    aiAnalysis: {
      processed: false,
      suggestedCategories: [],
      volumeCategory: undefined,
      riskFactors: [],
      recommendations: [],
      processedAt: undefined
    },
    submittedBy: userProfile?._id || userProfile?.userId || userProfile?.id,
    userId: userProfile?._id || userProfile?.userId || userProfile?.id,
    status: 'pending',
    submissionSource: 'web_form',
    phone: undefined,
    quotes: [],
    internalNotes: [],
    ...(formData.subSector && { subSector: formData.subSector }),
    ...(formData.annualRevenue && { annualRevenue: formData.annualRevenue }),
    ...(formData.officeBasedEmployees && { officeBasedEmployees: parseInt(formData.officeBasedEmployees) }),
    ...(formData.primaryBusinessActivity && { primaryBusinessActivity: formData.primaryBusinessActivity }),
    ...(formData.currentPainPoints && { currentPainPoints: formData.currentPainPoints }),
    ...(formData.impactOnProductivity && { impactOnProductivity: formData.impactOnProductivity }),
    ...(formData.urgencyLevel && { urgencyLevel: formData.urgencyLevel }),
    ...(formData.budgetCycle && { budgetCycle: formData.budgetCycle }),
    ...(formData.peakUsagePeriods && { peakUsagePeriods: formData.peakUsagePeriods }),
    ...(formData.documentTypes?.length > 0 && { documentTypes: formData.documentTypes }),
    ...(formData.averagePageCount && { averagePageCount: formData.averagePageCount }),
    ...(formData.finishingRequirements?.length > 0 && { finishingRequirements: formData.finishingRequirements }),
    ...(formData.departmentBreakdown?.length > 0 && { departmentBreakdown: formData.departmentBreakdown }),
    ...(formData.securityRequirements?.length > 0 && { securityRequirements: formData.securityRequirements }),
    ...(formData.currentSoftwareEnvironment && { currentSoftwareEnvironment: formData.currentSoftwareEnvironment }),
    ...(formData.cloudPreference && { cloudPreference: formData.cloudPreference }),
    ...(formData.integrationNeeds?.length > 0 && { integrationNeeds: formData.integrationNeeds }),
    ...(formData.mobileRequirements && { mobileRequirements: formData.mobileRequirements === 'Yes' }),
    ...(formData.remoteWorkImpact && { remoteWorkImpact: formData.remoteWorkImpact }),
    ...(formData.totalAnnualCosts && { totalAnnualCosts: parseFloat(formData.totalAnnualCosts) }),
    ...(formData.hiddenCosts && { hiddenCosts: formData.hiddenCosts }),
    ...(formData.serviceProvider && { serviceProvider: formData.serviceProvider }),
    ...(formData.maintenanceIssues && { maintenanceIssues: formData.maintenanceIssues }),
    ...(formData.additionalServices?.length > 0 && { additionalServices: formData.additionalServices }),
    ...(formData.paysForScanning && { paysForScanning: formData.paysForScanning === 'Yes' }),
    ...(formData.colour && { colour: formData.colour }),
    ...(formData.min_speed && { min_speed: parseInt(formData.min_speed) }),
    ...(formData.securityFeatures?.length > 0 && { securityFeatures: formData.securityFeatures }),
    ...(formData.accessibilityNeeds && { accessibilityNeeds: formData.accessibilityNeeds === 'Yes' }),
    ...(formData.sustainabilityGoals && { sustainabilityGoals: formData.sustainabilityGoals }),
    ...(formData.trainingNeeds && { trainingNeeds: formData.trainingNeeds }),
    ...(formData.supplyManagement && { supplyManagement: formData.supplyManagement }),
    ...(formData.reportingNeeds?.length > 0 && { reportingNeeds: formData.reportingNeeds }),
    ...(formData.vendorRelationshipType && { vendorRelationshipType: formData.vendorRelationshipType }),
    ...(formData.evaluationCriteria?.length > 0 && { evaluationCriteria: formData.evaluationCriteria }),
    ...(formData.contractLengthPreference && { contractLengthPreference: formData.contractLengthPreference }),
    ...(formData.pricingModelPreference && { pricingModelPreference: formData.pricingModelPreference }),
    ...(formData.roiExpectations && { roiExpectations: formData.roiExpectations }),
    ...(formData.expansionPlans && { expansionPlans: formData.expansionPlans }),
    ...(formData.technologyRoadmap && { technologyRoadmap: formData.technologyRoadmap }),
    ...(formData.digitalTransformation && { digitalTransformation: formData.digitalTransformation }),
    ...(formData.threeYearVision && { threeYearVision: formData.threeYearVision }),
    ...(formData.reasonsForQuote?.length > 0 && { reasonsForQuote: formData.reasonsForQuote })
  };
};

// Submission function
const submitQuoteRequest = async (formData, userProfile) => {
  try {
    const payload = mapFormDataToBackend(formData, userProfile);
    console.log('🚀 Submitting payload:', JSON.stringify(payload, null, 2));
    const response = await fetch(`${PRODUCTION_API_URL}/api/quotes/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userProfile.token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Backend validation error:', errorData);
      throw new Error(errorData.message || errorData.details?.join('; ') || 'Failed to submit quote request');
    }
    const result = await response.json();
    console.log('✅ Quote request submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('⚠️ Error submitting quote request:', error);
    throw error;
  }
};

const EnhancedQuoteRequest = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industryType: '',
    subSector: '',
    annualRevenue: '',
    numEmployees: '',
    officeBasedEmployees: '',
    numLocations: '',
    primaryBusinessActivity: '',
    multiFloor: 'No',
    postcode: '',
    monthlyVolume: { mono: '', colour: '' },
    currentPainPoints: '',
    impactOnProductivity: '',
    urgencyLevel: '',
    implementationTimeline: '',
    budgetCycle: '',
    peakUsagePeriods: '',
    documentTypes: [],
    averagePageCount: '',
    finishingRequirements: [],
    departmentBreakdown: [],
    networkSetup: '',
    itSupportStructure: '',
    securityRequirements: [],
    currentSoftwareEnvironment: '',
    cloudPreference: '',
    integrationNeeds: [],
    mobileRequirements: 'No',
    remoteWorkImpact: '',
    currentEquipmentAge: '',
    currentSetup: {
      currentSupplier: '',
      currentModel: '',
      currentSpeed: '',
      contractStartDate: '',
      contractEndDate: '',
      currentMonoCPC: '',
      currentColorCPC: '',
      quarterlyLeaseCost: '',
      currentFeatures: [],
      buyoutRequired: false,
      buyoutCost: '',
      includeBuyoutInCosts: false
    },
    reasonsForQuote: [],
    totalAnnualCosts: '',
    hiddenCosts: '',
    serviceProvider: '',
    maintenanceIssues: '',
    additionalServices: [],
    paysForScanning: 'No',
    serviceType: 'Photocopiers',
    colour: '',
    type: '', // This will hold paper size like A4, A3
    min_speed: '',
    securityFeatures: [],
    accessibilityNeeds: 'No',
    sustainabilityGoals: '',
    responseTimeExpectation: '',
    maintenancePreference: '',
    trainingNeeds: '',
    supplyManagement: '',
    reportingNeeds: [],
    vendorRelationshipType: '',
    decisionMakers: [],
    evaluationCriteria: [],
    contractLengthPreference: '',
    pricingModelPreference: '',
    required_functions: [],
    preference: '',
    max_lease_price: '',
    roiExpectations: '',
    expectedGrowth: '',
    expansionPlans: '',
    technologyRoadmap: '',
    digitalTransformation: '',
    threeYearVision: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [errorMessages, setErrorMessages] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestedMachines, setSuggestedMachines] = useState([]);

  // Auto-update suggested machines
  useEffect(() => {
    if (auth?.token && (
      formData.monthlyVolume.mono ||
      formData.monthlyVolume.colour ||
      formData.type ||
      formData.industryType ||
      formData.currentSetup.currentSupplier ||
      formData.currentSetup.currentModel ||
      formData.currentSetup.currentFeatures.length > 0
    )) {
      suggestCopiers(formData, auth.token).then((suggestions) => {
        setSuggestedMachines(suggestions);
      }).catch(error => {
        console.warn('AI suggestions error:', error);
      });
    }
  }, [
    formData.monthlyVolume.mono,
    formData.monthlyVolume.colour,
    formData.type,
    formData.industryType,
    formData.currentSetup.currentSupplier,
    formData.currentSetup.currentModel,
    formData.currentSetup.currentFeatures,
    auth?.token
  ]);

  // Calculate buyout cost
  const calculateBuyout = () => {
    const { quarterlyLeaseCost, contractEndDate } = formData.currentSetup;
    if (!quarterlyLeaseCost || !contractEndDate) return 'N/A';
    const end = new Date(contractEndDate);
    const today = new Date();
    if (today > end) return 'Contract Ended';
    const monthsRemaining = (end - today) / (1000 * 60 * 60 * 24 * 30.44); // Average months days
    const quarterlyCost = parseFloat(quarterlyLeaseCost) || 0;
    const buyout = (quarterlyCost / 3) * monthsRemaining;
    return buyout.toFixed(2);
  };

  // Update buyout cost in formData
  useEffect(() => {
    const buyoutCost = calculateBuyout();
    setFormData(prev => ({
      ...prev,
      currentSetup: {
        ...prev.currentSetup,
        buyoutCost: buyoutCost !== 'N/A' && buyoutCost !== 'Contract Ended' ? parseFloat(buyoutCost) : undefined
      }
    }));
  }, [formData.currentSetup.quarterlyLeaseCost, formData.currentSetup.contractEndDate]);

  // Auto-suggest minimum speed based on volume
  useEffect(() => {
    const totalVolume = (parseInt(formData.monthlyVolume.mono) || 0) + (parseInt(formData.monthlyVolume.colour) || 0);
    if (totalVolume > 0) {
      const suggestedSpeed = suggestMinSpeed(totalVolume);
      setFormData(prev => ({
        ...prev,
        min_speed: suggestedSpeed.toString()
      }));
    }
  }, [formData.monthlyVolume.mono, formData.monthlyVolume.colour]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedData;

    // Helper for updating nested state
    const updateNestedState = (obj, keys, val) => {
      const updated = { ...obj };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = val;
      return updated;
    };

    if (type === 'checkbox') {
      const keys = name.split('.');
      const parentName = keys.length > 1 ? keys[0] : null;
      const fieldName = keys.length > 1 ? keys[1] : keys[0];

      if (parentName) {
        updatedData = { ...formData };
        const currentArray = updatedData[parentName][fieldName] || [];
        const newArray = checked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value);
        updatedData[parentName][fieldName] = newArray;
      } else {
        const currentArray = formData[name] || [];
        updatedData = {
          ...formData,
          [name]: checked
            ? [...currentArray, value]
            : currentArray.filter((item) => item !== value)
        };
      }
    } else if (name.startsWith('monthlyVolume.') || name.startsWith('currentSetup.')) {
      const keys = name.split('.');
      updatedData = updateNestedState(formData, keys, value);
    } else {
      updatedData = {
        ...formData,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
      };
    }
    setFormData(updatedData);
    setErrorMessages({}); // Clear errors on change
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        setErrorMessages(prev => ({
          ...prev,
          fileUpload: 'Some files were rejected. Ensure files are PDF, Excel, CSV, or images and under 5MB.'
        }));
        return;
      }
      if (acceptedFiles.length + uploadedFiles.length > 5) {
        setErrorMessages(prev => ({
          ...prev,
          fileUpload: 'Maximum 5 files allowed.'
        }));
        return;
      }
      // Check for duplicate file names
      const newFiles = acceptedFiles.filter(file => !uploadedFiles.some(existing => existing.name === file.name));
      if (newFiles.length < acceptedFiles.length) {
        setErrorMessages(prev => ({
          ...prev,
          fileUpload: 'Some files were rejected due to duplicate names.'
        }));
      }
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    },
  });

  const removeFile = (file) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
  };

  const validateStep = (currentStep) => {
    const errors = {};
    switch (currentStep) {
      case 1:
        if (!formData.companyName) errors.companyName = 'Company name is required';
        if (!formData.industryType) errors.industryType = 'Industry type is required';
        if (!formData.numEmployees || parseInt(formData.numEmployees) < 1) errors.numEmployees = 'Number of employees must be at least 1';
        if (!formData.numLocations || parseInt(formData.numLocations) < 1) errors.numLocations = 'Number of locations must be at least 1';
        if (!formData.postcode) errors.postcode = 'Postcode is required';
        else if (!validatePostcode(formData.postcode)) errors.postcode = 'Invalid UK postcode format';
        break;
      case 2:
        if (formData.reasonsForQuote.length === 0) errors.reasonsForQuote = 'At least one reason for requesting a quote is required';
        if (!formData.urgencyLevel) errors.urgencyLevel = 'Urgency level is required';
        if (!formData.implementationTimeline) errors.implementationTimeline = 'Implementation timeline is required';
        break;
      case 3:
        if (formData.monthlyVolume.colour === '' || formData.monthlyVolume.mono === '') {
          errors.monthlyVolume = 'Both color and mono volume are required';
        } else if (parseInt(formData.monthlyVolume.colour) < 0 || parseInt(formData.monthlyVolume.mono) < 0) {
          errors.monthlyVolume = 'Volumes cannot be negative';
        }
        break;
      case 4:
        if (!formData.networkSetup) errors.networkSetup = 'Network setup is required';
        if (!formData.itSupportStructure) errors.itSupportStructure = 'IT support structure is required';
        break;
      case 5:
        if (!formData.currentEquipmentAge) errors.currentEquipmentAge = 'Current equipment age is required';
        break;
      case 6:
        if (!formData.serviceType) errors.serviceType = 'Service type is required';
        if (!formData.colour) errors.colour = 'Colour preference is required';
        if (!formData.type) errors.type = 'Maximum paper size is required';
        if (!formData.min_speed || parseInt(formData.min_speed) < 1) errors.min_speed = 'Minimum speed is required';
        break;
      case 7:
        if (!formData.responseTimeExpectation) errors.responseTimeExpectation = 'Response time expectation is required';
        if (!formData.maintenancePreference) errors.maintenancePreference = 'Maintenance preference is required';
        break;
      case 8:
        if (formData.decisionMakers.length === 0) errors.decisionMakers = 'At least one decision maker is required';
        if (!formData.preference) errors.preference = 'Priority is required';
        if (!formData.max_lease_price || parseInt(formData.max_lease_price) < 1) errors.max_lease_price = 'Maximum monthly investment must be at least £1';
        break;
      case 9:
        if (!formData.expectedGrowth) errors.expectedGrowth = 'Expected growth is required';
        if (!formData.threeYearVision) errors.threeYearVision = 'Three-year vision is required';
        break;
      default:
        return true;
    }
    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setErrorMessages({});
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(9)) {
      return;
    }
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessages({});
    setSuccessMessage('');
    if (!isLoggedIn) {
      alert('You must be logged in to submit a quote request.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }
    const token = auth?.token;
    const userId = auth?.user?.userId || auth?.user?.id;
    const userProfile = {
      _id: userId,
      name: auth?.user?.name || auth?.user?.username,
      email: auth?.user?.email,
      token: token
    };
    if (!token || !userId) {
      alert('Authentication failed. Please log in again.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }
    try {
      let data;
      if (uploadedFiles.length > 0) {
        console.log('📁 Submitting with files');
        const requestData = new FormData();
        const payload = mapFormDataToBackend(formData, userProfile);
        requestData.append('quoteRequest', JSON.stringify(payload));
        uploadedFiles.forEach((file, index) => requestData.append(`documents[${index}]`, file));
        const response = await fetch(`${PRODUCTION_API_URL}/api/quotes/request`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: requestData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Backend error:', errorData);
          throw new Error(errorData.message || errorData.details?.join('; ') || 'Failed to submit quote request');
        }
        data = await response.json();
      } else {
        console.log('📄 Submitting JSON only');
        data = await submitQuoteRequest(formData, userProfile);
      }
      console.log('✅ Quote request submitted successfully:', data);
      setSubmissionStatus('success');
      setSuccessMessage('Quote request submitted successfully! AI matching in progress. Redirecting to your comparison page...');
      setErrorMessages({});
      setTimeout(() => {
        console.log('🎯 Navigating to compare vendors page');
        // CRITICAL FIX: Navigate to CompareVendors instead of broken QuotesResults
        if (data.aiMatching?.quotesCreated > 0) {
          navigate('/compare-vendors');
        } else {
          // Fallback to quotes page if no quotes were generated
          navigate('/quotes');
        }
      }, 2000);
      setFormData({
        companyName: '', industryType: '', subSector: '', annualRevenue: '', numEmployees: '', officeBasedEmployees: '', numLocations: '', primaryBusinessActivity: '', multiFloor: 'No', postcode: '', monthlyVolume: { mono: '', colour: '' }, currentPainPoints: '', impactOnProductivity: '', urgencyLevel: '', implementationTimeline: '', budgetCycle: '', peakUsagePeriods: '', documentTypes: [], averagePageCount: '', finishingRequirements: [], departmentBreakdown: [], networkSetup: '', itSupportStructure: '', securityRequirements: [], currentSoftwareEnvironment: '', cloudPreference: '', integrationNeeds: [], mobileRequirements: 'No', remoteWorkImpact: '', currentEquipmentAge: '', currentSetup: { currentSupplier: '', currentModel: '', currentSpeed: '', contractStartDate: '', contractEndDate: '', currentMonoCPC: '', currentColorCPC: '', quarterlyLeaseCost: '', currentFeatures: [], buyoutRequired: false, buyoutCost: '', includeBuyoutInCosts: false }, reasonsForQuote: [], totalAnnualCosts: '', hiddenCosts: '', serviceProvider: '', maintenanceIssues: '', additionalServices: [], paysForScanning: 'No', serviceType: 'Photocopiers', colour: '', type: '', min_speed: '', securityFeatures: [], accessibilityNeeds: 'No', sustainabilityGoals: '', responseTimeExpectation: '', maintenancePreference: '', trainingNeeds: '', supplyManagement: '', reportingNeeds: [], vendorRelationshipType: '', decisionMakers: [], evaluationCriteria: [], contractLengthPreference: '', pricingModelPreference: '', required_functions: [], preference: '', max_lease_price: '', roiExpectations: '', expectedGrowth: '', expansionPlans: '', technologyRoadmap: '', digitalTransformation: '', threeYearVision: ''
      });
      setUploadedFiles([]);
      setStep(1);
    } catch (error) {
      console.error('⚠️ Error submitting quote request:', error);
      setSubmissionStatus('error');
      setErrorMessages({ general: error.message || 'An error occurred while submitting your quote request. Please try again.' });
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 1: Company Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="companyName">Company Name <span className="required">*</span></label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="Enter your company name"
            className={errorMessages.companyName ? 'error' : ''}
          />
          {errorMessages.companyName && <span className="error-text">{errorMessages.companyName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="industryType">Industry Type <span className="required">*</span></label>
          <select
            id="industryType"
            name="industryType"
            value={formData.industryType}
            onChange={handleChange}
            required
            className={errorMessages.industryType ? 'error' : ''}
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Legal">Legal</option>
            <option value="Education">Education</option>
            <option value="Finance">Finance</option>
            <option value="Government">Government</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Non-profit">Non-profit</option>
          </select>
          {errorMessages.industryType && <span className="error-text">{errorMessages.industryType}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="subSector">Sub-Sector</label>
          <input
            type="text"
            id="subSector"
            name="subSector"
            value={formData.subSector}
            onChange={handleChange}
            placeholder="e.g., Tech Startup, NHS Trust"
          />
        </div>
        <div className="form-group">
          <label htmlFor="annualRevenue">Annual Revenue</label>
          <input
            type="text"
            id="annualRevenue"
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleChange}
            placeholder="e.g., £5M, £20-50M"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numEmployees">Number of Total Employees <span className="required">*</span></label>
          <input
            type="number"
            id="numEmployees"
            name="numEmployees"
            value={formData.numEmployees}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 50"
            className={errorMessages.numEmployees ? 'error' : ''}
          />
          {errorMessages.numEmployees && <span className="error-text">{errorMessages.numEmployees}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="officeBasedEmployees">Number of Office-Based Employees</label>
          <input
            type="number"
            id="officeBasedEmployees"
            name="officeBasedEmployees"
            value={formData.officeBasedEmployees}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 40"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numLocations">Number of Office Locations <span className="required">*</span></label>
          <input
            type="number"
            id="numLocations"
            name="numLocations"
            value={formData.numLocations}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 1"
            className={errorMessages.numLocations ? 'error' : ''}
          />
          {errorMessages.numLocations && <span className="error-text">{errorMessages.numLocations}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="primaryBusinessActivity">Primary Business Activity</label>
          <input
            type="text"
            id="primaryBusinessActivity"
            name="primaryBusinessActivity"
            value={formData.primaryBusinessActivity}
            onChange={handleChange}
            placeholder="e.g., Legal Services, Software Development"
          />
        </div>
        <div className="form-group">
          <label htmlFor="multiFloor">Are your offices on multiple floors?</label>
          <select
            id="multiFloor"
            name="multiFloor"
            value={formData.multiFloor}
            onChange={handleChange}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="postcode">UK Postcode <span className="required">*</span></label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            required
            placeholder="e.g., SW1A 0AA"
            className={errorMessages.postcode ? 'error' : ''}
          />
          {errorMessages.postcode && <span className="error-text">{errorMessages.postcode}</span>}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 2: Needs & Urgency</h2>
      <div className="form-group">
        <label>Why are you requesting a new quote? <span className="required">*</span></label>
        {errorMessages.reasonsForQuote && <span className="error-text">{errorMessages.reasonsForQuote}</span>}
        <fieldset className="checkbox-group">
          <legend className="sr-only">Reasons for quote</legend>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="High printing costs" onChange={handleChange} checked={formData.reasonsForQuote.includes('High printing costs')} />
            High printing costs
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Frequent equipment breakdowns" onChange={handleChange} checked={formData.reasonsForQuote.includes('Frequent equipment breakdowns')} />
            Frequent equipment breakdowns
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Poor print quality" onChange={handleChange} checked={formData.reasonsForQuote.includes('Poor print quality')} />
            Poor print quality
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Slow printing speeds" onChange={handleChange} checked={formData.reasonsForQuote.includes('Slow printing speeds')} />
            Slow printing speeds
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Limited functionality" onChange={handleChange} checked={formData.reasonsForQuote.includes('Limited functionality')} />
            Limited functionality
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Complex user interface" onChange={handleChange} checked={formData.reasonsForQuote.includes('Complex user interface')} />
            Complex user interface
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Poor vendor support" onChange={handleChange} checked={formData.reasonsForQuote.includes('Poor vendor support')} />
            Poor vendor support
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Supply chain issues" onChange={handleChange} checked={formData.reasonsForQuote.includes('Supply chain issues')} />
            Supply chain issues
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Security concerns" onChange={handleChange} checked={formData.reasonsForQuote.includes('Security concerns')} />
            Security concerns
          </label>
          <label>
            <input type="checkbox" name="reasonsForQuote" value="Integration problems" onChange={handleChange} checked={formData.reasonsForQuote.includes('Integration problems')} />
            Integration problems
          </label>
        </fieldset>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="urgencyLevel">Urgency Level <span className="required">*</span></label>
          <select
            id="urgencyLevel"
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            required
            className={errorMessages.urgencyLevel ? 'error' : ''}
          >
            <option value="">Select urgency</option>
            <option value="Immediate">Immediate (less than 1 month)</option>
            <option value="Short-term">Short-term (1-3 months)</option>
            <option value="Mid-term">Mid-term (3-6 months)</option>
            <option value="Long-term">Long-term (6+ months)</option>
          </select>
          {errorMessages.urgencyLevel && <span className="error-text">{errorMessages.urgencyLevel}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="implementationTimeline">Implementation Timeline <span className="required">*</span></label>
          <select
            id="implementationTimeline"
            name="implementationTimeline"
            value={formData.implementationTimeline}
            onChange={handleChange}
            required
            className={errorMessages.implementationTimeline ? 'error' : ''}
          >
            <option value="">Select timeline</option>
            <option value="ASAP">ASAP</option>
            <option value="1-2 months">1-2 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="12+ months">12+ months</option>
          </select>
          {errorMessages.implementationTimeline && <span className="error-text">{errorMessages.implementationTimeline}</span>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="impactOnProductivity">How do these issues impact your team's productivity?</label>
        <textarea
          id="impactOnProductivity"
          name="impactOnProductivity"
          value={formData.impactOnProductivity}
          onChange={handleChange}
          rows="4"
          placeholder="Describe the impact, e.g., 'Delayed report generation', 'Frustration with constant paper jams'."
        />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 3: Usage & Volume</h2>
      <p>Please estimate your average monthly print volume.</p>
      {errorMessages.monthlyVolume && <span className="error-text">{errorMessages.monthlyVolume}</span>}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="monthlyVolume.mono">Mono (Black & White) <span className="required">*</span></label>
          <input
            type="number"
            id="monthlyVolume.mono"
            name="monthlyVolume.mono"
            value={formData.monthlyVolume.mono}
            onChange={handleChange}
            required
            min="0"
            placeholder="Enter mono volume"
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
        </div>
        <div className="form-group">
          <label htmlFor="monthlyVolume.colour">Colour <span className="required">*</span></label>
          <input
            type="number"
            id="monthlyVolume.colour"
            name="monthlyVolume.colour"
            value={formData.monthlyVolume.colour}
            onChange={handleChange}
            required
            min="0"
            placeholder="Enter colour volume"
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="peakUsagePeriods">Peak Usage Periods</label>
        <textarea
          id="peakUsagePeriods"
          name="peakUsagePeriods"
          value={formData.peakUsagePeriods}
          onChange={handleChange}
          rows="2"
          placeholder="e.g., 'End of month', 'Tax season', 'Mondays'."
        />
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 4: Technical & Security</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="networkSetup">Network Setup <span className="required">*</span></label>
          <select
            id="networkSetup"
            name="networkSetup"
            value={formData.networkSetup}
            onChange={handleChange}
            required
            className={errorMessages.networkSetup ? 'error' : ''}
          >
            <option value="">Select network setup</option>
            <option value="Wired LAN">Wired LAN</option>
            <option value="Wireless (Wi-Fi)">Wireless (Wi-Fi)</option>
            <option value="Hybrid">Hybrid (Wired/Wireless)</option>
            <option value="Stand-alone">Stand-alone (USB)</option>
          </select>
          {errorMessages.networkSetup && <span className="error-text">{errorMessages.networkSetup}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="itSupportStructure">IT Support Structure <span className="required">*</span></label>
          <select
            id="itSupportStructure"
            name="itSupportStructure"
            value={formData.itSupportStructure}
            onChange={handleChange}
            required
            className={errorMessages.itSupportStructure ? 'error' : ''}
          >
            <option value="">Select IT support</option>
            <option value="In-house IT Team">In-house IT Team</option>
            <option value="Managed IT Service Provider (MSP)">Managed IT Service Provider (MSP)</option>
            <option value="External Support on demand">External Support on demand</option>
            <option value="No Formal IT Support">No Formal IT Support</option>
          </select>
          {errorMessages.itSupportStructure && <span className="error-text">{errorMessages.itSupportStructure}</span>}
        </div>
      </div>
      <div className="form-group">
        <label>Security Requirements</label>
        <fieldset className="checkbox-group">
          <legend className="sr-only">Security Requirements</legend>
          <label>
            <input type="checkbox" name="securityRequirements" value="User Authentication" onChange={handleChange} checked={formData.securityRequirements.includes('User Authentication')} />
            User Authentication (PIN/Card/Biometric)
          </label>
          <label>
            <input type="checkbox" name="securityRequirements" value="Hard Drive Encryption" onChange={handleChange} checked={formData.securityRequirements.includes('Hard Drive Encryption')} />
            Hard Drive Encryption
          </label>
          <label>
            <input type="checkbox" name="securityRequirements" value="Data Overwrite" onChange={handleChange} checked={formData.securityRequirements.includes('Data Overwrite')} />
            Secure Data Overwrite
          </label>
          <label>
            <input type="checkbox" name="securityRequirements" value="IP Filtering" onChange={handleChange} checked={formData.securityRequirements.includes('IP Filtering')} />
            IP Filtering
          </label>
        </fieldset>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 5: Current Equipment</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="currentEquipmentAge">Current Equipment Age <span className="required">*</span></label>
          <select
            id="currentEquipmentAge"
            name="currentEquipmentAge"
            value={formData.currentEquipmentAge}
            onChange={handleChange}
            required
            className={errorMessages.currentEquipmentAge ? 'error' : ''}
          >
            <option value="">Select age</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5-6 years">5-6 years</option>
            <option value="Over 6 years">Over 6 years</option>
            <option value="Mixed ages">Mixed ages</option>
            <option value="No current equipment">No current equipment</option>
          </select>
          {errorMessages.currentEquipmentAge && <span className="error-text">{errorMessages.currentEquipmentAge}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.currentSupplier">Current Supplier</label>
          <input
            type="text"
            id="currentSetup.currentSupplier"
            name="currentSetup.currentSupplier"
            value={formData.currentSetup.currentSupplier}
            onChange={handleChange}
            placeholder="e.g., Canon, Ricoh, Xerox"
          />
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.currentModel">Current Model</label>
          <input
            type="text"
            id="currentSetup.currentModel"
            name="currentSetup.currentModel"
            value={formData.currentSetup.currentModel}
            onChange={handleChange}
            placeholder="e.g., C3500i"
          />
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.currentSpeed">Current Speed (PPM)</label>
          <input
            type="number"
            id="currentSetup.currentSpeed"
            name="currentSetup.currentSpeed"
            value={formData.currentSetup.currentSpeed}
            onChange={handleChange}
            placeholder="e.g., 30"
          />
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.contractEndDate">Current Contract End Date</label>
          <input
            type="date"
            id="currentSetup.contractEndDate"
            name="currentSetup.contractEndDate"
            value={formData.currentSetup.contractEndDate}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Buyout Required?</label>
        <fieldset className="checkbox-group">
          <label>
            <input
              type="radio"
              name="currentSetup.buyoutRequired"
              value="true"
              checked={formData.currentSetup.buyoutRequired === true}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSetup: { ...prev.currentSetup, buyoutRequired: e.target.value === 'true' } }))}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="currentSetup.buyoutRequired"
              value="false"
              checked={formData.currentSetup.buyoutRequired === false}
              onChange={(e) => setFormData(prev => ({ ...prev, currentSetup: { ...prev.currentSetup, buyoutRequired: e.target.value === 'true' } }))}
            />
            No
          </label>
        </fieldset>
      </div>
      {formData.currentSetup.buyoutRequired && (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="currentSetup.quarterlyLeaseCost">Quarterly Lease Cost</label>
            <input
              type="number"
              id="currentSetup.quarterlyLeaseCost"
              name="currentSetup.quarterlyLeaseCost"
              value={formData.currentSetup.quarterlyLeaseCost}
              onChange={handleChange}
              placeholder="e.g., 500"
            />
          </div>
          <div className="buyout-info">
            <h4>Estimated Buyout Cost</h4>
            <p>£{calculateBuyout()}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
