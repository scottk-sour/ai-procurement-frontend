```jsx
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

// Map form data to backend Quote schema
const mapFormDataToBackend = (formData, userProfile) => {
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
    minSpeed: parseInt(formData.min_speed) || undefined,
    type: formData.type || undefined,
    monthlyVolume: {
      mono: parseInt(formData.monthlyVolume?.mono) || 0,
      colour: parseInt(formData.monthlyVolume?.colour) || 0,
      total: (parseInt(formData.monthlyVolume?.mono) || 0) + (parseInt(formData.monthlyVolume?.colour) || 0) || 1
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
      minSpeed: parseInt(formData.min_speed) || undefined,
      maxNoiseLevel: undefined,
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
    ...(formData.organizationStructure && { organizationStructure: formData.organizationStructure }),
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
    if (type === 'checkbox') {
      if ([
        'primaryChallenges',
        'documentTypes',
        'finishingRequirements',
        'securityRequirements',
        'integrationNeeds',
        'additionalServices',
        'securityFeatures',
        'reportingNeeds',
        'decisionMakers',
        'evaluationCriteria',
        'required_functions',
        'reasonsForQuote',
        'currentSetup.currentFeatures',
        'departmentBreakdown'
      ].includes(name)) {
        const field = name.includes('.') ? name.split('.')[1] : name;
        const parent = name.includes('.') ? name.split('.')[0] : null;
        
        if (parent === 'currentSetup') {
          updatedData = {
            ...formData,
            currentSetup: {
              ...formData.currentSetup,
              [field]: checked
                ? [...(formData.currentSetup[field] || []), value]
                : (formData.currentSetup[field] || []).filter((item) => item !== value),
            }
          };
        } else {
          updatedData = {
            ...formData,
            [name]: checked
              ? [...(formData[name] || []), value]
              : (formData[name] || []).filter((item) => item !== value),
          };
        }
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
        if (!formData.currentEquipmentAge) errors.currentEquipmentAge = 'Current equipment age is required';
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
      setSuccessMessage('Quote request submitted successfully! AI matching in progress. Redirecting to your quotes page...');
      setErrorMessages({});
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
        currentEquipmentAge: '', currentSetup: {
          currentSupplier: '', currentModel: '', currentSpeed: '', contractStartDate: '',
          contractEndDate: '', currentMonoCPC: '', currentColorCPC: '', quarterlyLeaseCost: '',
          currentFeatures: [], buyoutRequired: false, buyoutCost: '', includeBuyoutInCosts: false
        },
        reasonsForQuote: [], totalAnnualCosts: '', hiddenCosts: '', serviceProvider: '',
        maintenanceIssues: '', additionalServices: [], paysForScanning: 'No', serviceType: 'Photocopiers',
        colour: '', type: '', min_speed: '', securityFeatures: [], accessibilityNeeds: 'No',
        sustainabilityGoals: '', responseTimeExpectation: '', maintenancePreference: '', trainingNeeds: '',
        supplyManagement: '', reportingNeeds: [], vendorRelationshipType: '', decisionMakers: [],
        evaluationCriteria: [], contractLengthPreference: '', pricingModelPreference: '', required_functions: [],
        preference: '', max_lease_price: '', roiExpectations: '', expectedGrowth: '', expansionPlans: '',
        technologyRoadmap: '', digitalTransformation: '', threeYearVision: ''
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
      className="form-step"
    >
      <h2>Company Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="companyName">Company Name *</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="Enter your company name"
            aria-describedby={errorMessages.companyName ? 'companyName-error' : undefined}
            className={errorMessages.companyName ? 'error' : ''}
          />
          {errorMessages.companyName && <span id="companyName-error" className="error-text">{errorMessages.companyName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="industryType">Industry Type *</label>
          <select
            id="industryType"
            name="industryType"
            value={formData.industryType}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.industryType ? 'industryType-error' : undefined}
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
          {errorMessages.industryType && <span id="industryType-error" className="error-text">{errorMessages.industryType}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="subSector">Sub-Sector</label>
          <input
            type="text"
            id="subSector"
            name="subSector"
            value={formData.subSector}
            onChange={handleChange}
            placeholder="e.g., Software Development, Medical Devices"
          />
        </div>
        <div className="form-group">
          <label htmlFor="annualRevenue">Annual Revenue</label>
          <select
            id="annualRevenue"
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleChange}
          >
            <option value="">Select Revenue Range</option>
            <option value="Under £1M">Under £1M</option>
            <option value="£1M - £5M">£1M - £5M</option>
            <option value="£5M - £10M">£5M - £10M</option>
            <option value="£10M - £50M">£10M - £50M</option>
            <option value="£50M - £100M">£50M - £100M</option>
            <option value="Over £100M">Over £100M</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="numEmployees">Total Number of Employees *</label>
          <input
            type="number"
            id="numEmployees"
            name="numEmployees"
            value={formData.numEmployees}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 50"
            aria-describedby={errorMessages.numEmployees ? 'numEmployees-error' : undefined}
            className={errorMessages.numEmployees ? 'error' : ''}
          />
          {errorMessages.numEmployees && <span id="numEmployees-error" className="error-text">{errorMessages.numEmployees}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="officeBasedEmployees">Office-Based Employees</label>
          <input
            type="number"
            id="officeBasedEmployees"
            name="officeBasedEmployees"
            value={formData.officeBasedEmployees}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 30"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numLocations">Number of Locations *</label>
          <input
            type="number"
            id="numLocations"
            name="numLocations"
            value={formData.numLocations}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 2"
            aria-describedby={errorMessages.numLocations ? 'numLocations-error' : undefined}
            className={errorMessages.numLocations ? 'error' : ''}
          />
          {errorMessages.numLocations && <span id="numLocations-error" className="error-text">{errorMessages.numLocations}</span>}
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
          <label htmlFor="postcode">Postcode *</label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            required
            placeholder="e.g., SW1A 1AA"
            aria-describedby={errorMessages.postcode ? 'postcode-error' : undefined}
            className={errorMessages.postcode ? 'error' : ''}
          />
          {errorMessages.postcode && <span id="postcode-error" className="error-text">{errorMessages.postcode}</span>}
        </div>
        <div className="form-group full-width">
          <label htmlFor="primaryBusinessActivity">Primary Business Activity</label>
          <textarea
            id="primaryBusinessActivity"
            name="primaryBusinessActivity"
            value={formData.primaryBusinessActivity}
            onChange={handleChange}
            placeholder="Brief description of your main business activities"
            rows="3"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="form-step"
    >
      <h2>Current Challenges & Requirements</h2>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Reasons for Requesting a Quote *</label>
          <div className="checkbox-group">
            {[
              'Current lease ending',
              'Expanding business',
              'Poor print quality',
              'High printing costs',
              'Frequent equipment breakdowns',
              'Slow printing speeds',
              'Limited functionality',
              'Need better security',
              'Environmental concerns',
              'Technology upgrade'
            ].map((reason) => (
              <label key={reason} className="checkbox-label">
                <input
                  type="checkbox"
                  name="reasonsForQuote"
                  value={reason}
                  checked={formData.reasonsForQuote.includes(reason)}
                  onChange={handleChange}
                  aria-describedby={errorMessages.reasonsForQuote ? 'reasonsForQuote-error' : undefined}
                />
                {reason}
              </label>
            ))}
          </div>
          {errorMessages.reasonsForQuote && <span id="reasonsForQuote-error" className="error-text">{errorMessages.reasonsForQuote}</span>}
        </div>
        <div className="form-group full-width">
          <label htmlFor="currentPainPoints">Current Pain Points</label>
          <textarea
            id="currentPainPoints"
            name="currentPainPoints"
            value={formData.currentPainPoints}
            onChange={handleChange}
            placeholder="Describe your current printing/copying challenges in detail"
            rows="4"
          />
        </div>
        <div className="form-group">
          <label htmlFor="urgencyLevel">Urgency Level *</label>
          <select
            id="urgencyLevel"
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.urgencyLevel ? 'urgencyLevel-error' : undefined}
            className={errorMessages.urgencyLevel ? 'error' : ''}
          >
            <option value="">Select Urgency</option>
            <option value="Critical - Within 1 week">Critical - Within 1 week</option>
            <option value="High - Within 1 month">High - Within 1 month</option>
            <option value="Medium - Within 3 months">Medium - Within 3 months</option>
            <option value="Low - 3+ months">Low - 3+ months</option>
          </select>
          {errorMessages.urgencyLevel && <span id="urgencyLevel-error" className="error-text">{errorMessages.urgencyLevel}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="implementationTimeline">Implementation Timeline *</label>
          <select
            id="implementationTimeline"
            name="implementationTimeline"
            value={formData.implementationTimeline}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.implementationTimeline ? 'implementationTimeline-error' : undefined}
            className={errorMessages.implementationTimeline ? 'error' : ''}
          >
            <option value="">Select Timeline</option>
            <option value="ASAP">ASAP</option>
            <option value="1-2 months">1-2 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="12+ months">12+ months</option>
          </select>
          {errorMessages.implementationTimeline && <span id="implementationTimeline-error" className="error-text">{errorMessages.implementationTimeline}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="impactOnProductivity">Impact on Productivity</label>
          <select
            id="impactOnProductivity"
            name="impactOnProductivity"
            value={formData.impactOnProductivity}
            onChange={handleChange}
          >
            <option value="">Select Impact</option>
            <option value="Severe - Work frequently stops">Severe - Work frequently stops</option>
            <option value="Moderate - Some delays">Moderate - Some delays</option>
            <option value="Minor - Occasional issues">Minor - Occasional issues</option>
            <option value="No impact">No impact</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="budgetCycle">Budget Cycle</label>
          <select
            id="budgetCycle"
            name="budgetCycle"
            value={formData.budgetCycle}
            onChange={handleChange}
          >
            <option value="">Select Budget Cycle</option>
            <option value="April - March">April - March</option>
            <option value="January - December">January - December</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="form-step"
    >
      <h2>Volume & Usage Requirements</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="monthlyVolume.mono">Monthly Mono Volume *</label>
          <input
            type="number"
            id="monthlyVolume.mono"
            name="monthlyVolume.mono"
            value={formData.monthlyVolume.mono}
            onChange={handleChange}
            required
            min="0"
            placeholder="e.g., 5000"
            aria-describedby={errorMessages.monthlyVolume ? 'monthlyVolume-error' : undefined}
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
          {errorMessages.monthlyVolume && <span id="monthlyVolume-error" className="error-text">{errorMessages.monthlyVolume}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="monthlyVolume.colour">Monthly Colour Volume *</label>
          <input
            type="number"
            id="monthlyVolume.colour"
            name="monthlyVolume.colour"
            value={formData.monthlyVolume.colour}
            onChange={handleChange}
            required
            min="0"
            placeholder="e.g., 1000"
            aria-describedby={errorMessages.monthlyVolume ? 'monthlyVolume-error' : undefined}
            className={errorMessages.monthlyVolume ? 'error' : ''}
          />
          {errorMessages.monthlyVolume && <span id="monthlyVolume-error" className="error-text">{errorMessages.monthlyVolume}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="peakUsagePeriods">Peak Usage Periods</label>
          <input
            type="text"
            id="peakUsagePeriods"
            name="peakUsagePeriods"
            value={formData.peakUsagePeriods}
            onChange={handleChange}
            placeholder="e.g., Month-end, Quarter-end"
          />
        </div>
        <div className="form-group">
          <label htmlFor="averagePageCount">Average Pages per Document</label>
          <select
            id="averagePageCount"
            name="averagePageCount"
            value={formData.averagePageCount}
            onChange={handleChange}
          >
            <option value="">Select Average</option>
            <option value="1-2 pages">1-2 pages</option>
            <option value="3-5 pages">3-5 pages</option>
            <option value="6-10 pages">6-10 pages</option>
            <option value="11-20 pages">11-20 pages</option>
            <option value="20+ pages">20+ pages</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label>Document Types</label>
          <div className="checkbox-group">
            {[
              'Standard office documents',
              'Presentations',
              'Marketing materials',
              'Technical drawings',
              'Forms and invoices',
              'Reports',
              'Legal documents',
              'Medical records'
            ].map((type) => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  name="documentTypes"
                  value={type}
                  checked={formData.documentTypes.includes(type)}
                  onChange={handleChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group full-width">
          <label>Finishing Requirements</label>
          <div className="checkbox-group">
            {[
              'Stapling',
              'Hole punching',
              'Folding',
              'Booklet making',
              'Laminating',
              'Binding'
            ].map((requirement) => (
              <label key={requirement} className="checkbox-label">
                <input
                  type="checkbox"
                  name="finishingRequirements"
                  value={requirement}
                  checked={formData.finishingRequirements.includes(requirement)}
                  onChange={handleChange}
                />
                {requirement}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group full-width">
          <label>Department Breakdown</label>
          <div className="checkbox-group">
            {[
              'Administration',
              'Sales',
              'Marketing',
              'Finance',
              'HR',
              'IT',
              'Operations',
              'Other'
            ].map((dept) => (
              <label key={dept} className="checkbox-label">
                <input
                  type="checkbox"
                  name="departmentBreakdown"
                  value={dept}
                  checked={formData.departmentBreakdown.includes(dept)}
                  onChange={handleChange}
                />
                {dept}
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
      className="form-step"
    >
      <h2>IT Infrastructure & Integration</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="networkSetup">Network Setup *</label>
          <select
            id="networkSetup"
            name="networkSetup"
            value={formData.networkSetup}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.networkSetup ? 'networkSetup-error' : undefined}
            className={errorMessages.networkSetup ? 'error' : ''}
          >
            <option value="">Select Network Setup</option>
            <option value="Wired network only">Wired network only</option>
            <option value="Wireless network only">Wireless network only</option>
            <option value="Mixed wired/wireless">Mixed wired/wireless</option>
            <option value="Cloud-based">Cloud-based</option>
          </select>
          {errorMessages.networkSetup && <span id="networkSetup-error" className="error-text">{errorMessages.networkSetup}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="itSupportStructure">IT Support Structure *</label>
          <select
            id="itSupportStructure"
            name="itSupportStructure"
            value={formData.itSupportStructure}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.itSupportStructure ? 'itSupportStructure-error' : undefined}
            className={errorMessages.itSupportStructure ? 'error' : ''}
          >
            <option value="">Select Support Structure</option>
            <option value="In-house IT team">In-house IT team</option>
            <option value="Outsourced IT">Outsourced IT</option>
            <option value="Mixed support">Mixed support</option>
            <option value="No dedicated IT">No dedicated IT</option>
          </select>
          {errorMessages.itSupportStructure && <span id="itSupportStructure-error" className="error-text">{errorMessages.itSupportStructure}</span>}
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
          <label htmlFor="cloudPreference">Cloud Preference</label>
          <select
            id="cloudPreference"
            name="cloudPreference"
            value={formData.cloudPreference}
            onChange={handleChange}
          >
            <option value="">Select Preference</option>
            <option value="Cloud-first">Cloud-first</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-premise preferred">On-premise preferred</option>
            <option value="No preference">No preference</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="mobileRequirements">Mobile Printing Requirements</label>
          <select
            id="mobileRequirements"
            name="mobileRequirements"
            value={formData.mobileRequirements}
            onChange={handleChange}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="remoteWorkImpact">Remote Work Impact</label>
          <textarea
            id="remoteWorkImpact"
            name="remoteWorkImpact"
            value={formData.remoteWorkImpact}
            onChange={handleChange}
            placeholder="How has remote work affected your printing needs?"
            rows="3"
          />
        </div>
        <div className="form-group full-width">
          <label>Security Requirements</label>
          <div className="checkbox-group">
            {[
              'User authentication',
              'Secure print release',
              'Data encryption',
              'Network security',
              'Audit trail',
              'GDPR compliance',
              'Industry-specific compliance'
            ].map((requirement) => (
              <label key={requirement} className="checkbox-label">
                <input
                  type="checkbox"
                  name="securityRequirements"
                  value={requirement}
                  checked={formData.securityRequirements.includes(requirement)}
                  onChange={handleChange}
                />
                {requirement}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group full-width">
          <label>Integration Needs</label>
          <div className="checkbox-group">
            {[
              'Email integration',
              'CRM integration',
              'Document management system',
              'ERP integration',
              'Cloud storage integration',
              'Custom software integration'
            ].map((need) => (
              <label key={need} className="checkbox-label">
                <input
                  type="checkbox"
                  name="integrationNeeds"
                  value={need}
                  checked={formData.integrationNeeds.includes(need)}
                  onChange={handleChange}
                />
                {need}
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
      className="form-step"
    >
      <h2>Current Equipment & Costs</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="currentEquipmentAge">Current Equipment Age *</label>
          <select
            id="currentEquipmentAge"
            name="currentEquipmentAge"
            value={formData.currentEquipmentAge}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.currentEquipmentAge ? 'currentEquipmentAge-error' : undefined}
            className={errorMessages.currentEquipmentAge ? 'error' : ''}
          >
            <option value="">Select Equipment Age</option>
            <option value="No current equipment">No current equipment</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-2 years">1-2 years</option>
            <option value="2-5 years">2-5 years</option>
            <option value="5-6 years">5-6 years</option>
            <option value="Over 6 years">Over 6 years</option>
            <option value="Mixed ages">Mixed ages</option>
          </select>
          {errorMessages.currentEquipmentAge && <span id="currentEquipmentAge-error" className="error-text">{errorMessages.currentEquipmentAge}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.currentSupplier">Current Supplier</label>
          <input
            type="text"
            id="currentSetup.currentSupplier"
            name="currentSetup.currentSupplier"
            value={formData.currentSetup.currentSupplier}
            onChange={handleChange}
            placeholder="e.g., Canon, Xerox, HP"
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
            placeholder="e.g., imageRUNNER ADVANCE C3530i"
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
            min="1"
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
            placeholder="e.g., 0.8"
            step="0.01"
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="currentSetup.currentColorCPC">Current Color CPC (pence)</label>
          <input
            type="number"
            id="currentSetup.currentColorCPC"
            name="currentSetup.currentColorCPC"
            value={formData.currentSetup.currentColorCPC}
            onChange={handleChange}
            placeholder="e.g., 8.5"
            step="0.01"
            min="0"
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
            placeholder="e.g., 450"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Estimated Buyout Cost: £{calculateBuyout()}</label>
          <div className="checkbox-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="currentSetup.buyoutRequired"
                checked={formData.currentSetup.buyoutRequired}
                onChange={handleChange}
              />
              Buyout required
            </label>
          </div>
          {formData.currentSetup.buyoutRequired && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="currentSetup.includeBuyoutInCosts"
                checked={formData.currentSetup.includeBuyoutInCosts}
                onChange={handleChange}
              />
              Include buyout in new contract costs
            </label>
          )}
        </div>
        <div className="form-group full-width">
          <label>Current Features</label>
          <div className="checkbox-group">
            {[
              'Duplex Printing',
              'Wireless Printing',
              'Mobile Printing',
              'Cloud Integration',
              'Advanced Security',
              'Large Paper Trays',
              'High Capacity Toner',
              'Color Printing',
              'Scanning',
              'Fax',
              'Copying',
              'Email Integration',
              'Stapling',
              'Hole Punch',
              'Booklet Making',
              'Large Capacity Trays',
              'Touch Screen',
              'Auto Document Feeder',
              'ID Card Copying',
              'Follow-Me Print'
            ].map((feature) => (
              <label key={feature} className="checkbox-label">
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
          </div>
        </div>
        <div className="form-group full-width">
          <label htmlFor="totalAnnualCosts">Total Annual Costs</label>
          <input
            type="number"
            id="totalAnnualCosts"
            name="totalAnnualCosts"
            value={formData.totalAnnualCosts}
            onChange={handleChange}
            placeholder="Total annual cost including lease, service, supplies"
            min="0"
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="hiddenCosts">Hidden Costs</label>
          <textarea
            id="hiddenCosts"
            name="hiddenCosts"
            value={formData.hiddenCosts}
            onChange={handleChange}
            placeholder="Any unexpected or hidden costs you've encountered"
            rows="3"
          />
        </div>
        <div className="form-group full-width">
          <label>AI Suggested Machines</label>
          {suggestedMachines.length > 0 ? (
            <div className="suggested-machines">
              {suggestedMachines.map((machine, index) => (
                <div key={index} className="machine-suggestion">
                  <h4>{machine.brand} {machine.model}</h4>
                  <p>Speed: {machine.speed} PPM | Confidence: {machine.confidence}%</p>
                  <p>{machine.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No suggestions available yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderStep6 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="form-step"
    >
      <h2>Equipment Specifications</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="serviceType">Service Type *</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.serviceType ? 'serviceType-error' : undefined}
            className={errorMessages.serviceType ? 'error' : ''}
          >
            <option value="">Select Service Type</option>
            <option value="Photocopiers">Photocopiers</option>
            <option value="Multi-Function Devices">Multi-Function Devices</option>
            <option value="Printers Only">Printers Only</option>
            <option value="Production Printing">Production Printing</option>
          </select>
          {errorMessages.serviceType && <span id="serviceType-error" className="error-text">{errorMessages.serviceType}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="colour">Colour Requirements *</label>
          <select
            id="colour"
            name="colour"
            value={formData.colour}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.colour ? 'colour-error' : undefined}
            className={errorMessages.colour ? 'error' : ''}
          >
            <option value="">Select Colour Requirement</option>
            <option value="Mono only">Mono only</option>
            <option value="Colour required">Colour required</option>
            <option value="Both mono and colour">Both mono and colour</option>
          </select>
          {errorMessages.colour && <span id="colour-error" className="error-text">{errorMessages.colour}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="type">Maximum Paper Size *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.type ? 'type-error' : undefined}
            className={errorMessages.type ? 'error' : ''}
          >
            <option value="">Select Paper Size</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="A2">A2</option>
            <option value="SRA3">SRA3</option>
          </select>
          {errorMessages.type && <span id="type-error" className="error-text">{errorMessages.type}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="min_speed">Minimum Speed (PPM)</label>
          <input
            type="number"
            id="min_speed"
            name="min_speed"
            value={formData.min_speed}
            onChange={handleChange}
            placeholder="Auto-suggested based on volume"
            min="1"
          />
          <small>Suggested based on your monthly volume</small>
        </div>
        <div className="form-group full-width">
          <label>Required Functions</label>
          <div className="checkbox-group">
            {[
              'Duplex Printing',
              'Wireless Printing',
              'Mobile Printing',
              'Cloud Integration',
              'Advanced Security',
              'Large Paper Trays',
              'High Capacity Toner',
              'Color Printing',
              'Scanning',
              'Fax',
              'Copying',
              'Email Integration',
              'Stapling',
              'Hole Punch',
              'Booklet Making',
              'Touch Screen',
              'Auto Document Feeder',
              'ID Card Copying',
              'Follow-Me Print'
            ].map((func) => (
              <label key={func} className="checkbox-label">
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
          </div>
        </div>
        <div className="form-group full-width">
          <label>Security Features</label>
          <div className="checkbox-group">
            {[
              'User Authentication',
              'Secure Print Release',
              'Data Encryption',
              'Network Security',
              'Audit Trail',
              'Card Reader Integration',
              'PIN Code Access'
            ].map((feature) => (
              <label key={feature} className="checkbox-label">
                <input
                  type="checkbox"
                  name="securityFeatures"
                  value={feature}
                  checked={formData.securityFeatures.includes(feature)}
                  onChange={handleChange}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="accessibilityNeeds">Accessibility Requirements</label>
          <select
            id="accessibilityNeeds"
            name="accessibilityNeeds"
            value={formData.accessibilityNeeds}
            onChange={handleChange}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label htmlFor="sustainabilityGoals">Sustainability Goals</label>
          <textarea
            id="sustainabilityGoals"
            name="sustainabilityGoals"
            value={formData.sustainabilityGoals}
            onChange={handleChange}
            placeholder="Any environmental or sustainability requirements"
            rows="3"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep7 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="form-step"
    >
      <h2>Service & Support Requirements</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="responseTimeExpectation">Response Time Expectation *</label>
          <select
            id="responseTimeExpectation"
            name="responseTimeExpectation"
            value={formData.responseTimeExpectation}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.responseTimeExpectation ? 'responseTimeExpectation-error' : undefined}
            className={errorMessages.responseTimeExpectation ? 'error' : ''}
          >
            <option value="">Select Response Time</option>
            <option value="Same day">Same day</option>
            <option value="Next working day">Next working day</option>
            <option value="Within 48 hours">Within 48 hours</option>
            <option value="Within 1 week">Within 1 week</option>
          </select>
          {errorMessages.responseTimeExpectation && <span id="responseTimeExpectation-error" className="error-text">{errorMessages.responseTimeExpectation}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="maintenancePreference">Maintenance Preference *</label>
          <select
            id="maintenancePreference"
            name="maintenancePreference"
            value={formData.maintenancePreference}
            onChange={handleChange}
            required
            aria-describedby={errorMessages.maintenancePreference ? 'maintenancePreference-error' : undefined}
            className={errorMessages.maintenancePreference ? 'error' : ''}
          >
            <option value="">Select Preference</option>
            <option value="Full service included">Full service included</option>
            <option value="Parts and labour only">Parts and labour only</option>
            <option value="Basic maintenance only">Basic maintenance only</option>
            <option value="Self-maintenance">Self-maintenance</option>
          </select>
          {errorMessages.maintenancePreference && <span id="maintenancePreference-error" className="error-text">{errorMessages.maintenancePreference}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="trainingNeeds">Training Requirements</label>
          <textarea
            id="trainingNeeds"
            name="trainingNeeds"
            value={formData.trainingNeeds}
            onChange={handleChange}
            placeholder="What training do your staff need?"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="supplyManagement">Supply Management Preference</label>
          <select
            id="supplyManagement"
            name="supplyManagement"
            value={formData.supplyManagement}
            onChange={handleChange}
          >
            <option value="">Select Preference</option>
            <option value="Automatic supply delivery">Automatic supply delivery</option>
            <option value="Order as needed">Order as needed</option>
            <option value="Self-managed supplies">Self-managed supplies</option>
            <option value="Mixed approach">Mixed approach</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label>Additional Services</label>
          <div className="checkbox-group">
            {[
              'Document management',
              'Workflow automation',
              'Cloud integration',
              'Mobile app support',
              'Remote monitoring',
              'Usage reporting',
              'Cost center tracking',
              'Environmental reporting'
            ].map((service) => (
              <label key={service} className="checkbox-label">
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
          </div>
        </div>
        <div className="form-group full-width">
          <label>Reporting Needs</label>
          <div className="checkbox-group">
            {[
              'Usage reports',
              'Cost reports',
              'Environmental reports',
              'Maintenance reports',
              'User activity reports',
              'Department breakdown',
              'Custom reporting'
            ].map((report) => (
              <label key={report} className="checkbox-label">
                <input
                  type="checkbox"
                  name="reportingNeeds"
                  value={report}
                  checked={formData.reportingNeeds.includes(report)}
                  onChange={handleChange}
                />
                {report}
              </label>
            ))}
          </div>
        </
