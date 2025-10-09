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
    industryType: '',
    subSector: '',
    numEmployees: '',
    numLocations: 1,
    multiFloor: 'No',
    postcode: '',
    annualRevenue: '',
    officeBasedEmployees: '',
    primaryBusinessActivity: '',
    
    // === STEP 2: Volume & Usage ===
    monthlyVolume: {
      mono: '',
      colour: '',
      total: 0
    },
    peakUsagePeriods: '',
    documentTypes: [],
    averagePageCount: '',
    
    // === STEP 3: Paper & Finishing Requirements ===
    paperRequirements: {
      primarySize: 'A4',
      additionalSizes: [],
      specialPaper: false,
      specialPaperTypes: []
    },
    finishingRequirements: [],
    
    // === STEP 4: IT & Network Environment ===
    networkSetup: '',
    itSupportStructure: '',
    currentSoftwareEnvironment: '',
    cloudPreference: '',
    integrationNeeds: [],
    mobileRequirements: 'No',
    securityRequirements: [],
    
    // === STEP 5: Current Setup & Pain Points ===
    currentSetup: {
      machineAge: '',
      currentSupplier: '',
      currentModel: '',
      currentSpeed: '',
      contractStartDate: '',
      contractEndDate: '',
      currentMonoCPC: '',
      currentColorCPC: '',
      quarterlyLeaseCost: '',
      quarterlyService: '',
      currentFeatures: [],
      buyoutRequired: false,
      buyoutCost: '',
      includeBuyoutInCosts: false
    },
    reasonsForQuote: [],
    currentPainPoints: '',
    impactOnProductivity: '',
    maintenanceIssues: '',
    
    // === STEP 6: Technical Requirements ===
    serviceType: 'Photocopiers',
    colour: '',
    type: '',
    min_speed: '',
    required_functions: [],
    niceToHaveFeatures: [],
    securityFeatures: [],
    
    // === STEP 7: Service & Support ===
    responseTimeExpectation: '',
    maintenancePreference: '',
    trainingNeeds: '',
    supplyManagement: '',
    reportingNeeds: [],
    additionalServices: [],
    
    // === STEP 8: Budget & Commercial ===
    budget: {
      maxLeasePrice: '',
      preferredTerm: '60 months',
      includeService: true,
      includeConsumables: true
    },
    preference: '',
    decisionMakers: [],
    evaluationCriteria: [],
    contractLengthPreference: '',
    pricingModelPreference: '',
    max_lease_price: '',
    expectedGrowth: '',
    expansionPlans: '',
    technologyRoadmap: '',
    digitalTransformation: '',
    threeYearVision: '',
    remoteWorkImpact: '',
    
    // === STEP 9: Urgency & Timeline ===
    urgency: {
      timeframe: '',
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

  // Calculate Cost Per Page
  const calculateCostPerPage = (type) => {
    const mono = parseInt(formData.monthlyVolume.mono) || 0;
    const colour = parseInt(formData.monthlyVolume.colour) || 0;
    
    if (type === 'mono') {
      if (mono === 0) return '£0.00';
      const monoCost = (formData.currentSetup.currentMonoCPC || 1.0) / 100;
      return `£${monoCost.toFixed(3)}`;
    } else {
      if (colour === 0) return '£0.00';
      const colourCost = (formData.currentSetup.currentColorCPC || 4.0) / 100;
      return `£${colourCost.toFixed(3)}`;
    }
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

  // ✅ FIXED: Validation for each step
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
        
      case 3
        case 3: // Paper & Finishing
        if (!formData.paperRequirements.primarySize) {
          errors.paperRequirements = 'Primary paper size is required';
        }
        break;
        
      case 4: // IT & Network Environment - FIXED
        if (!formData.networkSetup) {
          errors.networkSetup = 'Network setup is required';
        }
        break;
        
      case 5: // Current Setup & Pain Points - FIXED
        if (!formData.currentSetup.machineAge) {
          errors.currentSetup = 'Please select current equipment age';
        }
        if (formData.reasonsForQuote.length === 0) {
          errors.reasonsForQuote = 'Please select at least one reason for requesting a quote';
        }
        break;
        
      case 6: // Technical Requirements - FIXED (was step 5)
        if (!formData.serviceType) errors.serviceType = 'Service type is required';
        if (!formData.colour) errors.colour = 'Colour preference is required';
        if (!formData.min_speed) errors.min_speed = 'Minimum speed is required';
        break;
        
      case 7: // Service & Support - FIXED (was step 6)
        if (!formData.responseTimeExpectation) {
          errors.responseTimeExpectation = 'Response time expectation is required';
        }
        if (!formData.maintenancePreference) {
          errors.maintenancePreference = 'Maintenance preference is required';
        }
        break;
        
      case 8: // Budget & Commercial - FIXED (was step 7 & 8 combined)
        if (!formData.budget.maxLeasePrice) {
          errors.budget = 'Maximum quarterly lease price is required';
        }
        if (!formData.preference) {
          errors.preference = 'Please select your priority';
        }
        if (formData.decisionMakers.length === 0) {
          errors.decisionMakers = 'Please select at least one decision maker';
        }
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

  const handlePrevious = () => {
    setStep(prev => prev - 1);
    setErrorMessages({});
  };
  // ✅ FIXED: Form submission with proper backend enum mapping
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
        
        // ✅ FIXED: Requirements (backend schema) - Map to backend enums
        requirements: {
          priority: formData.preference || 'balanced',
          essentialFeatures: formData.required_functions || [],
          niceToHaveFeatures: formData.niceToHaveFeatures || [],
          minSpeed: parseInt(formData.min_speed) || 0,
          
          // ✅ Map maintenance preference to backend serviceLevel enum: ['Basic', 'Standard', 'Premium']
          serviceLevel: (() => {
            const preference = formData.maintenancePreference;
            if (!preference) return 'Standard';
            
            // Map user-friendly text to backend enum values
            if (preference.includes('quarterly') || preference.includes('Quarterly')) return 'Basic';
            if (preference.includes('Predictive') || preference.includes('predictive')) return 'Premium';
            if (preference.includes('monthly') || preference.includes('Monthly')) return 'Premium';
            if (preference.includes('As-needed')) return 'Basic';
            
            return 'Standard'; // Default fallback
          })(),
          
          // ✅ Map response time to backend responseTime enum: ['4hr', '8hr', 'Next day', '48hr']
          responseTime: (() => {
            const time = formData.responseTimeExpectation;
            if (!time) return 'Next day';
            
            // Map user-friendly text to backend enum values
            if (time.includes('Same day') || time.includes('4-8 hours')) return '4hr';
            if (time.includes('Next business day') || time.includes('Next day')) return 'Next day';
            if (time.includes('48 hours') || time.includes('Within 48')) return '48hr';
            if (time.includes('3-5 business days')) return '48hr'; // Closest match
            if (time.includes('Flexible')) return 'Next day'; // Default for flexible
            
            return 'Next day'; // Default fallback
          })()
        },
        
        // ✅ FIXED: Budget (backend schema) - Ensure valid enum values
        budget: {
          maxLeasePrice: parseFloat(formData.budget.maxLeasePrice) || 0,
          
          // ✅ Ensure contract term matches backend enum: ['12 months', '24 months', '36 months', '48 months', '60 months']
          preferredTerm: (() => {
            const term = formData.contractLengthPreference || formData.budget.preferredTerm || '60 months';
            
            // Backend only accepts: ['12 months', '24 months', '36 months', '48 months', '60 months']
            const validTerms = ['12 months', '24 months', '36 months', '48 months', '60 months'];
            
            // If term is just a number like "60", add " months"
            if (term && !term.includes('months')) {
              const formatted = `${term} months`;
              if (validTerms.includes(formatted)) return formatted;
            }
            
            // If already formatted correctly
            if (validTerms.includes(term)) return term;
            
            // Default to 60 months
            return '60 months';
          })()
        },
        
        // ✅ FIXED: Urgency (backend schema) - Map to backend enum
        urgency: {
          // ✅ Map implementation timeline to backend timeframe enum: ['Immediately', '1-3 months', '3-6 months', '6+ months']
          timeframe: (() => {
            const timeline = formData.implementationTimeline || formData.urgency.timeframe;
            
            if (!timeline) return '1-3 months';
            
            if (timeline.includes('Immediately') || timeline.includes('This week')) return 'Immediately';
            if (timeline.includes('1-2 weeks') || timeline.includes('2-4 weeks')) return '1-3 months';
            if (timeline.includes('1-3 months')) return '1-3 months';
            if (timeline.includes('3-6 months')) return '3-6 months';
            if (timeline.includes('6+ months') || timeline.includes('6 months')) return '6+ months';
            if (timeline.includes('Flexible')) return '1-3 months';
            
            return '1-3 months'; // Default
          })(),
          reason: formData.currentPainPoints || formData.urgency.reason || ''
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
          <label htmlFor="numLocations">Number of Locations</label>
          <input
            type="number"
            id="numLocations"
            name="numLocations"
            value={formData.numLocations}
            onChange={handleChange}
            min="1"
            placeholder="1"
          />
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
const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-section"
    >
      <h2>Step 4: IT & Network Environment</h2>
      
      <div className="info-box">
        <p>🔌 Understanding your IT setup helps ensure seamless integration.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="networkSetup">Network Setup <span className="required">*</span></label>
          <div className="radio-group">
            {['Wired (Ethernet)', 'Wireless (Wi-Fi)', 'Both', 'Not Sure'].map(setup => (
              <label key={setup}>
                <input
                  type="radio"
                  name="networkSetup"
                  value={setup}
                  checked={formData.networkSetup === setup}
                  onChange={handleChange}
                />
                {setup}
              </label>
            ))}
          </div>
          {errorMessages.networkSetup && <span className="error-text">{errorMessages.networkSetup}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="itSupportStructure">IT Support Structure</label>
          <select
            id="itSupportStructure"
            name="itSupportStructure"
            value={formData.itSupportStructure}
            onChange={handleChange}
          >
            <option value="">Select IT support</option>
            <option value="In-house IT team">In-house IT team</option>
            <option value="External IT provider">External IT provider</option>
            <option value="Hybrid (in-house + external)">Hybrid (in-house + external)</option>
            <option value="No dedicated IT support">No dedicated IT support</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="currentSoftwareEnvironment">Current Software Environment</label>
          <input
            type="text"
            id="currentSoftwareEnvironment"
            name="currentSoftwareEnvironment"
            value={formData.currentSoftwareEnvironment}
            onChange={handleChange}
            placeholder="e.g., Microsoft 365, Google Workspace"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cloudPreference">Cloud Integration</label>
          <select
            id="cloudPreference"
            name="cloudPreference"
            value={formData.cloudPreference}
            onChange={handleChange}
          >
            <option value="">Select cloud preference</option>
            <option value="Essential - Must have cloud">Essential - Must have cloud</option>
            <option value="Nice to have">Nice to have</option>
            <option value="Not needed">Not needed</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Integration Requirements</label>
          <div className="checkbox-grid">
            {[
              'Email Integration',
              'Document Management Systems',
              'Cloud Storage (Dropbox, OneDrive, Google Drive)',
              'ERP Systems',
              'CRM Systems',
              'Accounting Software'
            ].map(integration => (
              <label key={integration}>
                <input
                  type="checkbox"
                  value={integration}
                  checked={formData.integrationNeeds?.includes(integration)}
                  onChange={(e) => handleArrayChange('integrationNeeds', integration, e.target.checked)}
                />
                {integration}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="mobileRequirements">Mobile/Remote Printing Required?</label>
          <select
            id="mobileRequirements"
            name="mobileRequirements"
            value={formData.mobileRequirements}
            onChange={handleChange}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Not Sure">Not Sure</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Security Requirements</label>
          <div className="checkbox-grid">
            {[
              'User Authentication',
              'Secure Print Release',
              'Data Encryption',
              'Compliance (GDPR, HIPAA, etc.)',
              'Audit Trails',
              'Access Control'
            ].map(req => (
              <label key={req}>
                <input
                  type="checkbox"
                  value={req}
                  checked={formData.securityRequirements?.includes(req)}
                  onChange={(e) => handleArrayChange('securityRequirements', req, e.target.checked)}
                />
                {req}
              </label>
            ))}
          </div>
        </div>
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
      <h2>Step 5: Current Equipment & Pain Points</h2>
      
      <div className="info-box">
        <p>🔧 Understanding your current setup helps us recommend the best replacement or upgrade.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="currentSetup.machineAge">Current Equipment Age <span className="required">*</span></label>
          <select
            id="currentSetup.machineAge"
            name="currentSetup.machineAge"
            value={formData.currentSetup.machineAge}
            onChange={handleChange}
            required
            className={errorMessages.currentSetup ? 'error' : ''}
          >
            <option value="">Select age</option>
            <option value="No current machine">No current machine</option>
            <option value="0-2 years">0-2 years (New)</option>
            <option value="2-5 years">2-5 years (Mid-life)</option>
            <option value="5+ years">5+ years (Aging)</option>
            <option value="Not sure">Not sure</option>
          </select>
          {errorMessages.currentSetup && <span className="error-text">{errorMessages.currentSetup}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.currentSupplier">Current Supplier</label>
          <input
            type="text"
            id="currentSetup.currentSupplier"
            name="currentSetup.currentSupplier"
            value={formData.currentSetup.currentSupplier}
            onChange={handleChange}
            placeholder="e.g., Xerox, Canon"
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
            placeholder="Model number or name"
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
            min="0"
            placeholder="Pages per minute"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.contractStartDate">Contract Start Date</label>
          <input
            type="date"
            id="currentSetup.contractStartDate"
            name="currentSetup.contractStartDate"
            value={formData.currentSetup.contractStartDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.contractEndDate">Contract End Date</label>
          <input
            type="date"
            id="currentSetup.contractEndDate"
            name="currentSetup.contractEndDate"
            value={formData.currentSetup.contractEndDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.currentMonoCPC">Current Mono CPC (pence)</label>
          <input
            type="number"
            id="currentSetup.currentMonoCPC"
            name="currentSetup.currentMonoCPC"
            value={formData.currentSetup.currentMonoCPC}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 0.8"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.currentColorCPC">Current Colour CPC (pence)</label>
          <input
            type="number"
            id="currentSetup.currentColorCPC"
            name="currentSetup.currentColorCPC"
            value={formData.currentSetup.currentColorCPC}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 4.5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.quarterlyLeaseCost">Quarterly Lease Cost (£)</label>
          <input
            type="number"
            id="currentSetup.quarterlyLeaseCost"
            name="currentSetup.quarterlyLeaseCost"
            value={formData.currentSetup.quarterlyLeaseCost}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 750"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.quarterlyService">Quarterly Service Cost (£)</label>
          <input
            type="number"
            id="currentSetup.quarterlyService"
            name="currentSetup.quarterlyService"
            value={formData.currentSetup.quarterlyService}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 150"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentSetup.buyoutRequired">Buyout Required?</label>
          <select
            id="currentSetup.buyoutRequired"
            name="currentSetup.buyoutRequired"
            value={formData.currentSetup.buyoutRequired}
            onChange={handleChange}
          >
            <option value={false}>No</option>
            <option value={true}>Yes</option>
          </select>
        </div>

        {formData.currentSetup.buyoutRequired && (
          <div className="form-group">
            <label htmlFor="currentSetup.buyoutCost">Estimated Buyout Cost (£)</label>
            <input
              type="number"
              id="currentSetup.buyoutCost"
              name="currentSetup.buyoutCost"
              value={formData.currentSetup.buyoutCost || calculateBuyout()}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="Auto-calculated"
            />
            <p className="helper-text">Calculated: £{calculateBuyout()}</p>
          </div>
        )}

        <div className="form-group full-width">
          <label>Reasons for Requesting Quote <span className="required">*</span></label>
          <div className="checkbox-grid">
            {[
              'Contract ending',
              'High running costs',
              'Frequent breakdowns',
              'Poor print quality',
              'Slow performance',
              'Expanding business',
              'New requirements',
              'Dissatisfied with current supplier'
            ].map(reason => (
              <label key={reason}>
                <input
                  type="checkbox"
                  value={reason}
                  checked={formData.reasonsForQuote?.includes(reason)}
                  onChange={(e) => handleArrayChange('reasonsForQuote', reason, e.target.checked)}
                />
                {reason}
              </label>
            ))}
          </div>
          {errorMessages.reasonsForQuote && <span className="error-text">{errorMessages.reasonsForQuote}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="currentPainPoints">Current Pain Points</label>
          <textarea
            id="currentPainPoints"
            name="currentPainPoints"
            value={formData.currentPainPoints}
            onChange={handleChange}
            rows="3"
            placeholder="Describe specific issues with your current setup..."
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="maintenanceIssues">Maintenance Issues</label>
          <textarea
            id="maintenanceIssues"
            name="maintenanceIssues"
            value={formData.maintenanceIssues}
            onChange={handleChange}
            rows="3"
            placeholder="Any recurring maintenance problems..."
          />
        </div>
      </div>
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
          {errorMessages.colour && <span className="error-text
            {errorMessages.colour && <span className="error-text">{errorMessages.colour}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="min_speed">Minimum Speed (PPM) <span className="required">*</span></label>
          <input
            type="number"
            id="min_speed"
            name="min_speed"
            value={formData.min_speed}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 45"
            className={errorMessages.min_speed ? 'error' : ''}
          />
          <p className="helper-text">Recommended: {suggestMinSpeed(formData.monthlyVolume.total)} PPM based on your volume</p>
          {errorMessages.min_speed && <span className="error-text">{errorMessages.min_speed}</span>}
        </div>

        <div className="form-group full-width">
          <label>Required Functions</label>
          <div className="checkbox-grid">
            {['Print', 'Copy', 'Scan', 'Fax', 'Email'].map(func => (
              <label key={func}>
                <input
                  type="checkbox"
                  value={func}
                  checked={formData.required_functions?.includes(func)}
                  onChange={(e) => handleArrayChange('required_functions', func, e.target.checked)}
                />
                {func}
              </label>
            ))}
          </div>
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
          <label>Nice-to-Have Features</label>
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
                  checked={formData.niceToHaveFeatures?.includes(feature)}
                  onChange={(e) => handleArrayChange('niceToHaveFeatures', feature, e.target.checked)}
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

        <div className="form-group full-width">
          <label>Additional Services Required</label>
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
                  checked={formData.additionalServices?.includes(service)}
                  onChange={(e) => handleArrayChange('additionalServices', service, e.target.checked)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="trainingNeeds">Training Requirements</label>
          <textarea
            id="trainingNeeds"
            name="trainingNeeds"
            value={formData.trainingNeeds}
            onChange={handleChange}
            rows="3"
            placeholder="Describe any training needs for your team..."
          />
        </div>
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
      <h2>Step 8: Budget & Financial Preferences</h2>
      
      <div className="info-box">
        <p>💰 Understanding your budget helps us provide the most suitable options within your financial constraints.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="budget.maxLeasePrice">Maximum Quarterly Lease Price (£) <span className="required">*</span></label>
          <input
            type="number"
            id="budget.maxLeasePrice"
            name="budget.maxLeasePrice"
            value={formData.budget.maxLeasePrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="e.g., 1500"
            required
            className={errorMessages.budget ? 'error' : ''}
          />
          {errorMessages.budget && <span className="error-text">{errorMessages.budget}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="contractLengthPreference">Preferred Contract Length</label>
          <select
            id="contractLengthPreference"
            name="contractLengthPreference"
            value={formData.contractLengthPreference}
            onChange={handleChange}
          >
            <option value="">Select contract length</option>
            <option value="36 months">36 months</option>
            <option value="48 months">48 months</option>
            <option value="60 months">60 months (Standard)</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="preference">Priority <span className="required">*</span></label>
          <select
            id="preference"
            name="preference"
            value={formData.preference}
            onChange={handleChange}
            required
            className={errorMessages.preference ? 'error' : ''}
          >
            <option value="">Select priority</option>
            <option value="cost">Cost (Best Price)</option>
            <option value="quality">Quality (Best Performance)</option>
            <option value="speed">Speed (Fastest PPM)</option>
            <option value="reliability">Reliability (Lowest Downtime)</option>
            <option value="balanced">Balanced (All Factors)</option>
          </select>
          {errorMessages.preference && <span className="error-text">{errorMessages.preference}</span>}
        </div>

        <div className="form-group">
          <label>Cost Per Page Estimate</label>
          <div className="cost-estimate">
            <p><strong>Mono:</strong> {calculateCostPerPage('mono')} per page</p>
            <p><strong>Colour:</strong> {calculateCostPerPage('colour')} per page</p>
            <p className="info-text">Based on your current setup</p>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Decision Makers <span className="required">*</span></label>
          <div className="checkbox-grid">
            {[
              'Finance Director',
              'IT Manager',
              'Operations Manager',
              'Managing Director',
              'Procurement Team',
              'Department Heads',
              'Office Manager'
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
          {errorMessages.decisionMakers && <span className="error-text">{errorMessages.decisionMakers}</span>}
        </div>

        <div className="form-group full-width">
          <label>Evaluation Criteria</label>
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

        <div className="form-group full-width">
          <label htmlFor="expectedGrowth">Expected Growth <span className="required">*</span></label>
          <select
            id="expectedGrowth"
            name="expectedGrowth"
            value={formData.expectedGrowth}
            onChange={handleChange}
            required
            className={errorMessages.expectedGrowth ? 'error' : ''}
          >
            <option value="">Select expected growth</option>
            <option value="No growth expected">No growth expected</option>
            <option value="0-10% growth">0-10% growth</option>
            <option value="10-25% growth">10-25% growth</option>
            <option value="25-50% growth">25-50% growth</option>
            <option value="50%+ growth">50%+ growth</option>
            <option value="Uncertain">Uncertain</option>
          </select>
          {errorMessages.expectedGrowth && <span className="error-text">{errorMessages.expectedGrowth}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="threeYearVision">Three-Year Vision <span className="required">*</span></label>
          <textarea
            id="threeYearVision"
            name="threeYearVision"
            value={formData.threeYearVision}
            onChange={handleChange}
            rows="3"
            placeholder="Describe your company's 3-year printing/copying needs..."
            required
            className={errorMessages.threeYearVision ? 'error' : ''}
          />
          {errorMessages.threeYearVision && <span className="error-text">{errorMessages.threeYearVision}</span>}
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
      <h2>Step 9: Urgency & Timeline</h2>
      
      <div className="info-box">
        <p>⏰ Understanding your timeline helps us prioritize and expedite your quote.</p>
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
            <option value="Critical - Immediate">Critical - Immediate (ASAP)</option>
            <option value="High - Within 1 week">High - Within 1 week</option>
            <option value="Medium - 1-4 weeks">Medium - 1-4 weeks</option>
            <option value="Low - 1-3 months">Low - 1-3 months</option>
            <option value="Planning - 3+ months">Planning - 3+ months</option>
            <option value="Just exploring">Just exploring options</option>
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
            <option value="Immediately">Immediately (This week)</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
            <option value="Flexible">Flexible</option>
          </select>
          {errorMessages.implementationTimeline && <span className="error-text">{errorMessages.implementationTimeline}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="budgetCycle">Budget Approval Cycle</label>
          <select
            id="budgetCycle"
            name="budgetCycle"
            value={formData.budgetCycle}
            onChange={handleChange}
          >
            <option value="">Select budget cycle</option>
            <option value="Budget already approved">Budget already approved</option>
            <option value="Approval within 1 week">Approval within 1 week</option>
            <option value="Approval within 1 month">Approval within 1 month</option>
            <option value="Next quarter">Next quarter</option>
            <option value="Next financial year">Next financial year</option>
            <option value="No budget constraints">No budget constraints</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="sustainabilityGoals">Sustainability Goals</label>
          <textarea
            id="sustainabilityGoals"
            name="sustainabilityGoals"
            value={formData.sustainabilityGoals}
            onChange={handleChange}
            rows="3"
            placeholder="Any environmental or sustainability requirements..."
          />
        </div>

        <div className="form-group full-width">
          <label>Upload Supporting Documents (Optional)</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>📎 Drag & drop files here, or click to select</p>
            <p className="dropzone-info">Max 5 files, 5MB each (PDF, Excel, CSV, Images)</p>
          </div>
          {errorMessages.fileUpload && <span className="error-text">{errorMessages.fileUpload}</span>}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="form-group full-width">
            <label>Uploaded Files:</label>
            <ul className="uploaded-files-list">
              {uploadedFiles.map((file, index) => (
                <li key={index}>
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
          </div>
        )}
      </div>
    </motion.div>
  );

  // Main render function
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
            { num: 9, label: 'Timeline' }
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
              disabled={isSubmitting}
            >
              ← Previous
            </button>
          )}
          
          {step < 9 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="btn btn-primary"
              disabled={isSubmitting}
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

        {/* Success Message */}
        {submissionStatus === 'success' && successMessage && (
          <div className="success-message">
            <p>✅ {successMessage}</p>
          </div>
        )}

        {/* Error Messages */}
        {submissionStatus === 'error' && errorMessages.general && (
          <div className="error-message">
            <p>❌ {errorMessages.general}</p>
          </div>
        )}

        {/* Overall Error Summary */}
        {Object.keys(errorMessages).length > 0 && submissionStatus !== 'error' && (
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
