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
  ChevronRight
} from 'lucide-react';
import logoImg from '../../assets/spartan-logo.png';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data states
  const [overview, setOverview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [activeVisitorsCount, setActiveVisitorsCount] = useState(1);

  // Filters & search
  const [messageSearch, setMessageSearch] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Modals
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [projectModal, setProjectModal] = useState({ isOpen: false, mode: 'create', data: null });
  const [pricingModal, setPricingModal] = useState({ isOpen: false, data: null });

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
        setAdminUser({ name: 'Gajender Singh', email: 'gajender@spartanimpex.com' });
      }
    }

    fetchDashboardData(storedToken);

    // Auto-refresh metrics every 30 seconds
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
        if (ovData.metrics?.activeVisitors) {
          setActiveVisitorsCount(ovData.metrics.activeVisitors);
        }
      }

      // 2. Messages
      const msgRes = await fetch('/api/admin/messages', { headers: getAuthHeaders(authToken) });
      if (msgRes.ok) setMessages(await msgRes.json());

      // 3. Projects
      const projRes = await fetch('/api/projects');
      if (projRes.ok) setProjects(await projRes.json());

      // 4. Pricing Plans
      const priceRes = await fetch('/api/admin/pricing', { headers: getAuthHeaders(authToken) });
      if (priceRes.ok) setPricingPlans(await priceRes.json());

      // 5. Payments
      const payRes = await fetch('/api/admin/payments', { headers: getAuthHeaders(authToken) });
      if (payRes.ok) {
        const payData = await payRes.json();
        setTransactions(payData.transactions || []);
      }

      // 6. Visitors
      const visRes = await fetch('/api/admin/visitors', { headers: getAuthHeaders(authToken) });
      if (visRes.ok) {
        const visData = await visRes.json();
        setVisitorLogs(visData.recentLogs || []);
        if (visData.activeCount) setActiveVisitorsCount(visData.activeCount);
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

  // --- Message Actions ---
  const handleUpdateMessageStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => ({ ...prev, status }));
        }
        showToast(`Message status updated to ${status}`);
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this user inquiry permanently?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) setSelectedMessage(null);
        showToast('Message removed successfully');
      }
    } catch (e) {
      showToast('Failed to delete message', 'error');
    }
  };

  // --- Project Actions ---
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const data = projectModal.data;

    try {
      const isEdit = projectModal.mode === 'edit';
      const endpoint = isEdit ? `/api/admin/projects/${data.id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save project');
      }

      showToast(isEdit ? 'Project updated successfully!' : 'New project added to portfolio!');
      setProjectModal({ isOpen: false, mode: 'create', data: null });
      fetchDashboardData(token, true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project from the live portfolio?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast('Project removed from portfolio');
      }
    } catch (e) {
      showToast('Failed to delete project', 'error');
    }
  };

  // --- Pricing Actions ---
  const handleSavePricing = async (e) => {
    e.preventDefault();
    const data = pricingModal.data;

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update pricing plan');

      showToast('Pricing plan updated successfully!');
      setPricingModal({ isOpen: false, data: null });
      fetchDashboardData(token, true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered queries
  const filteredMessages = messages.filter((m) => {
    const matchStatus = messageStatusFilter === 'ALL' || m.status === messageStatusFilter;
    const matchSearch =
      !messageSearch ||
      m.name?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.subject?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.message?.toLowerCase().includes(messageSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchStatus = paymentStatusFilter === 'ALL' || t.status === paymentStatusFilter;
    const matchSearch =
      !paymentSearch ||
      t.customerName?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.customerEmail?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.orderId?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.planName?.toLowerCase().includes(paymentSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPaidRevenue = transactions
    .filter((t) => t.status === 'PAID')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-navy-dark text-navy-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all ${
            notification.type === 'error'
              ? 'bg-rose-500/90 text-white border border-rose-400'
              : 'bg-cyan-DEFAULT/90 text-navy-dark border border-cyan-300'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 bg-navy-card/95 backdrop-blur-md border-b border-navy-border px-4 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand & Admin Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-navy border border-navy-border p-1 flex items-center justify-center shadow-md">
              <img src={logoImg} alt="Spartan Impax" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className="text-cyan-DEFAULT">SPARTAN</span>
              <span className="text-silver-500 font-light">|</span>
              <span className="text-white text-sm">ADMIN PORTAL</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 text-cyan-300">
            <Shield className="w-3.5 h-3.5 text-cyan-DEFAULT" />
            Super Admin
          </span>
        </div>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Visitors Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy border border-navy-border text-xs font-medium text-silver-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>
              <strong className="text-white">{activeVisitorsCount}</strong> Active {activeVisitorsCount === 1 ? 'Visitor' : 'Visitors'}
            </span>
          </div>

          {/* View Live Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy hover:bg-navy-border/50 border border-navy-border text-xs text-silver-300 hover:text-white transition-all"
            title="Open Public Site"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Refresh Data */}
          <button
            onClick={() => fetchDashboardData(token)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-navy hover:bg-navy-border/50 border border-navy-border text-silver-300 hover:text-cyan-DEFAULT transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-DEFAULT' : ''}`} />
          </button>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-navy-border">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold text-white leading-tight">{adminUser?.name || 'Gajender Singh'}</p>
              <p className="text-[10px] text-silver-400">gajender@spartanimpex.com</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-navy-card/80 border-r border-navy-border p-4 shrink-0">
          <nav className="space-y-1.5">
            {[
              { id: 'overview', name: 'Overview', icon: LayoutDashboard, badge: null },
              { id: 'messages', name: 'User Requests', icon: MessageSquare, badge: overview?.metrics?.unreadMessages || messages.filter(m => m.status === 'UNREAD').length },
              { id: 'projects', name: 'Projects Manager', icon: FolderGit2, badge: projects.length },
              { id: 'pricing', name: 'Pricing Packages', icon: Layers, badge: pricingPlans.length },
              { id: 'payments', name: 'Razorpay Payments', icon: CreditCard, badge: transactions.filter(t => t.status === 'PAID').length },
              { id: 'visitors', name: 'Live Visitors', icon: Users, badge: activeVisitorsCount },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-cyan-DEFAULT text-navy-dark shadow-[0_0_20px_rgba(0,229,255,0.3)] font-bold'
                      : 'text-silver-300 hover:bg-navy hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-navy-dark' : 'text-cyan-DEFAULT'}`} />
                    <span>{tab.name}</span>
                  </div>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-navy-dark text-cyan-DEFAULT' : 'bg-cyan-DEFAULT/15 text-cyan-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Leadership Card */}
          <div className="mt-8 p-4 rounded-2xl bg-navy border border-navy-border/60 text-xs">
            <p className="text-[11px] font-bold text-silver-400 uppercase tracking-wider mb-2">Spartan Leadership</p>
            <div className="space-y-2">
              <div>
                <p className="text-white font-semibold">Gajender Singh Rajawat</p>
                <p className="text-[11px] text-cyan-DEFAULT">CEO & Founder</p>
              </div>
              <div className="pt-2 border-t border-navy-border/40">
                <p className="text-white font-semibold">Usman</p>
                <p className="text-[11px] text-cyan-DEFAULT">CIO & Principal Architect</p>
                <a
                  href="https://github.com/tzkusman/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-silver-400 hover:text-white flex items-center gap-1 mt-0.5"
                >
                  <FolderGit2 className="w-3 h-3" /> github.com/tzkusman
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* ========================================================
              TAB 1: OVERVIEW
             ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header Title */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-1">
                  Executive Operations & Intelligence
                </h2>
                <p className="text-silver-400 text-xs sm:text-sm">
                  Real-time command center for Spartan Impax. Monitor customer inquiries, live visitors, and Razorpay settlements.
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Paid Revenue */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">Total Paid Revenue</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight mb-1">
                    ₹{totalPaidRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Verified Settlements
                  </p>
                </div>

                {/* Unread Inquiries */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">User Inquiries</span>
                    <div className="w-10 h-10 rounded-xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight mb-1">
                    {messages.length}
                  </div>
                  <p className="text-xs text-cyan-300">
                    <strong>{messages.filter(m => m.status === 'UNREAD').length}</strong> unread user requests pending
                  </p>
                </div>

                {/* Active Projects */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">Portfolio Projects</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight mb-1">
                    {projects.length}
                  </div>
                  <p className="text-xs text-blue-300">
                    Synced with GitHub tzkusman & Live Sites
                  </p>
                </div>

                {/* Active Telemetry */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">Active Visitors</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight mb-1">
                    {activeVisitorsCount}
                  </div>
                  <p className="text-xs text-purple-300">
                    Live concurrent traffic on site right now
                  </p>
                </div>
              </div>

              {/* Two Column Grid: Recent Inquiries & Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Inquiries */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-DEFAULT" />
                      Recent User Inquiries
                    </h3>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="text-xs font-semibold text-cyan-DEFAULT hover:underline flex items-center gap-1"
                    >
                      View All ({messages.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {messages.slice(0, 5).map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className="p-4 rounded-2xl bg-navy/80 hover:bg-navy border border-navy-border/60 hover:border-cyan-DEFAULT/40 transition-all cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm truncate">{msg.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                msg.status === 'UNREAD'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : msg.status === 'REPLIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-navy-border text-silver-400'
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-xs text-silver-300 font-medium truncate">{msg.subject}</p>
                          <p className="text-[11px] text-silver-500 truncate">{msg.email}</p>
                        </div>
                        <span className="text-[10px] text-silver-400 whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-center text-silver-500 text-xs py-8">No user inquiries received yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Razorpay Payments */}
                <div className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Razorpay Transactions Audit
                    </h3>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="text-xs font-semibold text-cyan-DEFAULT hover:underline flex items-center gap-1"
                    >
                      View All ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-2xl bg-navy/80 border border-navy-border/60 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm truncate">{tx.customerName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-xs text-silver-300 truncate">{tx.planName}</p>
                          <p className="text-[11px] font-mono text-silver-500 truncate">{tx.orderId}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <p className="font-black text-white text-base">₹{Number(tx.amount).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-silver-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-center text-silver-500 text-xs py-8">No payment transactions recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: USER REQUESTS / INQUIRIES
             ======================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Client Requests & Inquiries</h2>
                  <p className="text-silver-400 text-xs sm:text-sm">Manage submissions from prospective clients through the contact portal.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-silver-400" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={messageSearch}
                      onChange={(e) => setMessageSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-DEFAULT"
                    />
                  </div>

                  <select
                    value={messageStatusFilter}
                    onChange={(e) => setMessageStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="UNREAD">Unread</option>
                    <option value="READ">Read</option>
                    <option value="REPLIED">Replied</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Messages Table */}
              <div className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy/80 text-silver-400 uppercase tracking-wider text-[10px] border-b border-navy-border">
                      <tr>
                        <th className="py-4 px-6">Sender Details</th>
                        <th className="py-4 px-6">Subject & Preview</th>
                        <th className="py-4 px-6">Date Received</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50 text-silver-200">
                      {filteredMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-navy/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-white text-sm">{msg.name}</p>
                            <a href={`mailto:${msg.email}`} className="text-cyan-DEFAULT hover:underline text-[11px]">
                              {msg.email}
                            </a>
                          </td>
                          <td className="py-4 px-6 max-w-xs">
                            <p className="font-semibold text-white truncate">{msg.subject}</p>
                            <p className="text-silver-400 truncate text-[11px]">{msg.message}</p>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-silver-400">
                            {new Date(msg.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={msg.status}
                              onChange={(e) => handleUpdateMessageStatus(msg.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                msg.status === 'UNREAD'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : msg.status === 'REPLIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-navy text-silver-300 border-navy-border'
                              }`}
                            >
                              <option value="UNREAD">UNREAD</option>
                              <option value="READ">READ</option>
                              <option value="REPLIED">REPLIED</option>
                              <option value="ARCHIVED">ARCHIVED</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => setSelectedMessage(msg)}
                              className="p-1.5 rounded-lg bg-navy hover:bg-cyan-DEFAULT/20 text-cyan-300 hover:text-cyan-DEFAULT border border-navy-border transition-colors"
                              title="View Full Message"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1.5 rounded-lg bg-navy hover:bg-rose-500/20 text-silver-400 hover:text-rose-400 border border-navy-border transition-colors"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredMessages.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-silver-500">
                            No matching user inquiries found.
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
              TAB 3: PROJECTS MANAGER (CRUD)
             ======================================================== */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Live Portfolio Projects</h2>
                  <p className="text-silver-400 text-xs sm:text-sm">
                    Manage real projects synced with GitHub tzkusman and live manufacturing & AI deployments.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setProjectModal({
                      isOpen: true,
                      mode: 'create',
                      data: {
                        title: '',
                        slug: '',
                        category: 'Web Development',
                        shortDescription: '',
                        overview: '',
                        thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
                        tags: 'React, Node.js, Tailwind CSS',
                        liveUrl: '',
                        githubUrl: 'https://github.com/tzkusman/',
                        featured: true,
                      },
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Add New Project
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-cyan-DEFAULT/40 transition-all"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="h-44 w-full bg-navy relative overflow-hidden">
                        <img
                          src={proj.thumbnail}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-navy-dark/90 text-cyan-DEFAULT border border-cyan-DEFAULT/30 backdrop-blur-md">
                          {proj.category}
                        </span>
                        {proj.featured && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-DEFAULT text-navy-dark shadow-md">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-white text-base mb-1.5 group-hover:text-cyan-300 transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-silver-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {proj.shortDescription}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(Array.isArray(proj.tags) ? proj.tags : []).slice(0, 4).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] bg-navy border border-navy-border text-silver-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-5 pt-0 border-t border-navy-border/40 mt-auto flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 pt-3">
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-navy hover:bg-cyan-DEFAULT/20 text-cyan-DEFAULT border border-navy-border"
                            title="Open Live Deployment"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-navy hover:bg-silver-500/20 text-silver-300 border border-navy-border"
                            title="Open GitHub Repository"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3">
                        <button
                          onClick={() =>
                            setProjectModal({
                              isOpen: true,
                              mode: 'edit',
                              data: {
                                ...proj,
                                tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : proj.tags,
                              },
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-border text-silver-200 text-xs font-semibold flex items-center gap-1 border border-navy-border"
                        >
                          <Edit3 className="w-3 h-3 text-cyan-DEFAULT" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg bg-navy hover:bg-rose-500/20 text-silver-400 hover:text-rose-400 border border-navy-border"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: PRICING PACKAGES CONTROL
             ======================================================== */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Pricing & Razorpay Packages</h2>
                  <p className="text-silver-400 text-xs sm:text-sm">
                    Adjust commercial rates, deliverables, and popular badges shown to visitors on the live pricing page.
                  </p>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-navy-card border border-navy-border rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        {plan.badge && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-DEFAULT/15 text-cyan-DEFAULT border border-cyan-DEFAULT/30">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-silver-400 text-xs mb-4 min-h-[36px]">{plan.description}</p>

                      <div className="p-4 rounded-2xl bg-navy border border-navy-border mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-silver-400">Current Price:</span>
                          <span className="text-2xl font-black text-cyan-DEFAULT">
                            ₹{Number(plan.price).toLocaleString('en-IN')}
                          </span>
                          {plan.originalPrice && (
                            <span className="text-xs line-through text-silver-500">
                              ₹{Number(plan.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-[11px] font-bold uppercase text-silver-400 tracking-wider">Features ({plan.features?.length || 0}):</p>
                        {(Array.isArray(plan.features) ? plan.features : []).map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-silver-300">
                            <Check className="w-3.5 h-3.5 text-cyan-DEFAULT shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setPricingModal({
                          isOpen: true,
                          data: {
                            ...plan,
                            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features,
                          },
                        })
                      }
                      className="w-full py-3 rounded-xl bg-navy hover:bg-cyan-DEFAULT hover:text-navy-dark text-cyan-DEFAULT border border-cyan-DEFAULT/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Adjust Plan & Pricing
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: RAZORPAY TRANSACTIONS AUDIT
             ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Razorpay Transactions Audit</h2>
                  <p className="text-silver-400 text-xs sm:text-sm">
                    Complete financial audit trail: Verify paid vs pending orders, customer credentials, and payment signatures.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-silver-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-DEFAULT"
                    />
                  </div>

                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-navy border border-navy-border text-xs text-white focus:outline-none focus:border-cyan-DEFAULT"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy/80 text-silver-400 uppercase tracking-wider text-[10px] border-b border-navy-border">
                      <tr>
                        <th className="py-4 px-6">Customer & Contact</th>
                        <th className="py-4 px-6">Architecture Plan</th>
                        <th className="py-4 px-6">Amount (INR)</th>
                        <th className="py-4 px-6">Order & Payment IDs</th>
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50 text-silver-200">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-navy/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-white text-sm">{tx.customerName}</p>
                            <p className="text-silver-400 text-[11px]">{tx.customerEmail}</p>
                            {tx.customerPhone && <p className="text-silver-500 text-[10px]">{tx.customerPhone}</p>}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-white">{tx.planName}</span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="font-black text-white text-base">₹{Number(tx.amount).toLocaleString('en-IN')}</span>
                          </td>
                          <td className="py-4 px-6 font-mono text-[10px]">
                            <p className="text-cyan-DEFAULT">ORD: {tx.orderId}</p>
                            {tx.paymentId ? (
                              <p className="text-emerald-400">PAY: {tx.paymentId}</p>
                            ) : (
                              <p className="text-silver-500">PAY: Pending checkout</p>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-silver-400">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${
                                tx.status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : tx.status === 'FAILED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-silver-500">
                            No matching payment transactions found.
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
              TAB 6: LIVE ACTIVE VISITORS & TELEMETRY
             ======================================================== */}
          {activeTab === 'visitors' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Live Traffic & Active Telemetry</h2>
                <p className="text-silver-400 text-xs sm:text-sm">
                  Real-time visitor logs captured on every page load with route tracking and client details.
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-navy-card border border-navy-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-silver-400 uppercase font-semibold">Active Visitors Right Now</p>
                    <p className="text-3xl font-black text-white">{activeVisitorsCount}</p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-navy-card border border-navy-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-silver-400 uppercase font-semibold">Total Telemetry Hits Logged</p>
                    <p className="text-3xl font-black text-white">{visitorLogs.length}</p>
                  </div>
                </div>
              </div>

              {/* Telemetry Stream */}
              <div className="bg-navy-card border border-navy-border rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy/80 text-silver-400 uppercase tracking-wider text-[10px] border-b border-navy-border">
                      <tr>
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Page Path</th>
                        <th className="py-4 px-6">Client IP Address</th>
                        <th className="py-4 px-6">Browser User-Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50 text-silver-200 font-mono text-[11px]">
                      {visitorLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-navy/50 transition-colors">
                          <td className="py-3 px-6 whitespace-nowrap text-silver-400">
                            {new Date(log.createdAt).toLocaleTimeString()} ({new Date(log.createdAt).toLocaleDateString()})
                          </td>
                          <td className="py-3 px-6 text-cyan-DEFAULT font-bold">
                            {log.path}
                          </td>
                          <td className="py-3 px-6 text-silver-300">
                            {log.ip || '127.0.0.1'}
                          </td>
                          <td className="py-3 px-6 text-silver-500 max-w-sm truncate">
                            {log.userAgent || 'Modern Web Browser'}
                          </td>
                        </tr>
                      ))}
                      {visitorLogs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-silver-500 font-sans">
                            No visitor telemetry pings recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: VIEW FULL MESSAGE
         ======================================================== */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center text-cyan-DEFAULT">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Client Inquiry Details</h3>
                <p className="text-xs text-silver-400">Received {new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-navy border border-navy-border space-y-2">
                <p>
                  <strong className="text-silver-400">From:</strong>{' '}
                  <span className="text-white font-bold">{selectedMessage.name}</span>
                </p>
                <p>
                  <strong className="text-silver-400">Email:</strong>{' '}
                  <a href={`mailto:${selectedMessage.email}`} className="text-cyan-DEFAULT hover:underline">
                    {selectedMessage.email}
                  </a>
                </p>
                <p>
                  <strong className="text-silver-400">Subject:</strong>{' '}
                  <span className="text-white font-semibold">{selectedMessage.subject}</span>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-silver-400 uppercase tracking-wider mb-1">
                  Message Body:
                </label>
                <div className="p-4 rounded-2xl bg-navy border border-navy-border text-silver-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-silver-400 font-semibold">Status:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleUpdateMessageStatus(selectedMessage.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-navy border border-navy-border text-white text-xs"
                  >
                    <option value="UNREAD">UNREAD</option>
                    <option value="READ">READ</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="px-4 py-2 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold text-xs uppercase hover:bg-cyan-300 transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Reply via Mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT PROJECT
         ======================================================== */}
      {projectModal.isOpen && projectModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProjectModal({ isOpen: false, mode: 'create', data: null })}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-cyan-DEFAULT" />
              {projectModal.mode === 'edit' ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-silver-300 font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectModal.data.title}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, title: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  placeholder="e.g. Eye Production Generative AI Studio"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver-300 font-semibold mb-1">Category</label>
                  <select
                    value={projectModal.data.category}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, category: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="ERP & Enterprise">ERP & Enterprise</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-silver-300 font-semibold mb-1">Slug (URL friendly)</label>
                  <input
                    type="text"
                    value={projectModal.data.slug || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, slug: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                    placeholder="e.g. eyeproduction-ai-studio"
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">Short Description *</label>
                <textarea
                  required
                  rows="2"
                  value={projectModal.data.shortDescription}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, shortDescription: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  placeholder="Brief synopsis for portfolio grid card..."
                />
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={projectModal.data.thumbnail || ''}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, thumbnail: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={projectModal.data.tags || ''}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, tags: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  placeholder="React, Next.js, PostgreSQL, Tailwind"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver-300 font-semibold mb-1">Live URL</label>
                  <input
                    type="url"
                    value={projectModal.data.liveUrl || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, liveUrl: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                    placeholder="https://eyeproductiondenimcrafts.ai.studio/"
                  />
                </div>
                <div>
                  <label className="block text-silver-300 font-semibold mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={projectModal.data.githubUrl || ''}
                    onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, githubUrl: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                    placeholder="https://github.com/tzkusman/..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={Boolean(projectModal.data.featured)}
                  onChange={(e) => setProjectModal({ ...projectModal, data: { ...projectModal.data, featured: e.target.checked } })}
                  className="rounded border-navy-border text-cyan-DEFAULT focus:ring-cyan-DEFAULT"
                />
                <label htmlFor="featuredCheck" className="text-white font-semibold cursor-pointer">
                  Feature prominently on Homepage & Top of Portfolio
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectModal({ isOpen: false, mode: 'create', data: null })}
                  className="px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-silver-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-lg"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT PRICING PLAN
         ======================================================== */}
      {pricingModal.isOpen && pricingModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPricingModal({ isOpen: false, data: null })}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-DEFAULT" />
              Adjust Commercial Plan: {pricingModal.data.name}
            </h3>

            <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver-300 font-semibold mb-1">Live Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={pricingModal.data.price}
                    onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, price: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white text-base font-bold focus:outline-none focus:border-cyan-DEFAULT"
                  />
                </div>
                <div>
                  <label className="block text-silver-300 font-semibold mb-1">Original Price (Strikeout ₹)</label>
                  <input
                    type="number"
                    value={pricingModal.data.originalPrice || ''}
                    onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, originalPrice: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={pricingModal.data.badge || ''}
                  onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, badge: e.target.value } })}
                  placeholder="e.g. Quick Launch, Recommended"
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                />
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">Description</label>
                <textarea
                  rows="2"
                  value={pricingModal.data.description || ''}
                  onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, description: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white focus:outline-none focus:border-cyan-DEFAULT"
                />
              </div>

              <div>
                <label className="block text-silver-300 font-semibold mb-1">
                  Features (One feature per line)
                </label>
                <textarea
                  rows="5"
                  value={pricingModal.data.features || ''}
                  onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, features: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-white font-mono text-xs focus:outline-none focus:border-cyan-DEFAULT"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={Boolean(pricingModal.data.popular)}
                  onChange={(e) => setPricingModal({ ...pricingModal, data: { ...pricingModal.data, popular: e.target.checked } })}
                  className="rounded border-navy-border text-cyan-DEFAULT focus:ring-cyan-DEFAULT"
                />
                <label htmlFor="popularCheck" className="text-white font-semibold cursor-pointer">
                  Mark as Most Popular / Highlighted Plan
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPricingModal({ isOpen: false, data: null })}
                  className="px-4 py-2.5 rounded-xl bg-navy border border-navy-border text-silver-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-lg"
                >
                  Save Pricing Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
