import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, Building, CreditCard, TrendingUp,
  CheckCircle, XCircle, Eye, Edit, Package,
  MessageSquare, RefreshCw, LogOut, AlertCircle,
  DollarSign, Clock, Download
} from 'lucide-react';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterClaimed, setFilterClaimed] = useState('all');
  const [filterService, setFilterService] = useState('all');
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
    monthlyRevenue: 0,
    pendingClaims: 0,
    recentVendors: 0,
    tierBreakdown: { free: 0, visible: 0, verified: 0 },
    roleBreakdown: { user: 0, admin: 0, vendor: 0 }
  });

  const [vendors, setVendors] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);

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

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/admin/users');
      if (data?.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [fetchWithAuth]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchVendors(), fetchLeads(), fetchUsers()]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchVendors, fetchLeads, fetchUsers]);

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
    const matchesClaimed = filterClaimed === 'all' ||
      (filterClaimed === 'claimed' && vendor.isClaimed) ||
      (filterClaimed === 'unclaimed' && !vendor.isClaimed);
    const matchesService = filterService === 'all' ||
      vendor.services?.some(s => s.toLowerCase().includes(filterService.toLowerCase()));
    return matchesSearch && matchesTier && matchesClaimed && matchesService;
  });

  const exportToCSV = () => {
    const headers = ['Company', 'Email', 'Tier', 'Services', 'City', 'Postcode Areas', 'Status', 'Created'];
    const rows = filteredVendors.map(v => [
      v.company,
      v.email,
      v.tier,
      (v.services || []).join('; '),
      v.city || '',
      (v.postcodeAreas || []).join('; '),
      v.isClaimed ? 'Claimed' : 'Unclaimed',
      formatDate(v.createdAt)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendors-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const OverviewTab = () => (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon vendors"><Building size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalVendors}</span>
            <span className="stat-label">Total Vendors</span>
            <span className="stat-breakdown">
              {stats.tierBreakdown?.free || 0} free / {(stats.tierBreakdown?.visible || 0) + (stats.tierBreakdown?.basic || 0)} visible / {(stats.tierBreakdown?.verified || 0) + (stats.tierBreakdown?.managed || 0)} verified
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
            <span className="stat-breakdown">
              {stats.roleBreakdown?.user || stats.totalUsers} customers
            </span>
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
          <div className="stat-icon subscriptions"><CreditCard size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeSubscriptions}</span>
            <span className="stat-label">Paid Subscriptions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">£{stats.monthlyRevenue || 0}</span>
            <span className="stat-label">Monthly Revenue</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.pendingClaims || 0}</span>
            <span className="stat-label">Pending Claims</span>
            <span className="stat-breakdown">unclaimed vendor listings</span>
          </div>
        </div>
      </div>

      <div className="tier-breakdown">
        <h3>Vendor Tier Breakdown</h3>
        <div className="tier-bars">
          <div className="tier-bar">
            <span className="tier-name">Free</span>
            <div className="tier-progress">
              <div className="tier-fill free" style={{ width: `${(stats.tierBreakdown?.free / stats.totalVendors) * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{stats.tierBreakdown?.free || 0}</span>
          </div>
          <div className="tier-bar">
            <span className="tier-name">Visible (£99/mo)</span>
            <div className="tier-progress">
              <div className="tier-fill visible" style={{ width: `${((stats.tierBreakdown?.visible || 0) + (stats.tierBreakdown?.basic || 0)) / stats.totalVendors * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{(stats.tierBreakdown?.visible || 0) + (stats.tierBreakdown?.basic || 0)}</span>
          </div>
          <div className="tier-bar">
            <span className="tier-name">Verified (£149/mo)</span>
            <div className="tier-progress">
              <div className="tier-fill verified" style={{ width: `${((stats.tierBreakdown?.verified || 0) + (stats.tierBreakdown?.managed || 0)) / stats.totalVendors * 100 || 0}%` }}></div>
            </div>
            <span className="tier-count">{(stats.tierBreakdown?.verified || 0) + (stats.tierBreakdown?.managed || 0)}</span>
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
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)}>
            <option value="all">All Services</option>
            <option value="Photocopiers">Photocopiers</option>
            <option value="Telecoms">Telecoms</option>
            <option value="IT">IT</option>
            <option value="CCTV">CCTV</option>
            <option value="Security">Security</option>
          </select>
          <select value={filterClaimed} onChange={(e) => setFilterClaimed(e.target.value)}>
            <option value="all">All Status</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
          <button className="export-btn" onClick={exportToCSV} title="Export to CSV">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="vendors-table-wrapper">
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Services</th>
              <th>City</th>
              <th>Postcodes</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.id} className={vendor.isClaimed ? 'row-claimed' : 'row-unclaimed'}>
                <td>
                  <div className="vendor-company">
                    <strong>{vendor.company}</strong>
                    <span className="vendor-name">{vendor.name}</span>
                  </div>
                </td>
                <td className="email-cell">
                  <span className={vendor.isClaimed ? '' : 'unclaimed-email'}>
                    {vendor.email}
                  </span>
                </td>
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
                  <div className="services-tags">
                    {(vendor.services || []).slice(0, 2).map((s, i) => (
                      <span key={i} className="service-tag">{s}</span>
                    ))}
                    {(vendor.services || []).length > 2 && (
                      <span className="service-more">+{vendor.services.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>{vendor.city || 'N/A'}</td>
                <td>
                  <span className="postcode-areas" title={(vendor.postcodeAreas || []).join(', ')}>
                    {(vendor.postcodeAreas || []).slice(0, 3).join(', ')}
                    {(vendor.postcodeAreas || []).length > 3 && '...'}
                  </span>
                </td>
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
                      onClick={() => window.open(`/suppliers/profile/${vendor.id}`, '_blank')}
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
        <div className="table-footer">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>
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

  const UsersTab = () => (
    <div className="admin-users">
      <div className="users-header">
        <h2>User Management</h2>
        <span className="users-count">{users.length} total</span>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td><strong>{user.name || 'N/A'}</strong></td>
                <td>{user.email}</td>
                <td>{user.company || 'N/A'}</td>
                <td>
                  <span className={`role-badge role-${user.role || 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.lastLogin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="no-results">No users found.</div>
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
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Users ({users.length})
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
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'leads' && <LeadsTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
