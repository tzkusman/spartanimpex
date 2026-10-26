import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  LogOut,
  ExternalLink,
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
  ChevronRight,
  Download,
  Copy,
  Receipt,
  FileSpreadsheet,
  X,
  SlidersHorizontal,
  CheckCircle
} from 'lucide-react';
import logoImg from '../../assets/spartan-logo.png';
import { formatCurrencyAmount, SUPPORTED_CURRENCIES } from '../../utils/currency';
import { printAuditReport } from '../../utils/auditReport';

// Divisors for calculating preview rates from base INR
const PREVIEW_FX_DIVISORS = {
  USD: 75.37,
  JPY: 0.503,
  EUR: 81.07,
  GBP: 94.33,
  AED: 20.55,
};

function getPreviewConvertedPrice(inrAmount, curr) {
  if (!inrAmount || inrAmount <= 0) return 0;
  const div = PREVIEW_FX_DIVISORS[curr] || 75.37;
  if (curr === 'JPY') return Math.max(100, Math.round(inrAmount / div / 100) * 100);
  return Math.max(1, Math.round(inrAmount / div));
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('payments'); // Default to Payments tab
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Financial & Data states
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currencyTotals, setCurrencyTotals] = useState({});
  const [pricingPlans, setPricingPlans] = useState([]);

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

  // Live Pricing Editing State
  const [editingPlan, setEditingPlan] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    price: '',
    originalPrice: '',
    badge: '',
    description: '',
    features: '',
    popular: false,
    active: true,
  });

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

      // 4. Live Pricing Plans from database
      const priceRes = await fetch(`/api/admin/pricing?_t=${Date.now()}`, { headers: getAuthHeaders(authToken) });
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        setPricingPlans(priceData.plans || []);
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
    showToast(`Copied: ${text}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open edit modal for a plan
  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      price: plan.price || '',
      originalPrice: plan.originalPrice || '',
      badge: plan.badge || '',
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
      popular: Boolean(plan.popular),
      active: Boolean(plan.active),
    });
  };

  // Save plan pricing live to Postgres
  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSavingPlan(true);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: editingPlan.id,
          slug: editingPlan.slug,
          price: Number(planForm.price),
          originalPrice: planForm.originalPrice ? Number(planForm.originalPrice) : null,
          badge: planForm.badge,
          description: planForm.description,
          features: planForm.features.split('\n').map(f => f.trim()).filter(Boolean),
          popular: planForm.popular,
          active: planForm.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update plan pricing');

      showToast(`Pricing for "${editingPlan.name}" updated live in database!`, 'success');
      setEditingPlan(null);
      fetchDashboardData(token, true);
    } catch (err) {
      showToast(err.message || 'Error updating plan pricing', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  // Export Transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['Order ID', 'Payment ID', 'Customer Name', 'Email', 'Phone', 'Package', 'Amount', 'Currency', 'Status', 'Timestamp'];
    const rows = transactions.map((t) => [
      t.orderId,
      t.paymentId || 'N/A',
      `"${t.customerName}"`,
      t.customerEmail,
      t.customerPhone || 'N/A',
      `"${t.planName}"`,
      t.amount,
      t.currency || 'INR',
      t.status,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spartan_impax_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial CSV Export downloaded successfully!');
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      paymentSearch === '' ||
      (t.customerName && t.customerName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
      (t.customerEmail && t.customerEmail.toLowerCase().includes(paymentSearch.toLowerCase())) ||
      (t.orderId && t.orderId.toLowerCase().includes(paymentSearch.toLowerCase())) ||
      (t.paymentId && t.paymentId.toLowerCase().includes(paymentSearch.toLowerCase()));

    const matchesStatus = paymentStatusFilter === 'ALL' || t.status === paymentStatusFilter;
    const matchesCurrency = paymentCurrencyFilter === 'ALL' || t.currency === paymentCurrencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  return (
    <div className="min-h-screen bg-navy-dark text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-navy-border bg-navy/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-navy-card border border-cyan-DEFAULT/30 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <img src={logoImg} alt="Spartan Impax" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Spartan Impax
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-cyan-DEFAULT/15 text-cyan-DEFAULT border border-cyan-DEFAULT/30 uppercase tracking-wider">
                    Executive Control
                  </span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Razorpay Live Production</span>
            </div>

            <button
              onClick={() => fetchDashboardData(token)}
              disabled={refreshing}
              title="Refresh Registry"
              className="p-2 rounded-xl bg-navy-card border border-navy-border text-silver-400 hover:text-cyan-DEFAULT hover:border-cyan-DEFAULT/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-DEFAULT' : ''}`} />
            </button>

            <Link
              to="/pricing"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-card border border-navy-border text-xs text-silver-300 hover:text-white transition-colors"
            >
              <span>View Live Pricing</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-DEFAULT" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Realtime Toast Notifications */}
      {notification && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-xs font-semibold flex items-center gap-2 animate-bounce ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
              : notification.type === 'info'
              ? 'bg-navy-card/95 text-cyan-300 border-cyan-DEFAULT/40'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-DEFAULT" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Admin Console Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border pb-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-navy-card border border-navy-border shadow-lg">
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
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pricing'
                  ? 'bg-cyan-DEFAULT text-navy-dark shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-silver-300 hover:text-white hover:bg-navy'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Live Pricing & Plans ({pricingPlans.length})</span>
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
            TAB: LIVE PRICING & PLANS MANAGEMENT
           ======================================================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Tag className="w-4 h-4" />
                  <span>Real-Time Database Pricing Control</span>
                </div>
                <h2 className="text-2xl font-bold font-serif text-white">Architecture & Engineering Packages</h2>
                <p className="text-xs text-silver-400 mt-1">
                  Changes made here save directly to PostgreSQL and take effect immediately on <span className="text-cyan-300">/pricing</span> and in Razorpay checkout.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-silver-300 bg-navy px-4 py-2.5 rounded-xl border border-navy-border">
                <Globe className="w-4 h-4 text-cyan-DEFAULT" />
                <span>Auto-converts to USD, JPY, EUR, GBP, AED, CAD, AUD, SGD</span>
              </div>
            </div>

            {/* Pricing Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => {
                const inrPrice = plan.price || 0;
                return (
                  <div
                    key={plan.id || plan.slug}
                    className={`rounded-3xl p-6 sm:p-7 border transition-all flex flex-col justify-between relative shadow-xl ${
                      plan.popular
                        ? 'bg-navy-card border-cyan-DEFAULT/50 shadow-[0_0_30px_rgba(0,229,255,0.15)]'
                        : 'bg-navy-card/80 border-navy-border hover:border-navy-border/80'
                    }`}
                  >
                    {/* Popular Pill */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-DEFAULT to-blue-500 text-navy-dark text-[10px] font-black uppercase tracking-wider shadow-lg">
                        Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            plan.active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {plan.active ? 'LIVE & ACTIVE' : 'HIDDEN'}
                        </span>

                        {plan.badge && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Slug */}
                      <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      <p className="font-mono text-[11px] text-cyan-400/80 mb-4">{plan.slug}</p>

                      {/* Pricing Display */}
                      <div className="p-4 rounded-2xl bg-navy/90 border border-navy-border mb-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-silver-400 font-semibold">Base INR:</span>
                          <span className="text-2xl font-black text-white font-mono">
                            ₹{inrPrice.toLocaleString('en-IN')}
                          </span>
                          {plan.originalPrice && (
                            <span className="text-xs text-silver-500 line-through font-mono">
                              ₹{plan.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Multi-currency preview row */}
                        <div className="mt-3 pt-3 border-t border-navy-border/60">
                          <span className="text-[10px] font-bold text-silver-400 uppercase tracking-wider block mb-2">
                            Auto International Rates:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                            <span className="text-cyan-300">USD: ${getPreviewConvertedPrice(inrPrice, 'USD')}</span>
                            <span className="text-cyan-300">JPY: ¥{getPreviewConvertedPrice(inrPrice, 'JPY').toLocaleString()}</span>
                            <span className="text-cyan-300">EUR: €{getPreviewConvertedPrice(inrPrice, 'EUR')}</span>
                            <span className="text-cyan-300">GBP: £{getPreviewConvertedPrice(inrPrice, 'GBP')}</span>
                            <span className="text-cyan-300">AED: {getPreviewConvertedPrice(inrPrice, 'AED')} AED</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-silver-300 mb-5 leading-relaxed">{plan.description}</p>

                      {/* Features preview */}
                      <div className="space-y-2 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-silver-400 block">
                          Included Deliverables ({Array.isArray(plan.features) ? plan.features.length : 0})
                        </span>
                        {Array.isArray(plan.features) &&
                          plan.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-silver-300">
                              <CheckCircle className="w-3.5 h-3.5 text-cyan-DEFAULT flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{f}</span>
                            </div>
                          ))}
                        {Array.isArray(plan.features) && plan.features.length > 4 && (
                          <span className="text-[10px] text-cyan-400 italic block pl-5">
                            +{plan.features.length - 4} more features
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="w-full py-3 rounded-xl bg-navy border border-cyan-DEFAULT/40 text-cyan-300 hover:bg-cyan-DEFAULT hover:text-navy-dark transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Live Pricing & Plan</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: DEEP RAZORPAY TRANSACTIONS REGISTRY
           ======================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Multi-Currency Revenue Stream Metrics */}
            <div className="p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Collected Revenue by Currency</span>
                </div>
                <span className="text-xs text-silver-400">
                  Total Transactions: <strong className="text-white">{transactions.length}</strong> (
                  <strong className="text-emerald-400">{transactions.filter((t) => t.status === 'PAID').length} Paid</strong>
                  )
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Object.keys(currencyTotals).length > 0 ? (
                  Object.entries(currencyTotals).map(([curCode, amt]) => {
                    const cInfo = SUPPORTED_CURRENCIES[curCode] || { symbol: curCode + ' ', flag: '🌐' };
                    return (
                      <div key={curCode} className="p-3.5 rounded-2xl bg-navy/90 border border-navy-border/80">
                        <div className="flex items-center gap-1.5 text-xs text-silver-400 mb-1">
                          <span>{cInfo.flag}</span>
                          <span className="font-bold">{curCode}</span>
                        </div>
                        <p className="text-base sm:text-lg font-black text-white font-mono">
                          {cInfo.symbol}
                          {Number(amt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 rounded-2xl bg-navy/90 border border-navy-border/80">
                    <span className="text-xs text-silver-400">INR</span>
                    <p className="text-base font-black text-white font-mono">₹0</p>
                  </div>
                )}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-navy-card p-4 rounded-2xl border border-navy-border">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-400" />
                <input
                  type="text"
                  placeholder="Search by customer, email, order ID, payment ID..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy rounded-xl border border-navy-border text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-DEFAULT"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 text-xs text-silver-400">
                  <Filter className="w-3.5 h-3.5 text-cyan-DEFAULT" />
                  <span>Status:</span>
                </div>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-navy rounded-xl border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT"
                >
                  <option value="ALL">All Statuses ({transactions.length})</option>
                  <option value="PAID">Paid Only</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="FAILED">Failed Only</option>
                </select>

                <select
                  value={paymentCurrencyFilter}
                  onChange={(e) => setPaymentCurrencyFilter(e.target.value)}
                  className="px-3 py-2 bg-navy rounded-xl border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT"
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

            {/* Transactions Ledger Table */}
            <div className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-navy-border bg-navy/60 text-silver-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-6">Customer & Contact</th>
                      <th className="py-4 px-6">Package</th>
                      <th className="py-4 px-6">Amount & Currency</th>
                      <th className="py-4 px-6">Order & Payment IDs</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-border/60">
                    {filteredTransactions.map((tx) => {
                      const cur = tx.currency || 'INR';
                      const isPaid = tx.status === 'PAID';
                      return (
                        <tr key={tx.id || tx.orderId} className="hover:bg-navy/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-white text-sm">{tx.customerName}</div>
                            <div className="text-silver-400 text-xs font-mono">{tx.customerEmail}</div>
                            {tx.customerPhone && (
                              <div className="text-silver-500 text-[10px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-cyan-DEFAULT" />
                                <span>{tx.customerPhone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-white">{tx.planName}</span>
                            <span className="block text-[10px] text-silver-400 font-mono">{tx.planSlug}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono text-base font-bold text-white flex items-center gap-1.5">
                              <span>{SUPPORTED_CURRENCIES[cur]?.flag || '🌐'}</span>
                              <span>{formatCurrencyAmount(tx.amount, cur)}</span>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-mono uppercase">{cur}</span>
                          </td>
                          <td className="py-4 px-6 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-cyan-300">{tx.orderId}</span>
                              <button
                                onClick={() => handleCopy(tx.orderId, `order_${tx.id}`)}
                                title="Copy Order ID"
                                className="text-silver-400 hover:text-white"
                              >
                                {copiedId === `order_${tx.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {tx.paymentId ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-emerald-400">{tx.paymentId}</span>
                                <button
                                  onClick={() => handleCopy(tx.paymentId, `pay_${tx.id}`)}
                                  title="Copy Payment ID"
                                  className="text-silver-400 hover:text-white"
                                >
                                  {copiedId === `pay_${tx.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-silver-500 italic block">Payment ID not generated</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-silver-400 font-mono text-[11px]">
                            {new Date(tx.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            <span className="block text-[10px] text-silver-500">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isPaid
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : tx.status === 'PENDING'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPaid ? 'bg-emerald-400' : tx.status === 'PENDING' ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                              />
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedTransaction(tx)}
                              className="px-3 py-1.5 rounded-xl bg-navy border border-navy-border text-silver-300 hover:text-cyan-DEFAULT hover:border-cyan-DEFAULT/40 transition-colors inline-flex items-center gap-1.5 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: FINANCIAL OVERVIEW
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                  Est. Gross Revenue
                </span>
                <p className="text-3xl font-black text-white font-mono">
                  ₹{Number(overview?.metrics?.totalRevenueEstINR || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-cyan-400 mt-2 block">Razorpay Real Financial Volume</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                  Confirmed Payments
                </span>
                <p className="text-3xl font-black text-emerald-400 font-mono">
                  {overview?.metrics?.paidTransactionsCount || 0}
                </p>
                <span className="text-[11px] text-silver-400 mt-2 block">Cryptographically Verified</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                  Client Messages
                </span>
                <p className="text-3xl font-black text-cyan-DEFAULT font-mono">{messages.length}</p>
                <span className="text-[11px] text-silver-400 mt-2 block">Direct Corporate Inquiries</span>
              </div>

              <div className="p-6 rounded-3xl bg-navy-card border border-navy-border shadow-xl">
                <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                  Live Active Plans
                </span>
                <p className="text-3xl font-black text-purple-400 font-mono">{pricingPlans.length}</p>
                <span className="text-[11px] text-silver-400 mt-2 block">Synchronized in PostgreSQL</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CLIENT INQUIRIES
           ======================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Client Inquiries & Contact Forms</h3>
              {messages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-navy border border-navy-border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <p className="font-mono text-cyan-400 text-xs">{m.email}</p>
                    </div>
                    <span className="text-[10px] text-silver-400 font-mono">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-silver-300 font-semibold">{m.subject}</p>
                  <p className="text-xs text-silver-400 bg-navy-card/60 p-3 rounded-xl border border-navy-border/50">
                    {m.message}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-silver-500 text-xs py-16">No client messages received yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: EDIT PRICING PLAN LIVE
         ======================================================== */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPlan(null)}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2 rounded-xl hover:bg-navy border border-transparent hover:border-navy-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Edit Package Pricing Live</h3>
                <p className="text-xs text-silver-400 font-mono">
                  {editingPlan.name} ({editingPlan.slug})
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Base INR Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Base Price (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-silver-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 bg-navy text-white font-mono rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-silver-500 mt-1 block">Live amount charged in checkout</span>
                </div>

                <div>
                  <label className="block text-silver-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Original Price (INR Strikethrough)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-silver-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={planForm.originalPrice}
                      onChange={(e) => setPlanForm({ ...planForm, originalPrice: e.target.value })}
                      placeholder="Optional"
                      className="w-full pl-8 pr-4 py-2.5 bg-navy text-white font-mono rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-silver-500 mt-1 block">Shown crossed out for discount</span>
                </div>
              </div>

              {/* Promotional Badge */}
              <div>
                <label className="block text-silver-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Promotional Tag / Badge
                </label>
                <input
                  type="text"
                  value={planForm.badge}
                  onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                  placeholder="e.g. Most Popular Choice, Quick Launch"
                  className="w-full px-4 py-2.5 bg-navy text-white rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-silver-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Plan Description
                </label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-navy text-white rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none leading-relaxed"
                />
              </div>

              {/* Features (One per line) */}
              <div>
                <label className="block text-silver-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Included Features (Enter 1 feature per line)
                </label>
                <textarea
                  rows={5}
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-4 py-2.5 bg-navy text-white font-mono text-[11px] rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-navy border border-navy-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="w-4 h-4 rounded border-navy-border text-cyan-DEFAULT focus:ring-0 bg-navy-card"
                  />
                  <span className="text-white font-semibold">Highlight as Most Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.active}
                    onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                    className="w-4 h-4 rounded border-navy-border text-cyan-DEFAULT focus:ring-0 bg-navy-card"
                  />
                  <span className="text-white font-semibold">Active & Visible to Public</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 rounded-xl bg-navy border border-navy-border text-silver-300 font-bold hover:bg-navy-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="flex-1 py-3 rounded-xl bg-cyan-DEFAULT text-navy-dark font-black hover:bg-cyan-DEFAULT/90 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2"
                >
                  {savingPlan ? 'Publishing...' : 'Save & Publish Live Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => printAuditReport(selectedTransaction)}
                className="w-full py-3.5 rounded-xl bg-cyan-DEFAULT text-navy-dark text-xs font-black hover:bg-cyan-300 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Print Statutory Audit Certificate & Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3 rounded-xl bg-navy border border-navy-border text-white text-xs font-bold hover:bg-navy-card transition-colors uppercase tracking-wider"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
