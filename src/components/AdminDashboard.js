import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Building, CreditCard, TrendingUp,
  CheckCircle, XCircle, Eye, Edit, Package,
  MessageSquare, RefreshCw, LogOut, AlertCircle
} from 'lucide-react';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalQuotes: 0,
    totalLeads: 0,
    totalProducts: 0,
    activeSubscriptions: 0,
    recentVendors: 0,
    tierBreakdown: { free: 0, visible: 0, verified: 0 }
  });

  const [vendors, setVendors] = useState([]);
  const [leads, setLeads] = useState([]);

  const getToken = () => localStorage.getItem('adminToken');

  const fetchWithAuth = useCallback(async (endpoint) => {
    const token = getToken();
    if (!token) {
      navigate('/admin-login');
      return null;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      navigate('/admin-login');
      return null;
    }

    return response.json();
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/admin/stats');
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [fetchWithAuth]);

  const fetchVendors = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/admin/vendors');
      if (data?.success) {
        setVendors(data.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  }, [fetchWithAuth]);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/admin/leads');
      if (data?.success) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, [fetchWithAuth]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchVendors(), fetchLeads()]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchVendors, fetchLeads]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/admin-login');
      return;
    }
    loadAllData();
  }, [navigate, loadAllData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const handleChangeTier = async (vendorId, newTier) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/vendors/${vendorId}/tier`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier: newTier })
      });

      const data = await response.json();
      if (data.success) {
        setVendors(prev => prev.map(v =>
          v.id === vendorId ? { ...v, tier: newTier } : v
        ));
        setEditingVendor(null);
      } else {
        alert(data.message || 'Failed to update tier');
      }
    } catch (err) {
      console.error('Error updating tier:', err);
      alert('Failed to update tier');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getTierBadgeClass = (tier) => {
    const classes = {
      free: 'tier-free',
      visible: 'tier-visible',
      verified: 'tier-verified',
      basic: 'tier-visible',
      managed: 'tier-verified',
      enterprise: 'tier-verified'
    };
    return classes[tier] || 'tier-free';
  };

  const getTierDisplayName = (tier) => {
    const names = {
      free: 'Free',
      visible: 'Visible (£99)',
      verified: 'Verified (£149)',
      basic: 'Visible (£99)',
      managed: 'Verified (£149)',
      enterprise: 'Enterprise'
    };
    return names[tier] || tier;
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || vendor.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const OverviewTab = () => (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon vendors"><Building size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalVendors}</span>
            <span className="stat-label">Total Vendors</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon subscriptions"><CreditCard size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeSubscriptions}</span>
            <span className="stat-label">Active Subscriptions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon leads"><MessageSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalLeads}</span>
            <span className="stat-label">Total Leads</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products"><Package size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Products Listed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon recent"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.recentVendors}</span>
            <span className="stat-label">New Vendors (30d)</span>
          </div>
        </div>
      </div>

      <div className="tier-breakdown">
        <h3>Vendor Tier Breakdown</h3>
        <div className="tier-bars">
          <div className="tier-bar">
            <span className="tier-name">Free</span>
            <div className="tier-progress">
              <div className="tier-fill free" style={{ width: `${(stats.tierBreakdown.free / stats.totalVendors) * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{stats.tierBreakdown.free || 0}</span>
          </div>
          <div className="tier-bar">
            <span className="tier-name">Visible (£99)</span>
            <div className="tier-progress">
              <div className="tier-fill visible" style={{ width: `${((stats.tierBreakdown.visible + stats.tierBreakdown.basic) / stats.totalVendors) * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{(stats.tierBreakdown.visible || 0) + (stats.tierBreakdown.basic || 0)}</span>
          </div>
          <div className="tier-bar">
            <span className="tier-name">Verified (£149)</span>
            <div className="tier-progress">
              <div className="tier-fill verified" style={{ width: `${((stats.tierBreakdown.verified + stats.tierBreakdown.managed) / stats.totalVendors) * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{(stats.tierBreakdown.verified || 0) + (stats.tierBreakdown.managed || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const VendorsTab = () => (
    <div className="admin-vendors">
      <div className="vendors-header">
        <h2>Vendor Management</h2>
        <div className="vendors-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="visible">Visible</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      <div className="vendors-table-wrapper">
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Subscription</th>
              <th>Products</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.id}>
                <td>
                  <div className="vendor-company">
                    <strong>{vendor.company}</strong>
                    <span className="vendor-name">{vendor.name}</span>
                  </div>
                </td>
                <td>{vendor.email}</td>
                <td>
                  {editingVendor === vendor.id ? (
                    <select
                      value={vendor.tier}
                      onChange={(e) => handleChangeTier(vendor.id, e.target.value)}
                      onBlur={() => setEditingVendor(null)}
                      autoFocus
                    >
                      <option value="free">Free</option>
                      <option value="visible">Visible (£99)</option>
                      <option value="verified">Verified (£149)</option>
                    </select>
                  ) : (
                    <span className={`tier-badge ${getTierBadgeClass(vendor.tier)}`}>
                      {getTierDisplayName(vendor.tier)}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`subscription-status ${vendor.subscriptionStatus}`}>
                    {vendor.subscriptionStatus === 'active' ? (
                      <><CheckCircle size={14} /> Active</>
                    ) : vendor.hasStripe ? (
                      <><AlertCircle size={14} /> {vendor.subscriptionStatus}</>
                    ) : (
                      <><XCircle size={14} /> None</>
                    )}
                  </span>
                </td>
                <td>{vendor.productCount}</td>
                <td>{vendor.location}</td>
                <td>{formatDate(vendor.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => setEditingVendor(vendor.id)}
                      title="Change Tier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn view"
                      onClick={() => window.open(`/suppliers/${vendor.id}`, '_blank')}
                      title="View Profile"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredVendors.length === 0 && (
          <div className="no-results">No vendors found matching your criteria.</div>
        )}
      </div>
    </div>
  );

  const LeadsTab = () => (
    <div className="admin-leads">
      <div className="leads-header">
        <h2>Enquiries / Leads</h2>
        <span className="leads-count">{leads.length} total</span>
      </div>

      <div className="leads-table-wrapper">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Company</th>
              <th>Service</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Source</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>
                  <div className="lead-customer">
                    <strong>{lead.customerName}</strong>
                    <span>{lead.customerEmail}</span>
                  </div>
                </td>
                <td>{lead.customerCompany}</td>
                <td>{lead.service}</td>
                <td>{lead.vendor?.company || 'Unassigned'}</td>
                <td>
                  <span className={`status-badge ${lead.status}`}>
                    {lead.status}
                  </span>
                </td>
                <td>{lead.source}</td>
                <td>{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="no-results">No leads found.</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spinning" size={32} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button onClick={loadAllData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>TendorAI Admin</h1>
        </div>
        <div className="admin-header-right">
          <button className="refresh-btn" onClick={loadAllData} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={18} /> Overview
        </button>
        <button
          className={activeTab === 'vendors' ? 'active' : ''}
          onClick={() => setActiveTab('vendors')}
        >
          <Building size={18} /> Vendors ({vendors.length})
        </button>
        <button
          className={activeTab === 'leads' ? 'active' : ''}
          onClick={() => setActiveTab('leads')}
        >
          <MessageSquare size={18} /> Leads ({leads.length})
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'vendors' && <VendorsTab />}
        {activeTab === 'leads' && <LeadsTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
