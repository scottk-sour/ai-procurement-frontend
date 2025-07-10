// Enhanced form utilities and validation functions
// File: src/utils/enhancedFormUtils.js

/**
 * Volume and speed calculation utilities
 */
export const VolumeUtils = {
  calculateVolumeRange: (monoVol, colourVol) => {
    const total = monoVol + colourVol;
    if (total <= 6000) return '0-6k';
    if (total <= 13000) return '6k-13k';
    if (total <= 20000) return '13k-20k';
    if (total <= 30000) return '20k-30k';
    if (total <= 40000) return '30k-40k';
    if (total <= 50000) return '40k-50k';
    return '50k+';
  },

  suggestMinSpeed: (monthlyVolume) => {
    if (monthlyVolume <= 6000) return 20;
    if (monthlyVolume <= 13000) return 25;
    if (monthlyVolume <= 20000) return 30;
    if (monthlyVolume <= 30000) return 35;
    if (monthlyVolume <= 40000) return 45;
    if (monthlyVolume <= 50000) return 55;
    if (monthlyVolume <= 60000) return 65;
    return 75;
  },

  calculateCurrentMonthlyCost: (volume, rate) => {
    return (volume * rate) / 100; // Convert pence to pounds
  },

  validateVolumeAlignment: (totalVolume, suggestedSpeed, actualSpeed) => {
    const warnings = [];
    
    if (totalVolume < 100) {
      warnings.push('Very low volume - consider if a multifunction device is needed');
    }
    
    if (totalVolume > 100000) {
      warnings.push('Very high volume - may need multiple devices or high-capacity machines');
    }
    
    if (actualSpeed && actualSpeed < suggestedSpeed * 0.7) {
      warnings.push(`Speed may be insufficient for volume - consider ${suggestedSpeed}+ PPM`);
    }
    
    if (actualSpeed && actualSpeed > suggestedSpeed * 3) {
      warnings.push('Speed may be excessive for volume - could increase costs');
    }
    
    return warnings;
  }
};

/**
 * Cost calculation utilities
 */
export const CostUtils = {
  calculateBuyout: (quarterlyLease, contractEndDate) => {
    if (!quarterlyLease || !contractEndDate) return 'N/A';

    const end = new Date(contractEndDate);
    const today = new Date();
    
    if (today > end) return 'Contract Ended';

    const monthsRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24 * 30));
    const monthlyCost = quarterlyLease / 3;
    const buyout = monthlyCost * monthsRemaining * 0.6; // Typical buyout factor
    
    return `£${buyout.toFixed(2)}`;
  },

  calculateTotalMonthlyCost: (volume, costs) => {
    const { mono, colour } = volume;
    const { monoRate, colourRate, quarterlyLease, quarterlyService } = costs;
    
    const cpcCost = (mono * monoRate + colour * colourRate) / 100;
    const leaseCost = quarterlyLease / 3;
    const serviceCost = quarterlyService / 3;
    
    return {
      cpc: cpcCost,
      lease: leaseCost,
      service: serviceCost,
      total: cpcCost + leaseCost + serviceCost
    };
  },

  validateBudget: (maxLeasePrice, estimatedCosts) => {
    const warnings = [];
    
    if (maxLeasePrice < 100) {
      warnings.push('Budget may be too low for quality multifunction devices');
    }
    
    if (estimatedCosts && estimatedCosts.total > maxLeasePrice) {
      warnings.push(`Estimated costs (£${estimatedCosts.total.toFixed(2)}) exceed budget`);
    }
    
    return warnings;
  }
};

/**
 * Form validation utilities
 */
