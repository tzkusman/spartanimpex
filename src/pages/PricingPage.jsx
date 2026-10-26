import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  Lock,
  HelpCircle,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  Building2,
  Layers,
  Code,
  Globe
} from 'lucide-react';
import Container from '../components/common/Container';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import { pricingPlansData, personalData } from '../data/portfolioData';
import {
  SUPPORTED_CURRENCIES,
  PLAN_PRICING_MATRIX,
  formatCurrencyAmount,
  detectVisitorDefaultCurrency
} from '../utils/currency';

export default function PricingPage() {
  const [plans, setPlans] = useState(pricingPlansData);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // 1. Detect visitor country & preferred currency automatically
  useEffect(() => {
    let isMounted = true;
    fetch('/api/geo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && data.currency && SUPPORTED_CURRENCIES[data.currency]) {
          setCurrency(data.currency);
        } else {
          setCurrency(detectVisitorDefaultCurrency());
        }
      })
      .catch(() => {
        if (isMounted) setCurrency(detectVisitorDefaultCurrency());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch dynamic plans from database if available
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/pricing');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlans(data);
          }
        }
      } catch (err) {
        console.warn('Using local fallback pricing plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Helper to get localized price for a plan (prioritizing live DB prices)
  const getPlanPrice = (planSlug) => {
    const livePlan = plans.find((p) => p.slug === planSlug);
    if (livePlan && livePlan.prices && livePlan.prices[currency]) {
      return livePlan.prices[currency];
    }
    const matrix = PLAN_PRICING_MATRIX[planSlug];
    if (matrix && matrix[currency]) {
      return matrix[currency].price;
    }
    return livePlan ? livePlan.price : 14999;
  };

  const getPlanOriginalPrice = (planSlug) => {
    const livePlan = plans.find((p) => p.slug === planSlug);
    if (livePlan && livePlan.originalPrices && livePlan.originalPrices[currency]) {
      return livePlan.originalPrices[currency];
    }
    const matrix = PLAN_PRICING_MATRIX[planSlug];
    if (matrix && matrix[currency]) {
      return matrix[currency].originalPrice;
    }
    return livePlan ? livePlan.originalPrice : null;
  };

  // Dynamically load official Razorpay checkout SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        return resolve(true);
      }
      const existing = document.getElementById('razorpay-checkout-sdk');
      if (existing) {
        if (window.Razorpay) return resolve(true);
        existing.addEventListener('load', () => resolve(true));
      } else {
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-sdk';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      }

      setTimeout(() => {
        if (window.Razorpay) resolve(true);
        else resolve(false);
      }, 10000);
    });
  };

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setPaymentError(null);
    setPaymentSuccess(null);
    setIsModalOpen(true);
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error('Please enter your full name and corporate email.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const activePrice = getPlanPrice(selectedPlan.slug);

      // Step 1: Create Order on backend with requested currency
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: selectedPlan.slug,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          currency: currency,
        }),
      });

      let orderData;
      const resText = await res.text();
      try {
        orderData = JSON.parse(resText);
      } catch {
        throw new Error(
          resText.includes('FUNCTION_INVOCATION_FAILED')
            ? 'Payment service is initializing on server. Please ensure RAZORPAY keys are configured on Vercel.'
            : (resText || 'Failed to communicate with payment gateway.')
        );
      }
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initiate checkout order.');
      }

      if (!orderData.keyId || orderData.keyId.includes('placeholder')) {
        throw new Error('Razorpay API Key ID is not configured on the server. Please add your RAZORPAY_KEY_ID in Vercel Environment Variables.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name: 'Spartan Impax Enterprise IT',
        description: `${orderData.plan.name} Architecture Package (${orderData.currency || currency})`,
        image: '/assets/spartan-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || '',
        },
        theme: {
          color: '#00E5FF',
        },
        handler: async function (response) {
          try {
            // Step 2: Verify Payment on Backend
            const verifyRes = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentMethod: 'Razorpay International Checkout',
                currency: orderData.currency || currency,
                amount: activePrice,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            setPaymentSuccess({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              plan: selectedPlan,
              amount: activePrice,
              currency: orderData.currency || currency,
              customer: formData,
            });
          } catch (vErr) {
            setPaymentError(vErr.message);
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      // Launch Razorpay popup
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        setPaymentError(response.error.description || 'Payment was declined or cancelled.');
        setPaymentLoading(false);
      });
      rzpInstance.open();

    } catch (err) {
      setPaymentError(err.message || 'Payment initiation failed.');
      setPaymentLoading(false);
    }
  };

  const faqs = [
    {
      q: 'Which international currencies and payment methods do you accept?',
      a: 'We accept payments globally in USD ($), Japanese Yen (¥), Indian Rupee (₹), Euro (€), British Pound (£), UAE Dirham (AED), Canadian Dollar (CAD), and Australian Dollar (AUD). Checkout supports all international credit/debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, UPI (in India), and major regional banks.'
    },
    {
      q: 'How does the Razorpay multi-currency checkout work?',
      a: 'When you select your local currency, our system generates an authorized Razorpay order directly in your selected currency (e.g., $199 USD or ¥29,800 JPY). Your bank is billed without unexpected foreign transaction conversion charges.'
    },
    {
      q: 'Can we adjust or customize deliverables after checkout?',
      a: 'Yes. Every project package kicks off with a dedicated architectural discovery call with CIO Usman and CEO Gajender Singh. We customize technical specifications and milestones to match your exact enterprise scope.'
    },
    {
      q: 'Do you provide Non-Disclosure Agreements (NDA) and IP ownership?',
      a: 'Absolutely. 100% of all intellectual property, source repositories, documentation, and cloud infrastructure keys belong exclusively to you upon project handover.'
    },
    {
      q: 'What is the standard turnaround time for deliverables?',
      a: 'Starter Architecture packages are delivered within 5 to 7 business days. Business Full-Stack systems typically span 2 to 4 weeks depending on third-party integrations, while Custom Enterprise solutions follow phased sprint milestones.'
    }
  ];

  return (
    <div className="py-20 min-h-screen bg-navy text-navy-50 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00E5FF 0%, #1E50C8 50%, transparent 80%)' }}
      />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 text-cyan-DEFAULT text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-DEFAULT" />
            Transparent Global Enterprise Architecture Pricing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white mb-6">
            Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-DEFAULT via-cyan-300 to-blue-400">Production-Grade</span> Engineering
          </h1>
          <p className="text-silver-300 text-base md:text-lg leading-relaxed mb-8">
            From high-conversion web platforms to mission-critical Oracle Cloud portals and Generative AI studios. Instant checkout powered by Razorpay Global.
          </p>

          {/* Interactive Global Currency Switcher */}
          <div className="inline-flex items-center gap-3 p-2 rounded-2xl bg-navy-card/90 border border-navy-border shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 pl-3 text-silver-300 text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-4 h-4 text-cyan-DEFAULT" />
              <span>Billing Currency:</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-4 py-2 rounded-xl bg-navy border border-cyan-DEFAULT/30 text-white text-xs font-bold focus:outline-none focus:border-cyan-DEFAULT cursor-pointer shadow-md transition-all hover:border-cyan-DEFAULT"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-navy text-white py-1">
                  {c.flag} {c.code} ({c.symbol.trim()}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-silver-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-DEFAULT" /> Razorpay 256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% IP & Code Ownership
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-DEFAULT" /> Direct CIO & CEO Consultation
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan) => {
            const isPopular = plan.popular;
            const currentPrice = getPlanPrice(plan.slug);
            const originalPrice = getPlanOriginalPrice(plan.slug);

            return (
              <div
                key={plan.id || plan.slug}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? 'bg-navy-card/95 border-2 border-cyan-DEFAULT shadow-[0_0_35px_rgba(0,229,255,0.25)] lg:-translate-y-2'
                    : 'bg-navy-card/80 border border-navy-border hover:border-cyan-DEFAULT/40 shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Popular / Recommended Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-DEFAULT to-blue-600 text-navy-dark text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular Choice
                  </div>
                )}

                {/* Plan Top Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy border border-navy-border text-cyan-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-silver-400 text-sm mb-6 min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price Block */}
                  <div className="mb-6 p-4 rounded-2xl bg-navy/80 border border-navy-border/60">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-cyan-300">{currency}</span>
                      <span className="text-4xl font-black text-white tracking-tight">
                        {formatCurrencyAmount(currentPrice, currency)}
                      </span>
                      {originalPrice && (
                        <span className="text-sm line-through text-silver-500 ml-1">
                          {formatCurrencyAmount(originalPrice, currency)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-silver-400 mt-1">Single engagement milestone payment • Zero recurring surprises</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider">
                      Included Architecture Deliverables:
                    </p>
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-silver-200">
                        <div className="w-5 h-5 rounded-full bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-cyan-DEFAULT" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div>
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-navy border ${
                      isPopular
                        ? 'border-2 border-cyan text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:bg-cyan hover:text-navy-dark hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]'
                        : 'border border-cyan/40 text-cyan-300 hover:bg-cyan hover:text-navy-dark hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]'
                    }`}
                  >
                    <span>Proceed in {currency}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-silver-500 mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Razorpay 256-bit Encrypted Checkout
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Bespoke Bar */}
        <div className="bg-gradient-to-r from-navy-card via-navy to-navy-card border border-navy-border rounded-3xl p-8 md:p-12 mb-24 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="text-xs uppercase tracking-widest text-cyan-DEFAULT font-bold mb-2 block">
                Custom Enterprise Retainers
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                Need a Dedicated Architect or Multi-Month Retainer?
              </h3>
              <p className="text-silver-300 text-sm leading-relaxed">
                Connect directly with CIO Usman and CEO Gajender Singh Rajawat for custom microservices architecture, Oracle APEX cloud migrations, or dedicated engineering squads.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold text-sm tracking-wider uppercase hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2"
              >
                Schedule Architecture Call
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-silver-400 text-sm">Everything you need to know about global billing, deliverables, and SLAs.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-navy-card/90 border border-navy-border rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-cyan-300 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-DEFAULT shrink-0 transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-silver-300 text-sm leading-relaxed border-t border-navy-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Razorpay Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
          <div className="bg-navy-card border border-navy-border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!paymentLoading) setIsModalOpen(false);
              }}
              className="absolute top-5 right-5 text-silver-400 hover:text-white p-2 rounded-xl hover:bg-navy border border-transparent hover:border-navy-border transition-colors"
              disabled={paymentLoading}
            >
              ✕
            </button>

            {/* Modal Content */}
            {!paymentSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-cyan-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Razorpay Secure Global Checkout</h3>
                    <p className="text-xs text-silver-400">Order for: {selectedPlan.name} ({currency})</p>
                  </div>
                </div>

                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl bg-navy border border-navy-border mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-silver-400">Selected Architecture Package</p>
                      <h4 className="font-bold text-white text-base">{selectedPlan.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-silver-400">Total Investment ({currency})</p>
                      <span className="text-xl font-black text-cyan-DEFAULT">
                        {formatCurrencyAmount(getPlanPrice(selectedPlan.slug), currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-silver-300 uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Doe / Tanaka Taro"
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-navy-border text-white text-sm focus:outline-none focus:border-cyan-DEFAULT focus:ring-1 focus:ring-cyan-DEFAULT transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-silver-300 uppercase tracking-wider mb-1.5">
                      Corporate / Billing Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-navy-border text-white text-sm focus:outline-none focus:border-cyan-DEFAULT focus:ring-1 focus:ring-cyan-DEFAULT transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-silver-300 uppercase tracking-wider mb-1.5">
                      Contact / Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-4 py-3 rounded-xl bg-navy border border-navy-border text-white text-sm focus:outline-none focus:border-cyan-DEFAULT focus:ring-1 focus:ring-cyan-DEFAULT transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full py-4 rounded-xl bg-cyan text-navy font-black text-sm tracking-wider uppercase hover:bg-cyan-300 transition-all shadow-[0_0_25px_rgba(0,229,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: '#00E5FF', color: '#040E1A' }}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting to Razorpay Global Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay {formatCurrencyAmount(getPlanPrice(selectedPlan.slug), currency)} with Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-silver-400 pt-2">
                    <span>International Cards (Visa/MC/Amex)</span>
                    <span>•</span>
                    <span>UPI & NetBanking</span>
                    <span>•</span>
                    <span>SSL 256-bit</span>
                  </div>
                </form>
              </>
            ) : (
              /* Success Confirmation Screen */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Payment Successfully Verified!</h3>
                <p className="text-silver-300 text-sm mb-6">
                  Thank you, <strong className="text-white">{paymentSuccess.customer.name}</strong>. Your international transaction has been confirmed in real time.
                </p>

                <div className="p-4 rounded-2xl bg-navy border border-navy-border text-left text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-silver-400">Order ID:</span>
                    <span className="font-mono text-cyan-DEFAULT">{paymentSuccess.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver-400">Payment ID:</span>
                    <span className="font-mono text-emerald-400">{paymentSuccess.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver-400">Package:</span>
                    <span className="font-semibold text-white">{paymentSuccess.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-silver-400">Total Charged:</span>
                    <span className="font-bold text-white">
                      {formatCurrencyAmount(paymentSuccess.amount, paymentSuccess.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/contact"
                    className="py-3 px-5 rounded-xl bg-cyan-DEFAULT text-navy-dark font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Initiate Project Onboarding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="py-3 px-4 rounded-xl bg-navy border border-navy-border text-silver-300 font-semibold text-xs hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
