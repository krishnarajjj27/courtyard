import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle, HelpCircle, Calendar, Navigation } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const quickActions = [
    {
      icon: Calendar,
      title: 'Book a Court',
      description: 'Reserve your court in minutes',
      action: () => navigate('/user/booking'),
      color: 'emerald',
    },
    {
      icon: MessageCircle,
      title: 'Chat Support',
      description: 'Get instant help',
      action: () => window.open('tel:+919876543210'),
      color: 'blue',
    },
    {
      icon: HelpCircle,
      title: 'FAQs',
      description: 'Find quick answers',
      action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
      color: 'purple',
    },
  ];

  const faqs = [
    {
      question: 'What are your operating hours?',
      answer: 'We are open Monday-Friday from 5:00 AM to 11:00 PM, and Saturday-Sunday from 6:00 AM to 10:00 PM.',
    },
    {
      question: 'How do I cancel my booking?',
      answer: 'Please contact our support team via phone at +91 98765 43210 to request a cancellation. Our team will process your request.',
    },
    {
      question: 'Do you offer group bookings?',
      answer: 'Yes! We offer special rates for group bookings and tournaments. Contact us for more details.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto"
          >
            We're here to help! Whether you have questions, need support, or want to give feedback
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12 -mt-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Call Us</h3>
                    <a
                      href="tel:+919876543210"
                      className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-1 transition-colors"
                    >
                      +91 98765 43210
                    </a>
                    <a
                      href="tel:+919876543211"
                      className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      +91 98765 43211
                    </a>
                    <p className="text-xs text-gray-500 mt-2">Available 7 days a week</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Email Us</h3>
                    <a
                      href="mailto:info@thecourtyard.com"
                      className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-1 transition-colors"
                    >
                      info@thecourtyard.com
                    </a>
                    <a
                      href="mailto:support@thecourtyard.com"
                      className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      support@thecourtyard.com
                    </a>
                    <p className="text-xs text-gray-500 mt-2">Response within 24 hours</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Visit Us</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      thecourtyard Sports Arena<br />
                      123, Marine Drive<br />
                      Mumbai, Maharashtra 400001
                    </p>
                    <button
                      onClick={() => window.open('https://maps.google.com', '_blank')}
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Operating Hours</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mon - Fri</span>
                        <span className="font-medium text-gray-800">5 AM - 11 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sat - Sun</span>
                        <span className="font-medium text-gray-800">6 AM - 10 PM</span>
                      </div>
                    </div>
                    <div className="mt-3 px-2 py-1 bg-green-100 rounded text-xs font-medium text-green-700 inline-block">
                      Open Now
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                  <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Message Sent Successfully!</h3>
                    <p className="text-gray-600 text-center max-w-md mb-6">
                      Thank you for reaching out to us. Our team will review your message and respond within 24 hours.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select a subject</option>
                          <option value="booking">Booking Inquiry</option>
                          <option value="cancellation">Cancellation Request</option>
                          <option value="payment">Payment Issue</option>
                          <option value="feedback">Feedback</option>
                          <option value="general">General Question</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                        placeholder="Tell us how we can help you..."
                      />
                      <p className="text-xs text-gray-500 mt-2">Please provide as much detail as possible</p>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        className="px-8 py-3 text-base"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                      <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                    </div>
                  </form>
                )}
              </GlassCard>
            </motion.div>

            {/* FAQs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <GlassCard className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="pb-4 border-b border-gray-200 last:border-0">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm ml-7">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Can't find what you're looking for?{' '}
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Contact us directly
                    </button>
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};