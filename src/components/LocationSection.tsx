
import React from "react";
import { MapPin } from "lucide-react";

const mainCampus =
  "Naubasta Pulia, Takrohi Road, Indira Nagar, Lucknow";
const branchCampus =
  "Hardasi Kheda, Deva Road, Matiyari, Lucknow";

export default function LocationSection() {
  return (
    <section id="location" className="py-10 xs:py-14 md:py-20 px-2 xs:px-4 md:px-6 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2 w-full">
          <MapPin className="w-6 h-6 text-yellow-500" aria-hidden="true" />
          <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 text-center font-montserrat tracking-tight w-full">
            Our Location
          </h2>
        </div>
        <p className="text-base md:text-lg text-gray-700 text-center font-medium mb-8">
          Visit us at our main and branch campuses in Lucknow. Find directions and plan your visit. 
        </p>
        <div className="flex flex-col gap-5 md:flex-row md:gap-0 md:justify-center">
          <div className="flex-1 mb-2 md:mb-0 md:mr-4 text-center animate-fade-in">
            <div className="font-bold text-gray-800">Main Campus</div>
            <div className="text-gray-700 text-sm xs:text-base">{mainCampus}</div>
          </div>
          <div className="flex-1 text-center animate-fade-in">
            <div className="font-bold text-gray-800">Branch Campus</div>
            <div className="text-gray-700 text-sm xs:text-base">{branchCampus}</div>
          </div>
        </div>
        {/* Google Map Embed */}
        <div className="relative w-full rounded-lg shadow-md overflow-hidden h-56 xs:h-72 md:h-96 mt-8 animate-fade-in">
          <iframe
            title="Ghatak Sports Academy Locations Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.2070978926137!2d80.99170791744385!3d26.884563330917584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2b2f08e0b4b%3A0xbcf1e4c809b883cd!2sNaubasta%20Pulia%2C%20Takrohi%20Rd%2C%20Indira%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh%20226016!5e0!3m2!1sen!2sin!4v1716628636907!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowFullScreen={true}
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="text-xs text-center text-gray-400 mt-2">Map powered by Google Maps. Both campuses are shown for your reference.</div>
      </div>
    </section>
  );
}
