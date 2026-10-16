import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { personalData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import SocialLinks from '../components/common/SocialLinks';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const prefilledService = searchParams.get('service') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: prefilledService ? `Inquiry about ${prefilledService}` : '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your name';
    }
    if (!formData.email.trim()) {
      errs.email = 'Please provide your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) {
      errs.subject = 'Please enter a subject';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide a message with at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit message to database.');
      }

      setIsSubmitting(false);
      setSubmissionStatus('demo-sent');
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setApiError(err.message || 'Error connecting to server. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge="GET IN TOUCH"
        title="Contact Me"
        description="Have an upcoming project, freelance contract, or technical leadership role? I'd love to hear from you."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="py-14 md:py-20 bg-navy">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Direct Contact Info & Signature */}
            <div className="lg:col-span-5 space-y-8">
              {/* Info Cards */}
              <div className="space-y-4">
                {/* Email card */}
                <div className="bg-navy-card p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
                      Email
                    </span>
                    <a
                      href={`mailto:${personalData.email}`}
                      className="block text-sm sm:text-base font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {personalData.email}
                    </a>
                  </div>
                </div>

                {/* Phone card */}
                <div className="bg-navy-card p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
                      Phone / WhatsApp
                    </span>
                    <a
                      href={`tel:${personalData.phone}`}
                      className="block text-sm sm:text-base font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {personalData.phone}
                    </a>
                  </div>
                </div>

                {/* Location card */}
                <div className="bg-navy-card p-6 rounded-2xl border border-navy-border hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-muted border border-navy-border flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
                      Location
                    </span>
                    <span className="block text-sm sm:text-base font-medium text-white">
                      {personalData.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-navy-card p-6 rounded-2xl border border-navy-border">
                <span className="text-xs uppercase tracking-wider text-navy-300 font-semibold block mb-4">
                  Social Profiles
                </span>
                <SocialLinks variant="circle" />
              </div>

              {/* Let's Work Together Box */}
              <div className="bg-navy-card p-8 rounded-3xl border border-navy-border shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-widest font-semibold mb-2">
                  <Sparkles size={14} />
                  <span>DIRECT INVITATION</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-white mb-3">
                  Let's Work Together
                </h3>
                <p className="text-sm text-navy-200 leading-relaxed mb-6">
                  I'm always open to discussing product ideas, strategic architecture opportunities, and collaborating on high-impact projects.
                </p>

                {/* Signature */}
                <div className="pt-4 border-t border-navy-border flex items-center justify-between">
                  <span className="text-xs text-navy-300">Founder & Architect</span>
                  <span className="font-serif italic text-xl font-bold text-cyan tracking-wider">
                    ~ {personalData.signature}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-navy-card p-8 sm:p-10 rounded-3xl border border-navy-border shadow-2xl">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white mb-2">
                  Send a Message
                </h2>
                <p className="text-sm text-navy-200 mb-8">
                  Fill out the form below and I'll get back to you within 24 business hours.
                </p>

                {submissionStatus === 'demo-sent' ? (
                  <div className="bg-navy border border-cyan-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-fadeIn">
                    <div className="w-14 h-14 rounded-full bg-cyan-500 text-navy-950 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-white">
                      Inquiry Transmitted!
                    </h3>
                    <p className="text-sm text-navy-200 max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="font-semibold text-white">{formData.name}</span>! Your inquiry has been logged and our engineering team will follow up promptly.
                    </p>

                    <div className="mt-6 p-4 rounded-xl bg-navy-dark border border-navy-border text-left text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
                        <Info size={14} />
                        <span>Production Endpoint Ready</span>
                      </div>
                      <p className="text-navy-300">
                        Form transmission validated successfully. Ready for direct backend integration or Formspree / EmailJS hookup.
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setSubmissionStatus(null);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      variant="primary"
                      size="sm"
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                                    {apiError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
                      <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-navy-200 mb-2">
                          Your Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. John Doe"
                          aria-invalid={errors.name ? "true" : "false"}
                          className={`w-full px-4 py-3 text-sm bg-navy text-white rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-navy-400 ${
                            errors.name ? 'border-rose-400 focus:border-rose-500 bg-rose-950/20' : 'border-navy-border focus:border-cyan-400'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{errors.name}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-navy-200 mb-2">
                          Your Email <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. john@company.com"
                          aria-invalid={errors.email ? "true" : "false"}
                          className={`w-full px-4 py-3 text-sm bg-navy text-white rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-navy-400 ${
                            errors.email ? 'border-rose-400 focus:border-rose-500 bg-rose-950/20' : 'border-navy-border focus:border-cyan-400'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-navy-200 mb-2">
                        Subject <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g. Full-Stack Web Development Inquiry"
                        aria-invalid={errors.subject ? "true" : "false"}
                        className={`w-full px-4 py-3 text-sm bg-navy text-white rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-navy-400 ${
                          errors.subject ? 'border-rose-400 focus:border-rose-500 bg-rose-950/20' : 'border-navy-border focus:border-cyan-400'
                        }`}
                      />
                      {errors.subject && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{errors.subject}</span>
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-navy-200 mb-2">
                        Message <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell me about your project, goals, and timeline..."
                        aria-invalid={errors.message ? "true" : "false"}
                        className={`w-full px-4 py-3 text-sm bg-navy text-white rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all resize-y placeholder:text-navy-400 ${
                          errors.message ? 'border-rose-400 focus:border-rose-500 bg-rose-950/20' : 'border-navy-border focus:border-cyan-400'
                        }`}
                      ></textarea>
                      {errors.message && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        icon={Send}
                        iconPosition="right"
                        className="w-full sm:w-auto font-semibold"
                      >
                        {isSubmitting ? 'Validating...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
