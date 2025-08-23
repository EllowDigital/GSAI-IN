import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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
    },
  },
};

const quickContactVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 63941 35988'],
    action: 'tel:+916394135988',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['ghatakgsai@gmail.com'],
    action: 'mailto:ghatakgsai@gmail.com',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: [
      'Badshah kheda, Takrohi Rd, nearby Balaji Chauraha, Indira Nagar, Lucknow, Uttar Pradesh 226028',
    ],
    action: '#location',
    color: 'from-red-500 to-pink-600',
  },
  {
    icon: Clock,
    title: 'Training Hours',
    details: ['Mon-Sat: 6:00 AM - 9:00 PM', 'Sunday: Closed'],
    action: null,
    color: 'from-purple-500 to-indigo-600',
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      id="contact"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Get In Touch
            </span>
          </div>
          <h2
            id="contact-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Contact
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Us Today
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to start your martial arts journey? Get in touch with us for
            enrollment, trial classes, or any questions about our programs.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-yellow-200/50"
              variants={quickContactVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl`}
              >
                <info.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600">
                {info.title}
              </h3>
              <div className="space-y-1">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm">
                    {detail}
                  </p>
                ))}
              </div>
              {info.action && (
                <div className="mt-4">
                  <a
                    href={info.action}
                    className="inline-flex items-center gap-2 text-yellow-600 font-medium hover:text-yellow-700"
                  >
                    <span className="text-sm">
                      {info.title === 'Call Us'
                        ? 'Call Now'
                        : info.title === 'Email Us'
                          ? 'Send Email'
                          : 'Get Directions'}
                    </span>
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-red-500"></div>
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={formVariants}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Send us a Message
              </h3>
            </div>

            <form
              action="https://formsubmit.co/ghatakgsai@gmail.com"
              method="POST"
              className="space-y-6"
              onSubmit={(e) => {
                // Add basic validation before submission
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const email = formData.get('email') as string;
                const message = formData.get('message') as string;
                
                if (!name?.trim() || !email?.trim() || !message?.trim()) {
                  e.preventDefault();
                  alert('Please fill in all required fields before submitting.');
                  return;
                }
              }}
            >
              {/* Redirect after submission */}
              <input
                type="hidden"
                name="_next"
                value={`${window.location.origin}/pages/success.html`}
              />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_subject" value="New Contact Form Submission - Ghatak Sports Academy" />
              {/* CC: Add other recipients here */}
              <input
                type="hidden"
                name="_cc"
                value="sarwanyadav6174@gmail.com,ellowdigitalindia@gmail.com"
              />

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl resize-none"
                  placeholder="Tell us about your interest in our programs..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" />
                  Send Message
                </span>
              </button>
            </form>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={ctaVariants}
          >
            {/* Trial Class CTA */}
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-3xl p-8 border border-yellow-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Book a Free Trial
                </h3>
              </div>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Experience our world-class training firsthand. Book your free
                trial class today and discover the perfect martial arts program
                for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+916394135988"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-yellow-200/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span>View Programs</span>
                </a>
              </div>
            </div>

            {/* FAQ CTA */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Have Questions?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Check out our comprehensive FAQ section for answers to common
                questions about programs, fees, facilities, and more.
              </p>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors duration-300"
              >
                <span>View FAQ</span>
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
              </a>
            </div>

            {/* Location CTA */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Find Our Locations
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We have two convenient locations in Lucknow. Find the one
                nearest to you and get directions.
              </p>
              <a
                href="#location"
                className="inline-flex items-center gap-2 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors duration-300"
              >
                <span>View Locations</span>
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
