import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './EnhancedQuoteRequest.css';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// FIXED: Hard-coded production URL
const PRODUCTION_API_URL = 'https://ai-procurement-backend-q35u.onrender.com';

// AI-driven copier suggestion function using an external API
const suggestCopiers = async (data) => {
  // ✅ FIXED: Use hard-coded production URL
  const API_KEY = process.env.REACT_APP_AI_API_KEY;
  if (!API_KEY) {
    console.warn('AI API KEY is missing in .env - skipping AI suggestions');
    return [];
  }
  try {
    // ✅ FIXED: Use the hard-coded production URL
    const response = await fetch(`${PRODUCTION_API_URL}/api/suggest-copiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // Don't throw error for missing AI endpoint, just return empty array
      console.warn('AI suggestions endpoint not available');
      return [];
    }
    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.warn('AI suggestions not available:', error.message);
    return []; // Return empty array instead of throwing error
  }
};

// Transform frontend data to match backend schema
const transformQuoteData = (formData, userProfile) => {
  console.log('🔍 Starting transformation with formData:', formData);
  console.log('🔍 UserProfile:', userProfile);
 
  // Map frontend industry types to backend enum values
  const industryMapping = {
    'Technology': 'Other',
    'Real Estate': 'Other',
    'Non-profit': 'Other',
    'Healthcare': 'Healthcare',
    'Legal': 'Legal',
    'Education': 'Education',
    'Finance': 'Finance',
    'Manufacturing': 'Manufacturing',
    'Retail': 'Retail',
    'Government': 'Government',
    'Other': 'Other'
  };
  // Map frontend timeframes to backend enum values
  const timeframeMapping = {
    'ASAP': 'ASAP',
    'As soon as possible': 'ASAP',
    '1-2 months': '1-2 months',
    '3-6 months': '3-6 months',
    '6-12 months': '6-12 months',
    '12+ months': '12+ months'
  };
  // Map frontend equipment age to backend enum values
  const ageMapping = {
    'Less than 1 year': '0-2 years',
    '1-2 years': '0-2 years',
    '3-4 years': '2-5 years',
    '5-6 years': '5+ years',
    'Over 6 years': '5+ years',
    'Mixed ages': '5+ years',
    '': 'No current machine'
  };
  // Calculate total monthly volume
  const monthlyColour = parseInt(formData.monthlyVolume?.colour) || 0;
  const monthlyMono = parseInt(formData.monthlyVolume?.mono) || 0;
  const totalVolume = monthlyColour + monthlyMono;
 
  // Ensure we have valid values for required fields
  const transformedData = {
    // Required fields - with fallbacks
    companyName: formData.companyName || 'Unknown Company',
    contactName: userProfile?.name || userProfile?.username || formData.contactName || 'Unknown Contact',
    email: userProfile?.email || formData.email || 'unknown@example.com',
   
    // Industry type with proper mapping
    industryType: industryMapping[formData.industryType] || 'Other',
   
    // Required numbers with validation
    numEmployees: Math.max(1, parseInt(formData.numEmployees) || 1),
    numLocations: Math.max(1, parseInt(formData.numLocations) || 1),
   
    // Monthly volume - required object with minimum values
    monthlyVolume: {
      mono: Math.max(0, monthlyMono),
      colour: Math.max(0, monthlyColour),
      total: Math.max(1, totalVolume) // Backend requires at least 1
    },
   
    // Paper requirements - required object
    paperRequirements: {
      primarySize: formData.type || formData.paperSize || 'A4'
    },
   
    // Current setup - required object
    currentSetup: {
      machineAge: ageMapping[formData.currentEquipmentAge] || 'No current machine'
    },
   
    // Requirements - required object
    requirements: {
      priority: formData.preference || 'balanced'
    },
   
    // Budget - required object with minimum value
    budget: {
      maxLeasePrice: Math.max(1, parseInt(formData.max_lease_price) || 100)
    },
   
    // Urgency - required object
    urgency: {
      timeframe: timeframeMapping[formData.implementationTimeline] || 'ASAP'
    },
   
    // Location - required object
    location: {
      postcode: formData.postcode || 'Unknown'
    },
   
    // System fields - CRITICAL: Must have valid IDs
    submittedBy: userProfile?.id || userProfile?.userId || userProfile?._id || 'temp_user_id',
    userId: userProfile?.id || userProfile?.userId || userProfile?._id, // Add userId for backend
    status: 'pending', // FIXED: Use lowercase 'pending'
    submissionSource: 'web_form',
   
    // Optional fields - only include if they have values
    ...(formData.subSector && { subSector: formData.subSector }),
    ...(formData.annualRevenue && { annualRevenue: formData.annualRevenue }),
    ...(formData.officeBasedEmployees && { officeBasedEmployees: parseInt(formData.officeBasedEmployees) }),
    ...(formData.primaryBusinessActivity && { primaryBusinessActivity: formData.primaryBusinessActivity }),
    ...(formData.organizationStructure && { organizationStructure: formData.organizationStructure }),
    ...(formData.multiFloor && { multiFloor: formData.multiFloor === 'Yes' }),
    ...(formData.primaryChallenges?.length > 0 && { primaryChallenges: formData.primaryChallenges }),
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
    ...(formData.networkSetup && { networkSetup: formData.networkSetup }),
    ...(formData.itSupportStructure && { itSupportStructure: formData.itSupportStructure }),
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
    ...(formData.serviceType && { serviceType: formData.serviceType }),
    ...(formData.colour && { colour: formData.colour }),
    ...(formData.min_speed && { min_speed: parseInt(formData.min_speed) }),
    ...(formData.securityFeatures?.length > 0 && { securityFeatures: formData.securityFeatures }),
    ...(formData.accessibilityNeeds && { accessibilityNeeds: formData.accessibilityNeeds === 'Yes' }),
    ...(formData.sustainabilityGoals && { sustainabilityGoals: formData.sustainabilityGoals }),
    ...(formData.responseTimeExpectation && { responseTimeExpectation: formData.responseTimeExpectation }),
    ...(formData.maintenancePreference && { maintenancePreference: formData.maintenancePreference }),
    ...(formData.trainingNeeds && { trainingNeeds: formData.trainingNeeds }),
    ...(formData.supplyManagement && { supplyManagement: formData.supplyManagement }),
    ...(formData.reportingNeeds?.length > 0 && { reportingNeeds: formData.reportingNeeds }),
    ...(formData.vendorRelationshipType && { vendorRelationshipType: formData.vendorRelationshipType }),
    ...(formData.decisionMakers?.length > 0 && { decisionMakers: formData.decisionMakers }),
    ...(formData.evaluationCriteria?.length > 0 && { evaluationCriteria: formData.evaluationCriteria }),
    ...(formData.contractLengthPreference && { contractLengthPreference: formData.contractLengthPreference }),
    ...(formData.pricingModelPreference && { pricingModelPreference: formData.pricingModelPreference }),
    ...(formData.roiExpectations && { roiExpectations: formData.roiExpectations }),
    ...(formData.expectedGrowth && { expectedGrowth: formData.expectedGrowth }),
    ...(formData.expansionPlans && { expansionPlans: formData.expansionPlans }),
    ...(formData.technologyRoadmap && { technologyRoadmap: formData.technologyRoadmap }),
    ...(formData.digitalTransformation && { digitalTransformation: formData.digitalTransformation }),
    ...(formData.threeYearVision && { threeYearVision: formData.threeYearVision })
  };
 
  // Force the correct status and remove any incorrect fields
  transformedData.status = 'pending'; // Force lowercase
 
  console.log('✅ Transformation complete. Result:', transformedData);
  return transformedData;
};

const EnhancedQuoteRequest = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Profile & Context
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
    postcode: '', // Added missing field
   
    // Step 2: Current Challenges & Timeline
    primaryChallenges: [],
    currentPainPoints: '',
    impactOnProductivity: '',
    urgencyLevel: '',
    implementationTimeline: '',
    budgetCycle: '',
   
    // Step 3: Usage Patterns & Document Workflow
    monthlyPrintVolume: '',
    annualPrintVolume: '',
    monthlyVolume: { colour: '', mono: '' },
    peakUsagePeriods: '',
    documentTypes: [],
    averagePageCount: '',
    finishingRequirements: [],
    departmentBreakdown: [],
   
    // Step 4: Technical Environment & Integration
    networkSetup: '',
    itSupportStructure: '',
    securityRequirements: [],
    currentSoftwareEnvironment: '',
    cloudPreference: '',
    integrationNeeds: [],
    mobileRequirements: 'No',
    remoteWorkImpact: '',
   
    // Step 5: Current Setup & Costs
    currentColorCPC: '',
    currentMonoCPC: '',
    quarterlyLeaseCost: '',
    totalAnnualCosts: '',
    hiddenCosts: '',
    leasingCompany: '',
    serviceProvider: '',
    contractStartDate: '',
    contractEndDate: '',
    currentEquipmentAge: '',
    maintenanceIssues: '',
   
    // Step 6: Requirements & Specifications
    additionalServices: [],
    paysForScanning: 'No',
    serviceType: 'Photocopiers',
    colour: '',
    type: '',
    min_speed: '',
    securityFeatures: [],
    accessibilityNeeds: 'No',
    sustainabilityGoals: '',
   
    // Step 7: Service & Support Expectations
    responseTimeExpectation: '',
    maintenancePreference: '',
    trainingNeeds: '',
    supplyManagement: '',
    reportingNeeds: [],
    vendorRelationshipType: '',
   
    // Step 8: Decision Process & Commercial
    decisionMakers: [],
    evaluationCriteria: [],
    contractLengthPreference: '',
    pricingModelPreference: '',
    required_functions: [],
    preference: '',
    max_lease_price: '',
    roiExpectations: '',
   
    // Step 9: Future Planning
    expectedGrowth: '',
    expansionPlans: '',
    technologyRoadmap: '',
    digitalTransformation: '',
    threeYearVision: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestedMachines, setSuggestedMachines] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedData;
   
    if (type === 'checkbox') {
      if (['primaryChallenges', 'documentTypes', 'finishingRequirements', 'securityRequirements',
           'integrationNeeds', 'additionalServices', 'securityFeatures', 'reportingNeeds',
           'decisionMakers', 'evaluationCriteria', 'required_functions'].includes(name)) {
        updatedData = {
          ...formData,
          [name]: checked
            ? [...formData[name], value]
            : formData[name].filter((item) => item !== value),
        };
      }
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
    // Fetch AI suggestions when key fields are updated (only if AI endpoint exists)
    if (['monthlyPrintVolume', 'min_speed', 'type', 'colour', 'required_functions', 'industryType'].includes(name)) {
      suggestCopiers(updatedData).then((suggestions) => {
        setSuggestedMachines(suggestions);
      }).catch(error => {
        console.warn('AI suggestions not available:', error);
      });
    }
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
      // Only include specific fields we want, don't spread the original data
      companyName: data.companyName,
      industryType: data.industryType,
      subSector: data.subSector,
      annualRevenue: data.annualRevenue,
      numEmployees: data.numEmployees ? parseInt(data.numEmployees, 10) : undefined,
      officeBasedEmployees: data.officeBasedEmployees ? parseInt(data.officeBasedEmployees, 10) : undefined,
      numLocations: data.numLocations ? Math.abs(parseInt(data.numLocations, 10)) || 1 : 1,
      primaryBusinessActivity: data.primaryBusinessActivity,
      organizationStructure: data.organizationStructure,
      multiFloor: data.multiFloor && data.multiFloor.toLowerCase() === 'yes',
      postcode: data.postcode,
      primaryChallenges: data.primaryChallenges,
      currentPainPoints: data.currentPainPoints,
      impactOnProductivity: data.impactOnProductivity,
      urgencyLevel: data.urgencyLevel,
      implementationTimeline: data.implementationTimeline,
      budgetCycle: data.budgetCycle,
      monthlyPrintVolume: data.monthlyPrintVolume ? parseInt(data.monthlyPrintVolume, 10) : undefined,
      annualPrintVolume: data.annualPrintVolume ? parseInt(data.annualPrintVolume, 10) : undefined,
      monthlyVolume: {
        colour: data.monthlyVolume.colour ? parseInt(data.monthlyVolume.colour, 10) : 0,
        mono: data.monthlyVolume.mono ? parseInt(data.monthlyVolume.mono, 10) : 0,
      },
      peakUsagePeriods: data.peakUsagePeriods,
      documentTypes: data.documentTypes,
      averagePageCount: data.averagePageCount,
      finishingRequirements: data.finishingRequirements,
      departmentBreakdown: data.departmentBreakdown,
      networkSetup: data.networkSetup,
      itSupportStructure: data.itSupportStructure,
      securityRequirements: data.securityRequirements,
      currentSoftwareEnvironment: data.currentSoftwareEnvironment,
      cloudPreference: data.cloudPreference,
      integrationNeeds: data.integrationNeeds,
      mobileRequirements: data.mobileRequirements && data.mobileRequirements.toLowerCase() === 'yes',
      remoteWorkImpact: data.remoteWorkImpact,
      currentColorCPC: data.currentColorCPC ? parseFloat(data.currentColorCPC) : undefined,
      currentMonoCPC: data.currentMonoCPC ? parseFloat(data.currentMonoCPC) : undefined,
      quarterlyLeaseCost: data.quarterlyLeaseCost ? parseFloat(data.quarterlyLeaseCost) : undefined,
      totalAnnualCosts: data.totalAnnualCosts ? parseFloat(data.totalAnnualCosts) : undefined,
      hiddenCosts: data.hiddenCosts,
      leasingCompany: data.leasingCompany,
      serviceProvider: data.serviceProvider,
      contractStartDate: data.contractStartDate,
      contractEndDate: data.contractEndDate,
      currentEquipmentAge: data.currentEquipmentAge,
      maintenanceIssues: data.maintenanceIssues,
      additionalServices: data.additionalServices,
      paysForScanning: data.paysForScanning && data.paysForScanning.toLowerCase() === 'yes',
      serviceType: data.serviceType,
      colour: data.colour,
      type: data.type,
      min_speed: data.min_speed ? parseInt(data.min_speed, 10) : undefined,
      securityFeatures: data.securityFeatures,
      accessibilityNeeds: data.accessibilityNeeds && data.accessibilityNeeds.toLowerCase() === 'yes',
      sustainabilityGoals: data.sustainabilityGoals,
      responseTimeExpectation: data.responseTimeExpectation,
      maintenancePreference: data.maintenancePreference,
      trainingNeeds: data.trainingNeeds,
      supplyManagement: data.supplyManagement,
      reportingNeeds: data.reportingNeeds,
      vendorRelationshipType: data.vendorRelationshipType,
      decisionMakers: data.decisionMakers,
      evaluationCriteria: data.evaluationCriteria,
      contractLengthPreference: data.contractLengthPreference,
      pricingModelPreference: data.pricingModelPreference,
      required_functions: data.required_functions,
      preference: data.preference,
      max_lease_price: data.max_lease_price ? parseInt(data.max_lease_price, 10) : undefined,
      roiExpectations: data.roiExpectations,
      expectedGrowth: data.expectedGrowth,
      expansionPlans: data.expansionPlans,
      technologyRoadmap: data.technologyRoadmap,
      digitalTransformation: data.digitalTransformation,
      threeYearVision: data.threeYearVision
      // Do NOT include status here - let transformation handle it
      // Do NOT use ...data to avoid copying unwanted fields
    };
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.industryType && formData.numEmployees && formData.numLocations && formData.postcode;
      case 2:
        return formData.primaryChallenges.length > 0 && formData.urgencyLevel && formData.implementationTimeline;
      case 3:
        return formData.monthlyVolume.colour !== '' && formData.monthlyVolume.mono !== '';
      case 4:
        return formData.networkSetup && formData.itSupportStructure;
      case 5:
        return true; // Optional financial fields
      case 6:
        return formData.serviceType && formData.colour && formData.type;
      case 7:
        return formData.responseTimeExpectation && formData.maintenancePreference;
      case 8:
        return formData.decisionMakers.length > 0 && formData.preference && formData.max_lease_price;
      case 9:
        return formData.expectedGrowth && formData.threeYearVision;
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
    console.log('🔍 FILE VERSION CHECK: Updated transformation file is being used');
    console.log('🔍 Original formData before formatting:', formData);
   
    if (!validateStep(9)) {
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
    const userProfile = {
      id: userId,
      name: auth?.user?.name || auth?.user?.username,
      email: auth?.user?.email,
      userId: userId
    };
    if (!token || !userId) {
      alert('Authentication failed. Please log in again.');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }
    const formattedData = formatFormData(formData);
    console.log('📝 Formatted data:', formattedData);
   
    const transformedData = transformQuoteData(formattedData, userProfile);
   
    // FORCE CORRECT VALUES AFTER TRANSFORMATION
    transformedData.status = 'pending'; // Force lowercase
   
    console.log('🔄 Final transformed data (after fixes):', transformedData);
   
    // Add validation to catch transformation issues
    const validateTransformedData = (data) => {
      const errors = [];
     
      // Check required fields exist and have values
      const requiredChecks = [
        { field: 'companyName', value: data.companyName },
        { field: 'contactName', value: data.contactName },
        { field: 'email', value: data.email },
        { field: 'location.postcode', value: data.location?.postcode },
        { field: 'urgency.timeframe', value: data.urgency?.timeframe },
        { field: 'budget.maxLeasePrice', value: data.budget?.maxLeasePrice },
        { field: 'requirements.priority', value: data.requirements?.priority },
        { field: 'currentSetup.machineAge', value: data.currentSetup?.machineAge },
        { field: 'paperRequirements.primarySize', value: data.paperRequirements?.primarySize },
        { field: 'monthlyVolume.total', value: data.monthlyVolume?.total },
        { field: 'numLocations', value: data.numLocations },
        { field: 'submittedBy', value: data.submittedBy }
      ];
     
      requiredChecks.forEach(check => {
        if (!check.value || check.value === '' || check.value === 0) {
          errors.push(`${check.field} is missing or empty (value: ${check.value})`);
        }
      });
     
      // Check enum values
      const validIndustryTypes = ["Healthcare", "Legal", "Education", "Finance", "Government", "Manufacturing", "Retail", "Other"];
      const validStatusValues = ["pending", "processing", "quotes_generated", "quotes_sent", "completed", "cancelled"];
     
      if (data.industryType && !validIndustryTypes.includes(data.industryType)) {
        errors.push(`Invalid industryType: ${data.industryType}. Valid: ${validIndustryTypes.join(', ')}`);
      }
     
      if (data.status && !validStatusValues.includes(data.status)) {
        errors.push(`Invalid status: ${data.status}. Valid: ${validStatusValues.join(', ')}`);
      }
     
      return errors;
    };
   
    // Validate transformed data
    const validationErrors = validateTransformedData(transformedData);
    if (validationErrors.length > 0) {
      console.error('Validation errors in transformed data:', validationErrors);
      setErrorMessage(`Data transformation errors: ${validationErrors.join('; ')}`);
      setIsSubmitting(false);
      return;
    }
   
    console.log('🚨 EXACTLY WHAT WE ARE SENDING:', JSON.stringify(transformedData, null, 2));
    
    try {
      // ✅ FIXED: Use hard-coded production URL to avoid CSP issues
      const finalUrl = `${PRODUCTION_API_URL}/api/quotes/request`;
      
      console.log('🔍 API URL DEBUG:', {
        productionUrl: PRODUCTION_API_URL,
        envVar: process.env.REACT_APP_API_BASE_URL,
        finalUrl: finalUrl,
        nodeEnv: process.env.NODE_ENV
      });
      
      console.log('🔗 Submitting to URL:', finalUrl);
      
      let response, data;
      if (uploadedFiles.length > 0) {
        console.log('📁 Submitting with files');
        const requestData = new FormData();
        requestData.append('userRequirements', JSON.stringify(transformedData));
        uploadedFiles.forEach((file, index) => requestData.append(`documents[${index}]`, file));
       
        response = await fetch(finalUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: requestData,
        });
      } else {
        console.log('📄 Submitting JSON only');
        response = await fetch(finalUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(transformedData),
        });
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.message || errorData.details?.join('; ') || 'Failed to submit quote request');
      }
      data = await response.json();
      setSuccessMessage('Comprehensive quote request submitted successfully!');
      setErrorMessage('');
      navigate(`/quote-details?status=created&Id=${data._id}`, {
        state: {
          quoteData: data,
          hasVendors: data.matchedVendors && data.matchedVendors.length > 0,
        },
      });
      // Reset form
      setFormData({
        companyName: '', industryType: '', subSector: '', annualRevenue: '', numEmployees: '',
        officeBasedEmployees: '', numLocations: '', primaryBusinessActivity: '', organizationStructure: '',
        multiFloor: 'No', postcode: '', primaryChallenges: [], currentPainPoints: '', impactOnProductivity: '',
        urgencyLevel: '', implementationTimeline: '', budgetCycle: '', monthlyPrintVolume: '',
        annualPrintVolume: '', monthlyVolume: { colour: '', mono: '' }, peakUsagePeriods: '',
        documentTypes: [], averagePageCount: '', finishingRequirements: [], departmentBreakdown: [],
        networkSetup: '', itSupportStructure: '', securityRequirements: [], currentSoftwareEnvironment: '',
        cloudPreference: '', integrationNeeds: [], mobileRequirements: 'No', remoteWorkImpact: '',
        currentColorCPC: '', currentMonoCPC: '', quarterlyLeaseCost: '', totalAnnualCosts: '',
        hiddenCosts: '', leasingCompany: '', serviceProvider: '', contractStartDate: '',
        contractEndDate: '', currentEquipmentAge: '', maintenanceIssues: '', additionalServices: [],
        paysForScanning: 'No', serviceType: 'Photocopiers', colour: '', type: '', min_speed: '',
        securityFeatures: [], accessibilityNeeds: 'No', sustainabilityGoals: '', responseTimeExpectation: '',
        maintenancePreference: '', trainingNeeds: '', supplyManagement: '', reportingNeeds: [],
        vendorRelationshipType: '', decisionMakers: [], evaluationCriteria: [], contractLengthPreference: '',
        pricingModelPreference: '', required_functions: [], preference: '', max_lease_price: '',
        roiExpectations: '', expectedGrowth: '', expansionPlans: '', technologyRoadmap: '',
        digitalTransformation: '', threeYearVision: ''
      });
      setUploadedFiles([]);
      setStep(1);
    } catch (error) {
      console.error('Error submitting quote request:', error.message);
      setErrorMessage(`Failed to submit: ${error.message}`);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option arrays
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
                />
              </label>
              <label>
                Industry Type: <span className="required">*</span>
                <select name="industryType" value={formData.industryType} onChange={handleChange} required>
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
              <h4>What's Driving This Decision?</h4>
              <fieldset>
                <legend>Primary Challenges (Select all that apply): <span className="required">*</span></legend>
                {challengeOptions.map((challenge) => (
                  <label key={challenge}>
                    <input
                      type="checkbox"
                      name="primaryChallenges"
                      value={challenge}
                      checked={formData.primaryChallenges.includes(challenge)}
                      onChange={handleChange}
                    />
                    {challenge}
                  </label>
                ))}
              </fieldset>
             
              <label>
                Urgency Level: <span className="required">*</span>
                <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange} required>
                  <option value="">Select Urgency</option>
                  <option value="Critical">Critical (Immediate)</option>
                  <option value="High">High (1-2 months)</option>
                  <option value="Medium">Medium (3-6 months)</option>
                  <option value="Low">Low (6+ months)</option>
                </select>
              </label>
             
              <label>
                Implementation Timeline: <span className="required">*</span>
                <select name="implementationTimeline" value={formData.implementationTimeline} onChange={handleChange} required>
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
                />
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
                <select name="networkSetup" value={formData.networkSetup} onChange={handleChange} required>
                  <option value="">Select Network Type</option>
                  <option value="Wired only">Wired network only</option>
                  <option value="Wireless only">Wireless network only</option>
                  <option value="Mixed">Mixed (both wired and wireless)</option>
                  <option value="Cloud-based">Cloud-based infrastructure</option>
                </select>
              </label>
             
              <label>
                IT Support Structure: <span className="required">*</span>
                <select name="itSupportStructure" value={formData.itSupportStructure} onChange={handleChange} required>
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
              <h4>Current Equipment & Costs</h4>
              <label>
                Current Equipment Age:
                <select name="currentEquipmentAge" value={formData.currentEquipmentAge} onChange={handleChange}>
                  <option value="">Select Age Range</option>
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-4 years">3-4 years</option>
                  <option value="5-6 years">5-6 years</option>
                  <option value="Over 6 years">Over 6 years</option>
                  <option value="Mixed ages">Mixed ages</option>
                </select>
              </label>
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
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                  <option value="Photocopiers">Multifunction Photocopiers</option>
                  <option value="Printers">Desktop Printers</option>
                  <option value="Production">Production Printing</option>
                  <option value="Scanners">Standalone Scanners</option>
                  <option value="Mixed">Mixed Solution</option>
                </select>
              </label>
              <label>
                Colour Preference: <span className="required">*</span>
                <select name="colour" value={formData.colour} onChange={handleChange} required>
                  <option value="">Select Preference</option>
                  <option value="Black & White">Black & White Only</option>
                  <option value="Color">Color Required</option>
                  <option value="Both">Both (separate devices)</option>
                </select>
              </label>
              {formData.colour && (
                <label>
                  Maximum Paper Size: <span className="required">*</span>
                  <select name="type" value={formData.type} onChange={handleChange} required>
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
                <select name="responseTimeExpectation" value={formData.responseTimeExpectation} onChange={handleChange} required>
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
                <select name="maintenancePreference" value={formData.maintenancePreference} onChange={handleChange} required>
                  <option value="">Select Preference</option>
                  <option value="Proactive">Proactive (scheduled preventive maintenance)</option>
                  <option value="Reactive">Reactive (fix when broken)</option>
                  <option value="Hybrid">Hybrid approach</option>
                  <option value="Self-service">Self-service with remote support</option>
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
              </fieldset>
             
              <label>
                What is most important to you? <span className="required">*</span>
                <select name="preference" value={formData.preference} onChange={handleChange} required>
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
                />
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
                <select name="expectedGrowth" value={formData.expectedGrowth} onChange={handleChange} required>
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
                />
              </label>
            </div>
           
            <div className="form-section">
              <h4>Final Review Summary</h4>
              <div className="review-section">
                <p><strong>Assessment Completion:</strong> 95% complete</p>
                <p><strong>Key Requirements Summary:</strong></p>
                <ul>
                  <li>Industry: {formData.industryType}</li>
                  <li>Monthly Volume: {(parseInt(formData.monthlyVolume.colour) || 0) + (parseInt(formData.monthlyVolume.mono) || 0)} pages</li>
                  <li>Priority: {formData.preference}</li>
                  <li>Budget: £{formData.max_lease_price}/month</li>
                  <li>Timeline: {formData.implementationTimeline}</li>
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
