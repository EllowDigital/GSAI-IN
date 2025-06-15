
import React from "react";

const privacySections = [
  {
    title: "1. Introduction",
    content: `At Ghatak Sports Academy India, we respect your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.`,
  },
  {
    title: "2. Information We Collect",
    content: (
      <>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li><strong>Personal Data:</strong> Name, email address, phone number (submitted voluntarily).</li>
          <li><strong>Usage Data:</strong> IP address, browser type, device info, pages visited.</li>
          <li><strong>Cookies:</strong> Small files stored in your browser to enhance your experience.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. How We Use Your Information",
    content: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Provide and maintain our website</li>
          <li>Improve site performance and functionality</li>
          <li>Communicate with users</li>
          <li>Ensure security and prevent fraud</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Disclosure of Information",
    content: (
      <>
        <p>We may share your data with:</p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li><strong>Service Providers:</strong> To facilitate services and enhance user experience.</li>
          <li><strong>Legal Obligations:</strong> When required by law or to protect our legal rights.</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Security Measures",
    content: `We employ administrative and technical safeguards to protect your information from unauthorized access or disclosure.`,
  },
  {
    title: "6. Your Rights",
    content: `You may request access to, update, or delete your personal data by contacting us.`,
  },
  {
    title: "7. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. Changes will be posted on this page with the updated date.`,
  },
  {
    title: "8. Contact Us",
    content: (
      <>
        <p>If you have any questions about this Privacy Policy, contact us:</p>
        <div className="mt-1">
          <span>
            Email:{" "}
            <a
              href="mailto:ghatakgsai@gmail.com"
              className="text-yellow-500 underline hover:text-yellow-600"
            >
              ghatakgsai@gmail.com
            </a>
          </span>
          <br />
          <span>
            Phone:{" "}
            <a
              href="tel:+916394135988"
              className="text-yellow-500 underline hover:text-yellow-600"
            >
              +91 63941 35988
            </a>
            ,{" "}
            <a
              href="tel:+918355062424"
              className="text-yellow-500 underline hover:text-yellow-600"
            >
              +91 83550 62424
            </a>
          </span>
        </div>
      </>
    ),
  },
];

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen font-montserrat bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-0">
    <div className="max-w-3xl mx-auto mt-8 px-4 py-10 rounded-2xl bg-white/95 shadow-xl border border-yellow-100">
      <header className="border-b border-gray-200 pb-3 mb-7">
        <h1 className="text-3xl font-bold text-yellow-500 mb-1 text-center select-none">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Last updated: 12 February 2025
        </p>
      </header>
      {privacySections.map((s, i) => (
        <section className="mb-7 last:mb-0" key={s.title}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h2>
          <div className="text-gray-700 text-base">{s.content}</div>
        </section>
      ))}
    </div>
    <div className="w-full max-w-3xl mx-auto text-gray-400 text-xs text-center py-5">
      &copy; 2025 Ghatak Sports Academy India. All rights reserved.
    </div>
  </div>
);

export default PrivacyPage;
