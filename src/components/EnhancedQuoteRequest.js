import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './EnhancedQuoteRequest.css';

// Hard-coded production URL
const PRODUCTION_API_URL = 'https://ai-procurement-backend-q35u.onrender.com';

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
      console.warn('AI suggestions endpoint not available:', response.status);
      return [];
    }
    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.warn('AI suggestions not available:', error.message);
    return [];
  }
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
    '': 'No current machine'
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

// Map form data to backend Quote schema
const mapFormDataToBackend = (formData, userProfile) => {
  return {
    // Basic Company Details (Required fields)
    companyName: formData.companyName || 'Unknown Company',
    contactName: userProfile?.name || userProfile?.username || formData.contactName || 'Unknown Contact',
    email: userProfile?.email || formData.email || 'unknown@example.com',

    // Use valid enum values only
    industryType: mapIndustryType(formData.industryType),

    numEmployees: Math.max(1, parseInt(formData.numEmployees) || 1),
    numLocations: Math.max(1, parseInt(formData.numLocations) || 1),

    // Backend expected fields
    serviceType: formData.serviceType || 'Photocopiers',
    numOfficeLocations: Math.max(1, parseInt(formData.numLocations) || 1),
    multipleFloors: formData.multiFloor === 'Yes',
    price: parseInt(formData.max_lease_price) || 100,
    minSpeed: parseInt(formData.min_speed) || undefined,
    type: formData.type || undefined,

    // Monthly Volume (Required structure)
    monthlyVolume: {
      mono: parseInt(formData.monthlyVolume?.mono) || 0,
      colour: parseInt(formData.monthlyVolume?.colour) || 0,
      total: (parseInt(formData.monthlyVolume?.mono) || 0) + (parseInt(formData.monthlyVolume?.colour) || 0) || 1
    },

    // Paper Requirements (Required structure)
    paperRequirements: {
      primarySize: mapPaperSize(formData.type || formData.paperSize),
      additionalSizes: [],
      specialPaper: false,
      specialPaperTypes: []
    },

    // Current Setup (Required structure)
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

    // Requirements (Required structure)
    requirements: {
      priority: mapPriority(formData.preference),
      essentialFeatures: mapFeatures(formData.required_functions || []),
      niceToHaveFeatures: [],
      minSpeed: parseInt(formData.min_speed) || undefined,
      maxNoisLevel: undefined,
      environmentalConcerns: formData.sustainabilityGoals ? true : false
    },

    // Budget (Required structure)
    budget: {
      maxLeasePrice: parseInt(formData.max_lease_price) || 100,
      preferredTerm: formData.contractLengthPreference || '36 months',
      includeService: true,
      includeConsumables: true
    },

    // Urgency (Required structure)
    urgency: {
      timeframe: mapTimeframe(formData.implementationTimeline),
      reason: formData.currentPainPoints || undefined
    },

    // Location (Required structure)
    location: {
      postcode: formData.postcode || 'Unknown',
      city: undefined,
      region: undefined,
      installationRequirements: undefined
    },

    // AI Analysis (optional, will be populated by backend)
    aiAnalysis: {
      processed: false,
      suggestedCategories: [],
      volumeCategory: undefined,
      riskFactors: [],
      recommendations: [],
      processedAt: undefined
    },

    // System Fields (Required)
    submittedBy: userProfile?._id || userProfile?.userId || userProfile?.id,
    userId: userProfile?._id || userProfile?.userId || userProfile?.id,
    status: 'pending',
    submissionSource: 'web_form',

    // Optional fields with safe defaults
    phone: undefined,
    quotes: [],
    internalNotes: [],

    // Additional optional fields
    ...(formData.subSector && { subSector: formData.subSector }),
    ...(formData.annualRevenue && { annualRevenue: formData.annualRevenue }),
    ...(formData.officeBasedEmployees && { officeBasedEmployees: parseInt(formData.officeBasedEmployees) }),
    ...(formData.primaryBusinessActivity && { primaryBusinessActivity: formData.primaryBusinessActivity }),
    ...(formData.organizationStructure && { organizationStructure: formData.organizationStructure }),
    ...(formData.multiFloor && { multiFloor: formData.multiFloor === 'Yes' }),
    ...(formData.currentPainPoints && { currentPainPoints: formData.currentPainPoints }),
    ...(formData.impactOnProductivity && { impactOnProductivity: formData.impactOnProductivity }),
    ...(formData.urgencyLevel && { urgencyLevel: formData.urgencyLevel }),
    ...(formData.budgetCycle && { budgetCycle: formData.budgetCycle }),
    ...(formData.monthlyPrintVolume && { monthlyPrintVolume: parseInt(formData.monthlyPrintVolume) }),
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
    ...(formData.contractStartDate && { contractStartDate: new Date(formData.contractStartDate) }),
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
      throw new Error(errorData.message || 'Validation failed');
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
    organizationStructure: '',
    multiFloor: 'No',
    postcode: '',
    primaryChallenges: [],
    currentPainPoints: '',
    impactOnProductivity: '',
    urgencyLevel: '',
    implementationTimeline: '',
    budgetCycle: '',
    monthlyPrintVolume: '',
    annualPrintVolume: '',
    monthlyVolume: { colour: '', mono: '' },
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
    leasingCompany: '',
    serviceProvider: '',
    contractStartDate: '',
    contractEndDate: '',
    currentEquipmentAge: '',
    maintenanceIssues: '',
    additionalServices: [],
    paysForScanning: 'No',
    serviceType: 'Photocopiers',
    colour: '',
    type: '',
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
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestedMachines, setSuggestedMachines] = useState([]);

  // Auto-update suggested machines
  useEffect(() => {
    if (auth?.token && (formData.monthlyVolume.mono || formData.monthlyVolume.colour || formData.type || formData.industryType)) {
      suggestCopiers(formData, auth.token).then((suggestions) => {
        setSuggestedMachines(suggestions);
      }).catch(error => {
        console.warn('AI suggestions not available:', error);
      });
    }
  }, [formData.monthlyVolume.mono, formData.monthlyVolume.colour, formData.type, formData.industryType, auth?.token]);

  // Calculate buyout cost
  const calculateBuyout = () => {
    const { quarterlyLeaseCost, contractEndDate } = formData.currentSetup;
    if (!quarterlyLeaseCost || !contractEndDate) return 'N/A';
    const end = new Date(contractEndDate);
    const today = new Date();
    if (today > end) return 'Contract Ended';
    const monthsRemaining = (end - today) / (1000 * 60 * 60 * 24 * 30);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedData;
    if (type === 'checkbox') {
      if (['primaryChallenges', 'documentTypes', 'finishingRequirements', 'securityRequirements',
           'integrationNeeds', 'additionalServices', 'securityFeatures', 'reportingNeeds',
           'decisionMakers', 'evaluationCriteria', 'required_functions', 'reasonsForQuote',
           'currentSetup.currentFeatures'].includes(name)) {
        updatedData = {
          ...formData,
          [name]: checked
            ? [...formData[name], value]
            : formData[name].filter((item) => item !== value),
        };
      } else if (name.startsWith('currentSetup.')) {
        const field = name.split('.')[1];
        updatedData = {
          ...formData,
          currentSetup: {
            ...formData.currentSetup,
            [field]: checked
          }
        };
      }
    } else if (name.startsWith('monthlyVolume.') || name.startsWith('currentSetup.')) {
      const keys = name.split('.');
      const field = keys[1];
      updatedData = {
        ...formData,
        [keys[0]]: {
          ...formData[keys[0]],
          [field]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }
      };
    } else {
      updatedData = {
        ...formData,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
      };
    }
    setFormData(updatedData);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const validateStep = (currentStep) => {
    const errors = {};
    switch (currentStep) {
      case 1:
        if (!formData.companyName) errors.companyName = 'Company name is required';
        if (!formData.industryType) errors.industryType = 'Industry type is required';
        if (!formData.numEmployees) errors.numEmployees = 'Number of employees is required';
        if (!formData.numLocations) errors.numLocations = 'Number of locations is required';
        if (!formData.postcode) errors.postcode = 'Postcode is required';
        break;
      case 2:
        if (formData.reasonsForQuote.length === 0) errors.reasonsForQuote = 'At least one reason for requesting a quote is required';
        if (!formData.urgencyLevel) errors.urgencyLevel = 'Urgency level is required';
        if (!formData.implementationTimeline) errors.implementationTimeline = 'Implementation timeline is required';
        break;
      case 3:
        if (formData.monthlyVolume.colour === '' || formData.monthlyVolume.mono === '') {
          errors.monthlyVolume = 'Both color and mono volume are required';
        }
        break;
      case 4:
        if (!formData.networkSetup) errors.networkSetup = 'Network setup is required';
        if (!formData.itSupportStructure) errors.itSupportStructure = 'IT support structure is required';
        break;
      case 5:
        if (formData.currentSetup.currentSupplier && (
          !formData.currentSetup.currentModel ||
          !formData.currentSetup.currentSpeed ||
          !formData.currentSetup.contractStartDate ||
          !formData.currentSetup.contractEndDate ||
          !formData.currentSetup.currentMonoCPC ||
          !formData.currentSetup.currentColorCPC ||
          !formData.currentSetup.quarterlyLeaseCost
        )) {
          errors.currentSetup = 'All current setup fields are required if a supplier is specified';
        }
        break;
      case 6:
        if (!formData.serviceType) errors.serviceType = 'Service type is required';
        if (!formData.colour) errors.colour = 'Colour preference is required';
        if (!formData.type) errors.type = 'Maximum paper size is required';
        break;
      case 7:
        if (!formData.responseTimeExpectation) errors.responseTimeExpectation = 'Response time expectation is required';
        if (!formData.maintenancePreference) errors.maintenancePreference = 'Maintenance preference is required';
        break;
      case 8:
        if (formData.decisionMakers.length === 0) errors.decisionMakers = 'At least one decision maker is required';
        if (!formData.preference) errors.preference = 'Priority is required';
        if (!formData.max_lease_price) errors.max_lease_price = 'Maximum monthly investment is required';
        break;
      case 9:
        if (!formData.expectedGrowth) errors.expectedGrowth = 'Expected growth is required';
        if (!formData.threeYearVision) errors.threeYearVision = 'Three-year vision is required';
        break;
      default:
        return true;
    }
    setErrorMessage(Object.values(errors).join('; '));
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setErrorMessage('');
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
      setSuccessMessage('Quote request submitted successfully! AI matching in progress. Redirecting to your quotes page...');
      setErrorMessage('');

      setTimeout(() => {
        console.log('🎯 Navigating to quotes page');
        navigate('/quotes');
      }, 2000);

      setFormData({
        companyName: '', industryType: '', subSector: '', annualRevenue: '', numEmployees: '',
        officeBasedEmployees: '', numLocations: '', primaryBusinessActivity: '', organizationStructure: '',
        multiFloor: 'No', postcode: '', primaryChallenges: [], currentPainPoints: '', impactOnProductivity: '',
        urgencyLevel: '', implementationTimeline: '', budgetCycle: '', monthlyPrintVolume: '',
        annualPrintVolume: '', monthlyVolume: { colour: '', mono: '' }, peakUsagePeriods: '',
        documentTypes: [], averagePageCount: '', finishingRequirements: [], departmentBreakdown: [],
        networkSetup: '', itSupportStructure: '', securityRequirements: [], currentSoftwareEnvironment: '',
        cloudPreference: '', integrationNeeds: [], mobileRequirements: 'No', remoteWorkImpact: '',
        currentSetup: {
          currentSupplier: '', currentModel: '', currentSpeed: '', contractStartDate: '',
          contractEndDate: '', currentMonoCPC: '', currentColorCPC: '', quarterlyLeaseCost: '',
          currentFeatures: [], buyoutRequired: false, buyoutCost: '', includeBuyoutInCosts: false
        },
        reasonsForQuote: [],
        totalAnnualCosts: '', hiddenCosts: '', leasingCompany: '', serviceProvider: '',
        contractStartDate: '', contractEndDate: '', currentEquipmentAge: '', maintenanceIssues: '',
        additionalServices: [], paysForScanning: 'No', serviceType: 'Photocopiers', colour: '',
        type: '', min_speed: '', securityFeatures: [], accessibilityNeeds: 'No', sustainabilityGoals: '',
        responseTimeExpectation: '', maintenancePreference: '', trainingNeeds: '', supplyManagement: '',
        reportingNeeds: [], vendorRelationshipType: '', decisionMakers: [], evaluationCriteria: [],
        contractLengthPreference: '', pricingModelPreference: '', required_functions: [],
        preference: '', max_lease_price: '', roiExpectations: '', expectedGrowth: '',
        expansionPlans: '', technologyRoadmap: '', digitalTransformation: '', threeYearVision: ''
      });
      setUploadedFiles([]);
      setStep(1);
    } catch (error) {
      console.error('❌ Error submitting quote request:', error.message);
      setSubmissionStatus('error');
      setErrorMessage(`Failed to submit: ${error.message}`);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonsForQuoteOptions = [
    'Not happy with current supplier',
    'Too expensive',
    'Poor service quality',
    'Outdated equipment',
    'Need additional features',
    'Contract nearing end',
    'Business expansion',
    'Cost optimization'
  ];

  const currentFeatureOptions = [
    'Stapling',
    'Duplex Printing',
    'Follow-Me Print'
  ];

  const challengeOptions = [
    'High printing costs',
    'Frequent equipment breakdowns',
    'Poor print quality',
    'Slow printing speeds',
    'Limited functionality',
    'Complex user interface',
    'Poor vendor support',
    'Supply chain issues',
    'Security concerns',
    'Integration problems'
  ];

  const documentTypeOptions = [
    'Standard office documents',
    'Marketing materials',
    'Technical drawings',
    'Legal documents',
    'Financial reports',
    'Training materials',
    'Customer communications',
    'Compliance documents',
    'Presentations',
    'Graphics/Images'
  ];

  const finishingOptions = [
    'Stapling',
    'Hole punching',
    'Booklet making',
    'Folding',
    'Cutting/Trimming',
    'Binding',
    'Laminating',
    'Sorting/Collating'
  ];

  const securityRequirementOptions = [
    'User authentication',
    'Document encryption',
    'Secure print release',
    'Audit trails',
    'Data wiping',
    'Network security',
    'Compliance (GDPR, HIPAA, etc.)',
    'Access controls'
  ];

  const integrationOptions = [
    'Email systems',
    'Cloud storage (Google Drive, OneDrive, etc.)',
    'Document management systems',
    'ERP systems',
    'CRM systems',
    'Accounting software',
    'Workflow automation',
    'Mobile apps'
  ];

  const additionalServicesOptions = [
    'Automatic toner replenishment',
    'On-site service & repairs',
    'Cost per copy fees',
    'Bulk paper delivery',
    'Print tracking & reporting',
    'Monthly lease payments',
    'Printer setup & network configuration',
    'Toner cartridge recycling',
    'User training',
    'Help desk support'
  ];

  const securityFeatureOptions = [
    'PIN/Card authentication',
    'Biometric access',
    'Encrypted hard drives',
    'Secure boot',
    'Digital signatures',
    'Watermarking',
    'Access logging',
    'Network isolation'
  ];

  const reportingOptions = [
    'Usage analytics',
    'Cost tracking',
    'Environmental impact',
    'User activity',
    'Device status',
    'Supply levels',
    'Service history',
    'Compliance reports'
  ];

  const decisionMakerOptions = [
    'IT Manager/Director',
    'Finance Manager/CFO',
    'Operations Manager',
    'Procurement Manager',
    'Office Manager',
    'CEO/General Manager',
    'Department Heads',
    'End Users'
  ];

  const evaluationCriteriaOptions = [
    'Total cost of ownership',
    'Print quality',
    'Reliability/Uptime',
    'Speed/Productivity',
    'Security features',
    'Vendor support quality',
    'Integration capabilities',
    'Environmental impact',
    'User friendliness',
    'Scalability'
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Company Profile & Context</h3>
            <div className="form-section">
              <h4>Basic Information</h4>
              <label>
                Company Name: <span className="required">*</span>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className={errorMessage.includes('companyName') ? 'error' : ''}
                />
              </label>
              <label>
                Postcode: <span className="required">*</span>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  placeholder="e.g., SW1A 1AA"
                  required
                  className={errorMessage.includes('postcode') ? 'error' : ''}
                />
              </label>
              <label>
                Industry Type: <span className="required">*</span>
                <select name="industryType" value={formData.industryType} onChange={handleChange} required className={errorMessage.includes('industryType') ? 'error' : ''}>
                  <option value="">Select Industry</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Legal">Legal</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Technology">Technology</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Government">Government</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Sub-sector/Specialization:
                <input
                  type="text"
                  name="subSector"
                  value={formData.subSector}
                  onChange={handleChange}
                  placeholder="e.g., Dental practice, Corporate law, etc."
                />
              </label>
              <label>
                Annual Revenue Range:
                <select name="annualRevenue" value={formData.annualRevenue} onChange={handleChange}>
                  <option value="">Select Range</option>
                  <option value="Under £1M">Under £1M</option>
                  <option value="£1M - £5M">£1M - £5M</option>
                  <option value="£5M - £25M">£5M - £25M</option>
                  <option value="£25M - £100M">£25M - £100M</option>
                  <option value="Over £100M">Over £100M</option>
                </select>
              </label>
            </div>
            <div className="form-section">
              <h4>Organization Structure</h4>
              <label>
                Total Number of Employees: <span className="required">*</span>
                <input
                  type="number"
                  name="numEmployees"
                  value={formData.numEmployees}
                  onChange={handleChange}
                  required
                  className={errorMessage.includes('numEmployees') ? 'error' : ''}
                />
              </label>
              <label>
                Office-Based Employees:
                <input
                  type="number"
                  name="officeBasedEmployees"
                  value={formData.officeBasedEmployees}
                  onChange={handleChange}
                  placeholder="Number who regularly use office equipment"
                />
              </label>
              <label>
                Number of Office Locations: <span className="required">*</span>
                <input
                  type="number"
                  name="numLocations"
                  value={formData.numLocations}
                  onChange={handleChange}
                  min="1"
                  required
                  className={errorMessage.includes('numLocations') ? 'error' : ''}
                />
              </label>
              <label>
                Primary Business Activity:
                <textarea
                  name="primaryBusinessActivity"
                  value={formData.primaryBusinessActivity}
                  onChange={handleChange}
                  placeholder="Brief description of what your company does"
                  rows="3"
                />
              </label>
              <label>
                Organization Structure:
                <select name="organizationStructure" value={formData.organizationStructure} onChange={handleChange}>
                  <option value="">Select Structure</option>
                  <option value="Centralized">Centralized (decisions made at HQ)</option>
                  <option value="Decentralized">Decentralized (local decision-making)</option>
                  <option value="Hybrid">Hybrid (mixed approach)</option>
                </select>
              </label>
              <label>
                Multiple Floors at Main Location?
                <select name="multiFloor" value={formData.multiFloor} onChange={handleChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
            </div>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Current Challenges & Timeline</h3>
            <div className="form-section">
              <h4>Why Are You Requesting a Quote?</h4>
              <fieldset>
                <legend>Reasons for Quote (Select all that apply): <span className="required">*</span></legend>
                {reasonsForQuoteOptions.map((reason) => (
                  <label key={reason}>
                    <input
                      type="checkbox"
                      name="reasonsForQuote"
                      value={reason}
                      checked={formData.reasonsForQuote.includes(reason)}
                      onChange={handleChange}
                    />
                    {reason}
                  </label>
                ))}
                {errorMessage.includes('reasonsForQuote') && <span className="error-text">At least one reason is required</span>}
              </fieldset>
              <label>
                Additional Pain Points:
                <textarea
                  name="currentPainPoints"
                  value={formData.currentPainPoints}
                  onChange={handleChange}
                  placeholder="Describe any specific issues with your current setup"
                  rows="3"
                />
              </label>
              <label>
                Urgency Level: <span className="required">*</span>
                <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange} required className={errorMessage.includes('urgencyLevel') ? 'error' : ''}>
                  <option value="">Select Urgency</option>
                  <option value="Critical">Critical (Immediate)</option>
                  <option value="High">High (1-2 months)</option>
                  <option value="Medium">Medium (3-6 months)</option>
                  <option value="Low">Low (6+ months)</option>
                </select>
              </label>
              <label>
                Implementation Timeline: <span className="required">*</span>
                <select name="implementationTimeline" value={formData.implementationTimeline} onChange={handleChange} required className={errorMessage.includes('implementationTimeline') ? 'error' : ''}>
                  <option value="">Select Timeline</option>
                  <option value="ASAP">As soon as possible</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </label>
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Usage Patterns & Document Workflow</h3>
            <div className="form-section">
              <h4>Print Volume Analysis</h4>
              <label>
                Monthly Color Volume (pages): <span className="required">*</span>
                <input
                  type="number"
                  name="monthlyVolume.colour"
                  value={formData.monthlyVolume.colour}
                  onChange={handleChange}
                  placeholder="Color pages per month"
                  required
                  className={errorMessage.includes('monthlyVolume') ? 'error' : ''}
                />
              </label>
              <label>
                Monthly Mono Volume (pages): <span className="required">*</span>
                <input
                  type="number"
                  name="monthlyVolume.mono"
                  value={formData.monthlyVolume.mono}
                  onChange={handleChange}
                  placeholder="Black & white pages per month"
                  required
                  className={errorMessage.includes('monthlyVolume') ? 'error' : ''}
                />
              </label>
              <label>
                Peak Usage Periods:
                <select name="peakUsagePeriods" value={formData.peakUsagePeriods} onChange={handleChange}>
                  <option value="">Select Pattern</option>
                  <option value="Monday-Friday">Monday-Friday</option>
                  <option value="Weekends">Weekends Included</option>
                  <option value="Daily">Daily Consistent</option>
                  <option value="Month-end">Month-end Heavy</option>
                </select>
              </label>
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Technical Environment & Integration</h3>
            <div className="form-section">
              <h4>IT Infrastructure</h4>
              <label>
                Network Setup: <span className="required">*</span>
                <select name="networkSetup" value={formData.networkSetup} onChange={handleChange} required className={errorMessage.includes('networkSetup') ? 'error' : ''}>
                  <option value="">Select Network Type</option>
                  <option value="Wired only">Wired network only</option>
                  <option value="Wireless only">Wireless network only</option>
                  <option value="Mixed">Mixed (both wired and wireless)</option>
                  <option value="Cloud-based">Cloud-based infrastructure</option>
                </select>
              </label>
              <label>
                IT Support Structure: <span className="required">*</span>
                <select name="itSupportStructure" value={formData.itSupportStructure} onChange={handleChange} required className={errorMessage.includes('itSupportStructure') ? 'error' : ''}>
                  <option value="">Select IT Support</option>
                  <option value="Internal IT team">Internal IT team</option>
                  <option value="Outsourced IT">Outsourced IT support</option>
                  <option value="Hybrid">Hybrid (internal + external)</option>
                  <option value="Minimal IT support">Minimal IT support</option>
                  <option value="No dedicated IT">No dedicated IT support</option>
                </select>
              </label>
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Current Setup & Financial Analysis</h3>
            <div className="form-section">
              <h4>Current Copier Setup</h4>
              <label>
                Current Supplier:
                <input
                  type="text"
                  name="currentSetup.currentSupplier"
                  value={formData.currentSetup.currentSupplier}
                  onChange={handleChange}
                  placeholder="e.g., Xerox, Canon"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Current Copier Model:
                <input
                  type="text"
                  name="currentSetup.currentModel"
                  value={formData.currentSetup.currentModel}
                  onChange={handleChange}
                  placeholder="e.g., AltaLink C8030"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Current Copier Speed (PPM):
                <input
                  type="number"
                  name="currentSetup.currentSpeed"
                  value={formData.currentSetup.currentSpeed}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 30"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Contract Start Date:
                <input
                  type="date"
                  name="currentSetup.contractStartDate"
                  value={formData.currentSetup.contractStartDate}
                  onChange={handleChange}
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Contract End Date:
                <input
                  type="date"
                  name="currentSetup.contractEndDate"
                  value={formData.currentSetup.contractEndDate}
                  onChange={handleChange}
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Current Mono CPC (pence per page):
                <input
                  type="number"
                  name="currentSetup.currentMonoCPC"
                  value={formData.currentSetup.currentMonoCPC}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1.2"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Current Color CPC (pence per page):
                <input
                  type="number"
                  name="currentSetup.currentColorCPC"
                  value={formData.currentSetup.currentColorCPC}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 6.5"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <label>
                Current Quarterly Lease Cost (£):
                <input
                  type="number"
                  name="currentSetup.quarterlyLeaseCost"
                  value={formData.currentSetup.quarterlyLeaseCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 450.00"
                  className={errorMessage.includes('currentSetup') ? 'error' : ''}
                />
              </label>
              <fieldset>
                <legend>Current Copier Features:</legend>
                {currentFeatureOptions.map((feature) => (
                  <label key={feature}>
                    <input
                      type="checkbox"
                      name="currentSetup.currentFeatures"
                      value={feature}
                      checked={formData.currentSetup.currentFeatures.includes(feature)}
                      onChange={handleChange}
                    />
                    {feature}
                  </label>
                ))}
              </fieldset>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="currentSetup.buyoutRequired"
                  checked={formData.currentSetup.buyoutRequired}
                  onChange={handleChange}
                />
                Buyout of current contract required
              </label>
              {formData.currentSetup.buyoutRequired && (
                <>
                  <div className="buyout-info">
                    <h4>Estimated Buyout Cost</h4>
                    <p>£{calculateBuyout()}</p>
                  </div>
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      name="currentSetup.includeBuyoutInCosts"
                      checked={formData.currentSetup.includeBuyoutInCosts}
                      onChange={handleChange}
                    />
                    Include buyout cost in new quote costs
                  </label>
                </>
              )}
              {errorMessage.includes('currentSetup') && <span className="error-text">{errorMessage}</span>}
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Equipment Requirements & Specifications</h3>
            <div className="form-section">
              <h4>Basic Requirements</h4>
              <label>
                Service Type: <span className="required">*</span>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} required className={errorMessage.includes('serviceType') ? 'error' : ''}>
                  <option value="Photocopiers">Multifunction Photocopiers</option>
                  <option value="Printers">Desktop Printers</option>
                  <option value="Production">Production Printing</option>
                  <option value="Scanners">Standalone Scanners</option>
                  <option value="Mixed">Mixed Solution</option>
                </select>
              </label>
              <label>
                Colour Preference: <span className="required">*</span>
                <select name="colour" value={formData.colour} onChange={handleChange} required className={errorMessage.includes('colour') ? 'error' : ''}>
                  <option value="">Select Preference</option>
                  <option value="Black & White">Black & White Only</option>
                  <option value="Color">Color Required</option>
                  <option value="Both">Both (separate devices)</option>
                </select>
              </label>
              {formData.colour && (
                <label>
                  Maximum Paper Size: <span className="required">*</span>
                  <select name="type" value={formData.type} onChange={handleChange} required className={errorMessage.includes('type') ? 'error' : ''}>
                    <option value="">Select Size</option>
                    <option value="A4">A4 (Standard)</option>
                    <option value="A3">A3 (Larger format)</option>
                    <option value="A2">A2 (Wide format)</option>
                    <option value="SRA3">SRA3 (Oversized A3)</option>
                  </select>
                </label>
              )}
            </div>
            <div className="form-section">
              <h4>Document Upload</h4>
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Drag & drop recent invoices, floor plans, or equipment photos</p>
                <p className="text-muted">Accepted: PDF, Excel, Images</p>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  <p>{uploadedFiles.length} file(s) selected:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="remove-file"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {suggestedMachines.length > 0 && (
              <div className="form-section">
                <h4>AI-Powered Equipment Suggestions</h4>
                <ul>
                  {suggestedMachines.map((model, index) => (
                    <li key={index}>{model}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Service & Support Expectations</h3>
            <div className="form-section">
              <h4>Service Level Requirements</h4>
              <label>
                Response Time Expectation: <span className="required">*</span>
                <select name="responseTimeExpectation" value={formData.responseTimeExpectation} onChange={handleChange} required className={errorMessage.includes('responseTimeExpectation') ? 'error' : ''}>
                  <option value="">Select Response Time</option>
                  <option value="Same day">Same day (4-8 hours)</option>
                  <option value="Next business day">Next business day</option>
                  <option value="48 hours">Within 48 hours</option>
                  <option value="3-5 days">3-5 business days</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </label>
              <label>
                Maintenance Preference: <span className="required">*</span>
                <select name="maintenancePreference" value={formData.maintenancePreference} onChange={handleChange} required className={errorMessage.includes('maintenancePreference') ? 'error' : ''}>
                  <option value="">Select Preference</option>
                  <option value="Proactive">Proactive (scheduled preventive maintenance)</option>
                  <option value="Reactive">Reactive (fix when broken)</option>
                  <option value="Hybrid">Hybrid approach</option>
                  <option value="Self-service">Self-service with remote support</option>
                </select>
              </label>
              <label>
                Training Needs:
                <select name="trainingNeeds" value={formData.trainingNeeds} onChange={handleChange}>
                  <option value="">Select Training Needs</option>
                  <option value="Basic">Basic user training</option>
                  <option value="Advanced">Advanced admin training</option>
                  <option value="None">No training required</option>
                </select>
              </label>
              <label>
                Supply Management:
                <select name="supplyManagement" value={formData.supplyManagement} onChange={handleChange}>
                  <option value="">Select Supply Management</option>
                  <option value="Automatic">Automatic toner/supply replenishment</option>
                  <option value="Manual">Manual ordering</option>
                  <option value="Vendor-managed">Vendor-managed inventory</option>
                </select>
              </label>
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Decision Process & Commercial Framework</h3>
            <div className="form-section">
              <h4>Decision Making</h4>
              <fieldset>
                <legend>Key Decision Makers (Select all that apply): <span className="required">*</span></legend>
                {decisionMakerOptions.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      name="decisionMakers"
                      value={role}
                      checked={formData.decisionMakers.includes(role)}
                      onChange={handleChange}
                    />
                    {role}
                  </label>
                ))}
                {errorMessage.includes('decisionMakers') && <span className="error-text">At least one decision maker is required</span>}
              </fieldset>
              <label>
                What is most important to you? <span className="required">*</span>
                <select name="preference" value={formData.preference} onChange={handleChange} required className={errorMessage.includes('preference') ? 'error' : ''}>
                  <option value="">Select Priority</option>
                  <option value="cost">Lowest total cost</option>
                  <option value="quality">Best print quality</option>
                  <option value="speed">Fastest performance</option>
                  <option value="reliability">Maximum uptime/reliability</option>
                  <option value="balanced">Balanced approach</option>
                </select>
              </label>
              <label>
                Maximum Monthly Investment (£): <span className="required">*</span>
                <input
                  type="number"
                  name="max_lease_price"
                  value={formData.max_lease_price}
                  onChange={handleChange}
                  placeholder="Total monthly budget for all equipment/services"
                  required
                  className={errorMessage.includes('max_lease_price') ? 'error' : ''}
                />
              </label>
              <label>
                Contract Length Preference:
                <select name="contractLengthPreference" value={formData.contractLengthPreference} onChange={handleChange}>
                  <option value="">Select Term</option>
                  <option value="12 months">12 months</option>
                  <option value="24 months">24 months</option>
                  <option value="36 months">36 months</option>
                  <option value="48 months">48 months</option>
                  <option value="60 months">60 months</option>
                </select>
              </label>
              <label>
                Pricing Model Preference:
                <select name="pricingModelPreference" value={formData.pricingModelPreference} onChange={handleChange}>
                  <option value="">Select Model</option>
                  <option value="Lease">Lease (fixed monthly)</option>
                  <option value="CPC">Cost per copy</option>
                  <option value="Hybrid">Hybrid (lease + CPC)</option>
                </select>
              </label>
            </div>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Future Planning & Strategic Vision</h3>
            <div className="form-section">
              <h4>Growth & Expansion</h4>
              <label>
                Expected Business Growth: <span className="required">*</span>
                <select name="expectedGrowth" value={formData.expectedGrowth} onChange={handleChange} required className={errorMessage.includes('expectedGrowth') ? 'error' : ''}>
                  <option value="">Select Growth Expectation</option>
                  <option value="Decline">Decline/Downsizing</option>
                  <option value="Stable">Stable (no significant change)</option>
                  <option value="Moderate growth">Moderate growth (10-25%)</option>
                  <option value="Significant growth">Significant growth (25-50%)</option>
                  <option value="Rapid growth">Rapid growth (50%+)</option>
                  <option value="Uncertain">Uncertain</option>
                </select>
              </label>
              <label>
                3-Year Vision: <span className="required">*</span>
                <textarea
                  name="threeYearVision"
                  value={formData.threeYearVision}
                  onChange={handleChange}
                  placeholder="Where do you see your document/printing needs in 3 years?"
                  rows="4"
                  required
                  className={errorMessage.includes('threeYearVision') ? 'error' : ''}
                />
              </label>
              <label>
                Expansion Plans:
                <textarea
                  name="expansionPlans"
                  value={formData.expansionPlans}
                  onChange={handleChange}
                  placeholder="Any planned office expansions or new locations?"
                  rows="3"
                />
              </label>
              <label>
                Technology Roadmap:
                <textarea
                  name="technologyRoadmap"
                  value={formData.technologyRoadmap}
                  onChange={handleChange}
                  placeholder="How do you plan to integrate new technology?"
                  rows="3"
                />
              </label>
            </div>
            <div className="form-section">
              <h4>Final Review Summary</h4>
              <div className="review-section">
                <p><strong>Assessment Completion:</strong> 95% complete</p>
                <p><strong>Key Requirements Summary:</strong></p>
                <ul>
                  <li>Industry: {formData.industryType || 'Not specified'}</li>
                  <li>Monthly Volume: {(parseInt(formData.monthlyVolume.colour) || 0) + (parseInt(formData.monthlyVolume.mono) || 0)} pages</li>
                  <li>Current Supplier: {formData.currentSetup.currentSupplier || 'Not specified'}</li>
                  <li>Current Model: {formData.currentSetup.currentModel || 'Not specified'}</li>
                  <li>Reasons for Quote: {formData.reasonsForQuote.join(', ') || 'Not specified'}</li>
                  <li>Priority: {formData.preference || 'Not specified'}</li>
                  <li>Budget: £{formData.max_lease_price || 'Not specified'}/month</li>
                  <li>Timeline: {formData.implementationTimeline || 'Not specified'}</li>
                  {formData.currentSetup.buyoutRequired && (
                    <li>Buyout Cost: £{formData.currentSetup.buyoutCost || 'N/A'}</li>
                  )}
                </ul>
              </div>
            </div>
            <button onClick={handleBack}>Back</button>
            <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Comprehensive Assessment...' : 'Submit Complete Assessment'}
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Comprehensive Equipment Assessment</h2>
      <p className="text-center text-muted">Professional procurement analysis - 15-20 minutes</p>

      {submissionStatus === 'success' && (
        <div className="success-message" role="alert" style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {submissionStatus === 'error' && errorMessage && (
        <div className="error-message" role="alert" style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ❌ {errorMessage}
        </div>
      )}

      {submissionStatus === 'idle' && errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="progress-bar">
        <span>Step {step} of 9 - {Math.round((step / 9) * 100)}% Complete</span>
        <div style={{ width: `${(step / 9) * 100}%` }} className="progress" />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}
      </form>
    </div>
  );
};

export default EnhancedQuoteRequest;
