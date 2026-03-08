import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, CheckCircle2 } from 'lucide-react';

interface ProgramEnquiryFormProps {
  programTitle: string;
}

export default function ProgramEnquiryForm({ programTitle }: ProgramEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hi, I'm interested in the *${programTitle}* program.\n\nName: ${formData.name.trim()}\nPhone: ${formData.phone.trim()}\nMessage: ${formData.message.trim()}`
    );
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `https://wa.me/916394135988?text=${text}`
      : `https://web.whatsapp.com/send?phone=916394135988&text=${text}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <motion.section
      id="contact"
      className="py-12 md:py-20 border-t border-white/5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Enquire About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
                {programTitle}
              </span>
            </h2>
          </div>
          <p className="text-gray-400 mb-8">
            Interested in joining? Fill in your details and we'll get back to you
            via WhatsApp with batch timings and trial class information.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-green-400"
            >
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">Message sent! We'll contact you shortly on WhatsApp.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="enq-name" className="block text-sm text-gray-400 mb-1.5">
                  Your Name *
                </label>
                <input
                  id="enq-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="enq-phone" className="block text-sm text-gray-400 mb-1.5">
                  Phone / WhatsApp *
                </label>
                <input
                  id="enq-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={15}
                  pattern="[0-9]{10,15}"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="enq-message" className="block text-sm text-gray-400 mb-1.5">
                  Message (optional)
                </label>
                <textarea
                  id="enq-message"
                  name="message"
                  rows={3}
                  maxLength={500}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any questions about this program?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                Send Enquiry via WhatsApp
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.section>
  );
}
