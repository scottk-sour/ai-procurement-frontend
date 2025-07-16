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
  // Mock auth context
  const auth = {
    token: "mock-token",
    user: {
      name: "John Smith",
      email: "john@printtech.com",
      companyName: "PrintTech Solutions",
      verified: true,
      rating: 4.2,
      userId: "vendor123"
    }
  };

  // Enhanced state management
  const [vendorData, setVendorData] = useState({
    name: auth?.user?.name || "Vendor",
    email: auth?.user?.email || "",
    companyName: auth?.user?.companyName || "",
    verified: auth?.user?.verified || false,
    rating: auth?.user?.rating || 0,
    totalEarnings: 15420,
    monthlyEarnings: 3240
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

  const [dataState, setDataState] = useState({
    recentActivity: [
      { type: "quote", description: "New quote request from TechCorp", date: new Date().toISOString() },
      { type: "upload", description: "Uploaded 15 new products", date: new Date(Date.now() - 86400000).toISOString() }
    ],
    uploadedFiles: [],
    quotes: [
      {
        _id: "quote1",
        companyName: "TechCorp Ltd",
        status: "Pending",
        industryType: "Technology",
        monthlyVolume: { mono: 5000, colour: 2000 },
        maxBudget: 850,
        requirements: ["A4 Support", "High Speed", "Network Ready"],
        createdAt: new Date().toISOString()
      }
    ],
    notifications: [
      { type: "quote", title: "New Quote Request", message: "TechCorp has requested a quote", read: false, createdAt: new Date().toISOString() }
    ]
  });

  const [message, setMessage] = useState({ text: "", type: "", visible: false });
  const [uploadResults, setUploadResults] = useState(null);

  // Enhanced product management state
  const [vendorProducts, setVendorProducts] = useState([
    {
      _id: "prod1",
      manufacturer: "Canon",
      model: "imageRUNNER ADVANCE DX C5750i",
      category: "Multifunction Printer",
      speed: 50,
      minVolume: 5000,
      maxVolume: 15000,
      paperSizes: { primary: "A4", supported: ["A4", "A3", "Letter"] },
      costs: { cpcRates: { A4Mono: 1.2, A4Colour: 4.8 } },
      status: "active",
      features: ["Duplex", "Network", "Mobile Print"],
      description: "High-volume color multifunction printer",
      createdAt: new Date().toISOString()
    },
    {
      _id: "prod2", 
      manufacturer: "HP",
      model: "LaserJet Enterprise MFP M635h",
      category: "Laser Printer",
      speed: 65,
      minVolume: 8000,
      maxVolume: 25000,
      paperSizes: { primary: "A4", supported: ["A4", "Letter", "Legal"] },
      costs: { cpcRates: { A4Mono: 0.9, A4Colour: 0 } },
      status: "active",
      features: ["High Speed", "Security", "Energy Efficient"],
      description: "Enterprise-grade monochrome laser printer",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: "prod3",
      manufacturer: "Xerox",
      model: "VersaLink C405",
      category: "Multifunction Printer",
      speed: 36,
      minVolume: 2000,
      maxVolume: 8000,
      paperSizes: { primary: "A4", supported: ["A4", "A5", "Letter"] },
      costs: { cpcRates: { A4Mono: 1.5, A4Colour: 5.2 } },
      status: "inactive",
      features: ["Compact", "WiFi", "Touch Screen"],
      description: "Compact color multifunction for small offices",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

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

  // Mock analytics data
  const analyticsData = useMemo(() => {
    const currentDate = new Date();
    const days = parseInt(analyticsState.dateRange);
    
    // Generate revenue data
    const revenueData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      revenueData.push({
        date: date.toLocaleDateString("en-GB", { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 1000) + 500,
        quotes: Math.floor(Math.random() * 10) + 5,
        conversions: Math.floor(Math.random() * 5) + 2,
        avgDealValue: Math.floor(Math.random() * 200) + 300
      });
    }

    // Product performance data
    const productPerformance = [
      { name: "Canon MF Series", quotes: 45, revenue: 15400, successRate: 73 },
      { name: "HP LaserJet Pro", quotes: 38, revenue: 12800, successRate: 68 },
      { name: "Xerox WorkCentre", quotes: 32, revenue: 11200, successRate: 62 },
      { name: "Brother HL Series", quotes: 28, revenue: 9600, successRate: 71 },
      { name: "Ricoh MP Series", quotes: 22, revenue: 7800, successRate: 59 }
    ];

    // Industry breakdown
    const industryData = [
      { name: "Technology", value: 35, count: 24, avgValue: 850 },
      { name: "Healthcare", value: 28, count: 19, avgValue: 920 },
      { name: "Finance", value: 18, count: 12, avgValue: 1200 },
      { name: "Education", value: 12, count: 8, avgValue: 650 },
      { name: "Manufacturing", value: 7, count: 5, avgValue: 780 }
    ];

    // Monthly trends
    const monthlyTrends = [
      { month: "Jan", revenue: 18500, quotes: 67, avgResponse: 2.3 },
      { month: "Feb", revenue: 21200, quotes: 73, avgResponse: 2.1 },
      { month: "Mar", revenue: 19800, quotes: 69, avgResponse: 2.4 },
      { month: "Apr", revenue: 23400, quotes: 81, avgResponse: 1.9 },
      { month: "May", revenue: 25100, quotes: 87, avgResponse: 1.8 },
      { month: "Jun", revenue: 26800, quotes: 92, avgResponse: 1.7 }
    ];

    // Performance metrics
    const performanceMetrics = {
      totalRevenue: 134800,
      totalQuotes: 469,
      averageConversion: 68,
      averageResponseTime: 1.9,
      topPerformingCategory: "Multifunction Printers",
      bestMonth: "June",
      growthRate: 15.2,
      customerSatisfaction: 4.3
    };

    return {
      revenueData,
      productPerformance,
      industryData,
      monthlyTrends,
      performanceMetrics
    };
  }, [analyticsState.dateRange]);

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    success: '#22c55e'
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  // Bulk operations
  const handleSelectProduct = useCallback((productId, checked) => {
    setProductState(prev => {
      const newSelected = new Set(prev.selectedProducts);
      if (checked) {
        newSelected.add(productId);
      } else {
        newSelected.delete(productId);
      }
      return { ...prev, selectedProducts: newSelected };
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (productState.selectedProducts.size === 0) return;
    
    setBulkActions({
      isOpen: true,
      action: "delete",
      confirmText: `Delete ${productState.selectedProducts.size} selected products?`
    });
  }, [productState.selectedProducts]);

  const executeBulkAction = useCallback(() => {
    if (bulkActions.action === "delete") {
      setVendorProducts(prev => 
        prev.filter(p => !productState.selectedProducts.has(p._id))
      );
      setProductState(prev => ({ ...prev, selectedProducts: new Set() }));
      showMessage(`Deleted ${productState.selectedProducts.size} products`, "success");
    }
    setBulkActions({ isOpen: false, action: "", confirmText: "" });
  }, [bulkActions, productState.selectedProducts, showMessage]);

  // Enhanced product catalog upload function
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

    // Simulate upload process
    setTimeout(() => {
      const mockResults = {
        success: true,
        savedProducts: 25,
        data: {
          stats: { total: 27, saved: 25, invalid: 2 },
          warnings: [
            "Row 15: Price seems high for volume range",
            "Row 23: No colour support specified, assuming mono only"
          ]
        }
      };
      
      setUploadResults(mockResults);
      showMessage(`Successfully uploaded ${mockResults.savedProducts} products!`, "success");
      setDashboardState(prev => ({ ...prev, loading: false }));
    }, 2000);
  }, [showMessage]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = vendorProducts || [];
    
    if (productState.searchTerm) {
      const search = productState.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.manufacturer || "").toLowerCase().includes(search) ||
        (product.model || "").toLowerCase().includes(search) ||
        (product.category || "").toLowerCase().includes(search)
      );
    }
    
    if (productState.filterCategory !== "all") {
      filtered = filtered.filter(product => product.category === productState.filterCategory);
    }
    
    if (productState.filterStatus !== "all") {
      filtered = filtered.filter(product => product.status === productState.filterStatus);
    }
    
    return filtered.sort((a, b) => {
      const aVal = a[productState.sortBy] || "";
      const bVal = b[productState.sortBy] || "";
      const order = productState.sortOrder === "asc" ? 1 : -1;
      
      if (productState.sortBy === "createdAt") {
        return order * (new Date(aVal) - new Date(bVal));
      }
      return order * aVal.toString().localeCompare(bVal.toString());
    });
  }, [vendorProducts, productState]);

  // This must come after filteredProducts is defined
  const handleSelectAllProducts = useCallback((checked) => {
    const filtered = filteredProducts;
    if (checked) {
      setProductState(prev => ({ 
        ...prev, 
        selectedProducts: new Set(filtered.map(p => p._id)) 
      }));
    } else {
      setProductState(prev => ({ ...prev, selectedProducts: new Set() }));
    }
  }, [filteredProducts]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(vendorProducts.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [vendorProducts]);

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
                {vendorData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Welcome back, {vendorData.name}!
                  {vendorData.verified && (
                    <CheckCircle size={20} style={{ color: '#4ade80' }} />
                  )}
                </h1>
                <p style={{ margin: '0.25rem 0 0', opacity: 0.9 }}>{vendorData.companyName}</p>
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
              { id: "notifications", label: "Notifications", icon: <Bell size={18} />, badge: 1 }
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

        {dashboardState.activeTab === "analytics" && (
          <div>
            {/* Analytics Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Performance Analytics</h2>
                  <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
                    Track your vendor performance and identify growth opportunities
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={analyticsState.dateRange}
                    onChange={(e) => setAnalyticsState(prev => ({ ...prev, dateRange: e.target.value }))}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                  <button
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={16} /> Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#dbeafe', borderRadius: '0.5rem', color: '#1d4ed8' }}>
                    <PoundSterling size={24} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} /> +15.2%
                  </div>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Total Revenue</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>
                  {formatCurrency(analyticsData.performanceMetrics.totalRevenue)}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>vs last period</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '0.5rem', color: '#16a34a' }}>
                    <Target size={24} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} /> +3.2%
                  </div>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Conversion Rate</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>
                  {analyticsData.performanceMetrics.averageConversion}%
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>quotes to wins</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#d97706' }}>
                    <Clock size={24} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingDown size={14} /> -12min
                  </div>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Avg Response Time</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>
                  {analyticsData.performanceMetrics.averageResponseTime}h
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>industry avg: 4.2h</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '0.5rem', color: '#4338ca' }}>
                    <Star size={24} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} /> +0.2
                  </div>
                </div>
                <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Customer Rating</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0.25rem 0' }}>
                  {analyticsData.performanceMetrics.customerSatisfaction}/5
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>based on 127 reviews</p>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Revenue Trend Chart */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Revenue Trend</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['revenue', 'quotes', 'conversions'].map(metric => (
                      <button
                        key={metric}
                        onClick={() => setAnalyticsState(prev => ({ ...prev, selectedMetric: metric }))}
                        style={{
                          background: analyticsState.selectedMetric === metric ? '#3b82f6' : '#f3f4f6',
                          color: analyticsState.selectedMetric === metric ? 'white' : '#6b7280',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey={analyticsState.selectedMetric} 
                      stroke={chartColors.primary} 
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Industry Breakdown */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Industry Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.industryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {analyticsData.industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '1rem' }}>
                  {analyticsData.industryData.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: index < analyticsData.industryData.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pieColors[index % pieColors.length] }} />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{item.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{item.count} quotes</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatCurrency(item.avgValue)} avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Performance & Monthly Trends */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Top Products */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Top Performing Products</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analyticsData.productPerformance.map((product, index) => (
                    <div key={product.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '0.5rem', 
                        background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#6b7280',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                      }}>
                        #{index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {product.quotes} quotes • {product.successRate}% success rate
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{formatCurrency(product.revenue)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Performance */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.5rem'
                      }} 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Revenue' : name === 'quotes' ? 'Quotes' : 'Avg Response (hrs)'
                      ]}
                    />
                    <Bar dataKey="revenue" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Insights */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '600' }}>Performance Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={16} style={{ color: '#16a34a' }} />
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#166534' }}>Strong Growth</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>
                    Revenue increased by 15.2% compared to last period, driven by improved conversion rates.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Award size={16} style={{ color: '#2563eb' }} />
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>Top Performer</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                    Your response time is 53% faster than industry average, leading to higher win rates.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: '#fefce8', borderRadius: '0.5rem', border: '1px solid #fde047' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Target size={16} style={{ color: '#ca8a04' }} />
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#a16207' }}>Opportunity</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#a16207' }}>
                    Focus on the Healthcare sector - it shows 12% higher average deal values.
                  </p>
                </div>
              </div>
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

              {/* Product Controls */}
              <div style={{ 
                background: '#f9fafb', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                  {/* Search */}
                  <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
                    <Search style={{ 
                      position: 'absolute', 
                      left: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#9ca3af' 
                    }} size={16} />
                    <input
                      type="text"
                      placeholder="Search products by manufacturer, model, or category..."
                      value={productState.searchTerm}
                      onChange={(e) => setProductState(prev => ({ ...prev, searchTerm: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: 'white'
                      }}
                    />
                  </div>
                  
                  {/* Filters */}
                  <select
                    value={productState.filterCategory}
                    onChange={(e) => setProductState(prev => ({ ...prev, filterCategory: e.target.value }))}
                    style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.5rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={productState.filterStatus}
                    onChange={(e) => setProductState(prev => ({ ...prev, filterStatus: e.target.value }))}
                    style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.5rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <select
                    value={`${productState.sortBy}-${productState.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setProductState(prev => ({ ...prev, sortBy, sortOrder }));
                    }}
                    style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.5rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="manufacturer-asc">Manufacturer A-Z</option>
                    <option value="manufacturer-desc">Manufacturer Z-A</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="speed-desc">Highest Speed</option>
                    <option value="speed-asc">Lowest Speed</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <button
                      onClick={() => setProductState(prev => ({ ...prev, viewMode: 'grid' }))}
                      style={{
                        background: productState.viewMode === 'grid' ? '#3b82f6' : 'white',
                        color: productState.viewMode === 'grid' ? 'white' : '#6b7280',
                        border: 'none',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setProductState(prev => ({ ...prev, viewMode: 'table' }))}
                      style={{
                        background: productState.viewMode === 'table' ? '#3b82f6' : 'white',
                        color: productState.viewMode === 'table' ? 'white' : '#6b7280',
                        border: 'none',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {productState.selectedProducts.size > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '0.75rem', 
                    background: '#eff6ff', 
                    borderRadius: '0.5rem',
                    border: '1px solid #bfdbfe'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                      {productState.selectedProducts.size} products selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <Trash2 size={14} /> Delete Selected
                    </button>
                    <button
                      onClick={() => setProductState(prev => ({ ...prev, selectedProducts: new Set() }))}
                      style={{
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
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

                {/* Upload Results */}
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
                    
                    {uploadResults.success && (
                      <div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#166534' }}>
                          Successfully uploaded {uploadResults.savedProducts} products
                        </p>
                        {uploadResults.data?.stats && (
                          <div style={{ fontSize: '0.75rem', color: '#166534', display: 'flex', gap: '1rem' }}>
                            <span>Total: {uploadResults.data.stats.total}</span>
                            <span>Valid: {uploadResults.data.stats.saved}</span>
                            <span>Errors: {uploadResults.data.stats.invalid || 0}</span>
                          </div>
                        )}
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

            {/* Products List */}
            {filteredProducts.length > 0 ? (
              <div>
                {productState.viewMode === 'grid' ? (
                  /* Grid View */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredProducts.map((product, index) => (
                      <div key={product._id || index} style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                        ':hover': { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
                      }}>
                        <div style={{ padding: '1.5rem' }}>
                          {/* Product Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                  type="checkbox"
                                  checked={productState.selectedProducts.has(product._id)}
                                  onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                                  style={{ marginRight: '0.5rem' }}
                                />
                                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                                  {product.manufacturer} {product.model}
                                </h4>
                              </div>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: product.category === 'Multifunction Printer' ? '#dbeafe' : '#f3e8ff',
                                color: product.category === 'Multifunction Printer' ? '#1e40af' : '#7c3aed',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}>
                                {product.category}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleToggleProductStatus(product._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: product.status === 'active' ? '#10b981' : '#6b7280'
                                }}
                                title={`Status: ${product.status}`}
                              >
                                {product.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                              </button>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Speed:</span>
                              <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>{product.speed} PPM</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Paper Size:</span>
                              <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>{product.paperSizes?.primary}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Volume Range:</span>
                              <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
                                {product.minVolume?.toLocaleString()} - {product.maxVolume?.toLocaleString()} pages/month
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Mono CPC:</span>
                              <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
                                {product.costs?.cpcRates?.A4Mono || product.A4MonoCPC}p
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Color CPC:</span>
                              <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
                                {product.costs?.cpcRates?.A4Colour || product.A4ColourCPC || 'N/A'}p
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          {product.features && product.features.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Features:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {product.features.map((feature, idx) => (
                                  <span key={idx} style={{
                                    padding: '0.125rem 0.5rem',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem'
                                  }}>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Product Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              style={{
                                flex: 1,
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                              }}
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => handleDuplicateProduct(product)}
                              style={{
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Duplicate product"
                            >
                              <Copy size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Table View */
                  <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                          <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              <input
                                type="checkbox"
                                onChange={(e) => handleSelectAllProducts(e.target.checked)}
                                checked={productState.selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                style={{ marginRight: '0.5rem' }}
                              />
                              Product
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speed</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume Range</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPC Rates</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product, index) => (
                            <tr key={product._id || index} style={{ borderTop: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <input
                                    type="checkbox"
                                    checked={productState.selectedProducts.has(product._id)}
                                    onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                                  />
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                      {product.manufacturer} {product.model}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                      {product.paperSizes?.primary}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{
                                  padding: '0.25rem 0.75rem',
                                  background: product.category === 'Multifunction Printer' ? '#dbeafe' : '#f3e8ff',
                                  color: product.category === 'Multifunction Printer' ? '#1e40af' : '#7c3aed',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}>
                                  {product.category}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', color: '#374151' }}>{product.speed} PPM</td>
                              <td style={{ padding: '1rem', color: '#374151' }}>
                                {product.minVolume?.toLocaleString()} - {product.maxVolume?.toLocaleString()}
                              </td>
                              <td style={{ padding: '1rem', color: '#374151' }}>
                                <div style={{ fontSize: '0.875rem' }}>
                                  <div>Mono: {product.costs?.cpcRates?.A4Mono}p</div>
                                  <div>Color: {product.costs?.cpcRates?.A4Colour || 'N/A'}p</div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <button
                                  onClick={() => handleToggleProductStatus(product._id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: product.status === 'active' ? '#10b981' : '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  {product.status === 'active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                  <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{product.status}</span>
                                </button>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    onClick={() => handleEditProduct(product)}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    <Edit3 size={12} /> Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDuplicateProduct(product)}
                                    style={{
                                      background: '#f3f4f6',
                                      color: '#374151',
                                      border: 'none',
                                      padding: '0.25rem',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Duplicate"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product._id)}
                                    style={{
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: 'none',
                                      padding: '0.25rem',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

        {/* Other tabs content would go here */}
        {dashboardState.activeTab === "quotes" && (
          <div>
            {/* Enhanced Filters and Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
                  <Search style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af' 
                  }} size={16} />
                  <input
                    type="text"
                    placeholder="Search quotes by company or industry..."
                    value={dashboardState.searchTerm}
                    onChange={(e) => setDashboardState(prev => ({ 
                      ...prev, 
                      searchTerm: e.target.value 
                    }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                
                <select
                  value={dashboardState.filterStatus}
                  onChange={(e) => setDashboardState(prev => ({ 
                    ...prev, 
                    filterStatus: e.target.value 
                  }))}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.5rem',
                    background: 'white'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Enhanced Quotes List */}
            {dataState.quotes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {dataState.quotes.map((quote, index) => (
                  <div key={quote._id || index} style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>{quote.companyName || "Quote Request"}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: quote.status === 'Pending' ? '#fef3c7' : quote.status === 'Accepted' ? '#dcfce7' : '#fecaca',
                            color: quote.status === 'Pending' ? '#d97706' : quote.status === 'Accepted' ? '#16a34a' : '#dc2626',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {quote.status || "Unknown"}
                          </span>
                          <time style={{ fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(quote.createdAt)}</time>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{quote.industryType}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Monthly Volume</span>
                        <div style={{ fontSize: '1rem', color: '#374151', fontWeight: '600' }}>
                          {(quote.monthlyVolume?.mono || 0) + (quote.monthlyVolume?.colour || 0)} pages
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Colour/Mono Split</span>
                        <div style={{ fontSize: '1rem', color: '#374151', fontWeight: '600' }}>
                          {quote.monthlyVolume?.colour || 0} / {quote.monthlyVolume?.mono || 0}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Budget Range</span>
                        <div style={{ fontSize: '1rem', color: '#374151', fontWeight: '600' }}>{formatCurrency(quote.maxBudget || 0)}/month</div>
                      </div>
                    </div>

                    {quote.requirements && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Requirements:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {quote.requirements.map((req, idx) => (
                            <span key={idx} style={{
                              padding: '0.25rem 0.75rem',
                              background: '#f3f4f6',
                              color: '#374151',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem'
                            }}>
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                      {quote.status === "Pending" && (
                        <>
                          <button
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: '500'
                            }}
                          >
                            <CheckCircle size={16} /> Accept Quote
                          </button>
                          <button
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: '500'
                            }}
                          >
                            <X size={16} /> Decline
                          </button>
                        </>
                      )}
                      
                      <button
                        style={{
                          background: 'transparent',
                          color: '#3b82f6',
                          border: '1px solid #3b82f6',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Eye size={16} /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <Quote size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>No Quote Requests</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Quote requests from potential customers will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {dashboardState.activeTab === "notifications" && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Notifications</h2>
              <button style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                Mark All Read
              </button>
            </div>

            {dataState.notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dataState.notifications.map((notification, index) => (
                  <div 
                    key={index} 
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      boxShadow: notification.read ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ 
                      padding: '0.5rem', 
                      background: notification.type === 'quote' ? '#dbeafe' : '#dcfce7',
                      color: notification.type === 'quote' ? '#1d4ed8' : '#16a34a',
                      borderRadius: '0.5rem'
                    }}>
                      {notification.type === "quote" && <Quote size={20} />}
                      {notification.type === "payment" && <PoundSterling size={20} />}
                      {notification.type === "system" && <Bell size={20} />}
                      {notification.type === "alert" && <AlertTriangle size={20} />}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{notification.title}</h4>
                      <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>{notification.message}</p>
                      <time style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(notification.createdAt)}</time>
                    </div>
                    
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <Bell size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>No Notifications</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {dashboardState.activeTab !== "overview" && dashboardState.activeTab !== "files" && dashboardState.activeTab !== "analytics" && dashboardState.activeTab !== "quotes" && dashboardState.activeTab !== "notifications" && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#374151' }}>
              {dashboardState.activeTab.charAt(0).toUpperCase() + dashboardState.activeTab.slice(1)} Tab
            </h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              This section is under development
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

      {/* Bulk Actions Confirmation Modal */}
      {bulkActions.isOpen && (
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
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
                <AlertTriangle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                Confirm Action
              </h3>
              <p style={{ margin: '0 0 2rem', color: '#6b7280' }}>
                {bulkActions.confirmText}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setBulkActions({ isOpen: false, action: "", confirmText: "" })}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeBulkAction}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Confirm
                </button>
              </div>
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
            <p style={{ margin: 0, color: '#374151', fontWeight: '500' }}>Loading...</p>
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