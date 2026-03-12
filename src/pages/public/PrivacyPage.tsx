import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const privacySections = [
  {
    title: '1. Introduction',
    content: `At Ghatak Sports Academy India, we respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.`,
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-300">
          <li>
            <strong className="text-white">Personal Data:</strong> Name, email
            address, phone number (submitted voluntarily).
          </li>
          <li>
            <strong className="text-white">Usage Data:</strong> IP address,
            browser type, device info, pages visited.
          </li>
          <li>
            <strong className="text-white">Cookies:</strong> Small files stored
            in your browser to enhance your experience.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Your Information',
    content: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-300">
          <li>Provide and maintain our website</li>
          <li>Improve site performance and functionality</li>
          <li>Communicate with users</li>
          <li>Ensure security and prevent fraud</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Disclosure of Information',
    content: (
      <>
        <p>We may share your data with:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-300">
          <li>
            <strong className="text-white">Service Providers:</strong> To
            facilitate services and enhance user experience.
          </li>
          <li>
            <strong className="text-white">Legal Obligations:</strong> When
            required by law or to protect our legal rights.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Security Measures',
    content: `We employ administrative and technical safeguards to protect your information from unauthorized access or disclosure.`,
  },
  {
    title: '6. Your Rights',
    content: `You may request access to, update, or delete your personal data by contacting us.`,
  },
  {
    title: '7. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. Changes will be posted on this page with the updated date.`,
  },
  {
    title: '8. Contact Us',
    content: (
      <>
        <p>If you have any questions about this Privacy Policy, contact us:</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Email:</span>
            <a
              href="mailto:ghatakgsai@gmail.com"
              className="text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              ghatakgsai@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Phone:</span>
            <div className="flex gap-2">
              <a
                href="tel:+916394135988"
                className="text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                +91 63941 35988
              </a>
              <span className="text-gray-600">|</span>
              <a
                href="tel:+918355062424"
                className="text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                +91 83550 62424
              </a>
            </div>
          </div>
        </div>
      </>
    ),
  },
];

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-black text-white font-montserrat relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl"
      >
        <header className="border-b border-white/10 pb-8 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: 12 February 2025</p>
        </header>

        <div className="space-y-8">
          {privacySections.map((s) => (
            <section key={s.title} className="group">
              <h2 className="text-xl md:text-2xl font-semibold text-yellow-500 mb-4 group-hover:text-yellow-400 transition-colors">
                {s.title}
              </h2>
              <div className="text-gray-300 leading-relaxed">{s.content}</div>
            </section>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        &copy; 2025 Ghatak Sports Academy India. All rights reserved.
      </div>
    </div>
  </div>
);

export default PrivacyPage;
