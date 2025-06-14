
import { Youtube } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "#programs" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#" }, // placeholder, update when contact page is built
];

export default function FooterSection() {
  return (
    <footer className="bg-gray-950 py-10 px-4 mt-16 border-t border-gray-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-0 items-center justify-between">
        {/* Quick Links */}
        <nav className="flex flex-wrap gap-8 items-center">
          {quickLinks.map((link) => (
            <a
              href={link.href}
              className="text-white hover:text-yellow-400 transition text-lg font-semibold"
              key={link.name}
            >
              {link.name}
            </a>
          ))}
        </nav>
        {/* Social Icons + Credit */}
        <div className="flex flex-col md:items-end items-center gap-4">
          <div className="flex gap-4 mb-2">
            {/* Add more icons as they become available */}
            <a href="https://www.youtube.com/@ghatakgsai" target="_blank" rel="noopener noreferrer">
              <Youtube size={28} className="text-white hover:text-red-600 transition" />
            </a>
            {/* Instagram, Facebook, WhatsApp: Uncomment & add links when available */}
            {/* <a href="#"><Instagram ... /></a> */}
          </div>
          <div className="text-xs text-gray-500">
            Crafted by <span className="text-yellow-400 font-medium">EllowDigitals</span> – Empowering brands through innovation.
          </div>
        </div>
      </div>
    </footer>
  );
}
