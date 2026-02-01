import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIVisibilityScore from './vendor/AIVisibilityScore';
import {
  Quote,
  Upload,
  LogOut,
  BarChart3,
  Bell,
  Cloud,
  Gauge,
  Users,
  PoundSterling,
  Clock,
  CheckCircle,
  X,
  Eye,
  Star,
  Download,
  Search,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowRight,
  Trash2,
  Edit3,
  Plus,
  Copy,
  ToggleLeft,
  ToggleRight,
  Save,
  Grid,
  List,
  Settings,
  Package,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  ExternalLink,
  FileText
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const VendorDashboard = () => {
  const { auth, logout, getCurrentToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get vendor info from auth context and localStorage
  const vendorId = auth?.user?.userId || localStorage.getItem('vendorId');
  const token = getCurrentToken ? getCurrentToken() : localStorage.getItem('vendorToken');

  // Upgrade success modal state
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  // Vendor data state - will be populated from API
  const [vendorData, setVendorData] = useState({
    name: auth?.user?.name || localStorage.getItem('vendorName') || "Vendor",
    email: auth?.user?.email || "",
    companyName: "",
    verified: false,
    rating: 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });

  // Leads state for Quote Requests tab
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [dashboardState, setDashboardState] = useState({
    loading: false,
    error: null,
    activeTab: "files", // Start on files tab to show product management
    searchTerm: "",
    filterStatus: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [fileState, setFileState] = useState({
    file: null,
    documentType: "contract",
    uploadProgress: 0,
    dragOver: false
  });

  // Data state - cleaned up
  const [dataState, setDataState] = useState({
    recentActivity: [],
    uploadedFiles: [],
    quotes: [],
    notifications: []
  });

  const [message, setMessage] = useState({ text: "", type: "", visible: false });
  const [uploadResults, setUploadResults] = useState(null);

  // Profile editing state
  const [profileData, setProfileData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    postcode: '',
    coverage: [],
    description: '',
    yearsInBusiness: 0,
    services: [],
    brands: [],
    certifications: [],
    accreditations: [],
    tier: 'listed' // listed (free), visible (£99), verified (£149)
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [newTag, setNewTag] = useState({ brands: '', certifications: '', accreditations: '', coverage: '' });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    stats: null,
    daily: [],
    sources: [],
    loading: false,
    error: null,
    dateRange: '30' // days
  });

  // Enhanced product management state - cleaned up
  const [vendorProducts, setVendorProducts] = useState([]);

  // Product management state
  const [productState, setProductState] = useState({
    selectedProducts: new Set(),
    searchTerm: "",
    filterCategory: "all",
    filterStatus: "all",
    sortBy: "manufacturer",
    sortOrder: "asc",
    viewMode: "grid" // grid or table
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    isOpen: false,
    mode: "add", // add, edit, duplicate
    editingProduct: null,
    data: {
      manufacturer: "",
      model: "",
      category: "Multifunction Printer",
      speed: "",
      minVolume: "",
      maxVolume: "",
      paperSizes: { primary: "A4", supported: ["A4"] },
      costs: { cpcRates: { A4Mono: "", A4Colour: "" } },
      status: "active",
      features: [],
      description: ""
    },
    errors: {},
    isDirty: false
  });

  // Bulk operations state
  const [bulkActions, setBulkActions] = useState({
    isOpen: false,
    action: "", // delete, status-change, category-change
    confirmText: ""
  });

  // Enhanced state for analytics
  const [analyticsState, setAnalyticsState] = useState({
    dateRange: "30", // days
    selectedMetric: "revenue",
    compareEnabled: false,
    comparePeriod: "previous"
  });

  // Message display helper - defined first as it's used by other functions
  const showMessage = useCallback((text, type = "info") => {
    setMessage({ text, type, visible: true });
    setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 5000);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorId');
      localStorage.removeItem('vendorName');
      localStorage.removeItem('role');
    }
    navigate('/vendor-login');
  }, [logout, navigate]);

  // Fetch leads function
  const fetchLeads = useCallback(async () => {
    if (!vendorId) return;

    setLeadsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vendor-leads/vendor/${vendorId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (data.success) {
        setLeads(data.data?.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      showMessage('Failed to load quote requests', 'error');
    } finally {
      setLeadsLoading(false);
    }
  }, [vendorId, token, showMessage]);

  // Fetch vendor products
  const fetchVendorProducts = useCallback(async () => {
    if (!vendorId || !token) return;

    try {
      const response = await fetch(`${API_URL}/api/vendors/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setVendorProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, [vendorId, token]);

  // Fetch full profile for settings tab
  const fetchFullProfile = useCallback(async () => {
    if (!vendorId || !token) return;

    setProfileLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vendors/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success && data.vendor) {
        // Normalize tier names to: listed, visible, verified
        const rawTier = data.vendor.tier || 'free';
        const tierMapping = {
          'free': 'listed', 'listed': 'listed',
          'basic': 'visible', 'visible': 'visible', 'bronze': 'visible', 'standard': 'visible',
          'managed': 'verified', 'verified': 'verified', 'silver': 'verified', 'gold': 'verified', 'enterprise': 'verified', 'platinum': 'verified'
        };
        const normalizedTier = tierMapping[rawTier.toLowerCase()] || 'listed';

        setProfileData({
          company: data.vendor.company || '',
          name: data.vendor.name || '',
          email: data.vendor.email || '',
          phone: data.vendor.phone || '',
          website: data.vendor.website || '',
          city: data.vendor.city || '',
          postcode: data.vendor.postcode || '',
          coverage: data.vendor.coverage || [],
          description: data.vendor.description || '',
          yearsInBusiness: data.vendor.yearsInBusiness || 0,
          services: data.vendor.services || [],
          brands: data.vendor.brands || [],
          certifications: data.vendor.certifications || [],
          accreditations: data.vendor.accreditations || [],
          tier: normalizedTier
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showMessage('Failed to load profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  }, [vendorId, token, showMessage]);

  // Save profile
  const saveProfile = useCallback(async () => {
    if (!token) return;

    setProfileSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/vendors/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();

      if (data.success) {
        showMessage('Profile saved successfully!', 'success');
        // Update vendor name in header if changed
        if (data.vendor?.company) {
          setVendorData(prev => ({ ...prev, companyName: data.vendor.company }));
        }
      } else {
        showMessage(data.message || 'Failed to save profile', 'error');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      showMessage('Failed to save profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [token, profileData, showMessage]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;

    setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch all analytics data in parallel
      const [statsRes, dailyRes, sourcesRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/analytics/daily?days=${analyticsData.dateRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/analytics/sources?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [statsData, dailyData, sourcesData] = await Promise.all([
        statsRes.json(),
        dailyRes.json(),
        sourcesRes.json()
      ]);

      setAnalyticsData(prev => ({
        ...prev,
        stats: statsData.success ? statsData.data : null,
        daily: dailyData.success ? dailyData.data.stats : [],
        sources: sourcesData.success ? sourcesData.data : [],
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalyticsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load analytics data'
      }));
    }
  }, [token, analyticsData.dateRange]);

  // Add tag helper
  const addTag = useCallback((field, value) => {
    if (!value.trim()) return;
    setProfileData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
    setNewTag(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Remove tag helper
  const removeTag = useCallback((field, index) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  // Update lead status
  const updateLeadStatus = useCallback(async (leadId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/vendor-leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (data.success) {
        setLeads(prev => prev.map(lead =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        ));
        showMessage(`Lead marked as ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
      showMessage('Failed to update status', 'error');
    }
  }, [token, showMessage]);

  // Fetch vendor profile on mount
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!vendorId || !token) return;

      try {
        const response = await fetch(`${API_URL}/api/vendors/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Backend returns { vendor: {...} } without success field
        if (response.ok && data.vendor) {
          setVendorData(prev => ({
            ...prev,
            name: data.vendor.name || data.vendor.contactInfo?.name || prev.name,
            email: data.vendor.email || data.vendor.contactInfo?.email || prev.email,
            companyName: data.vendor.company || data.vendor.businessProfile?.companyName || "",
            verified: data.vendor.account?.verificationStatus === 'verified' || false,
            rating: data.vendor.performance?.rating || data.vendor.rating || 0
          }));
        }
      } catch (error) {
        console.error('Failed to fetch vendor profile:', error);
      }
    };

    fetchVendorProfile();
  }, [vendorId, token]);

  // Fetch products on mount
  useEffect(() => {
    if (vendorId && token) {
      fetchVendorProducts();
    }
  }, [vendorId, token, fetchVendorProducts]);

  // Fetch leads when quotes tab is active
  useEffect(() => {
    if (dashboardState.activeTab === 'quotes' && vendorId) {
      fetchLeads();
    }
  }, [dashboardState.activeTab, vendorId, fetchLeads]);

  // Fetch profile when settings tab is active
  useEffect(() => {
    if (dashboardState.activeTab === 'settings' && vendorId) {
      fetchFullProfile();
    }
  }, [dashboardState.activeTab, vendorId, fetchFullProfile]);

  // Fetch analytics and profile (for tier) when analytics tab is active
  useEffect(() => {
    if (dashboardState.activeTab === 'analytics' && token) {
      fetchAnalytics();
      // Also fetch profile to get tier for gating
      if (!profileData.tier || profileData.tier === 'listed') {
        fetchFullProfile();
      }
    }
  }, [dashboardState.activeTab, token, fetchAnalytics, fetchFullProfile, profileData.tier]);

  // Handle upgrade success from Stripe redirect
  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');
    if (upgradeStatus === 'success') {
      setShowUpgradeSuccess(true);
      // Remove the query parameter from URL
      searchParams.delete('upgrade');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Enhanced metrics calculation - now using leads
  const metrics = useMemo(() => {
    const products = vendorProducts || [];
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      totalQuotes: leads.length,
      pendingQuotes: leads.filter(l => l.status === "pending").length,
      viewedQuotes: leads.filter(l => l.status === "viewed").length,
      contactedQuotes: leads.filter(l => l.status === "contacted").length,
      quotedQuotes: leads.filter(l => l.status === "quoted").length,
      wonQuotes: leads.filter(l => l.status === "won").length,
      thisMonthQuotes: leads.filter(l => new Date(l.createdAt) >= thisMonth).length,
      responseRate: leads.length > 0 ? Math.round((leads.filter(l => l.status !== "pending").length / leads.length) * 100) : 0,
      successRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === "won").length / leads.length) * 100) : 0,
      activeProducts: products.filter(p => (p.status || "active") === "active").length,
      totalProducts: products.length
    };
  }, [leads, vendorProducts]);

  // Product CRUD operations
  const handleAddProduct = useCallback(() => {
    setProductForm({
      isOpen: true,
      mode: "add",
      editingProduct: null,
      data: {
        manufacturer: "",
        model: "",
        category: "Multifunction Printer",
        speed: "",
        minVolume: "",
        maxVolume: "",
        paperSizes: { primary: "A4", supported: ["A4"] },
        costs: { cpcRates: { A4Mono: "", A4Colour: "" } },
        status: "active",
        features: [],
        description: ""
      },
      errors: {},
      isDirty: false
    });
  }, []);

  const handleEditProduct = useCallback((product) => {
    setProductForm({
      isOpen: true,
      mode: "edit",
      editingProduct: product,
      data: {
        manufacturer: product.manufacturer || "",
        model: product.model || "",
        category: product.category || "Multifunction Printer",
        speed: product.speed?.toString() || "",
        minVolume: product.minVolume?.toString() || "",
        maxVolume: product.maxVolume?.toString() || "",
        paperSizes: product.paperSizes || { primary: "A4", supported: ["A4"] },
        costs: product.costs || { cpcRates: { A4Mono: "", A4Colour: "" } },
        status: product.status || "active",
        features: product.features || [],
        description: product.description || ""
      },
      errors: {},
      isDirty: false
    });
  }, []);

  const handleDuplicateProduct = useCallback((product) => {
    setProductForm({
      isOpen: true,
      mode: "duplicate",
      editingProduct: null,
      data: {
        manufacturer: product.manufacturer || "",
        model: `${product.model} (Copy)`,
        category: product.category || "Multifunction Printer",
        speed: product.speed?.toString() || "",
        minVolume: product.minVolume?.toString() || "",
        maxVolume: product.maxVolume?.toString() || "",
        paperSizes: product.paperSizes || { primary: "A4", supported: ["A4"] },
        costs: product.costs || { cpcRates: { A4Mono: "", A4Colour: "" } },
        status: "active",
        features: product.features || [],
        description: product.description || ""
      },
      errors: {},
      isDirty: false
    });
  }, []);

  const validateProductForm = useCallback((data) => {
    const errors = {};
    
    if (!data.manufacturer.trim()) errors.manufacturer = "Manufacturer is required";
    if (!data.model.trim()) errors.model = "Model is required";
    if (!data.speed || data.speed < 1) errors.speed = "Speed must be greater than 0";
    if (!data.minVolume || data.minVolume < 1) errors.minVolume = "Minimum volume is required";
    if (!data.maxVolume || data.maxVolume < 1) errors.maxVolume = "Maximum volume is required";
    if (parseInt(data.maxVolume) <= parseInt(data.minVolume)) {
      errors.maxVolume = "Maximum volume must be greater than minimum volume";
    }
    if (!data.costs.cpcRates.A4Mono || data.costs.cpcRates.A4Mono <= 0) {
      errors.monoRate = "Mono CPC rate is required";
    }
    
    return errors;
  }, []);

  const handleSaveProduct = useCallback(async () => {
    const errors = validateProductForm(productForm.data);
    
    if (Object.keys(errors).length > 0) {
      setProductForm(prev => ({ ...prev, errors }));
      showMessage("Please fix the form errors", "error");
      return;
    }

    try {
      const productData = {
        ...productForm.data,
        speed: parseInt(productForm.data.speed),
        minVolume: parseInt(productForm.data.minVolume),
        maxVolume: parseInt(productForm.data.maxVolume),
        costs: {
          cpcRates: {
            A4Mono: parseFloat(productForm.data.costs.cpcRates.A4Mono),
            A4Colour: parseFloat(productForm.data.costs.cpcRates.A4Colour) || 0
          }
        }
      };

      if (productForm.mode === "edit") {
        // Update existing product
        setVendorProducts(prev => prev.map(p => 
          p._id === productForm.editingProduct._id 
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        ));
        showMessage("Product updated successfully", "success");
      } else {
        // Add new product
        const newProduct = {
          _id: `prod_${Date.now()}`,
          ...productData,
          createdAt: new Date().toISOString()
        };
        setVendorProducts(prev => [newProduct, ...prev]);
        showMessage(`Product ${productForm.mode === "duplicate" ? "duplicated" : "added"} successfully`, "success");
      }

      setProductForm(prev => ({ ...prev, isOpen: false, isDirty: false }));
    } catch (error) {
      showMessage(`Failed to save product: ${error.message}`, "error");
    }
  }, [productForm, validateProductForm, showMessage]);

  const handleDeleteProduct = useCallback(async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      setVendorProducts(prev => prev.filter(p => p._id !== productId));
      showMessage("Product deleted successfully", "success");
    } catch (error) {
      showMessage("Failed to delete product", "error");
    }
  }, [showMessage]);

  const handleToggleProductStatus = useCallback((productId) => {
    setVendorProducts(prev => prev.map(p => 
      p._id === productId 
        ? { ...p, status: p.status === "active" ? "inactive" : "active" }
        : p
    ));
    showMessage("Product status updated", "success");
  }, [showMessage]);

  // ✅ FIXED: Real product catalog upload function
  const handleProductCatalogUpload = useCallback(async (file) => {
    if (!file) {
      showMessage("Please select a file to upload", "warning");
      return;
    }

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      showMessage("Please upload a CSV or Excel file for product catalogs", "error");
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));
    setUploadResults(null);

    try {
      // Get the vendor token from localStorage or auth context
      const token = localStorage.getItem('vendorToken') || 
                   localStorage.getItem('token') || 
                   auth?.token;
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Starting real upload to /api/vendors/upload');
      console.log('📁 File:', file.name, file.size, 'bytes');

      // Make the actual API call to your backend
      const response = await fetch('/api/vendors/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📄 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || result.errors?.[0] || `Upload failed with status ${response.status}`);
      }

      // Handle successful upload
      const savedProducts = result.data?.savedProducts || result.savedProducts || 0;
      
      setUploadResults({
        success: true,
        savedProducts: savedProducts,
        data: {
          stats: result.data?.stats || result.stats || { total: savedProducts, saved: savedProducts },
          warnings: result.data?.warnings || result.warnings || []
        }
      });

      showMessage(`✅ Successfully uploaded ${savedProducts} products!`, "success");

      // Refresh the product list after upload
      fetchVendorProducts();

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      setUploadResults({
        success: false,
        error: error.message
      });
      
      showMessage(`❌ Upload failed: ${error.message}`, "error");
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  }, [showMessage, auth?.token]);

  // Format utilities
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount || 0);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setFileState(prev => ({ ...prev, dragOver: false }));
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleProductCatalogUpload(droppedFile);
    }
  }, [handleProductCatalogUpload]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Upgrade Success Modal */}
      {showUpgradeSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937', fontSize: '1.5rem' }}>
              Subscription Activated!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Your plan has been upgraded successfully. You now have access to enhanced AI visibility features.
            </p>
            <button
              onClick={() => setShowUpgradeSuccess(false)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '2rem 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {vendorData.name.charAt(0).toUpperCase() || "V"}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Welcome back, {vendorData.name || "Vendor"}!
                  {vendorData.verified && (
                    <CheckCircle size={20} style={{ color: '#4ade80' }} />
                  )}
                </h1>
                <p style={{ margin: '0.25rem 0 0', opacity: 0.9 }}>{vendorData.companyName || "Your Company"}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16}
                      fill={i < vendorData.rating ? '#fbbf24' : 'transparent'}
                      style={{ color: i < vendorData.rating ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}
                    />
                  ))}
                  <span>({vendorData.rating}/5)</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>This Month</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{formatCurrency(vendorData.monthlyEarnings)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total Earned</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{formatCurrency(vendorData.totalEarnings)}</div>
              </div>
              
              <button
                onClick={() => navigate('/vendor-dashboard/upgrade')}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <ArrowUp size={16} /> Upgrade
              </button>

              <button
                onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'settings' }))}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Settings size={16} /> Settings
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message.visible && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: message.type === 'error' ? '#ef4444' : message.type === 'success' ? '#10b981' : '#3b82f6',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000,
          maxWidth: '400px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(prev => ({ ...prev, visible: false }))}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Enhanced Navigation */}
      <nav style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { id: "overview", label: "Overview", icon: <Gauge size={18} /> },
              { id: "quotes", label: "Quote Requests", icon: <Quote size={18} />, badge: metrics.pendingQuotes },
              { id: "files", label: "Product Catalog", icon: <Package size={18} />, badge: metrics.totalProducts },
              { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
              { id: "notifications", label: "Notifications", icon: <Bell size={18} />, badge: dataState.notifications.filter(n => !n.read).length },
              { id: "settings", label: "Settings", icon: <Settings size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDashboardState(prev => ({ ...prev, activeTab: tab.id }))}
                style={{
                  background: dashboardState.activeTab === tab.id ? '#f3f4f6' : 'transparent',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderBottom: dashboardState.activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: dashboardState.activeTab === tab.id ? '#1f2937' : '#6b7280',
                  fontWeight: dashboardState.activeTab === tab.id ? '600' : '400',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '0.25rem'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
            {/* Subscription/Upgrade link - navigates to separate page */}
            <button
              onClick={() => navigate('/vendor-dashboard/upgrade')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '2px solid transparent',
                color: '#f59e0b',
                fontWeight: '500',
                position: 'relative',
                transition: 'all 0.2s',
                marginLeft: 'auto'
              }}
            >
              <Award size={18} />
              <span>Subscription</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {dashboardState.activeTab === "overview" && (
          <div>
            {/* AI Visibility Score - Key monetisation driver */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <AIVisibilityScore token={auth.token} />
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  What is AI Visibility?
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1rem' }}>
                  Your AI Visibility Score shows how easily AI assistants (ChatGPT, Google AI, Perplexity) can find
                  and recommend your business when UK businesses ask for supplier recommendations.
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1rem' }}>
                  <strong>Higher scores = more leads from AI referrals.</strong>
                </p>
                <ul style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.25rem', margin: '0 0 1.5rem' }}>
                  <li>Complete your profile for better AI understanding</li>
                  <li>Upload products so AI can match you to queries</li>
                  <li>Add certifications to build trust signals</li>
                  <li>Upgrade for priority placement in AI results</li>
                </ul>
                <button
                  onClick={() => navigate('/vendor-dashboard/upgrade')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  <TrendingUp size={16} /> View Upgrade Options
                </button>
              </div>
            </div>

            {/* KPI Cards - Focus on visibility and profile completeness */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '0.5rem', color: '#4338ca' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Products Listed</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.totalProducts}</div>
                    <div style={{ fontSize: '0.875rem', color: metrics.activeProducts > 0 ? '#10b981' : '#6b7280' }}>
                      {metrics.activeProducts} active in catalog
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#dbeafe', borderRadius: '0.5rem', color: '#1d4ed8' }}>
                    <Quote size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Enquiries Received</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.totalQuotes}</div>
                    <div style={{ fontSize: '0.875rem', color: metrics.pendingQuotes > 0 ? '#f59e0b' : '#6b7280' }}>
                      {metrics.pendingQuotes > 0 ? `${metrics.pendingQuotes} pending` : 'All responded'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Recent Activity</h2>
                <button 
                  onClick={() => setDashboardState(prev => ({ ...prev, activeTab: "notifications" }))}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>
              
              {dataState.recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {dataState.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ padding: '0.5rem', background: 'white', borderRadius: '0.375rem', color: '#3b82f6' }}>
                        {activity.type === "quote" && <Quote size={16} />}
                        {activity.type === "upload" && <Upload size={16} />}
                        {activity.type === "login" && <Users size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>{activity.description}</p>
                        <time style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatDate(activity.date)}</time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <Info size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        )}

        {dashboardState.activeTab === "files" && (
          <div>
            {/* Product Catalog Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Product Catalog Management</h2>
                  <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
                    Manage your product catalog - add, edit, and organize your offerings
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {metrics.totalProducts} products ({metrics.activeProducts} active)
                  </span>
                  <button
                    onClick={handleAddProduct}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>

              {/* Bulk Upload Section */}
              <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Bulk Upload</h3>
                    <p style={{ margin: '0 0 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      Upload multiple products at once using our CSV template
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        showMessage("Template download started", "info");
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        background: 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} /> Download CSV Template
                    </button>
                  </div>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("bulk-upload-input").click()}
                    style={{
                      flex: 1,
                      border: `2px dashed ${fileState.dragOver ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '0.75rem',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: fileState.dragOver ? '#f0f9ff' : '#fafafa',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Cloud size={48} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                      Drag & drop your CSV file here
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                      or click to browse • CSV, XLSX files only
                    </p>
                    <input
                      id="bulk-upload-input"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleProductCatalogUpload(file);
                        }
                      }}
                      accept=".csv,.xlsx,.xls"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* ✅ FIXED: Enhanced Upload Results */}
                {uploadResults && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    background: uploadResults.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${uploadResults.success ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    <h4 style={{ 
                      margin: '0 0 0.5rem', 
                      color: uploadResults.success ? '#166534' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {uploadResults.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      {uploadResults.success ? 'Upload Successful' : 'Upload Failed'}
                    </h4>
                    
                    {uploadResults.success ? (
                      <div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#166534' }}>
                          Successfully uploaded {uploadResults.savedProducts} products
                        </p>
                        {uploadResults.data?.stats && (
                          <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', gap: '1rem' }}>
                            <span>Total: {uploadResults.data.stats.total}</span>
                            <span>Valid: {uploadResults.data.stats.saved}</span>
                            <span>Errors: {uploadResults.data.stats.total - uploadResults.data.stats.saved || 0}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                          {uploadResults.error || 'Upload failed'}
                        </p>
                      </div>
                    )}

                    {uploadResults.data?.warnings && uploadResults.data.warnings.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#d97706' }}>
                          ⚠️ Warnings ({uploadResults.data.warnings.length}):
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#d97706' }}>
                          {uploadResults.data.warnings.slice(0, 3).map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                          {uploadResults.data.warnings.length > 3 && (
                            <li>... and {uploadResults.data.warnings.length - 3} more warnings</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <button 
                      onClick={() => setUploadResults(null)}
                      style={{
                        marginTop: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: uploadResults.success ? '#166534' : '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Product List or Empty State */}
            {vendorProducts.length > 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                {/* Product List Header */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9fafb'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>
                    {vendorProducts.length} Product{vendorProducts.length !== 1 ? 's' : ''} in Catalog
                  </span>
                </div>

                {/* Product Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem',
                  padding: '1.5rem'
                }}>
                  {vendorProducts.map(product => (
                    <div
                      key={product._id}
                      style={{
                        background: '#fafafa',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                            {product.manufacturer} {product.model}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px'
                          }}>
                            {product.category}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          background: (product.status || 'active') === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: (product.status || 'active') === 'active' ? '#166534' : '#6b7280'
                        }}>
                          {(product.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span><strong>Speed:</strong> {product.speed}ppm</span>
                          <span><strong>Volume:</strong> {product.minVolume?.toLocaleString()}-{product.maxVolume?.toLocaleString()}/mo</span>
                        </div>
                      </div>

                      {product.costs?.cpcRates && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          <strong>CPC:</strong> {product.costs.cpcRates.A4Mono}p mono, {product.costs.cpcRates.A4Colour}p colour
                        </div>
                      )}

                      {product.features && product.features.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {product.features.slice(0, 4).map((feature, i) => (
                            <span key={i} style={{
                              fontSize: '0.625rem',
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem'
                            }}>
                              {feature}
                            </span>
                          ))}
                          {product.features.length > 4 && (
                            <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                              +{product.features.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>No Products in Catalog</h3>
                <p style={{ margin: '0 0 1.5rem', color: '#6b7280' }}>
                  Get started by adding your first product or uploading a catalog
                </p>
                <button
                  onClick={handleAddProduct}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  <Plus size={16} /> Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quote Requests Tab */}
        {dashboardState.activeTab === "quotes" && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Quote Requests</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
                Manage incoming quote requests from potential customers
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Pending', count: metrics.pendingQuotes, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Viewed', count: metrics.viewedQuotes, color: '#3b82f6', bg: '#dbeafe' },
                { label: 'Contacted', count: metrics.contactedQuotes, color: '#8b5cf6', bg: '#ede9fe' },
                { label: 'Quoted', count: metrics.quotedQuotes, color: '#06b6d4', bg: '#cffafe' },
                { label: 'Won', count: metrics.wonQuotes, color: '#10b981', bg: '#d1fae5' }
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                </div>
              ))}
            </div>

            {/* Leads List */}
            {leadsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading quote requests...</p>
              </div>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <Quote size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>No Quote Requests Yet</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  When customers request quotes from your profile, they'll appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leads.map(lead => (
                  <div
                    key={lead._id}
                    style={{
                      background: 'white',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Lead Header */}
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                          {lead.customer?.companyName || 'Unknown Company'}
                        </h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {lead.customer?.contactName} • {lead.service}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          background: lead.status === 'pending' ? '#fef3c7' :
                                     lead.status === 'viewed' ? '#dbeafe' :
                                     lead.status === 'contacted' ? '#ede9fe' :
                                     lead.status === 'quoted' ? '#cffafe' :
                                     lead.status === 'won' ? '#d1fae5' : '#fee2e2',
                          color: lead.status === 'pending' ? '#d97706' :
                                 lead.status === 'viewed' ? '#2563eb' :
                                 lead.status === 'contacted' ? '#7c3aed' :
                                 lead.status === 'quoted' ? '#0891b2' :
                                 lead.status === 'won' ? '#059669' : '#dc2626'
                        }}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Lead Details */}
                    <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Contact Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                          <span><Mail size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#9ca3af' }} />{lead.customer?.email}</span>
                          <span><Phone size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#9ca3af' }} />{lead.customer?.phone}</span>
                          {lead.customer?.postcode && (
                            <span><MapPin size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#9ca3af' }} />{lead.customer?.postcode}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Requirements</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                          {lead.monthlyVolume && <span>Volume: {lead.monthlyVolume}</span>}
                          {lead.timeline && <span>Timeline: {lead.timeline}</span>}
                          {lead.budgetRange && <span>Budget: {lead.budgetRange}</span>}
                        </div>
                      </div>

                      {lead.customer?.message && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Message</div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', background: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem' }}>
                            <MessageSquare size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#9ca3af' }} />
                            {lead.customer.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lead Actions */}
                    <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {lead.status === 'pending' && (
                        <button
                          onClick={() => updateLeadStatus(lead._id, 'viewed')}
                          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Eye size={14} /> Mark as Viewed
                        </button>
                      )}
                      {(lead.status === 'pending' || lead.status === 'viewed') && (
                        <button
                          onClick={() => updateLeadStatus(lead._id, 'contacted')}
                          style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Phone size={14} /> Mark as Contacted
                        </button>
                      )}
                      {lead.status === 'contacted' && (
                        <button
                          onClick={() => updateLeadStatus(lead._id, 'quoted')}
                          style={{ padding: '0.5rem 1rem', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Quote size={14} /> Mark as Quoted
                        </button>
                      )}
                      {lead.status === 'quoted' && (
                        <>
                          <button
                            onClick={() => updateLeadStatus(lead._id, 'won')}
                            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <CheckCircle size={14} /> Won
                          </button>
                          <button
                            onClick={() => updateLeadStatus(lead._id, 'lost')}
                            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <X size={14} /> Lost
                          </button>
                        </>
                      )}
                      <a
                        href={`mailto:${lead.customer?.email}?subject=Re: Quote Request for ${lead.service}`}
                        style={{ padding: '0.5rem 1rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      >
                        <Mail size={14} /> Send Email
                      </a>
                      <a
                        href={`tel:${lead.customer?.phone}`}
                        style={{ padding: '0.5rem 1rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                      >
                        <Phone size={14} /> Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics and Notifications tabs show coming soon message */}
        {/* Settings Tab */}
        {dashboardState.activeTab === "settings" && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Profile Settings</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
                Complete your profile to improve your AI Visibility Score
              </p>
            </div>

            {profileLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading profile...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Section 1: Basic Info */}
                <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} style={{ color: '#3b82f6' }} /> Basic Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Phone Number <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="020 1234 5678"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Email (read-only)
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', background: '#f9fafb', color: '#6b7280' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="London"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Postcode <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.postcode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                        placeholder="SW1A 1AA"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Business Details */}
                <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={20} style={{ color: '#3b82f6' }} /> Business Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Website <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://www.yourcompany.co.uk"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Years in Business <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profileData.yearsInBusiness}
                        onChange={(e) => setProfileData(prev => ({ ...prev, yearsInBusiness: parseInt(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Description / About Us
                    </label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell potential customers about your business, experience, and what makes you unique..."
                      rows={4}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Services Offered <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {['Photocopiers', 'Telecoms', 'CCTV', 'IT Support', 'Security', 'Software', 'Managed Print'].map(service => (
                        <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', background: profileData.services.includes(service) ? '#dbeafe' : '#f3f4f6', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: profileData.services.includes(service) ? '#1d4ed8' : '#374151' }}>
                          <input
                            type="checkbox"
                            checked={profileData.services.includes(service)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfileData(prev => ({ ...prev, services: [...prev.services, service] }));
                              } else {
                                setProfileData(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          {service}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Coverage Areas <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {profileData.coverage.map((area, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '9999px', fontSize: '0.75rem' }}>
                          {area}
                          <button onClick={() => removeTag('coverage', i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#4338ca' }}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newTag.coverage}
                        onChange={(e) => setNewTag(prev => ({ ...prev, coverage: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('coverage', newTag.coverage))}
                        placeholder="Add coverage area (e.g., London, South East)"
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => addTag('coverage', newTag.coverage)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>Add</button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Products & Brands */}
                <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={20} style={{ color: '#3b82f6' }} /> Products & Brands
                  </h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Brands You Carry
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {profileData.brands.map((brand, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem' }}>
                          {brand}
                          <button onClick={() => removeTag('brands', i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#166534' }}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newTag.brands}
                        onChange={(e) => setNewTag(prev => ({ ...prev, brands: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('brands', newTag.brands))}
                        placeholder="Add brand (e.g., Canon, Ricoh, Konica Minolta)"
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => addTag('brands', newTag.brands)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>Add</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: '#1d4ed8' }}>Product Catalog</strong>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        Upload your products with pricing to earn +30 visibility points
                      </p>
                    </div>
                    <button
                      onClick={() => setDashboardState(prev => ({ ...prev, activeTab: 'files' }))}
                      style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Package size={14} /> Manage Products
                    </button>
                  </div>
                </div>

                {/* Section 4: Trust & Credentials */}
                <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={20} style={{ color: '#3b82f6' }} /> Trust & Credentials
                  </h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Certifications <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {profileData.certifications.map((cert, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '9999px', fontSize: '0.75rem' }}>
                          {cert}
                          <button onClick={() => removeTag('certifications', i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#92400e' }}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newTag.certifications}
                        onChange={(e) => setNewTag(prev => ({ ...prev, certifications: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('certifications', newTag.certifications))}
                        placeholder="Add certification (e.g., ISO 9001, Cyber Essentials)"
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => addTag('certifications', newTag.certifications)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>Add</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Accreditations & Partnerships <span style={{ color: '#10b981', fontSize: '0.75rem' }}>+5 pts</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {profileData.accreditations.map((acc, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fae8ff', color: '#86198f', borderRadius: '9999px', fontSize: '0.75rem' }}>
                          {acc}
                          <button onClick={() => removeTag('accreditations', i)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#86198f' }}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={newTag.accreditations}
                        onChange={(e) => setNewTag(prev => ({ ...prev, accreditations: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('accreditations', newTag.accreditations))}
                        placeholder="Add accreditation (e.g., Canon Partner, Ricoh Dealer)"
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                      />
                      <button onClick={() => addTag('accreditations', newTag.accreditations)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>Add</button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving}
                    style={{
                      padding: '0.75rem 2rem',
                      background: profileSaving ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: profileSaving ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {profileSaving ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab - Tier-gated features */}
        {dashboardState.activeTab === "analytics" && (() => {
          const tier = profileData.tier || 'listed';
          const isVisible = tier === 'visible' || tier === 'verified';
          const isVerified = tier === 'verified';

          // Locked card component
          const LockedCard = ({ icon: Icon, iconBg, iconColor, title, fakeValue, subtitle, upgradeText, upgradeTier }) => (
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: iconBg,
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} style={{ color: iconColor }} />
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{title}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{fakeValue}</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>{subtitle}</div>
              </div>
              {/* Lock overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#374151', textAlign: 'center', fontWeight: '500' }}>
                  {upgradeText}
                </span>
              </div>
            </div>
          );

          return (
            <div>
              {/* Header with tier badge and date range */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>
                      Analytics
                    </h2>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: tier === 'verified' ? '#fef3c7' : tier === 'visible' ? '#dbeafe' : '#f3f4f6',
                      color: tier === 'verified' ? '#92400e' : tier === 'visible' ? '#1e40af' : '#6b7280'
                    }}>
                      {tier === 'verified' ? 'Verified' : tier === 'visible' ? 'Visible' : 'Listed (Free)'}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    Track your profile performance and engagement
                  </p>
                </div>
                {isVisible && (
                  <select
                    value={analyticsData.dateRange}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, dateRange: e.target.value }))}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      background: 'white',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    {isVerified && <option value="90">Last 90 days</option>}
                  </select>
                )}
              </div>

              {analyticsData.loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '4rem',
                  background: 'white',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : analyticsData.error ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'white',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{analyticsData.error}</p>
                  <button onClick={fetchAnalytics} style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Key Metrics Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Profile Views - Always visible */}
                    <div style={{
                      background: 'white',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#dbeafe',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Eye size={20} style={{ color: '#3b82f6' }} />
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Profile Views</span>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                        {analyticsData.stats?.views || 0}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        {isVisible ? `${analyticsData.stats?.uniqueViews || 0} unique visitors` : 'Total views'}
                      </div>
                    </div>

                    {/* Quote Requests - Locked for free */}
                    {isVisible ? (
                      <div style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#d1fae5',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileText size={20} style={{ color: '#059669' }} />
                          </div>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Quote Requests</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                          {analyticsData.stats?.quoteRequests || 0}
                        </div>
                        <div style={{ color: '#059669', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {analyticsData.stats?.conversionRate || '0%'} conversion rate
                        </div>
                      </div>
                    ) : (
                      <LockedCard
                        icon={FileText}
                        iconBg="#d1fae5"
                        iconColor="#059669"
                        title="Quote Requests"
                        fakeValue="12"
                        subtitle="8.5% conversion"
                        upgradeText="Upgrade to Visible (£99/mo)"
                      />
                    )}

                    {/* Website Clicks - Locked for free */}
                    {isVisible ? (
                      <div style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#fef3c7',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ExternalLink size={20} style={{ color: '#d97706' }} />
                          </div>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Website Clicks</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                          {analyticsData.stats?.websiteClicks || 0}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          Outbound traffic
                        </div>
                      </div>
                    ) : (
                      <LockedCard
                        icon={ExternalLink}
                        iconBg="#fef3c7"
                        iconColor="#d97706"
                        title="Website Clicks"
                        fakeValue="28"
                        subtitle="Outbound traffic"
                        upgradeText="Upgrade to Visible (£99/mo)"
                      />
                    )}

                    {/* Phone Clicks - Locked for free */}
                    {isVisible ? (
                      <div style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#ede9fe',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Phone size={20} style={{ color: '#7c3aed' }} />
                          </div>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Phone Clicks</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                          {analyticsData.stats?.phoneClicks || 0}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          Call inquiries
                        </div>
                      </div>
                    ) : (
                      <LockedCard
                        icon={Phone}
                        iconBg="#ede9fe"
                        iconColor="#7c3aed"
                        title="Phone Clicks"
                        fakeValue="7"
                        subtitle="Call inquiries"
                        upgradeText="Upgrade to Visible (£99/mo)"
                      />
                    )}
                  </div>

                  {/* Daily Activity Chart */}
                  <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                      Daily Activity
                    </h3>
                    {isVisible ? (
                      analyticsData.daily.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px', padding: '0.5rem 0' }}>
                          {analyticsData.daily.slice(isVerified ? -30 : -14).map((day) => {
                            const totalEvents = day.events?.reduce((sum, e) => sum + e.count, 0) || 0;
                            const maxEvents = Math.max(...analyticsData.daily.slice(isVerified ? -30 : -14).map(d =>
                              d.events?.reduce((sum, e) => sum + e.count, 0) || 0
                            ), 1);
                            const height = (totalEvents / maxEvents) * 100;

                            return (
                              <div
                                key={day.date}
                                style={{
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title={`${day.date}: ${totalEvents} events`}
                              >
                                <div style={{
                                  width: '100%',
                                  height: `${Math.max(height, 5)}%`,
                                  background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                                  borderRadius: '4px 4px 0 0',
                                  minHeight: '4px',
                                  transition: 'height 0.3s ease'
                                }} />
                                <span style={{
                                  fontSize: '0.5rem',
                                  color: '#9ca3af',
                                  transform: 'rotate(-45deg)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          height: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '0.875rem'
                        }}>
                          No activity data yet
                        </div>
                      )
                    ) : (
                      <>
                        {/* Fake blurred chart for free tier */}
                        <div style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px', padding: '0.5rem 0' }}>
                            {[35, 48, 25, 60, 42, 55, 70, 45, 38, 65, 52, 40, 58, 50].map((h, i) => (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                  width: '100%',
                                  height: `${h}%`,
                                  background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                                  borderRadius: '4px 4px 0 0'
                                }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Lock overlay */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(2px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.75rem'
                          }}>
                            <svg width="24" height="24" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                          </div>
                          <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
                            Upgrade to unlock activity insights
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Visible tier (£99/mo) or higher
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Traffic Sources - Locked for free and visible */}
                  <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                      Traffic Sources
                    </h3>
                    {isVerified ? (
                      analyticsData.sources.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {analyticsData.sources.map((source, index) => {
                            const maxCount = analyticsData.sources[0]?.count || 1;
                            const percentage = (source.count / maxCount) * 100;
                            return (
                              <div key={source.source} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ width: '80px', fontSize: '0.875rem', color: '#374151', textTransform: 'capitalize' }}>
                                  {source.source}
                                </span>
                                <div style={{ flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : '#93c5fd',
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease'
                                  }} />
                                </div>
                                <span style={{ width: '50px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                  {source.count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                          No traffic source data yet
                        </div>
                      )
                    ) : (
                      <>
                        {/* Fake blurred sources */}
                        <div style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Google', 'Direct', 'LinkedIn', 'TendorAI'].map((s, i) => (
                              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ width: '80px', fontSize: '0.875rem', color: '#374151' }}>{s}</span>
                                <div style={{ flex: 1, height: '24px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${[80, 60, 40, 30][i]}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                                </div>
                                <span style={{ width: '50px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                  {[45, 32, 18, 12][i]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Lock overlay */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(2px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.75rem'
                          }}>
                            <svg width="24" height="24" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                          </div>
                          <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
                            Upgrade to Verified (£149/mo)
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            See where your traffic comes from
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Upgrade CTA for free tier */}
                  {!isVisible && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '2rem',
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      borderRadius: '0.75rem',
                      border: '1px solid #fcd34d',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#92400e', fontSize: '1.125rem' }}>
                        Unlock Full Analytics
                      </h4>
                      <p style={{ margin: '0 0 1rem', color: '#a16207', fontSize: '0.875rem' }}>
                        See quote requests, click tracking, daily activity charts and more.
                      </p>
                      <button
                        onClick={() => navigate('/vendor-dashboard/upgrade')}
                        style={{
                          padding: '0.75rem 2rem',
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                        }}
                      >
                        Upgrade to Visible - £99/mo
                      </button>
                    </div>
                  )}

                  {/* Upgrade CTA for visible tier */}
                  {isVisible && !isVerified && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      borderRadius: '0.75rem',
                      border: '1px solid #93c5fd',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1e40af', fontSize: '1rem' }}>
                        Want deeper insights?
                      </h4>
                      <p style={{ margin: '0 0 1rem', color: '#1e3a8a', fontSize: '0.875rem' }}>
                        Verified tier unlocks traffic sources, 90-day history, and AI referral tracking.
                      </p>
                      <button
                        onClick={() => navigate('/vendor-dashboard/upgrade')}
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Upgrade to Verified - £149/mo
                      </button>
                    </div>
                  )}

                  {/* Empty state if no data at all */}
                  {!analyticsData.stats?.views && !analyticsData.daily.length && isVisible && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '2rem',
                      background: '#f0f9ff',
                      borderRadius: '0.75rem',
                      border: '1px solid #bae6fd',
                      textAlign: 'center'
                    }}>
                      <BarChart3 size={40} style={{ color: '#0284c7', marginBottom: '1rem' }} />
                      <h4 style={{ margin: '0 0 0.5rem', color: '#0369a1' }}>No Analytics Data Yet</h4>
                      <p style={{ margin: 0, color: '#0284c7', fontSize: '0.875rem' }}>
                        Analytics will appear here as visitors view your profile.
                        <br />Complete your profile and add products to increase visibility.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* Notifications Tab - Coming Soon */}
        {dashboardState.activeTab === "notifications" && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              padding: '1rem',
              background: '#f3f4f6',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={32} style={{ color: '#6b7280' }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>
              Notifications Coming Soon
            </h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              This section is under development. Check back soon!
            </p>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {productForm.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                {productForm.mode === 'add' ? 'Add New Product' : 
                 productForm.mode === 'edit' ? 'Edit Product' : 'Duplicate Product'}
              </h3>
              <button
                onClick={() => setProductForm(prev => ({ ...prev, isOpen: false }))}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Manufacturer */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={productForm.data.manufacturer}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      data: { ...prev.data, manufacturer: e.target.value },
                      isDirty: true
                    }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${productForm.errors.manufacturer ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="e.g., Canon, HP, Xerox"
                  />
                  {productForm.errors.manufacturer && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                      {productForm.errors.manufacturer}
                    </p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    value={productForm.data.model}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      data: { ...prev.data, model: e.target.value },
                      isDirty: true
                    }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${productForm.errors.model ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="e.g., imageRUNNER ADVANCE DX C5750i"
                  />
                  {productForm.errors.model && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                      {productForm.errors.model}
                    </p>
                  )}
                </div>

                {/* Category & Speed */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Category
                    </label>
                    <select
                      value={productForm.data.category}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { ...prev.data, category: e.target.value },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="Multifunction Printer">Multifunction Printer</option>
                      <option value="Laser Printer">Laser Printer</option>
                      <option value="Inkjet Printer">Inkjet Printer</option>
                      <option value="Wide Format Printer">Wide Format Printer</option>
                      <option value="Production Printer">Production Printer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Speed (PPM) *
                    </label>
                    <input
                      type="number"
                      value={productForm.data.speed}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { ...prev.data, speed: e.target.value },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${productForm.errors.speed ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="50"
                      min="1"
                    />
                    {productForm.errors.speed && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                        {productForm.errors.speed}
                      </p>
                    )}
                  </div>
                </div>

                {/* Volume Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Min Volume (pages/month) *
                    </label>
                    <input
                      type="number"
                      value={productForm.data.minVolume}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { ...prev.data, minVolume: e.target.value },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${productForm.errors.minVolume ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="5000"
                      min="1"
                    />
                    {productForm.errors.minVolume && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                        {productForm.errors.minVolume}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Max Volume (pages/month) *
                    </label>
                    <input
                      type="number"
                      value={productForm.data.maxVolume}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { ...prev.data, maxVolume: e.target.value },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${productForm.errors.maxVolume ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="15000"
                      min="1"
                    />
                    {productForm.errors.maxVolume && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                        {productForm.errors.maxVolume}
                      </p>
                    )}
                  </div>
                </div>

                {/* CPC Rates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Mono CPC (pence) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.data.costs.cpcRates.A4Mono}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { 
                          ...prev.data, 
                          costs: { 
                            ...prev.data.costs, 
                            cpcRates: { 
                              ...prev.data.costs.cpcRates, 
                              A4Mono: e.target.value 
                            } 
                          } 
                        },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${productForm.errors.monoRate ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="1.20"
                      min="0.01"
                    />
                    {productForm.errors.monoRate && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                        {productForm.errors.monoRate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Color CPC (pence)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.data.costs.cpcRates.A4Colour}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { 
                          ...prev.data, 
                          costs: { 
                            ...prev.data.costs, 
                            cpcRates: { 
                              ...prev.data.costs.cpcRates, 
                              A4Colour: e.target.value 
                            } 
                          } 
                        },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="4.80"
                      min="0"
                    />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                      Leave empty for mono-only printers
                    </p>
                  </div>
                </div>

                {/* Paper Size & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Primary Paper Size
                    </label>
                    <select
                      value={productForm.data.paperSizes.primary}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { 
                          ...prev.data, 
                          paperSizes: { 
                            ...prev.data.paperSizes, 
                            primary: e.target.value 
                          } 
                        },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                      <option value="SRA3">SRA3</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Status
                    </label>
                    <select
                      value={productForm.data.status}
                      onChange={(e) => setProductForm(prev => ({
                        ...prev,
                        data: { ...prev.data, status: e.target.value },
                        isDirty: true
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={productForm.data.description}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value },
                      isDirty: true
                    }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Brief description of the product and its key features..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setProductForm(prev => ({ ...prev, isOpen: false }))}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={!productForm.isDirty}
                style={{
                  background: productForm.isDirty ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  cursor: productForm.isDirty ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500'
                }}
              >
                <Save size={16} /> 
                {productForm.mode === 'add' ? 'Add Product' : 
                 productForm.mode === 'edit' ? 'Update Product' : 'Duplicate Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {dashboardState.loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ margin: 0, color: '#374151', fontWeight: '500' }}>Processing upload...</p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
