import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    content: '+91 63941 35988',
    href: 'tel:+916394135988',
    description: 'Mon-Sat, 6:00 AM - 9:00 PM',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    content: 'ghatakgsai@gmail.com',
    href: 'mailto:ghatakgsai@gmail.com',
    description: 'We reply within 24 hours',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    content: 'Ghatak Sports Academy India',
    href: '#location',
    description: 'Find our location',
    color: 'from-red-500 to-pink-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ContactSection() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission delay
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section
      id="contact"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Get In Touch
            </span>
          </div>

          <h2 id="contact-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Contact
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Our Team
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to start your martial arts journey? Have questions about our programs? 
            We're here to help you take the first step towards excellence.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {contactInfo.map((info, index) => (
            <motion.a
              key={info.title}
              href={info.href}
              className="group block p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <info.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                  {info.title}
                </h3>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {info.content}
                </p>
                <p className="text-sm text-gray-600">
                  {info.description}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Left Side - Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border border-white/50">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Send us a Message
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Fill out the form below and we'll get back to you as soon as possible. 
                  Let's discuss how we can help you achieve your fitness and martial arts goals.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      className="h-12 bg-gray-50/50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100 rounded-xl transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Enter your phone number"
                      className="h-12 bg-gray-50/50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100 rounded-xl transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="h-12 bg-gray-50/50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What's this about?"
                    className="h-12 bg-gray-50/50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us about your interest in our programs, any specific questions, or how we can help you..."
                    className="bg-gray-50/50 border-gray-200 focus:border-yellow-400 focus:ring-yellow-100 rounded-xl transition-all duration-300 resize-none"
                  />
                </div>

                {/* Hidden FormSubmit fields */}
                <input type="hidden" name="_subject" value="New Contact Form Submission from Ghatak Sports Academy" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://ghatakgsai.netlify.app/pages/success.html" />
                <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} />

                <Button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className={`w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    formStatus === 'success'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white'
                  }`}
                >
                  {formStatus === 'submitting' && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  )}
                  {formStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message Sent Successfully!
                    </>
                  ) : formStatus === 'submitting' ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-3xl p-8 md:p-10 border border-yellow-100/50 shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Why Contact Us?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Free Trial Classes</h4>
                    <p className="text-gray-600">Experience our training firsthand with complimentary trial sessions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h4>
                    <p className="text-gray-600">We respond to all inquiries within 24 hours, often much sooner.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Personal Consultation</h4>
                    <p className="text-gray-600">Get personalized guidance on the best programs for your goals.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Need Immediate Help?</h4>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+916394135988"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
                
                <a
                  href="mailto:ghatakgsai@gmail.com"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
