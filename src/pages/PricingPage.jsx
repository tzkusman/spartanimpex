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
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  X,
  QrCode,
  Globe2,
  Building2
} from 'lucide-react';
import Container from '../components/common/Container';
import { pricingPlansData } from '../data/portfolioData';
import { printAuditReport } from '../utils/auditReport';

const PRICING_CACHE_KEY = 'spartan_live_pricing_plans_usd';

// Synchronous initial state resolution: guarantees 0ms paint with latest admin prices
function getInitialPlans() {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(PRICING_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed reading cached pricing plans:', err);
    }
  }
  return pricingPlansData;
}

function normalizePhoneForGateway(phone, isUSD) {
  if (!phone || !phone.trim()) return '';
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (!digits) return '';

  // If user already typed with '+', respect explicit international format
  if (trimmed.startsWith('+')) {
    return '+' + digits;
  }

  // USD Mode: guarantee +1 prefix so Razorpay never prepends +91
  if (isUSD) {
    if (digits.startsWith('1')) {
      return '+' + digits;
    }
    return '+1' + digits;
  }

  // UPI Mode: guarantee +91 prefix
  if (digits.startsWith('91')) {
    return '+' + digits;
  }
  return '+91' + digits;
}

function getInitialPaymentMethod() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
      return 'UPI';
    }
  } catch {
    // fallback
  }
  return 'CARD_USD';
}

