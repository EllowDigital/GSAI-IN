
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-gray-900 font-montserrat py-12 px-2">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl border border-gray-100 p-6 md:p-10 flex flex-col">
        <h1 className="text-3xl font-bold text-yellow-500 mb-1">Privacy Policy</h1>
        <p className="mb-2 text-xs text-gray-400">Last updated: 12 February 2025</p>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            At Ghatak Sports Academy India, we respect your privacy and are committed to protecting your personal
            information. This Privacy Policy outlines how we collect, use, and safeguard your data.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <strong>Personal Data:</strong> Name, email address, phone number (submitted voluntarily).
            </li>
            <li>
              <strong>Usage Data:</strong> IP address, browser type, device info, pages visited.
            </li>
            <li>
              <strong>Cookies:</strong> Small files stored in your browser to enhance your experience.
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Provide and maintain our website</li>
            <li>Improve site performance and functionality</li>
            <li>Communicate with users</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Disclosure of Information</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <strong>Service Providers:</strong> To facilitate services and enhance user experience.
            </li>
            <li>
              <strong>Legal Obligations:</strong> When required by law or to protect our legal rights.
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Security Measures</h2>
          <p>
            We employ administrative and technical safeguards to protect your information from unauthorized access or
            disclosure.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
          <p>
            You may request access to, update, or delete your personal data by contacting us.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with the updated
            date.
          </p>
        </section>
        <section className="mb-2">
          <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, contact us:
            <br />
            <span className="block my-2">
              Email:{" "}
              <a href="mailto:ghatakgsai@gmail.com" className="text-yellow-600 hover:underline">
                ghatakgsai@gmail.com
              </a>
              <br />
              Phone:{" "}
              <a href="tel:+916394135988" className="text-yellow-600 hover:underline">
                +91 63941 35988
              </a>
              ,{" "}
              <a href="tel:+918355062424" className="text-yellow-600 hover:underline">
                +91 83550 62424
              </a>
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}
