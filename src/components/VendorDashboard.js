import React, { useState, useCallback, useMemo } from "react";
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
  Award
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const VendorDashboard = () => {
  // Mock auth context - cleaned up
  const auth = {
    token: "mock-token",
    user: {
      name: "",
      email: "",
      companyName: "",
      verified: false,
      rating: 0,
      userId: "vendor123"
    }
  };

  // Enhanced state management - cleaned up
  const [vendorData, setVendorData] = useState({
    name: auth?.user?.name || "Vendor",
    email: auth?.user?.email || "",
    companyName: auth?.user?.companyName || "",
    verified: auth?.user?.verified || false,
    rating: auth?.user?.rating || 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });

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

  // Enhanced metrics calculation
  const metrics = useMemo(() => {
    const quotes = dataState.quotes || [];
    const products = vendorProducts || [];
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      totalQuotes: quotes.length,
      pendingQuotes: quotes.filter(q => q.status === "Pending").length,
      acceptedQuotes: quotes.filter(q => q.status === "Accepted" || q.status === "Completed").length,
      completedQuotes: quotes.filter(q => q.status === "Completed").length,
      thisMonthQuotes: quotes.filter(q => new Date(q.createdAt) >= thisMonth).length,
      responseRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status !== "Pending").length / quotes.length) * 100) : 0,
      successRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status === "Accepted").length / quotes.length) * 100) : 0,
      activeProducts: products.filter(p => p.status === "active").length,
      totalProducts: products.length
    };
  }, [dataState.quotes, vendorProducts]);

  // Enhanced error handling
  const showMessage = useCallback((text, type = "info") => {
    setMessage({ text, type, visible: true });
    setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 5000);
  }, []);

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
      
      // Optionally refresh the product list if you have one
      // fetchVendorProducts();

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
  }, [showMessage, auth]);

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
              { id: "notifications", label: "Notifications", icon: <Bell size={18} />, badge: dataState.notifications.filter(n => !n.read).length }
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {dashboardState.activeTab === "overview" && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#dbeafe', borderRadius: '0.5rem', color: '#1d4ed8' }}>
                    <Quote size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Total Quotes</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.totalQuotes}</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ArrowUp size={14} /> +{metrics.thisMonthQuotes} this month
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#d97706' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Pending Responses</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.pendingQuotes}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Awaiting your response</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '0.5rem', color: '#16a34a' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Success Rate</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.successRate}%</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Accepted quotes</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '0.5rem', color: '#4338ca' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Products Listed</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>{metrics.totalProducts}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In your catalog</div>
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

            {/* Empty State for Products */}
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
          </div>
        )}

        {/* Other tabs show coming soon message */}
        {(dashboardState.activeTab === "quotes" || dashboardState.activeTab === "analytics" || dashboardState.activeTab === "notifications") && (
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
              {dashboardState.activeTab === "quotes" && <Quote size={32} style={{ color: '#6b7280' }} />}
              {dashboardState.activeTab === "analytics" && <BarChart3 size={32} style={{ color: '#6b7280' }} />}
              {dashboardState.activeTab === "notifications" && <Bell size={32} style={{ color: '#6b7280' }} />}
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>
              {dashboardState.activeTab.charAt(0).toUpperCase() + dashboardState.activeTab.slice(1)} Coming Soon
            </h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              This section is under development. Start by adding products to your catalog!
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
