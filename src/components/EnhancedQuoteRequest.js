// Unified Enhanced Quote Request Form with Complete Backend Mapping
// This single file replaces all duplicate versions
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './EnhancedQuoteRequest.css';

// Hard-coded production URL
const PRODUCTION_API_URL = 'https://ai-procurement-backend-q35u.onrender.com';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="loading-spinner"></div>
  </div>
);

const EnhancedQuoteRequest = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [errorMessages, setErrorMessages] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestedMachines, setSuggestedMachines] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Comprehensive form data structure that maps to backend QuoteRequest model
  const [formData, setFormData] = useState({
    // === STEP 1: Company Information ===
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industryType: '', // Healthcare, Legal, Education, Finance, etc.
    subSector: '', // More specific industry detail
    numEmployees: '', // 1-10, 11-25, 26-50, etc.
    numLocations: 1,
    multiFloor: 'No',
    postcode: '',
    
    // Additional company details for better AI matching
    annualRevenue: '',
    officeBasedEmployees: '',
    primaryBusinessActivity: '',
    
    // === STEP 2: Volume & Usage ===
    monthlyVolume: {
      mono: '',
      colour: '',
      total: 0 // Auto-calculated
    },
    
    // Peak usage patterns (helps AI recommend appropriate capacity)
    peakUsagePeriods: '',
    documentTypes: [], // Contracts, Marketing, Reports, etc.
    averagePageCount: '',
    
    // === STEP 3: Paper & Finishing Requirements ===
    paperRequirements: {
      primarySize: 'A4', // A4, A3, SRA3
      additionalSizes: [],
      specialPaper: false,
      specialPaperTypes: [] // Cardstock, Labels, Envelopes, etc.
    },
    finishingRequirements: [], // Stapling, Hole punch, Booklet, etc.
    
    // === STEP 4: Current Setup & Pain Points ===
    currentSetup: {
      machineAge: '', // 0-2 years, 2-5 years, 5+ years, No current machine
      currentSupplier: '',
      currentModel: '',
      currentSpeed: '',
      contractStartDate: '',
      contractEndDate: '',
      currentMonoCPC: '', // Cost per copy in pence
      currentColorCPC: '',
      quarterlyLeaseCost: '',
      quarterlyService: '',
      currentFeatures: [],
      buyoutRequired: false,
      buyoutCost: '',
      includeBuyoutInCosts: false
    },
    
    // Current pain points and reasons for change
    reasonsForQuote: [], // High costs, Breakdowns, Poor quality, etc.
    currentPainPoints: '',
    impactOnProductivity: '',
    maintenanceIssues: '',
    
    // === STEP 5: Technical Requirements ===
    serviceType: 'Photocopiers', // Photocopiers, Printers, Multifunction
    colour: '', // Full Colour, Black & White
    type: '', // Paper size (A4, A3, etc.) - maps to paperRequirements.primarySize
    min_speed: '', // Minimum PPM required
    
    // Feature requirements
    required_functions: [], // Essential features
    niceToHaveFeatures: [], // Optional features
    
    // Security & compliance
    securityRequirements: [], // User auth, encryption, etc.
    securityFeatures: [], // Additional security needs
    
    // Network & integration
    networkSetup: '',
    itSupportStructure: '',
    currentSoftwareEnvironment: '',
    cloudPreference: '',
    integrationNeeds: [],
    mobileRequirements: 'No',
    
    // === STEP 6: Service & Support ===
    responseTimeExpectation: '',
    maintenancePreference: '',
    trainingNeeds: '',
    supplyManagement: '',
    reportingNeeds: [],
    additionalServices: [],
    
    // === STEP 7: Budget & Commercial ===
    budget: {
      maxLeasePrice: '', // Maximum quarterly lease price
      preferredTerm: '60 months',
      includeService: true,
      includeConsumables: true
    },
    
    // Decision making
    preference: '', // cost, quality, speed, reliability, balanced
    decisionMakers: [],
    evaluationCriteria: [],
    contractLengthPreference: '',
    pricingModelPreference: '',
    max_lease_price: '', // Monthly max (different from quarterly)
    
    // === STEP 8: Future Planning ===
    expectedGrowth: '',
    expansionPlans: '',
    technologyRoadmap: '',
    digitalTransformation: '',
    threeYearVision: '',
    remoteWorkImpact: '',
    
    // === STEP 9: Urgency & Timeline ===
    urgency: {
      timeframe: '', // Immediately, 1-3 months, etc.
      reason: ''
    },
    urgencyLevel: '',
    implementationTimeline: '',
    budgetCycle: '',
    
    // Additional flags and options
    paysForScanning: 'No',
    accessibilityNeeds: 'No',
    sustainabilityGoals: '',
    vendorRelationshipType: '',
    roiExpectations: '',
    
    // Hidden/calculated fields
    totalAnnualCosts: '',
    hiddenCosts: '',
    serviceProvider: ''
  });
  // Helper functions for calculations and suggestions
  const calculateVolumeRange = (mono, colour) => {
    const total = (parseInt(mono) || 0) + (parseInt(colour) || 0);
    if (total <= 6000) return '0-6k';
    if (total <= 13000) return '6k-13k';
    if (total <= 20000) return '13k-20k';
    if (total <= 30000) return '20k-30k';
    if (total <= 40000) return '30k-40k';
    if (total <= 50000) return '40k-50k';
    return '50k+';
  };

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

  // UK postcode validation
  const validatePostcode = (postcode) => {
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode);
  };

  // Auto-update calculated fields
  useEffect(() => {
    const mono = parseInt(formData.monthlyVolume.mono) || 0;
    const colour = parseInt(formData.monthlyVolume.colour) || 0;
    const total = mono + colour;
    
    setFormData(prev => ({
      ...prev,
      monthlyVolume: {
        ...prev.monthlyVolume,
        total: total
      }
    }));
    
    // Auto-suggest minimum speed if not set
    if (total > 0 && !formData.min_speed) {
      setFormData(prev => ({
        ...prev,
        min_speed: suggestMinSpeed(total).toString()
      }));
    }
  }, [formData.monthlyVolume.mono, formData.monthlyVolume.colour]);

  // Calculate buyout cost
  const calculateBuyout = () => {
    const { quarterlyLeaseCost, contractEndDate } = formData.currentSetup;
    if (!quarterlyLeaseCost || !contractEndDate) return 'N/A';
    
    const end = new Date(contractEndDate);
    const today = new Date();
    if (today > end) return 'Contract Ended';
    
    const monthsRemaining = (end - today) / (1000 * 60 * 60 * 24 * 30.44);
    const quarterlyCost = parseFloat(quarterlyLeaseCost) || 0;
    const buyout = (quarterlyCost / 3) * monthsRemaining;
    
    return buyout.toFixed(2);
  };

  // Update buyout cost when contract details change
  useEffect(() => {
    if (formData.currentSetup.buyoutRequired) {
      const buyoutCost = calculateBuyout();
      if (buyoutCost !== 'N/A' && buyoutCost !== 'Contract Ended') {
        setFormData(prev => ({
          ...prev,
          currentSetup: {
            ...prev.currentSetup,
            buyoutCost: parseFloat(buyoutCost)
          }
        }));
      }
    }
  }, [formData.currentSetup.quarterlyLeaseCost, formData.currentSetup.contractEndDate, formData.currentSetup.buyoutRequired]);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return updated;
      });
    } else if (type === 'checkbox' && name !== 'multiFloor' && name !== 'paysForScanning' && name !== 'accessibilityNeeds' && name !== 'mobileRequirements') {
      // Handle array checkboxes
      const currentArray = formData[name] || [];
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : value
      }));
    }
    
    // Clear error for this field
    setErrorMessages(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  // Handle array input changes
  const handleArrayChange = (arrayName, value, checked) => {
    setFormData(prev => {
      const currentArray = prev[arrayName] || [];
      return {
        ...prev,
        [arrayName]: checked
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

  // File upload setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        setErrorMessages(prev => ({
          ...prev,
          fileUpload: 'Some files were rejected. Max 5 files, 5MB each.'
        }));
        return;
      }
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const removeFile = (file) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== file.name));
  };
  // Validation for each step
  const validateStep = (currentStep) => {
    const errors = {};
    
    switch (currentStep) {
      case 1: // Company Information
        if (!formData.companyName) errors.companyName = 'Company name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.industryType) errors.industryType = 'Industry type is required';
        if (!formData.numEmployees) errors.numEmployees = 'Number of employees is required';
        if (!formData.postcode) errors.postcode = 'Postcode is required';
        else if (!validatePostcode(formData.postcode)) errors.postcode = 'Invalid UK postcode format';
        break;
        
      case 2: // Volume & Usage
        if (!formData.monthlyVolume.mono && !formData.monthlyVolume.colour) {
          errors.monthlyVolume = 'Please enter at least one volume type';
        }
        break;
        
      case 3: // Paper & Finishing
        if (!formData.paperRequirements.primarySize) {
          errors.paperRequirements = 'Primary paper size is required';
        }
        break;
        
      case 4: // Current Setup
        if (!formData.currentSetup.machineAge) {
          errors.currentSetup = 'Please select current equipment age';
        }
        if (formData.reasonsForQuote.length === 0) {
          errors.reasonsForQuote = 'Please select at least one reason for requesting a quote';
        }
        break;
        
      case 5: // Technical Requirements
        if (!formData.serviceType) errors.serviceType = 'Service type is required';
        if (!formData.colour) errors.colour = 'Colour preference is required';
        if (!formData.min_speed) errors.min_speed = 'Minimum speed is required';
        break;
        
      case 6: // Service & Support
        if (!formData.responseTimeExpectation) {
          errors.responseTimeExpectation = 'Response time expectation is required';
        }
        if (!formData.maintenancePreference) {
          errors.maintenancePreference = 'Maintenance preference is required';
        }
        break;
        
      case 7: // Budget & Commercial
        if (!formData.budget.maxLeasePrice) {
          errors.budget = 'Maximum quarterly lease price is required';
        }
        if (!formData.preference) {
          errors.preference = 'Please select your priority';
        }
        if (formData.decisionMakers.length === 0) {
          errors.decisionMakers = 'Please select at least one decision maker';
        }
        break;
        
      case 8: // Future Planning
        if (!formData.expectedGrowth) {
          errors.expectedGrowth = 'Expected growth is required';
        }
        if (!formData.threeYearVision) {
          errors.threeYearVision = 'Three-year vision is required';
        }
        break;
        
      case 9: // Urgency & Submit
        if (!formData.urgencyLevel) {
          errors.urgencyLevel = 'Urgency level is required';
        }
        if (!formData.implementationTimeline) {
          errors.implementationTimeline = 'Implementation timeline is required';
        }
        break;
    }
    
    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setErrorMessages({});
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  // Form submission with proper backend mapping
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
    
    if (!token || !userId) {
      alert('Authentication failed. Please log in again.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare submission data with proper backend field mapping
      const submissionData = {
        // Company Information
        companyName: formData.companyName,
        contactName: formData.contactName || auth?.user?.name || '',
        email: formData.email || auth?.user?.email || '',
        phone: formData.phone,
        industryType: formData.industryType,
        numEmployees: formData.numEmployees,
        numLocations: parseInt(formData.numLocations) || 1,
        
        // Volume (backend expects this structure)
        monthlyVolume: {
          mono: parseInt(formData.monthlyVolume.mono) || 0,
          colour: parseInt(formData.monthlyVolume.colour) || 0,
          total: formData.monthlyVolume.total
        },
        
        // Paper Requirements (backend schema)
        paperRequirements: {
          primarySize: formData.paperRequirements.primarySize || formData.type || 'A4',
          additionalSizes: formData.paperRequirements.additionalSizes || [],
          specialPaper: formData.paperRequirements.specialPaper || false,
          specialPaperTypes: formData.paperRequirements.specialPaperTypes || []
        },
        
        // Current Setup (backend schema)
        currentSetup: {
          machineAge: formData.currentSetup.machineAge,
          currentSupplier: formData.currentSetup.currentSupplier,
          currentModel: formData.currentSetup.currentModel,
          currentSpeed: parseInt(formData.currentSetup.currentSpeed) || 0,
          contractStartDate: formData.currentSetup.contractStartDate,
          contractEndDate: formData.currentSetup.contractEndDate,
          currentMonoCPC: parseFloat(formData.currentSetup.currentMonoCPC) || 0,
          currentColorCPC: parseFloat(formData.currentSetup.currentColorCPC) || 0,
          quarterlyLeaseCost: parseFloat(formData.currentSetup.quarterlyLeaseCost) || 0,
          quarterlyService: parseFloat(formData.currentSetup.quarterlyService) || 0,
          currentFeatures: formData.currentSetup.currentFeatures || [],
          buyoutRequired: formData.currentSetup.buyoutRequired,
          buyoutCost: formData.currentSetup.buyoutCost,
          painPoints: formData.reasonsForQuote || []
        },
        // Requirements (backend schema)
        requirements: {
          priority: formData.preference || 'balanced',
          essentialFeatures: formData.required_functions || [],
          niceToHaveFeatures: formData.niceToHaveFeatures || [],
          minSpeed: parseInt(formData.min_speed) || 0,
          serviceLevel: formData.maintenancePreference,
          responseTime: formData.responseTimeExpectation
        },
        
        // Budget (backend schema)
        budget: {
          maxLeasePrice: parseFloat(formData.budget.maxLeasePrice) || 0,
          preferredTerm: formData.contractLengthPreference || formData.budget.preferredTerm || '60 months',
          includeService: true,
          includeConsumables: true
        },
        
        // Urgency (backend schema)
        urgency: {
          timeframe: formData.implementationTimeline || formData.urgency.timeframe,
          reason: formData.currentPainPoints || formData.urgency.reason
        },
        
        // Location
        location: {
          postcode: formData.postcode || ''
        },
        
        // Additional fields the backend accepts
        serviceType: formData.serviceType || 'Photocopiers',
        submittedBy: userId,
        userId: userId,
        submissionSource: 'web_form',
        
        // Include all other fields that backend might use
        subSector: formData.subSector,
        annualRevenue: formData.annualRevenue,
        officeBasedEmployees: parseInt(formData.officeBasedEmployees) || 0,
        primaryBusinessActivity: formData.primaryBusinessActivity,
        multiFloor: formData.multiFloor === 'Yes',
        currentPainPoints: formData.currentPainPoints,
        impactOnProductivity: formData.impactOnProductivity,
        urgencyLevel: formData.urgencyLevel,
        budgetCycle: formData.budgetCycle,
        peakUsagePeriods: formData.peakUsagePeriods,
        documentTypes: formData.documentTypes,
        averagePageCount: formData.averagePageCount,
        finishingRequirements: formData.finishingRequirements,
        departmentBreakdown: formData.departmentBreakdown,
        securityRequirements: formData.securityRequirements,
        currentSoftwareEnvironment: formData.currentSoftwareEnvironment,
        cloudPreference: formData.cloudPreference,
        integrationNeeds: formData.integrationNeeds,
        mobileRequirements: formData.mobileRequirements === 'Yes',
        remoteWorkImpact: formData.remoteWorkImpact,
        totalAnnualCosts: parseFloat(formData.totalAnnualCosts) || 0,
        hiddenCosts: formData.hiddenCosts,
        serviceProvider: formData.serviceProvider,
        maintenanceIssues: formData.maintenanceIssues,
        additionalServices: formData.additionalServices,
        paysForScanning: formData.paysForScanning === 'Yes',
        colour: formData.colour,
        type: formData.paperRequirements.primarySize || formData.type || 'A4',
        min_speed: parseInt(formData.min_speed) || 0,
        securityFeatures: formData.securityFeatures,
        accessibilityNeeds: formData.accessibilityNeeds === 'Yes',
        sustainabilityGoals: formData.sustainabilityGoals,
        responseTimeExpectation: formData.responseTimeExpectation,
        maintenancePreference: formData.maintenancePreference,
        trainingNeeds: formData.trainingNeeds,
        supplyManagement: formData.supplyManagement,
        reportingNeeds: formData.reportingNeeds,
        vendorRelationshipType: formData.vendorRelationshipType,
        decisionMakers: formData.decisionMakers,
        evaluationCriteria: formData.evaluationCriteria,
        contractLengthPreference: formData.contractLengthPreference,
        pricingModelPreference: formData.pricingModelPreference,
        required_functions: formData.required_functions,
        preference: formData.preference,
        max_lease_price: parseFloat(formData.max_lease_price) || parseFloat(formData.budget.maxLeasePrice) || 0,
        roiExpectations: formData.roiExpectations,
        expectedGrowth: formData.expectedGrowth,
        expansionPlans: formData.expansionPlans,
        technologyRoadmap: formData.technologyRoadmap,
        digitalTransformation: formData.digitalTransformation,
        threeYearVision: formData.threeYearVision,
        reasonsForQuote: formData.reasonsForQuote
      };
      console.log('📤 Submitting quote request:', submissionData);
      
      let response;
      
      if (uploadedFiles.length > 0) {
        // Submit with files
        const formDataObj = new FormData();
        formDataObj.append('quoteRequest', JSON.stringify(submissionData));
        uploadedFiles.forEach((file, index) => {
          formDataObj.append(`documents[${index}]`, file);
        });
        
        response = await fetch(`${PRODUCTION_API_URL}/api/quotes/request`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataObj
        });
      } else {
        // Submit JSON only
        response = await fetch(`${PRODUCTION_API_URL}/api/quotes/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.message || 'Failed to submit quote request');
      }
      
      const result = await response.json();
      console.log('✅ Quote request submitted:', result);
      
      setSubmissionStatus('success');
      setSuccessMessage('Quote request submitted successfully! Redirecting to vendor comparison...');
      
      // Navigate to compare vendors page after short delay
      setTimeout(() => {
        if (result.aiMatching?.quotesCreated > 0 || result.quotes?.length > 0) {
          navigate('/compare-vendors', { 
            state: { 
              quoteRequestId: result.quoteRequest?.id || result._id,
              companyName: formData.companyName 
            }
          });
        } else {
          navigate('/quotes');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      setSubmissionStatus('error');
      setErrorMessages({ 
        general: error.message || 'Failed to submit quote request. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Render functions for each step
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
          <label htmlFor="contactName">Contact Name</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className={errorMessages.email ? 'error' : ''}
          />
          {errorMessages.email && <span className="error-text">{errorMessages.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="07XXX XXXXXX"
          />
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
            <option value="Healthcare">Healthcare</option>
            <option value="Legal">Legal</option>
            <option value="Education">Education</option>
            <option value="Finance">Finance</option>
            <option value="Government">Government</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Technology">Technology</option>
            <option value="Construction">Construction</option>
            <option value="Other">Other</option>
          </select>
          {errorMessages.industryType && <span className="error-text">{errorMessages.industryType}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="subSector">Sub-Sector (Optional)</label>
          <input
            type="text"
            id="subSector"
            name="subSector"
            value={formData.subSector}
            onChange={handleChange}
            placeholder="e.g., Private Hospital, Law Firm"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="numEmployees">Number of Employees <span className="required">*</span></label>
          <select
            id="numEmployees"
            name="numEmployees"
            value={formData.numEmployees}
            onChange={handleChange}
            required
            className={errorMessages.numEmployees ? 'error' : ''}
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
          {errorMessages.numEmployees && <span className="error-text">{errorMessages.numEmployees}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="officeBasedEmployees">Office-Based Employees</label>
          <input
            type="number"
            id="officeBasedEmployees"
            name="officeBasedEmployees"
            value={formData.officeBasedEmployees}
            onChange={handleChange}
            min="0"
            placeholder="Number working in office"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="numLocations">Number of Locations <span className="required">*</span></label>
          <input
            type="number"
            id="numLocations"
            name="numLocations"
            value={formData.numLocations}
            onChange={handleChange}
            required
            min="1"
            placeholder="1"
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
          <label htmlFor="annualRevenue">Annual Revenue</label>
          <input
            type="text"
            id="annualRevenue"
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleChange}
            placeholder="e.g., £1-5M"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="multiFloor">Multiple Floors?</label>
          <select
            id="multiFloor"
            name="multiFloor"
            value={formData.multiFloor}
            onChange={handleChange}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
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
      <h2>Step 2: Volume & Usage Patterns</h2>
      
      <div className="info-box">
        <p>📊 Accurate volume helps us match the right capacity machine - avoiding both under and over-specification.</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="monthlyVolume.mono">Monthly Mono (B&W) Pages <span className="required">*</span></label>
          <input
            type="number"
            id="monthlyVolume.mono"
            name="monthlyVolume.mono"
            value={formData.monthlyVolume.mono}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 5000"
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="monthlyVolume.colour">Monthly Colour Pages <span className="required">*</span></label>
          <input
            type="number"
            id="monthlyVolume.colour"
            name="monthlyVolume.colour"
            value={formData.monthlyVolume.colour}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 2000"
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
        </div>
        
        <div className="form-group full-width">
          <div className="volume-summary">
            <h3>Volume Analysis</h3>
            <p>Total Monthly: <strong>{formData.monthlyVolume.total.toLocaleString()} pages</strong></p>
            <p>Volume Range: <strong>{calculateVolumeRange(formData.monthlyVolume.mono, formData.monthlyVolume.colour)}</strong></p>
            <p>Recommended Min Speed: <strong>{suggestMinSpeed(formData.monthlyVolume.total)} PPM</strong></p>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="peakUsagePeriods">Peak Usage Periods</label>
          <input
            type="text"
            id="peakUsagePeriods"
            name="peakUsagePeriods"
            value={formData.peakUsagePeriods}
            onChange={handleChange}
            placeholder="e.g., Month-end, Mornings, Tax season"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="averagePageCount">Average Document Size</label>
          <input
            type="text"
            id="averagePageCount"
            name="averagePageCount"
            value={formData.averagePageCount}
            onChange={handleChange}
            placeholder="e.g., 1-5 pages, 10-20 pages"
          />
        </div>
        
        <div className="form-group full-width">
          <label>Document Types (check all that apply)</label>
          <div className="checkbox-grid">
            {['Contracts', 'Reports', 'Marketing Materials', 'Invoices', 'Letters', 'Presentations', 'Training Materials', 'Forms'].map(type => (
              <label key={type}>
                <input
                  type="checkbox"
                  value={type}
                  checked={formData.documentTypes.includes(type)}
                  onChange={(e) => handleArrayChange('documentTypes', type, e.target.checked)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>
      {errorMessages.monthlyVolume && <span className="error-text">{errorMessages.monthlyVolume}</span>}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 3: Paper & Finishing Requirements</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Primary Paper Size <span className="required">*</span></label>
          <div className="radio-group">
            {['A4', 'A3', 'SRA3'].map(size => (
              <label key={size}>
                <input
                  type="radio"
                  name="paperRequirements.primarySize"
                  value={size}
                  checked={formData.paperRequirements.primarySize === size}
                  onChange={handleChange}
                />
                {size} {size === 'A4' && '(Standard)'} {size === 'A3' && '(Larger)'} {size === 'SRA3' && '(Oversized)'}
              </label>
            ))}
          </div>
          {errorMessages.paperRequirements && <span className="error-text">{errorMessages.paperRequirements}</span>}
        </div>
        
        <div className="form-group">
          <label>Additional Paper Sizes</label>
          <div className="checkbox-grid">
            {['A4', 'A3', 'A5', 'Letter', 'Legal', 'SRA3'].map(size => (
              <label key={size}>
                <input
                  type="checkbox"
                  value={size}
                  checked={formData.paperRequirements.additionalSizes.includes(size)}
                  onChange={(e) => {
                    const updated = e.target.checked 
                      ? [...formData.paperRequirements.additionalSizes, size]
                      : formData.paperRequirements.additionalSizes.filter(s => s !== size);
                    setFormData(prev => ({
                      ...prev,
                      paperRequirements: {
                        ...prev.paperRequirements,
                        additionalSizes: updated
                      }
                    }));
                  }}
                />
                {size}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Special Media Types</label>
          <div className="checkbox-grid">
            {['Cardstock', 'Labels', 'Envelopes', 'Transparencies', 'Glossy Paper', 'Heavy Paper (200gsm+)'].map(type => (
              <label key={type}>
                <input
                  type="checkbox"
                  value={type}
                  checked={formData.paperRequirements.specialPaperTypes.includes(type)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...formData.paperRequirements.specialPaperTypes, type]
                      : formData.paperRequirements.specialPaperTypes.filter(t => t !== type);
                    setFormData(prev => ({
                      ...prev,
                      paperRequirements: {
                        ...prev.paperRequirements,
                        specialPaperTypes: updated,
                        specialPaper: updated.length > 0
                      }
                    }));
                  }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Finishing Requirements</label>
          <div className="checkbox-grid">
            {['Stapling', 'Hole Punch', 'Booklet Making', 'Folding', 'Trimming', 'Saddle Stitch', 'Perfect Binding'].map(feature => (
              <label key={feature}>
                <input
                  type="checkbox"
                  value={feature}
                  checked={formData.finishingRequirements.includes(feature)}
                  onChange={(e) => handleArrayChange('finishingRequirements', feature, e.target.checked)}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
// Part 12 - Render Steps 6 and 7
  
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
          <p className="suggestion-intro">Based on your requirements, we recommend:</p>
          <ul className="suggestions-list">
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
            <option value="">Select colour option</option>
            <option value="Colour Only">Colour Only</option>
            <option value="Black & White Only">Black & White Only</option>
            <option value="Both">Both (Colour & B&W)</option>
          </select>
          {errorMessages.colour && <span className="error-text">{errorMessages.colour}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="speed">Minimum Speed (PPM) <span className="required">*</span></label>
          <input
            type="number"
            id="speed"
            name="speed"
            value={formData.speed}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 45"
            className={errorMessages.speed ? 'error' : ''}
          />
          <p className="helper-text">Recommended: {suggestMinSpeed(formData.monthlyVolume.total)} PPM based on your volume</p>
          {errorMessages.speed && <span className="error-text">{errorMessages.speed}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity (Duty Cycle)</label>
          <select
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          >
            <option value="">Select capacity</option>
            <option value="Light (up to 10k pages/month)">Light (up to 10k pages/month)</option>
            <option value="Medium (10k-30k pages/month)">Medium (10k-30k pages/month)</option>
            <option value="Heavy (30k-100k pages/month)">Heavy (30k-100k pages/month)</option>
            <option value="Very Heavy (100k+ pages/month)">Very Heavy (100k+ pages/month)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Required Functions <span className="required">*</span></label>
          <div className="checkbox-grid">
            {['Print', 'Copy', 'Scan', 'Fax', 'Email'].map(func => (
              <label key={func}>
                <input
                  type="checkbox"
                  value={func}
                  checked={formData.requiredFunctions.includes(func)}
                  onChange={(e) => handleArrayChange('requiredFunctions', func, e.target.checked)}
                />
                {func}
              </label>
            ))}
          </div>
          {errorMessages.requiredFunctions && <span className="error-text">{errorMessages.requiredFunctions}</span>}
        </div>

        <div className="form-group full-width">
          <label>Security Features</label>
          <div className="checkbox-grid">
            {[
              'User Authentication',
              'Secure Print Release',
              'Data Encryption',
              'Secure Erase',
              'Access Control',
              'Audit Trail'
            ].map(feature => (
              <label key={feature}>
                <input
                  type="checkbox"
                  value={feature}
                  checked={formData.securityFeatures?.includes(feature)}
                  onChange={(e) => handleArrayChange('securityFeatures', feature, e.target.checked)}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Additional Features</label>
          <div className="checkbox-grid">
            {[
              'Duplex (Double-sided) Printing',
              'Large Paper Capacity',
              'Touchscreen Display',
              'Mobile Printing',
              'Cloud Integration',
              'OCR Capability',
              'Automatic Document Feeder (ADF)'
            ].map(feature => (
              <label key={feature}>
                <input
                  type="checkbox"
                  value={feature}
                  checked={formData.additionalFeatures?.includes(feature)}
                  onChange={(e) => handleArrayChange('additionalFeatures', feature, e.target.checked)}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>
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
      <h2>Step 7: Service & Support Expectations</h2>
      
      <div className="info-box">
        <p>🛠️ Service level agreements ensure your equipment stays operational and productive.</p>
      </div>

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
            <option value="">Select response time</option>
            <option value="Same day (4-8 hours)">Same day (4-8 hours)</option>
            <option value="Next business day">Next business day</option>
            <option value="Within 48 hours">Within 48 hours</option>
            <option value="3-5 business days">3-5 business days</option>
            <option value="Flexible">Flexible</option>
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
            <option value="">Select maintenance preference</option>
            <option value="Scheduled quarterly maintenance">Scheduled quarterly maintenance</option>
            <option value="Scheduled monthly maintenance">Scheduled monthly maintenance</option>
            <option value="As-needed only">As-needed only</option>
            <option value="Predictive (monitor and schedule as required)">Predictive (monitor and schedule as required)</option>
          </select>
          {errorMessages.maintenancePreference && <span className="error-text">{errorMessages.maintenancePreference}</span>}
        </div>

        <div className="form-group">
          <label>Service Coverage Hours</label>
          <div className="radio-group">
            {[
              'Business hours (9am-5pm)',
              'Extended hours (7am-7pm)',
              '24/7 Coverage',
              'Standard (9am-5pm weekdays)'
            ].map(option => (
              <label key={option}>
                <input
                  type="radio"
                  name="serviceCoverageHours"
                  value={option}
                  checked={formData.serviceCoverageHours === option}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Service Type</label>
          <div className="radio-group">
            {[
              'On-site service only',
              'Remote support preferred',
              'Combination of both',
              'No preference'
            ].map(option => (
              <label key={option}>
                <input
                  type="radio"
                  name="preferredServiceType"
                  value={option}
                  checked={formData.preferredServiceType === option}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Included Services Required</label>
          <div className="checkbox-grid">
            {[
              'Toner/Ink Included',
              'Parts & Labor',
              'Regular Maintenance',
              'Software Updates',
              'Training',
              'Installation',
              'Equipment Relocation'
            ].map(service => (
              <label key={service}>
                <input
                  type="checkbox"
                  value={service}
                  checked={formData.includedServices?.includes(service)}
                  onChange={(e) => handleArrayChange('includedServices', service, e.target.checked)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="specialServiceRequirements">Special Service Requirements</label>
          <textarea
            id="specialServiceRequirements"
            name="specialServiceRequirements"
            value={formData.specialServiceRequirements || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Any specific service requirements or SLA needs..."
          />
        </div>
      </div>
    </motion.div>
  );
// Part 13 - Render Steps 8 and 9
  
  const renderStep8 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 8: Budget & Financial Preferences</h2>
      
      <div className="info-box">
        <p>💰 Understanding your budget helps us provide the most suitable options within your financial constraints.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="budgetRange">Budget Range (Quarterly) <span className="required">*</span></label>
          <select
            id="budgetRange"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            required
            className={errorMessages.budgetRange ? 'error' : ''}
          >
            <option value="">Select budget range</option>
            <option value="Under £500">Under £500</option>
            <option value="£500 - £1,000">£500 - £1,000</option>
            <option value="£1,000 - £2,000">£1,000 - £2,000</option>
            <option value="£2,000 - £3,500">£2,000 - £3,500</option>
            <option value="£3,500 - £5,000">£3,500 - £5,000</option>
            <option value="£5,000+">£5,000+</option>
            <option value="Flexible">Flexible</option>
          </select>
          {errorMessages.budgetRange && <span className="error-text">{errorMessages.budgetRange}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="paymentPreference">Payment Preference <span className="required">*</span></label>
          <select
            id="paymentPreference"
            name="paymentPreference"
            value={formData.paymentPreference}
            onChange={handleChange}
            required
            className={errorMessages.paymentPreference ? 'error' : ''}
          >
            <option value="">Select payment preference</option>
            <option value="Lease">Lease</option>
            <option value="Rental">Rental</option>
            <option value="Purchase">Outright Purchase</option>
            <option value="Pay-per-page">Pay-per-page</option>
            <option value="Open to options">Open to options</option>
          </select>
          {errorMessages.paymentPreference && <span className="error-text">{errorMessages.paymentPreference}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="contractLength">Preferred Contract Length</label>
          <select
            id="contractLength"
            name="contractLength"
            value={formData.contractLength}
            onChange={handleChange}
          >
            <option value="">Select contract length</option>
            <option value="12 months">12 months</option>
            <option value="24 months">24 months</option>
            <option value="36 months">36 months (Standard)</option>
            <option value="48 months">48 months</option>
            <option value="60 months">60 months</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        <div className="form-group">
          <label>Cost Per Page Estimate</label>
          <div className="cost-estimate">
            <p><strong>Mono:</strong> {calculateCostPerPage('mono')} per page</p>
            <p><strong>Colour:</strong> {calculateCostPerPage('colour')} per page</p>
            <p className="info-text">Based on your monthly volume</p>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Preferred Brands</label>
          <div className="checkbox-grid">
            {[
              'Xerox',
              'Canon',
              'HP',
              'Ricoh',
              'Konica Minolta',
              'Brother',
              'Sharp',
              'Kyocera',
              'No Preference'
            ].map(brand => (
              <label key={brand}>
                <input
                  type="checkbox"
                  value={brand}
                  checked={formData.preferredBrands?.includes(brand)}
                  onChange={(e) => handleArrayChange('preferredBrands', brand, e.target.checked)}
                />
                {brand}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Environmental Preferences</label>
          <div className="checkbox-grid">
            {[
              'Energy Star Certified',
              'Low Power Consumption',
              'Eco Mode',
              'Recycling Program',
              'Carbon Neutral',
              'Refurbished Options OK'
            ].map(pref => (
              <label key={pref}>
                <input
                  type="checkbox"
                  value={pref}
                  checked={formData.environmentalPreferences?.includes(pref)}
                  onChange={(e) => handleArrayChange('environmentalPreferences', pref, e.target.checked)}
                />
                {pref}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="additionalBudgetNotes">Additional Budget Notes</label>
          <textarea
            id="additionalBudgetNotes"
            name="additionalBudgetNotes"
            value={formData.additionalBudgetNotes || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Any budget constraints or financial considerations we should know about..."
          />
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
      <h2>Step 9: Decision Makers & Contact Information</h2>
      
      <div className="info-box">
        <p>👥 Help us understand your decision-making process so we can provide the right information to the right people.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="primaryContactName">Primary Contact Name <span className="required">*</span></label>
          <input
            type="text"
            id="primaryContactName"
            name="primaryContactName"
            value={formData.primaryContactName}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className={errorMessages.primaryContactName ? 'error' : ''}
          />
          {errorMessages.primaryContactName && <span className="error-text">{errorMessages.primaryContactName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="primaryContactEmail">Primary Contact Email <span className="required">*</span></label>
          <input
            type="email"
            id="primaryContactEmail"
            name="primaryContactEmail"
            value={formData.primaryContactEmail}
            onChange={handleChange}
            placeholder="your.email@company.com"
            required
            className={errorMessages.primaryContactEmail ? 'error' : ''}
          />
          {errorMessages.primaryContactEmail && <span className="error-text">{errorMessages.primaryContactEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="primaryContactPhone">Primary Contact Phone <span className="required">*</span></label>
          <input
            type="tel"
            id="primaryContactPhone"
            name="primaryContactPhone"
            value={formData.primaryContactPhone}
            onChange={handleChange}
            placeholder="020 1234 5678"
            required
            className={errorMessages.primaryContactPhone ? 'error' : ''}
          />
          {errorMessages.primaryContactPhone && <span className="error-text">{errorMessages.primaryContactPhone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle">Your Job Title</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle || ''}
            onChange={handleChange}
            placeholder="e.g., Office Manager, IT Director"
          />
        </div>

        <div className="form-group full-width">
          <label>Who else will be involved in the decision?</label>
          <div className="checkbox-grid">
            {[
              'Finance Director',
              'IT Manager',
              'Operations Manager',
              'Managing Director',
              'Procurement Team',
              'Department Heads',
              'Other Stakeholders'
            ].map(role => (
              <label key={role}>
                <input
                  type="checkbox"
                  value={role}
                  checked={formData.decisionMakers?.includes(role)}
                  onChange={(e) => handleArrayChange('decisionMakers', role, e.target.checked)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="decisionTimeframe">Expected Decision Timeframe</label>
          <select
            id="decisionTimeframe"
            name="decisionTimeframe"
            value={formData.decisionTimeframe || ''}
            onChange={handleChange}
          >
            <option value="">Select timeframe</option>
            <option value="Within 1 week">Within 1 week</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3+ months">3+ months</option>
            <option value="Just exploring options">Just exploring options</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>What factors are most important in your decision?</label>
          <div className="checkbox-grid">
            {[
              'Price/Cost',
              'Quality/Reliability',
              'Service & Support',
              'Speed & Performance',
              'Brand Reputation',
              'Environmental Impact',
              'Features & Functionality',
              'Contract Flexibility'
            ].map(factor => (
              <label key={factor}>
                <input
                  type="checkbox"
                  value={factor}
                  checked={formData.evaluationCriteria?.includes(factor)}
                  onChange={(e) => handleArrayChange('evaluationCriteria', factor, e.target.checked)}
                />
                {factor}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
          <div className="radio-group">
            {['Email', 'Phone', 'Either'].map(method => (
              <label key={method}>
                <input
                  type="radio"
                  name="preferredContactMethod"
                  value={method}
                  checked={formData.preferredContactMethod === method}
                  onChange={handleChange}
                />
                {method}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bestTimeToContact">Best Time to Contact</label>
          <select
            id="bestTimeToContact"
            name="bestTimeToContact"
            value={formData.bestTimeToContact || ''}
            onChange={handleChange}
          >
            <option value="">Select best time</option>
            <option value="Morning (9am-12pm)">Morning (9am-12pm)</option>
            <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
            <option value="Anytime">Anytime</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="additionalComments">Additional Comments or Questions</label>
          <textarea
            id="additionalComments"
            name="additionalComments"
            value={formData.additionalComments || ''}
            onChange={handleChange}
            rows="4"
            placeholder="Any other information you'd like to share or questions you have..."
          />
        </div>
      </div>
    </motion.div>
  );
// Part 14 - Main Render Function and Navigation
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      case 9:
        return renderStep9();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="enhanced-quote-request">
      <div className="form-container">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            Step {step} of 9
          </div>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators">
          {[
            { num: 1, label: 'Company Info' },
            { num: 2, label: 'Volume & Usage' },
            { num: 3, label: 'Paper & Finishing' },
            { num: 4, label: 'IT & Network' },
            { num: 5, label: 'Current Setup' },
            { num: 6, label: 'Requirements' },
            { num: 7, label: 'Service & Support' },
            { num: 8, label: 'Budget' },
            { num: 9, label: 'Contact Info' }
          ].map((s) => (
            <div 
              key={s.num}
              className={`step-indicator ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
            >
              <div className="step-number">{s.num}</div>
              <div className="step-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {step > 1 && (
            <button 
              type="button" 
              onClick={handlePrevious}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
          )}
          
          {step < 9 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next →
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit}
              className="btn btn-success"
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

        {/* Overall Error Message */}
        {Object.keys(errorMessages).length > 0 && (
          <div className="error-summary">
            <p>⚠️ Please fix the following errors:</p>
            <ul>
              {Object.entries(errorMessages).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h3>Processing Your Request</h3>
            <p>Our AI is analyzing your requirements and matching you with the best vendors...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuoteRequest;