export const ValidationUtils = {
  validateStep: (step, formData) => {
    const errors = {};
    
    switch (step) {
      case 1: // Company Details
        if (!formData.companyName?.trim()) {
          errors.companyName = 'Company name is required';
        }
        if (!formData.industryType) {
          errors.industryType = 'Industry type is required';
        }
        if (!formData.numEmployees) {
          errors.numEmployees = 'Number of employees is required';
        }
        if (!formData.numLocations || formData.numLocations < 1) {
          errors.numLocations = 'At least one location is required';
        }
        break;
        
      case 2: // Volume Analysis
        const { mono, colour } = formData.monthlyVolume;
        const total = mono + colour;
        
        if (total < 50) {
          errors.monthlyVolume = 'Monthly volume seems too low (minimum 50 pages)';
        }
        if (total > 200000) {
          errors.monthlyVolume = 'Volume very high - may need enterprise solutions';
        }
        if (!mono && !colour) {
          errors.monthlyVolume = 'Please specify either mono or colour volume';
        }
        break;
        
      case 3: // Paper Requirements
        if (!formData.paperRequirements?.primarySize) {
          errors.paperRequirements = 'Primary paper size is required';
        }
        break;
        
      case 4: // Current Setup
        if (!formData.currentSetup?.machineAge) {
          errors.currentSetup = 'Current machine age information is required';
        }
        
        // Validate current costs if provided
        const { currentCosts } = formData.currentSetup;
        if (currentCosts?.monoRate > 5) {
          errors.currentMonoRate = 'Mono rate seems high - please verify';
        }
        if (currentCosts?.colourRate > 20) {
          errors.currentColourRate = 'Colour rate seems high - please verify';
        }
        break;
        
      case 5: // Requirements
        if (!formData.requirements?.priority) {
          errors.requirements = 'Priority selection is required';
        }
        
        const minSpeed = formData.requirements?.minSpeed;
        const suggestedSpeed = VolumeUtils.suggestMinSpeed(formData.monthlyVolume.mono + formData.monthlyVolume.colour);
        
        if (minSpeed && minSpeed < suggestedSpeed * 0.5) {
          errors.minSpeed = `Speed too low for volume - suggest ${suggestedSpeed}+ PPM`;
        }
        break;
        
      case 6: // Budget
        if (!formData.budget?.maxLeasePrice || formData.budget.maxLeasePrice <= 0) {
          errors.budget = 'Maximum lease price is required';
        }
        break;
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  },

  validateBusinessLogic: (formData) => {
    const warnings = [];
    const errors = [];
    
    // Volume vs Speed alignment
    const totalVolume = formData.monthlyVolume.mono + formData.monthlyVolume.colour;
    const suggestedSpeed = VolumeUtils.suggestMinSpeed(totalVolume);
    const minSpeed = formData.requirements?.minSpeed;
    
    if (minSpeed && minSpeed < suggestedSpeed * 0.7) {
      warnings.push(`Minimum speed (${minSpeed} PPM) may be too low for ${totalVolume} pages/month`);
    }
    
    // Paper size vs features
    const primarySize = formData.paperRequirements?.primarySize;
    const essentialFeatures = formData.requirements?.essentialFeatures || [];
    
    if (primarySize === 'A4' && essentialFeatures.includes('Large Format Printing')) {
      warnings.push('A4 machines cannot do large format printing - consider A3 or SRA3');
    }
    
    // Budget vs requirements
    const maxLease = formData.budget?.maxLeasePrice;
    const priority = formData.requirements?.priority;
    
    if (maxLease < 300 && priority === 'speed') {
      warnings.push('Budget may be too low for high-speed machines');
    }
    
    if (maxLease < 200 && essentialFeatures.length > 5) {
      warnings.push('Budget may be too low for feature-rich machines');
    }
    
    // Industry-specific recommendations
    const industry = formData.industryType;
    
    if (industry === 'Healthcare' && !essentialFeatures.includes('Advanced Security')) {
      warnings.push('Healthcare typically requires advanced security features');
    }
    
    if (industry === 'Legal' && !essentialFeatures.includes('Booklet Making')) {
      warnings.push('Legal firms often benefit from booklet making capabilities');
    }
    
    return { warnings, errors };
  }
};

/**
 * Form data formatting utilities
 */
export const FormatUtils = {
  formatForSubmission: (formData) => {
    // Calculate auto-fields
    const totalVolume = formData.monthlyVolume.mono + formData.monthlyVolume.colour;
    const volumeRange = VolumeUtils.calculateVolumeRange(
      formData.monthlyVolume.mono, 
      formData.monthlyVolume.colour
    );
    const suggestedSpeed = VolumeUtils.suggestMinSpeed(totalVolume);
    
    // Ensure required fields have defaults
    const formatted = {
      ...formData,
      monthlyVolume: {
        ...formData.monthlyVolume,
        total: totalVolume,
        volumeRange
      },
      requirements: {
        ...formData.requirements,
        minSpeed: formData.requirements.minSpeed || suggestedSpeed,
        suggestedSpeed
      },
      submission: {
        timestamp: new Date().toISOString(),
        source: 'enhanced-form',
        version: '2.0'
      }
    };
    
    // Clean up empty arrays and null values
    Object.keys(formatted).forEach(key => {
      if (Array.isArray(formatted[key]) && formatted[key].length === 0) {
        delete formatted[key];
      }
      if (formatted[key] === null || formatted[key] === '') {
        delete formatted[key];
      }
    });
    
    return formatted;
  },

  formatCurrency: (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatNumber: (number) => {
    return new Intl.NumberFormat('en-GB').format(number);
  },

  formatPercentage: (decimal, decimals = 1) => {
    return `${(decimal * 100).toFixed(decimals)}%`;
  }
};

/**
 * Smart suggestions based on form data
 */
export const SuggestionUtils = {
  suggestFeatures: (industryType, volumeRange, primarySize) => {
    const suggestions = [];
    
    // Industry-based suggestions
    const industryFeatures = {
      'Healthcare': ['Advanced Security', 'Duplex Printing', 'Large Paper Trays'],
      'Legal': ['Booklet Making', 'Stapling', 'Hole Punch', 'Large Capacity Trays'],
      'Education': ['Wireless Printing', 'Mobile Printing', 'Color Printing'],
      'Finance': ['Advanced Security', 'Duplex Printing', 'Fax'],
      'Government': ['Advanced Security', 'Duplex Printing', 'Large Paper Trays']
    };
    
    if (industryFeatures[industryType]) {
      suggestions.push(...industryFeatures[industryType]);
    }
    
    // Volume-based suggestions
    if (volumeRange.includes('6k+')) {
      suggestions.push('Large Paper Trays', 'Large Capacity Trays');
    }
    
    if (volumeRange.includes('30k+')) {
      suggestions.push('High Duty Cycle', 'Premium Service');
    }
    
    // Paper size suggestions
    if (primarySize === 'A3' || primarySize === 'SRA3') {
      suggestions.push('Large Format Printing', 'Professional Finishing');
    }
    
    return [...new Set(suggestions)]; // Remove duplicates
  },

  suggestBudgetRange: (volumeRange, features, priority) => {
    let baseBudget = 200; // Quarterly
    
    // Volume adjustments
    const volumeMultipliers = {
      '0-6k': 1.0,
      '6k-13k': 1.3,
      '13k-20k': 1.6,
      '20k-30k': 2.0,
      '30k-40k': 2.5,
      '40k-50k': 3.0,
      '50k+': 4.0
    };
    
    baseBudget *= volumeMultipliers[volumeRange] || 1.0;
    
    // Feature adjustments
    const featureCount = features?.length || 0;
    baseBudget += featureCount * 25;
    
    // Priority adjustments
    const priorityMultipliers = {
      'speed': 1.3,
      'quality': 1.2,
      'reliability': 1.15,
      'cost': 0.9,
      'balanced': 1.0
    };
    
    baseBudget *= priorityMultipliers[priority] || 1.0;
    
    const minBudget = Math.floor(baseBudget * 0.8);
    const maxBudget = Math.ceil(baseBudget * 1.3);
    
    return {
      suggested: Math.round(baseBudget),
      range: `£${minBudget}-£${maxBudget}`,
      explanation: `Based on ${volumeRange} volume, ${featureCount} features, and ${priority || 'balanced'} priority`
    };
  },

  getWarningsForCombination: (formData) => {
    const warnings = [];
    const { monthlyVolume, paperRequirements, requirements, budget } = formData;
    
    const totalVolume = monthlyVolume.mono + monthlyVolume.colour;
    const volumeRange = VolumeUtils.calculateVolumeRange(monthlyVolume.mono, monthlyVolume.colour);
    
    // High volume + A4 only warning
    if (totalVolume > 20000 && paperRequirements?.primarySize === 'A4') {
      warnings.push('High volume with A4 only - consider A3 capability for efficiency');
    }
    
    // Low budget + high requirements
    const featureCount = requirements?.essentialFeatures?.length || 0;
    if (budget?.maxLeasePrice < 300 && featureCount > 4) {
      warnings.push('Budget may be insufficient for all requested features');
    }
    
    // Speed requirements
    const minSpeed = requirements?.minSpeed;
    const suggestedSpeed = VolumeUtils.suggestMinSpeed(totalVolume);
    
    if (minSpeed && minSpeed > suggestedSpeed * 2) {
      warnings.push('Requested speed may be excessive for volume - could increase costs');
    }
    
    return warnings;
  }
};

/**
 * Auto-completion and smart defaults
 */
export const AutoCompleteUtils = {
  setSmartDefaults: (formData, step) => {
    const updates = {};
    
    if (step === 2) { // After volume entry
      const totalVolume = formData.monthlyVolume.mono + formData.monthlyVolume.colour;
      updates['requirements.minSpeed'] = VolumeUtils.suggestMinSpeed(totalVolume);
    }
    
    if (step === 3) { // After paper requirements
      const primarySize = formData.paperRequirements?.primarySize;
      if (primarySize === 'A4') {
        updates['requirements.essentialFeatures'] = ['Duplex Printing'];
      }
    }
    
    if (step === 4) { // After current setup
      const industry = formData.industryType;
      const suggestedFeatures = SuggestionUtils.suggestFeatures(
        industry, 
        formData.monthlyVolume.volumeRange,
        formData.paperRequirements?.primarySize
      );
      
      if (suggestedFeatures.length > 0) {
        updates.suggestedFeatures = suggestedFeatures;
      }
    }
    
    return updates;
  },

  predictNextFields: (formData, currentStep) => {
    const predictions = {};
    
    // Predict budget based on volume and features
    if (currentStep === 5) {
      const volumeRange = formData.monthlyVolume?.volumeRange;
      const features = formData.requirements?.essentialFeatures || [];
      const priority = formData.requirements?.priority;
      
      const budgetSuggestion = SuggestionUtils.suggestBudgetRange(
        volumeRange, 
        features, 
        priority
      );
      
      predictions.suggestedBudget = budgetSuggestion;
    }
    
    return predictions;
  }
};

export default {
  VolumeUtils,
  CostUtils,
  ValidationUtils,
  FormatUtils,
  SuggestionUtils,
  AutoCompleteUtils
};