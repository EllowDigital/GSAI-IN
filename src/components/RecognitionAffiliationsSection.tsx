
import React from "react";

const logos = [
  { name: "Government of India", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" },
  { name: "Ministry of Youth Affairs & Sports", url: "https://youthaffairs.gov.in/sites/default/files/ministry_logo.png" },
  { name: "Fit India", url: "https://fitindia.gov.in/assets/images/logo.png" },
  { name: "Khelo India", url: "https://kheloindia.gov.in/assets/images/logo.png" },
  { name: "MSME", url: "https://upload.wikimedia.org/wikipedia/commons/7/73/MSME_logo.png" },
  { name: "ISO Certified", url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/ISO_Logo.svg" },
  { name: "SGFI", url: "https://sgfi.org/assets/images/logo-blue_0.png" },
  { name: "UP Olympic Association", url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Olympic_rings_without_rims.svg" },
  { name: "UP Kalaripayattu Federation", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Om_symbol.svg/120px-Om_symbol.svg.png" },
  { name: "Taekwondo Federation", url: "https://upload.wikimedia.org/wikipedia/en/1/1d/World_Taekwondo_Federation_logo.svg" },
];

export default function RecognitionAffiliationsSection() {
  return (
    <section className="py-12 px-4 bg-white border-t border-b">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 text-center">
          🏆 Recognitions &amp; Affiliations
        </h2>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-10 min-w-max px-2 py-4">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex flex-col items-center min-w-[88px] flex-shrink-0"
                title={logo.name}
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  loading="lazy"
                  className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition mb-1"
                />
                <span className="text-xs text-gray-600 text-center max-w-[88px]">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