export default function PricingPage() {
  const [plans, setPlans] = useState(getInitialPlans);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState(getInitialPaymentMethod); // 'CARD_USD' for International, 'UPI' for India
  const [geoCountry, setGeoCountry] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Auto Geo-Detection: Detect country via Vercel Edge IP header
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/geo?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recommendedMethod && isMounted) {
          setPaymentTab(data.recommendedMethod);
          if (data.country) setGeoCountry(data.country);
        }
      })
      .catch((err) => console.warn('Geo-detection skipped, using local timezone:', err.message));
    return () => {
      isMounted = false;
    };
  }, []);

  // Silent background revalidation: checks PostgreSQL for any admin updates
  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      try {
        const res = await fetch(`/api/pricing?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setPlans(data);
            try {
              localStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(data));
            } catch (storageErr) {
              console.warn('Could not cache pricing plans:', storageErr);
            }
          }
        }
      } catch (err) {
        console.warn('Using existing cached pricing plans:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  // Direct USD price getters
  const getPlanPrice = (plan) => {
    if (plan && typeof plan.price === 'number') return plan.price;
    return 199;
  };

  const getPlanOriginalPrice = (plan) => {
    if (plan && typeof plan.originalPrice === 'number' && plan.originalPrice > plan.price) {
      return plan.originalPrice;
    }
    return null;
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

    // Refresh geo check on modal open with zero cache
    fetch(`/api/geo?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recommendedMethod) {
          setPaymentTab(data.recommendedMethod);
          if (data.country) setGeoCountry(data.country);
        }
      })
      .catch(() => {});
  };

  const handlePhoneChange = (val) => {
    setFormData((prev) => ({ ...prev, phone: val }));
    const clean = val.trim();
    const digitsOnly = val.replace(/[^0-9]/g, '');

    // 1. Explicit Indian phone detection (e.g. +91..., 91..., or 10-digit Indian numbers starting with 6-9)
    if (
      clean.startsWith('+91') ||
      (digitsOnly.startsWith('91') && digitsOnly.length >= 11) ||
      (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly))
    ) {
      setPaymentTab('UPI');
    }
    // 2. Explicit US & International phone detection (e.g. +1..., +44..., or 11-digit numbers starting with 1)
    else if (
      clean.startsWith('+1') ||
      clean.startsWith('+44') ||
      clean.startsWith('+61') ||
      clean.startsWith('+49') ||
      clean.startsWith('+971') ||
      (digitsOnly.startsWith('1') && digitsOnly.length === 11)
    ) {
      setPaymentTab('CARD_USD');
    }
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error('Please enter your full name and corporate email.');
      }

      const isUSDMode = (paymentTab === 'CARD_USD');
      const normalizedPhone = normalizePhoneForGateway(formData.phone, isUSDMode);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Step 1: Create Order on backend with chosen method and normalized phone
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: selectedPlan.slug,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: normalizedPhone,
          method: paymentTab,
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

      const isUSD = (orderData.currency === 'USD');
      const orderDescription = isUSD
        ? `${orderData.plan.name} Architecture Package ($${orderData.displayPrice} USD)`
        : `${orderData.plan.name} Architecture Package (₹${orderData.amountINR?.toLocaleString('en-IN')})`;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Spartan Impax Enterprise IT',
        description: orderDescription,
        image: '/assets/spartan-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: normalizedPhone || '',
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
                paymentMethod: isUSD ? 'Razorpay Global USD Checkout' : 'Razorpay Multi-Channel (UPI/NetBanking/Cards)',
                currency: orderData.currency,
                amount: isUSD ? orderData.displayPrice : orderData.amountINR,
                priceUSD: orderData.displayPrice,
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
              amount: isUSD ? orderData.displayPrice : orderData.amountINR,
              currency: orderData.currency,
              priceUSD: orderData.displayPrice,
              amountINR: orderData.amountINR,
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
      q: 'Which payment methods and currencies do you accept?',
      a: 'We accept All Channels: UPI (Google Pay, PhonePe, Paytm, QR Code scan), NetBanking from 50+ banks, Wallets, and domestic/international cards. For international clients paying with foreign cards or Apple Pay, checkout is processed directly in USD ($).'
    },
    {
      q: 'How does live foreign exchange conversion work?',
      a: 'When paying via UPI or NetBanking, the order is automatically converted using the real-time live interbank exchange rate, ensuring 100% equivalence to actual dollars with zero fee loss.'
    },
    {
      q: 'Are there any hidden recurring fees or monthly charges?',
      a: 'Zero. Every package is a single engagement milestone payment with clear, upfront deliverables. There are no surprise monthly subscription renewals or hidden recurring invoices.'
    },
    {
      q: 'Can we adjust or customize deliverables after checkout?',
      a: 'Yes. Every project package kicks off with a dedicated architectural discovery call with CIO Usman and CEO Gajender Singh Rajawat. We customize technical specifications and sprint milestones to match your exact enterprise scope.'
    },
    {
      q: 'Do you provide Non-Disclosure Agreements (NDA) and IP ownership?',
      a: 'Absolutely. 100% of all intellectual property, source code repositories, documentation, and cloud infrastructure keys belong exclusively to you upon project handover.'
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

          {/* Clean Global USD Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-navy-card/90 border border-cyan-DEFAULT/30 shadow-xl backdrop-blur-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Global Base Currency: <span className="text-cyan-DEFAULT">USD ($)</span>
            </span>
            <span className="text-silver-400 text-xs hidden sm:inline">•</span>
            <span className="text-silver-300 text-xs hidden sm:inline">All Payment Channels Supported</span>
            <span className="text-silver-400 text-xs hidden sm:inline">•</span>
            <span className="text-silver-400 text-xs hidden sm:inline">256-bit Encrypted</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.popular || plan.slug === 'business-fullstack';
            const price = getPlanPrice(plan);
            const originalPrice = getPlanOriginalPrice(plan);

            return (
              <div
                key={plan.id || plan.slug}
                className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? 'bg-navy-card/90 border-2 border-cyan-DEFAULT shadow-[0_0_40px_rgba(0,229,255,0.2)] md:-translate-y-2'
                    : 'bg-navy-card/60 border border-navy-border hover:border-cyan-DEFAULT/50 hover:shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-DEFAULT to-blue-500 text-navy-dark text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular Architecture</span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name & Category */}
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-DEFAULT">
                      {plan.slug.replace('-', ' ')}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white mt-1">{plan.name}</h3>
                  </div>

                  <p className="text-silver-300 text-sm leading-relaxed mb-6 min-h-[48px]">
                    {plan.description}
                  </p>

                  {/* Pricing Display */}
                  <div className="mb-6 p-4 rounded-2xl bg-navy border border-navy-border">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-silver-400 text-xs font-semibold uppercase">USD</span>
                    </div>
                    {originalPrice && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-silver-400 line-through">
                          ${originalPrice.toLocaleString()} USD
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          Save ${originalPrice - price}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-silver-400 mb-2">
                      What's Included:
                    </p>
                    {plan.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-full bg-cyan-DEFAULT/15 border border-cyan-DEFAULT/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-cyan-DEFAULT" />
                        </div>
                        <span className="text-silver-200 text-xs leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-8 pt-0">
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                      isPopular
                        ? 'bg-cyan-DEFAULT text-navy-dark hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                        : 'bg-navy border border-cyan-DEFAULT/40 text-cyan-DEFAULT hover:bg-cyan-DEFAULT hover:text-navy-dark'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[10px] text-silver-400 mt-2">
                    Instant Razorpay checkout • All channels supported
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Assurance Banner */}
        <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-card/40 border border-navy-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-cyan-DEFAULT" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Razorpay Verified & Secure</h4>
              <p className="text-silver-300 text-xs leading-relaxed">
                256-bit encryption with cryptographic HMAC-SHA256 signature verification on every milestone transaction.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-navy-card/40 border border-navy-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-cyan-DEFAULT" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">All Channels: UPI, NetBanking & Cards</h4>
              <p className="text-silver-300 text-xs leading-relaxed">
                Pay with Google Pay, PhonePe, Paytm, instant QR code, 50+ NetBanking options, and domestic or foreign cards.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-navy-card/40 border border-navy-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-cyan-DEFAULT" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Enterprise SLAs & Deliverables</h4>
              <p className="text-silver-300 text-xs leading-relaxed">
                Full intellectual property transfer, NDA protection, and direct access to principal architecture leadership.
              </p>
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
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            {!paymentSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-DEFAULT/10 border border-cyan-DEFAULT/30 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-cyan-DEFAULT" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Razorpay Multi-Channel Checkout</h3>
                    <p className="text-xs text-silver-400">Package: {selectedPlan.name} (${getPlanPrice(selectedPlan)} USD)</p>
                  </div>
                </div>

                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl bg-navy border border-navy-border mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-silver-400">Selected Architecture Package</p>
                      <h4 className="font-bold text-white text-base">{selectedPlan.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-silver-400">Total Investment</p>
                      <span className="text-xl font-black text-cyan-DEFAULT">
                        ${getPlanPrice(selectedPlan).toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-navy-border/60 text-[11px] text-silver-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>
                      {paymentTab === 'UPI'
                        ? 'All channels enabled: UPI (QR, GPay, PhonePe), NetBanking 50+ Banks, Cards & Wallets'
                        : 'Global USD checkout: Visa, Mastercard, American Express & Apple Pay'}
                    </span>
                  </div>
                </div>

                {/* Clean Segmented Method Tabs */}
                <div className="flex p-1 bg-navy rounded-2xl border border-navy-border mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('UPI')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      paymentTab === 'UPI'
                        ? 'bg-cyan-DEFAULT text-navy-dark shadow-md'
                        : 'text-silver-300 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI & NetBanking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('CARD_USD')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      paymentTab === 'CARD_USD'
                        ? 'bg-cyan-DEFAULT text-navy-dark shadow-md'
                        : 'text-silver-300 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card & Apple Pay (USD $)</span>
                  </button>
                </div>

                {paymentError && (
                  <div className="p-4 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
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
                      placeholder="e.g., John Doe / Rahul Sharma"
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
                      Contact / Phone {paymentTab === 'UPI' ? '(Required for UPI QR)' : '(Optional)'}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-silver-300 pointer-events-none select-none z-10">
                        {paymentTab === 'CARD_USD' ? '🇺🇸 +1' : '🇮🇳 +91'}
                      </span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={paymentTab === 'CARD_USD' ? '(555) 019-2834 or 1235486521' : '91323 54275'}
                        className="w-full pl-20 pr-4 py-3 rounded-xl bg-navy border border-navy-border text-white text-sm focus:outline-none focus:border-cyan-DEFAULT focus:ring-1 focus:ring-cyan-DEFAULT transition-all"
                      />
                    </div>
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
                          <span>Connecting to Razorpay Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            {paymentTab === 'UPI'
                              ? 'Pay with UPI, NetBanking & Cards'
                              : `Pay $${getPlanPrice(selectedPlan).toLocaleString()} USD with Razorpay`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-silver-400 pt-2 flex-wrap">
                    {paymentTab === 'UPI' ? (
                      <>
                        <span>UPI (GPay / PhonePe / QR)</span>
                        <span>•</span>
                        <span>NetBanking 50+ Banks</span>
                        <span>•</span>
                        <span>Cards & Wallets</span>
                      </>
                    ) : (
                      <>
                        <span>Visa</span>
                        <span>•</span>
                        <span>Mastercard</span>
                        <span>•</span>
                        <span>American Express</span>
                        <span>•</span>
                        <span>Apple Pay</span>
                      </>
                    )}
                    <span>•</span>
                    <span>256-bit SSL</span>
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
                  Thank you, <strong className="text-white">{paymentSuccess.customer.name}</strong>. Your payment has been confirmed in real time.
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
                    <span className="text-silver-400">Amount Charged:</span>
                    <span className="font-bold text-white">
                      {paymentSuccess.currency === 'USD'
                        ? `$${Number(paymentSuccess.amount).toLocaleString()} USD`
                        : `₹${Number(paymentSuccess.amount).toLocaleString('en-IN')} INR ($${paymentSuccess.priceUSD} USD)`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      printAuditReport({
                        orderId: paymentSuccess.orderId,
                        paymentId: paymentSuccess.paymentId,
                        customerName: paymentSuccess.customer.name,
                        customerEmail: paymentSuccess.customer.email,
                        customerPhone: paymentSuccess.customer.phone,
                        planName: paymentSuccess.plan.name,
                        amount: paymentSuccess.amount,
                        currency: paymentSuccess.currency,
                        status: 'PAID',
                      })
                    }
                    className="py-3 px-5 rounded-xl bg-navy border border-cyan-DEFAULT/50 text-cyan-DEFAULT font-bold text-xs uppercase tracking-wider hover:bg-cyan-DEFAULT hover:text-navy-dark transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Tax Receipt & Audit Record</span>
                  </button>
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
