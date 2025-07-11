import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import './EnhancedQuoteRequest.css';
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

    // Fetch AI suggestions when key fields are updated
    if (['monthlyPrintVolume', 'min_speed', 'type', 'colour', 'required_functions', 'industryType'].includes(name)) {
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
      ...data,
      numEmployees: data.numEmployees ? parseInt(data.numEmployees, 10) : undefined,
      officeBasedEmployees: data.officeBasedEmployees ? parseInt(data.officeBasedEmployees, 10) : undefined,
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
      totalAnnualCosts: data.totalAnnualCosts ? parseFloat(data.totalAnnualCosts) : undefined,
      min_speed: data.min_speed ? parseInt(data.min_speed, 10) : undefined,
      max_lease_price: data.max_lease_price ? parseInt(data.max_lease_price, 10) : undefined,
      multiFloor: data.multiFloor.toLowerCase() === 'yes',
      paysForScanning: data.paysForScanning.toLowerCase() === 'yes',
      mobileRequirements: data.mobileRequirements.toLowerCase() === 'yes',
      accessibilityNeeds: data.accessibilityNeeds.toLowerCase() === 'yes',
    };
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.industryType && formData.numEmployees && formData.numLocations;
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
        response = await fetch(`${API_BASE_URL}/api/quotes/request`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: requestData,
        });
      } else {
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

      if (!response.ok) {
        const errorMessage = data.details?.join('; ') || data.message || 'Failed to submit the request.';
        throw new Error(errorMessage);
      }

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
        multiFloor: 'No', primaryChallenges: [], currentPainPoints: '', impactOnProductivity: '',
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
      setErrorMessage(error.message);
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
                Describe Your Current Pain Points:
                <textarea
                  name="currentPainPoints"
                  value={formData.currentPainPoints}
                  onChange={handleChange}
                  placeholder="What specific problems are you experiencing with your current setup?"
                  rows="4"
                />
              </label>
              
              <label>
                Impact on Productivity/Operations:
                <textarea
                  name="impactOnProductivity"
                  value={formData.impactOnProductivity}
                  onChange={handleChange}
                  placeholder="How are these issues affecting your business operations?"
                  rows="3"
                />
              </label>
            </div>
            
            <div className="form-section">
              <h4>Timeline & Urgency</h4>
              <label>
                Urgency Level: <span className="required">*</span>
                <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange} required>
                  <option value="">Select Urgency</option>
                  <option value="Critical">Critical (Immediate - current system failing)</option>
                  <option value="High">High (Within 1-2 months)</option>
                  <option value="Medium">Medium (Within 3-6 months)</option>
                  <option value="Low">Low (Planning for future - 6+ months)</option>
                </select>
              </label>
              
              <label>
                Preferred Implementation Timeline: <span className="required">*</span>
                <select name="implementationTimeline" value={formData.implementationTimeline} onChange={handleChange} required>
                  <option value="">Select Timeline</option>
                  <option value="ASAP">As soon as possible</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </label>
              
              <label>
                Budget Cycle/Approval Process:
                <select name="budgetCycle" value={formData.budgetCycle} onChange={handleChange}>
                  <option value="">Select Budget Cycle</option>
                  <option value="April-March">April - March</option>
                  <option value="January-December">January - December</option>
                  <option value="July-June">July - June</option>
                  <option value="As needed">As needed</option>
                  <option value="Other">Other</option>
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
                Monthly Print Volume (pages):
                <input
                  type="number"
                  name="monthlyPrintVolume"
                  value={formData.monthlyPrintVolume}
                  onChange={handleChange}
                  placeholder="Total monthly pages across all devices"
                />
              </label>
              <label>
                Annual Print Volume (pages):
                <input
                  type="number"
                  name="annualPrintVolume"
                  value={formData.annualPrintVolume}
                  onChange={handleChange}
                  placeholder="If different from monthly x 12"
                />
              </label>
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
              <label>
                Peak Usage Periods:
                <textarea
                  name="peakUsagePeriods"
                  value={formData.peakUsagePeriods}
                  onChange={handleChange}
                  placeholder="When do you experience highest print volumes? (e.g., month-end, quarterly reports, seasonal campaigns)"
                  rows="2"
                />
              </label>
              <label>
                Average Document Page Count:
                <select name="averagePageCount" value={formData.averagePageCount} onChange={handleChange}>
                  <option value="">Select Average</option>
                  <option value="1-2 pages">1-2 pages</option>
                  <option value="3-5 pages">3-5 pages</option>
                  <option value="6-10 pages">6-10 pages</option>
                  <option value="11-25 pages">11-25 pages</option>
                  <option value="25+ pages">25+ pages</option>
                  <option value="Mixed">Mixed (varies significantly)</option>
                </select>
              </label>
            </div>
            
            <div className="form-section">
              <h4>Document Types & Requirements</h4>
              <fieldset>
                <legend>Document Types You Print (Select all that apply):</legend>
                {documentTypeOptions.map((docType) => (
                  <label key={docType}>
                    <input
                      type="checkbox"
                      name="documentTypes"
                      value={docType}
                      checked={formData.documentTypes.includes(docType)}
                      onChange={handleChange}
                    />
                    {docType}
                  </label>
                ))}
              </fieldset>
              
              <fieldset>
                <legend>Finishing Requirements (Select all that apply):</legend>
                {finishingOptions.map((finish) => (
                  <label key={finish}>
                    <input
                      type="checkbox"
                      name="finishingRequirements"
                      value={finish}
                      checked={formData.finishingRequirements.includes(finish)}
                      onChange={handleChange}
                    />
                    {finish}
                  </label>
                ))}
              </fieldset>
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
              
              <label>
                Current Software Environment:
                <select name="currentSoftwareEnvironment" value={formData.currentSoftwareEnvironment} onChange={handleChange}>
                  <option value="">Select Environment</option>
                  <option value="Windows primarily">Windows primarily</option>
                  <option value="Mac primarily">Mac primarily</option>
                  <option value="Mixed Windows/Mac">Mixed Windows/Mac</option>
                  <option value="Linux/Unix">Linux/Unix</option>
                  <option value="Cloud-based apps">Cloud-based applications</option>
                </select>
              </label>
              
              <label>
                Cloud vs On-Premise Preference:
                <select name="cloudPreference" value={formData.cloudPreference} onChange={handleChange}>
                  <option value="">Select Preference</option>
                  <option value="Cloud preferred">Cloud preferred</option>
                  <option value="On-premise preferred">On-premise preferred</option>
                  <option value="Hybrid approach">Hybrid approach</option>
                  <option value="No preference">No preference</option>
                </select>
              </label>
            </div>
            
            <div className="form-section">
              <h4>Security & Compliance</h4>
              <fieldset>
                <legend>Security Requirements (Select all that apply):</legend>
                {securityRequirementOptions.map((security) => (
                  <label key={security}>
                    <input
                      type="checkbox"
                      name="securityRequirements"
                      value={security}
                      checked={formData.securityRequirements.includes(security)}
                      onChange={handleChange}
                    />
                    {security}
                  </label>
                ))}
              </fieldset>
            </div>
            
            <div className="form-section">
              <h4>Integration & Mobility</h4>
              <fieldset>
                <legend>Integration Needs (Select all that apply):</legend>
                {integrationOptions.map((integration) => (
                  <label key={integration}>
                    <input
                      type="checkbox"
                      name="integrationNeeds"
                      value={integration}
                      checked={formData.integrationNeeds.includes(integration)}
                      onChange={handleChange}
                    />
                    {integration}
                  </label>
                ))}
              </fieldset>
              
              <label>
                Mobile/Remote Printing Requirements:
                <select name="mobileRequirements" value={formData.mobileRequirements} onChange={handleChange}>
                  <option value="No">Not required</option>
                  <option value="Yes">Yes, essential</option>
                  <option value="Nice to have">Nice to have</option>
                </select>
              </label>
              
              <label>
                Remote/Hybrid Work Impact:
                <textarea
                  name="remoteWorkImpact"
                  value={formData.remoteWorkImpact}
                  onChange={handleChange}
                  placeholder="How has remote/hybrid work affected your printing needs?"
                  rows="3"
                />
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
                Current Color Cost Per Copy (pence):
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
                Current Mono Cost Per Copy (pence):
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
                Total Annual Printing Costs (£):
                <input
                  type="number"
                  name="totalAnnualCosts"
                  value={formData.totalAnnualCosts}
                  onChange={handleChange}
                  placeholder="Include all printing-related expenses"
                />
              </label>
              <label>
                Hidden/Unexpected Costs:
                <textarea
                  name="hiddenCosts"
                  value={formData.hiddenCosts}
                  onChange={handleChange}
                  placeholder="Any additional costs not captured above (maintenance, supplies, downtime, etc.)"
                  rows="3"
                />
              </label>
            </div>
            
            <div className="form-section">
              <h4>Current Contracts & Equipment</h4>
              <label>
                Current Leasing Company:
                <input
                  type="text"
                  name="leasingCompany"
                  value={formData.leasingCompany}
                  onChange={handleChange}
                  placeholder="e.g., Sharp Leasing, Xerox Financial"
                />
              </label>
              <label>
                Current Service Provider:
                <input
                  type="text"
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleChange}
                  placeholder="e.g., Sharp Service, Canon Support"
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
              <label>
                Average Age of Current Equipment:
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
              <label>
                Current Maintenance Issues:
                <textarea
                  name="maintenanceIssues"
                  value={formData.maintenanceIssues}
                  onChange={handleChange}
                  placeholder="Describe any ongoing problems with current equipment"
                  rows="3"
                />
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
              <label>
                Minimum Speed Requirement (PPM):
                <input
                  type="number"
                  name="min_speed"
                  value={formData.min_speed}
                  onChange={handleChange}
                  placeholder="Pages per minute minimum"
                />
              </label>
            </div>
            
            <div className="form-section">
              <h4>Security & Access Features</h4>
              <fieldset>
                <legend>Security Features Required (Select all that apply):</legend>
                {securityFeatureOptions.map((feature) => (
                  <label key={feature}>
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
              </fieldset>
              
              <label>
                Accessibility Requirements:
                <select name="accessibilityNeeds" value={formData.accessibilityNeeds} onChange={handleChange}>
                  <option value="No">No specific requirements</option>
                  <option value="Yes">Yes, accessibility features needed</option>
                  <option value="Compliance">ADA/DDA compliance required</option>
                </select>
              </label>
            </div>
            
            <div className="form-section">
              <h4>Functions & Features</h4>
              <fieldset>
                <legend>Required Functions (Select all that apply):</legend>
                {['Print', 'Copy', 'Scan', 'Fax', 'Email', 'Cloud Storage', 'Wireless Printing', 'Duplex Printing', 'Large Capacity Trays', 'Booklet Making'].map((func) => (
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
              
              <label>
                Do You Pay for Scanning?
                <select name="paysForScanning" value={formData.paysForScanning} onChange={handleChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unknown">Not sure</option>
                </select>
              </label>
              
              <label>
                Sustainability Goals:
                <textarea
                  name="sustainabilityGoals"
                  value={formData.sustainabilityGoals}
                  onChange={handleChange}
                  placeholder="Any environmental or sustainability requirements?"
                  rows="2"
                />
              </label>
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
              
              <label>
                Training Needs:
                <select name="trainingNeeds" value={formData.trainingNeeds} onChange={handleChange}>
                  <option value="">Select Training Level</option>
                  <option value="Comprehensive">Comprehensive user training</option>
                  <option value="Basic">Basic operation training</option>
                  <option value="Admin only">Administrator training only</option>
                  <option value="Self-service">Self-service resources</option>
                  <option value="None">No formal training needed</option>
                </select>
              </label>
              
              <label>
                Supply Management Preference:
                <select name="supplyManagement" value={formData.supplyManagement} onChange={handleChange}>
                  <option value="">Select Preference</option>
                  <option value="Auto-replenishment">Automatic replenishment</option>
                  <option value="Just-in-time">Just-in-time delivery</option>
                  <option value="Bulk ordering">Bulk ordering</option>
                  <option value="Self-managed">Self-managed purchasing</option>
                </select>
              </label>
            </div>
            
            <div className="form-section">
              <h4>Reporting & Analytics</h4>
              <fieldset>
                <legend>Reporting Needs (Select all that apply):</legend>
                {reportingOptions.map((report) => (
                  <label key={report}>
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
              </fieldset>
              
              <label>
                Vendor Relationship Type:
                <select name="vendorRelationshipType" value={formData.vendorRelationshipType} onChange={handleChange}>
                  <option value="">Select Relationship</option>
                  <option value="Strategic partner">Strategic partnership</option>
                  <option value="Preferred supplier">Preferred supplier</option>
                  <option value="Transactional">Transactional relationship</option>
                  <option value="Competitive">Competitive bidding</option>
                </select>
              </label>
            </div>
            
            <div className="form-section">
              <h4>Additional Services</h4>
              <fieldset>
                <legend>Additional Services of Interest (Select all that apply):</legend>
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
              
              <fieldset>
                <legend>Evaluation Criteria (Select all that apply):</legend>
                {evaluationCriteriaOptions.map((criteria) => (
                  <label key={criteria}>
                    <input
                      type="checkbox"
                      name="evaluationCriteria"
                      value={criteria}
                      checked={formData.evaluationCriteria.includes(criteria)}
                      onChange={handleChange}
                    />
                    {criteria}
                  </label>
                ))}
              </fieldset>
            </div>
            
            <div className="form-section">
              <h4>Commercial Preferences</h4>
              <label>
                Contract Length Preference:
                <select name="contractLengthPreference" value={formData.contractLengthPreference} onChange={handleChange}>
                  <option value="">Select Length</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-4 years">3-4 years</option>
                  <option value="5+ years">5+ years</option>
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </label>
              
              <label>
                Pricing Model Preference:
                <select name="pricingModelPreference" value={formData.pricingModelPreference} onChange={handleChange}>
                  <option value="">Select Model</option>
                  <option value="Per-page">Per-page pricing</option>
                  <option value="Fixed monthly">Fixed monthly fee</option>
                  <option value="Tiered volume">Tiered volume pricing</option>
                  <option value="Hybrid">Hybrid model</option>
                  <option value="Equipment + service">Equipment + service separate</option>
                </select>
              </label>
              
              <label>
                What is most important to you? <span className="required">*</span>
                <select name="preference" value={formData.preference} onChange={handleChange} required>
                  <option value="">Select Priority</option>
                  <option value="cost">Lowest total cost</option>
                  <option value="quality">Best print quality</option>
                  <option value="speed">Fastest performance</option>
                  <option value="service">Superior service & support</option>
                  <option value="reliability">Maximum uptime/reliability</option>
                  <option value="security">Advanced security features</option>
                  <option value="environmental">Environmental impact</option>
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
              
              <label>
                ROI Expectations:
                <textarea
                  name="roiExpectations"
                  value={formData.roiExpectations}
                  onChange={handleChange}
                  placeholder="What return on investment are you expecting? (cost savings, productivity gains, etc.)"
                  rows="3"
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
                Office Expansion/Relocation Plans:
                <textarea
                  name="expansionPlans"
                  value={formData.expansionPlans}
                  onChange={handleChange}
                  placeholder="Any plans for new offices, relocations, or space changes in the next 3 years?"
                  rows="3"
                />
              </label>
              
              <label>
                Technology Roadmap:
                <textarea
                  name="technologyRoadmap"
                  value={formData.technologyRoadmap}
                  onChange={handleChange}
                  placeholder="How do you see technology evolving in your business? (cloud adoption, automation, etc.)"
                  rows="3"
                />
              </label>
              
              <label>
                Digital Transformation Initiatives:
                <textarea
                  name="digitalTransformation"
                  value={formData.digitalTransformation}
                  onChange={handleChange}
                  placeholder="Any paperless initiatives, workflow automation, or digital transformation projects?"
                  rows="3"
                />
              </label>
              
              <label>
                3-Year Vision: <span className="required">*</span>
                <textarea
                  name="threeYearVision"
                  value={formData.threeYearVision}
                  onChange={handleChange}
                  placeholder="Where do you see your document/printing needs in 3 years? What would success look like?"
                  rows="4"
                  required
                />
              </label>
            </div>
            
            <div className="form-section">
              <h4>Final Review Summary</h4>
              <div className="review-section">
                <p><strong>Estimated Current Buyout:</strong> £{calculateBuyout()}</p>
                <p><strong>Assessment Completion:</strong> 95% complete</p>
                <p><strong>Key Requirements Summary:</strong></p>
                <ul>
                  <li>Industry: {formData.industryType}</li>
                  <li>Monthly Volume: {formData.monthlyVolume.colour + formData.monthlyVolume.mono} pages</li>
                  <li>Priority: {formData.preference}</li>
                  <li>Budget: £{formData.max_lease_price}/month</li>
                  <li>Timeline: {formData.implementationTimeline}</li>
                </ul>
                <details>
                  <summary>View Complete Data (Click to expand)</summary>
                  <pre>{JSON.stringify(formatFormData(formData), null, 2)}</pre>
                </details>
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