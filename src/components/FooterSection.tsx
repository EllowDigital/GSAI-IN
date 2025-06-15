import { Youtube, Mail, MapPin, Instagram } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "#programs" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#contact" },
];

export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-t from-gray-950 via-gray-900 to-gray-950 text-white mt-8 xs:mt-16 border-t border-gray-900 font-montserrat relative overflow-hidden">
      {/* Decorative sparkles */}
      <span className="absolute left-8 top-2 w-12 h-12 bg-yellow-100/20 rounded-full blur-2xl pointer-events-none" />
      <span className="absolute right-8 bottom-2 w-14 h-14 bg-yellow-400/30 rounded-full blur-2xl pointer-events-none" />
      {/* Additional gradient swoosh */}
      <div className="absolute bottom-0 left-0 w-full h-[48px] bg-gradient-to-r from-yellow-400/10 via-transparent to-red-400/10 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-3 xs:px-6 py-9 flex flex-col md:flex-row gap-10 md:gap-0 justify-between items-center md:items-start relative z-10">
        {/* Column 1: Brand/About */}
        <div className="mb-6 md:mb-0 flex-1 min-w-[180px] flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl xs:text-3xl font-bold text-yellow-400 mb-2 tracking-wider select-none">
            Ghatak Sports Academy India™
          </div>
          <p className="text-gray-400 text-sm xs:text-base leading-relaxed max-w-xs">
            Empowering youth and athletes through structured training, discipline, and innovation. Join our thriving community to unlock your strength and potential.
          </p>
        </div>
        {/* Column 2: Quick Links */}
        <div className="mb-6 md:mb-0 flex-1 min-w-[150px] flex flex-col items-center md:items-start">
          <div className="font-semibold text-lg mb-2 text-gray-100">Quick Links</div>
          <ul className="flex flex-row md:flex-col gap-3 md:gap-2 flex-wrap w-full justify-center md:justify-start">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-400 hover:text-yellow-400 transition font-medium text-base px-2 py-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* Column 3: Contact & Social */}
        <div className="flex-1 min-w-[160px] flex flex-col items-center md:items-end">
          <div className="font-semibold text-lg mb-2 text-gray-100">Contact</div>
          <div className="flex flex-col gap-1 text-sm xs:text-base text-gray-400 mb-2 items-center md:items-end">
            <span className="inline-flex items-center gap-1">
              <Mail className="w-4 h-4 text-yellow-300" />
              <a href="mailto:ghatakgsai@gmail.com" className="hover:text-yellow-400 underline">ghatakgsai@gmail.com</a>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4 text-yellow-300" />
              <span>Lucknow, Uttar Pradesh, India</span>
            </span>
          </div>
          <div>
            <div className="flex gap-4 items-center mt-2">
              <a
                href="https://www.youtube.com/@ghatakgsai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-red-500 transition rounded-full border border-transparent hover:border-red-500 p-1"
              >
                <Youtube size={26} />
              </a>
              <a
                href="https://www.instagram.com/ghatakgsai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-pink-500 transition rounded-full border border-transparent hover:border-pink-500 p-1"
              >
                <Instagram size={26} />
              </a>
              {/* Additional social icons can be added here */}
            </div>
          </div>
        </div>
      </div>
      {/* Footer bottom row */}
      <div className="border-t border-gray-800 text-center py-5 px-2 text-xs xs:text-sm text-gray-500 bg-gray-950/90 flex flex-col xs:flex-row gap-2 xs:gap-4 items-center justify-center">
        <span>
          &copy; {new Date().getFullYear()} Ghatak Sports Academy India™. All rights reserved.
        </span>
        <span className="block">
          Crafted by <span className="text-yellow-400 font-medium"><a href="https://ellowdigitals.me" target="_blank" rel="noopener noreferrer">EllowDigital</a></span>
        </span>
      </div>
    </footer>
  );
}
