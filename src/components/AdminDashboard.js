import React, { useState, useEffect } from 'react';
import { Search, Users, Building, CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle, XCircle, Eye, Edit, Trash2, Mail, Filter, Download, Plus, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from your backend
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 2847,
      activeVendors: 156,
      pendingVendors: 23,
      totalRevenue: 284750,
      monthlyGrowth: 12.5,
      unpaidInvoices: 45
    },
    users: [
      { id: 1, name: 'John Smith', email: 'john@example.com', company: 'TechCorp', status: 'active', signupDate: '2024-01-15', lastLogin: '2024-07-07' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@design.com', company: 'DesignStudio', status: 'inactive', signupDate: '2024-02-20', lastLogin: '2024-06-15' },
      { id: 3, name: 'Mike Wilson', email: 'mike@startup.io', company: 'StartupXYZ', status: 'active', signupDate: '2024-03-10', lastLogin: '2024-07-08' },
      { id: 4, name: 'Emma Davis', email: 'emma@consulting.com', company: 'Davis Consulting', status: 'suspended', signupDate: '2024-01-05', lastLogin: '2024-06-20' }
    ],
    vendors: [
      { id: 1, name: 'Global Supplies Co', email: 'contact@globalsupplies.com', category: 'Manufacturing', status: 'approved', revenue: 45000, joinDate: '2024-01-20' },
      { id: 2, name: 'TechSolutions Ltd', email: 'info@techsolutions.com', category: 'Technology', status: 'pending', revenue: 0, joinDate: '2024-07-01' },
      { id: 3, name: 'Creative Services Inc', email: 'hello@creative.com', category: 'Design', status: 'approved', revenue: 28000, joinDate: '2024-03-15' },
      { id: 4, name: 'DataFlow Systems', email: 'support@dataflow.com', category: 'Technology', status: 'rejected', revenue: 0, joinDate: '2024-06-10' }
    ],
    payments: [
      { id: 1, userName: 'John Smith', userEmail: 'john@example.com', amount: 299, status: 'paid', dueDate: '2024-07-01', paidDate: '2024-06-28', invoiceId: 'INV-001' },
      { id: 2, userName: 'Sarah Johnson', userEmail: 'sarah@design.com', amount: 499, status: 'overdue', dueDate: '2024-06-15', paidDate: null, invoiceId: 'INV-002' },
      { id: 3, userName: 'Mike Wilson', userEmail: 'mike@startup.io', amount: 199, status: 'pending', dueDate: '2024-07-15', paidDate: null, invoiceId: 'INV-003' },
      { id: 4, userName: 'Emma Davis', userEmail: 'emma@consulting.com', amount: 699, status: 'paid', dueDate: '2024-07-05', paidDate: '2024-07-03', invoiceId: 'INV-004' }
    ]
  });

  // Filter functions
  const getFilteredUsers = () => {
    return dashboardData.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredVendors = () => {
    return dashboardData.vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredPayments = () => {
    return dashboardData.payments.filter(payment => {
      const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const handleUserAction = (action, userId) => {
    console.log(`${action} user ${userId}`);
    // In real app, make API call here
  };

  const handleVendorAction = (action, vendorId) => {
    console.log(`${action} vendor ${vendorId}`);
    // In real app, make API call here
  };

  const handlePaymentAction = (action, paymentId) => {
    console.log(`${action} payment ${paymentId}`);
    // In real app, make API call here
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.activeVendors}</p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.unpaidInvoices}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">New vendor "TechSolutions Ltd" applied</span>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Payment of $299 received from John Smith</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm">Invoice INV-002 is overdue</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-sm">5 new users registered today</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Add User</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Building className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Review Vendors</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Mail className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Send Reminders</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Download className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signup Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredUsers().map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.signupDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleUserAction('view', user.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUserAction('edit', user.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUserAction('delete', user.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const VendorsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold">Vendor Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredVendors().map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={vendor.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${vendor.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVendorAction('approve', vendor.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVendorAction('reject', vendor.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleVendorAction('view', vendor.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleVendorAction('edit', vendor.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PaymentsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold">Payment Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send Reminders
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredPayments().map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                    <div className="text-sm text-gray-500">{payment.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.invoiceId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.paidDate || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handlePaymentAction('view', payment.id)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {payment.status !== 'paid' && (
                      <button
                        onClick={() => handlePaymentAction('remind', payment.id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handlePaymentAction('download', payment.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Building },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'vendors' && <VendorsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;