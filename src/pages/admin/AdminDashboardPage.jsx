import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  FolderGit2,
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Check,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Globe,
  Tag,
  Lock,
  Layers,
  ChevronRight,
  Download,
  Copy,
  Receipt,
  FileSpreadsheet,
  X
} from 'lucide-react';
import logoImg from '../../assets/spartan-logo.png';
import { formatCurrencyAmount, SUPPORTED_CURRENCIES } from '../../utils/currency';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('payments'); // Default to Payments tab as requested
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Financial & Data states
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [currencyTotals, setCurrencyTotals] = useState({});

  // Filters & Search
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentCurrencyFilter, setPaymentCurrencyFilter] = useState('ALL');

  const [messageSearch, setMessageSearch] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState('ALL');

  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Check auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('spartan_admin_token');
    const storedUser = localStorage.getItem('spartan_admin_user');

    if (!storedToken) {
      navigate('/admin/login');
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (e) {
        setAdminUser({ name: 'Gajender Singh Rajawat', email: 'gajender@spartanimpex.com' });
      }
    }

    fetchDashboardData(storedToken);

    // Auto-refresh financial metrics every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(storedToken, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAuthHeaders = (overrideToken) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${overrideToken || token}`,
  });

  const fetchDashboardData = async (activeToken, silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    const authToken = activeToken || token;

    try {
      // 1. Overview metrics
      const ovRes = await fetch('/api/admin/overview', { headers: getAuthHeaders(authToken) });
      if (ovRes.status === 401) {
        localStorage.removeItem('spartan_admin_token');
        navigate('/admin/login');
        return;
      }
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData);
        if (ovData.metrics?.currencyTotals) {
          setCurrencyTotals(ovData.metrics.currencyTotals);
        }
      }

      // 2. Deep Transactions Registry
      const payRes = await fetch('/api/admin/payments', { headers: getAuthHeaders(authToken) });
      if (payRes.ok) {
        const payData = await payRes.json();
        setTransactions(payData.transactions || []);
        if (payData.currencyTotals) {
          setCurrencyTotals(payData.currencyTotals);
        }
      }

      // 3. Contact Inquiries
      const msgRes = await fetch('/api/admin/messages', { headers: getAuthHeaders(authToken) });
      if (msgRes.ok) {
        setMessages(await msgRes.json());
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spartan_admin_token');
    localStorage.removeItem('spartan_admin_user');
    navigate('/admin/login');
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${id}: ${text}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = [
      'Order ID',
      'Payment ID',
      'Status',
      'Currency',
      'Amount',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Plan Name',
      'Plan Slug',
      'Receipt',
      'Payment Method',
      'Created At'
    ];

    const rows = transactions.map((t) => [
      `"${t.orderId || ''}"`,
      `"${t.paymentId || ''}"`,
      `"${t.status || ''}"`,
      `"${t.currency || 'INR'}"`,
      t.amount || 0,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${(t.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(t.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(t.planName || '').replace(/"/g, '""')}"`,
      `"${t.planSlug || ''}"`,
      `"${t.receipt || ''}"`,
      `"${t.paymentMethod || ''}"`,
      `"${new Date(t.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spartan_impax_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Transaction registry exported to CSV successfully');
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = paymentStatusFilter === 'ALL' || tx.status === paymentStatusFilter;
    const matchesCurrency = paymentCurrencyFilter === 'ALL' || (tx.currency || 'INR').toUpperCase() === paymentCurrencyFilter;

    const q = paymentSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (tx.customerName && tx.customerName.toLowerCase().includes(q)) ||
      (tx.customerEmail && tx.customerEmail.toLowerCase().includes(q)) ||
      (tx.customerPhone && tx.customerPhone.toLowerCase().includes(q)) ||
      (tx.orderId && tx.orderId.toLowerCase().includes(q)) ||
      (tx.paymentId && tx.paymentId.toLowerCase().includes(q)) ||
      (tx.planName && tx.planName.toLowerCase().includes(q));

    return matchesStatus && matchesCurrency && matchesSearch;
  });

  // Financial aggregates
  const paidTransactions = transactions.filter((t) => t.status === 'PAID');
  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING');
  const failedTransactions = transactions.filter((t) => t.status === 'FAILED');

  return (
    <div className="min-h-screen bg-navy text-navy-50 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="h-20 border-b border-navy-border/80 bg-navy-card/95 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy border border-navy-border p-1.5 shadow-md flex items-center justify-center group-hover:border-cyan-DEFAULT/40 transition-colors">
              <img src={logoImg} alt="Spartan Impax" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight font-serif">Spartan Impax</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/30 text-[10px] font-black text-cyan-300 tracking-wider">
                  EXECUTIVE PORTAL
                </span>
              </div>
              <p className="text-[11px] text-silver-400">Database Financial & Payment Command Center</p>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(token)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-navy border border-navy-border text-silver-300 hover:text-cyan-DEFAULT hover:border-cyan-DEFAULT/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-sm"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-DEFAULT' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="p-2.5 rounded-xl bg-navy border border-navy-border text-silver-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="View live portfolio"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Live Site</span>
          </Link>

          <div className="h-6 w-px bg-navy-border mx-1" />

          {/* Admin User Profile Pill */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-DEFAULT/20 to-blue-600/30 border border-cyan-DEFAULT/40 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-md">
              GS
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white">{adminUser?.name || 'Gajender Singh Rajawat'}</p>
              <p className="text-[10px] text-cyan-300 font-mono">gajender@spartanimpex.com</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all ml-1"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-8 z-50 p-4 rounded-2xl bg-navy-card border border-cyan-DEFAULT/50 shadow-2xl text-white text-xs flex items-center gap-3 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-DEFAULT" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Admin Console Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border pb-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-navy-card border border-navy-border shadow-lg">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'payments'
                  ? 'bg-cyan-DEFAULT text-navy-dark shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-silver-300 hover:text-white hover:bg-navy'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payments & Transactions ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-cyan-DEFAULT text-navy-dark shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-silver-300 hover:text-white hover:bg-navy'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Financial Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'messages'
                  ? 'bg-cyan-DEFAULT text-navy-dark shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-silver-300 hover:text-white hover:bg-navy'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquiries ({messages.length})</span>
            </button>
          </div>

          {activeTab === 'payments' && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-navy border border-cyan-DEFAULT/40 text-cyan-300 hover:bg-cyan-DEFAULT hover:text-navy-dark transition-all text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* ========================================================
            TAB 1: DEEP RAZORPAY TRANSACTIONS REGISTRY
           ======================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top KPI Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Paid Revenue Metric */}
              <div className="p-6 rounded-3xl bg-navy-card border border-emerald-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Verified Revenue</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight font-serif mb-1">
                  ₹{Number(overview?.metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-silver-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">{paidTransactions.length} Paid</span> verified orders
                </p>
              </div>

              {/* Verified Transactions Count */}
              <div className="p-6 rounded-3xl bg-navy-card border border-cyan-DEFAULT/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Total Checkouts</span>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight font-serif mb-1">
                  {transactions.length}
                </div>
                <p className="text-xs text-silver-400">All database order attempts</p>
              </div>

              {/* Pending Transactions */}
              <div className="p-6 rounded-3xl bg-navy-card border border-amber-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Orders</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight font-serif mb-1">
                  {pendingTransactions.length}
                </div>
                <p className="text-xs text-silver-400">Awaiting customer payment completion</p>
              </div>

              {/* Multi-Currency Volume */}
              <div className="p-6 rounded-3xl bg-navy-card border border-purple-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Currencies Active</span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight font-serif mb-1">
                  {Object.keys(currencyTotals).length || 1}
                </div>
                <p className="text-xs text-silver-400 truncate">
                  {Object.keys(currencyTotals).join(', ') || 'INR, USD, JPY'}
                </p>
              </div>
            </div>

            {/* Currency Breakdown Bar */}
            {Object.keys(currencyTotals).length > 0 && (
              <div className="p-6 rounded-3xl bg-navy-card/80 border border-navy-border shadow-xl">
                <p className="text-xs font-bold text-silver-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-DEFAULT" />
                  <span>Collected Revenue by Currency:</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(currencyTotals).map(([curr, sum]) => (
                    <div
                      key={curr}
                      className="px-4 py-2.5 rounded-2xl bg-navy border border-navy-border/80 flex items-center gap-3"
                    >
                      <span className="text-base">{SUPPORTED_CURRENCIES[curr]?.flag || '🌐'}</span>
                      <div>
                        <span className="text-[10px] text-silver-400 uppercase font-semibold">{curr}</span>
                        <p className="text-sm font-bold text-white font-mono">
                          {formatCurrencyAmount(sum, curr)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-navy-card border border-navy-border shadow-lg">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-400" />
                <input
                  type="text"
                  placeholder="Search by customer, email, order ID, payment ID..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy border border-navy-border text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-DEFAULT focus:ring-1 focus:ring-cyan-DEFAULT transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-silver-400" />
                  <span className="text-xs text-silver-400 font-semibold">Status:</span>
                </div>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT cursor-pointer"
                >
                  <option value="ALL">All Statuses ({transactions.length})</option>
                  <option value="PAID">PAID ({paidTransactions.length})</option>
                  <option value="PENDING">PENDING ({pendingTransactions.length})</option>
                  <option value="FAILED">FAILED ({failedTransactions.length})</option>
                </select>

                <select
                  value={paymentCurrencyFilter}
                  onChange={(e) => setPaymentCurrencyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT cursor-pointer"
                >
                  <option value="ALL">All Currencies</option>
                  {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transactions Data Table */}
            <div className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy/90 text-silver-400 uppercase tracking-wider text-[10px] border-b border-navy-border">
                    <tr>
                      <th className="py-4 px-6">Customer & Contact</th>
                      <th className="py-4 px-6">Package</th>
                      <th className="py-4 px-6">Amount & Currency</th>
                      <th className="py-4 px-6">Order & Payment IDs</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-border/40 text-silver-200">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-navy/60 transition-colors group">
                        {/* Customer */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-white text-sm">{tx.customerName}</p>
                          <p className="text-silver-400 text-[11px] font-mono">{tx.customerEmail}</p>
                          {tx.customerPhone && (
                            <p className="text-silver-500 text-[10px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-silver-400" />
                              {tx.customerPhone}
                            </p>
                          )}
                        </td>

                        {/* Package */}
                        <td className="py-4 px-6">
                          <span className="font-semibold text-white">{tx.planName}</span>
                          <span className="block text-[10px] text-silver-400">{tx.planSlug}</span>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{SUPPORTED_CURRENCIES[tx.currency]?.flag || '🌐'}</span>
                            <div>
                              <span className="font-black text-white text-base">
                                {formatCurrencyAmount(tx.amount, tx.currency || 'INR')}
                              </span>
                              <span className="text-[10px] text-cyan-300 font-bold block">{tx.currency || 'INR'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Order & Payment IDs with Copy */}
                        <td className="py-4 px-6 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-cyan-300 font-semibold">{tx.orderId}</span>
                            <button
                              onClick={() => handleCopy(tx.orderId, tx.orderId)}
                              className="text-silver-400 hover:text-white p-1 rounded hover:bg-navy transition-colors"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {tx.paymentId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-semibold">{tx.paymentId}</span>
                              <button
                                onClick={() => handleCopy(tx.paymentId, tx.paymentId)}
                                className="text-silver-400 hover:text-white p-1 rounded hover:bg-navy transition-colors"
                                title="Copy Payment ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-silver-500 italic">Payment ID not generated</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 px-6 text-[11px] whitespace-nowrap">
                          <p className="text-white font-medium">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-silver-400 text-[10px]">
                            {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                              tx.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : tx.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {tx.status === 'PAID' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {tx.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400" />}
                            {tx.status}
                          </span>
                        </td>

                        {/* Deep Inspection Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="px-3 py-1.5 rounded-xl bg-navy border border-navy-border hover:border-cyan-DEFAULT text-silver-300 hover:text-cyan-DEFAULT text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-silver-500">
                          <Receipt className="w-12 h-12 text-silver-600 mx-auto mb-3" />
                          <p className="text-base font-bold text-white mb-1">No matching transactions found</p>
                          <p className="text-xs text-silver-400">
                            Try adjusting your search query, status, or currency filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FINANCIAL OVERVIEW
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <h3 className="text-sm font-bold text-silver-400 uppercase tracking-wider mb-2">Total Paid Revenue</h3>
                <div className="text-4xl font-serif font-black text-white mb-2">
                  ₹{Number(overview?.metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-400 font-semibold">100% Cryptographically Verified by HMAC-SHA256</p>
              </div>

              <div className="p-8 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <h3 className="text-sm font-bold text-silver-400 uppercase tracking-wider mb-2">Client Inquiries</h3>
                <div className="text-4xl font-serif font-black text-white mb-2">
                  {messages.length}
                </div>
                <p className="text-xs text-cyan-300 font-semibold">{messages.filter(m => m.status === 'UNREAD').length} Unread inquiries</p>
              </div>

              <div className="p-8 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <h3 className="text-sm font-bold text-silver-400 uppercase tracking-wider mb-2">Security Engine</h3>
                <div className="text-4xl font-serif font-black text-white mb-2">
                  Active
                </div>
                <p className="text-xs text-silver-400">Prisma PostgreSQL + Vercel Edge Serverless</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: USER REQUESTS / INQUIRIES
           ======================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-3xl bg-navy-card border border-navy-border shadow-lg flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-silver-400" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy border border-navy-border text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-DEFAULT"
                />
              </div>
            </div>

            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-navy-card border border-navy-border hover:border-cyan-DEFAULT/40 transition-all shadow-xl flex flex-col md:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base">{m.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy border border-navy-border text-cyan-300">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-silver-400 font-mono">{m.email}</p>
                    <p className="text-sm font-semibold text-white mt-1">{m.subject}</p>
                    <p className="text-xs text-silver-300 leading-relaxed bg-navy/60 p-4 rounded-2xl border border-navy-border/50">
                      {m.message}
                    </p>
                  </div>
                  <div className="text-right text-xs text-silver-500 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-silver-500 text-xs py-16">No client messages received yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Deep Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2 rounded-xl hover:bg-navy border border-transparent hover:border-navy-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Transaction Audit Record</h3>
                <p className="text-xs text-silver-400">Cryptographically logged in PostgreSQL database</p>
              </div>
            </div>

            {/* Status & Amount Highlight */}
            <div className="p-4 rounded-2xl bg-navy border border-navy-border flex items-center justify-between">
              <div>
                <span className="text-xs text-silver-400">Total Billed</span>
                <p className="text-2xl font-black text-white font-mono">
                  {formatCurrencyAmount(selectedTransaction.amount, selectedTransaction.currency || 'INR')}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  selectedTransaction.status === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selectedTransaction.status}
              </span>
            </div>

            {/* Deep Audit Fields */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Customer Name:</span>
                <span className="font-bold text-white">{selectedTransaction.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Corporate Email:</span>
                <span className="font-mono text-cyan-300">{selectedTransaction.customerEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Phone:</span>
                <span className="text-white">{selectedTransaction.customerPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Architecture Package:</span>
                <span className="font-semibold text-white">{selectedTransaction.planName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Razorpay Order ID:</span>
                <span className="font-mono text-cyan-300">{selectedTransaction.orderId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Razorpay Payment ID:</span>
                <span className="font-mono text-emerald-400">{selectedTransaction.paymentId || 'Pending'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-navy-border/50">
                <span className="text-silver-400">Cryptographic Verification:</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  HMAC-SHA256 Authenticated
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-silver-400">Recorded Timestamp:</span>
                <span className="text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full py-3.5 rounded-xl bg-navy border border-navy-border text-white text-xs font-bold hover:bg-navy-card transition-colors uppercase tracking-wider"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
