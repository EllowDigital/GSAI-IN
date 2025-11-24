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
  ArrowRight,
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
    btnText: 'Call Now',
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['ghatakgsai@gmail.com'],
    action: 'mailto:ghatakgsai@gmail.com',
    color: 'from-blue-500 to-cyan-600',
    btnText: 'Send Email',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: [
      'Badshah kheda, Takrohi Rd, nearby Balaji Chauraha, Indira Nagar, Lucknow, Uttar Pradesh 226028',
    ],
    action: '#location',
    color: 'from-red-500 to-pink-600',
    btnText: 'Get Directions',
  },
  {
    icon: Clock,
    title: 'Training Hours',
    details: ['Mon-Sat: 6:00 AM - 9:00 PM', 'Sunday: Closed'],
    action: null,
    color: 'from-purple-500 to-indigo-600',
    btnText: null,
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
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="contact-heading"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Get In Touch
            </span>
          </div>
          <h2
            id="contact-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            Contact{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Us Today
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Ready to start your martial arts journey? Get in touch with us for
            enrollment, trial classes, or any questions about our programs.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 border border-white/10 hover:border-yellow-500/30 flex flex-col h-full"
              variants={quickContactVariants}
              whileHover={{ y: -8 }}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <info.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">
                {info.title}
              </h3>
              <div className="space-y-1 mb-4 flex-grow">
                {info.details.map((detail, idx) => (
                  <p
                    key={idx}
                    className="text-gray-400 text-sm leading-relaxed"
                  >
                    {detail}
                  </p>
                ))}
              </div>
              {info.action && (
                <div className="mt-auto pt-4 border-t border-white/10">
                  <a
                    href={info.action}
                    className="inline-flex items-center gap-2 text-yellow-500 font-semibold hover:text-red-500 transition-colors text-sm"
                  >
                    <span>{info.btnText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Form & CTA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-white/10 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={formVariants}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-yellow-500/20">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Send us a Message
                </h3>
              </div>

              <form
                action="https://formsubmit.co/ghatakgsai@gmail.com"
                method="POST"
                className="space-y-5"
                onSubmit={(e) => {
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  const email = formData.get('email') as string;
                  const message = formData.get('message') as string;

                  if (!name?.trim() || !email?.trim() || !message?.trim()) {
                    e.preventDefault();
                    alert(
                      'Please fill in all required fields before submitting.'
                    );
                    return;
                  }
                }}
              >
                <input
                  type="hidden"
                  name="_next"
                  value={`${window.location.origin}/pages/success.html`}
                />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input
                  type="hidden"
                  name="_subject"
                  value="New Contact Form Submission - Ghatak Sports Academy"
                />
                <input
                  type="hidden"
                  name="_cc"
                  value="sarwanyadav6174@gmail.com,ellowdigitalindia@gmail.com"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-300 ml-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-300 ml-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-300 ml-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-gray-300 ml-1"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                    placeholder="Tell us about your interest in our programs..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full justify-center gap-2 py-3.5 text-base shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="space-y-6 sm:space-y-8 flex flex-col justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={ctaVariants}
          >
            {/* Trial Class CTA */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-red-900/20 rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-white">
                    Book a Free Trial
                  </h3>
                </div>
                <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                  Experience our world-class training firsthand. Book your free
                  trial class today and discover the perfect martial arts program
                  for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+916394135988"
                    className="btn-primary justify-center gap-2 bg-gradient-to-r from-yellow-500 to-red-600 border-0 text-white"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href="#programs"
                    className="btn-secondary justify-center gap-2 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-yellow-500"
                  >
                    <span>View Programs</span>
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ CTA */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/10 hover:border-yellow-500/30 transition-colors duration-300">
              <h3 className="text-xl font-bold text-white mb-3">
                Have Questions?
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed text-sm sm:text-base">
                Check out our comprehensive FAQ section for answers to common
                questions about programs, fees, facilities, and more.
              </p>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:text-red-500 transition-colors"
              >
                <span>View FAQ</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Location CTA */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/10 hover:border-yellow-500/30 transition-colors duration-300">
              <h3 className="text-xl font-bold text-white mb-3">
                Find Our Locations
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed text-sm sm:text-base">
                We have two convenient locations in Lucknow. Find the one
                nearest to you and get directions.
              </p>
              <a
                href="#location"
                className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:text-red-500 transition-colors"
              >
                <span>View Locations</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
