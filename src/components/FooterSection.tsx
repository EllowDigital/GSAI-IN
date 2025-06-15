
import { Youtube } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "#programs" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#" },
];

export default function FooterSection() {
  return (
    <footer className="bg-gray-950 text-white mt-8 xs:mt-16 border-t border-gray-900 font-montserrat">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-10 flex flex-col md:flex-row gap-8 md:gap-0 justify-between">
        {/* Column 1: About/Brand */}
        <div className="mb-6 md:mb-0 flex-1 min-w-[180px]">
          <div className="text-2xl font-bold text-yellow-400 mb-2 tracking-wider">
            Ghatak Sports Academy India™
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering youth and athletes through structured training, discipline, and innovation. Join our thriving community to unlock your strength and potential.
          </p>
        </div>
        {/* Column 2: Quick Links */}
        <div className="mb-6 md:mb-0 flex-1 min-w-[140px]">
          <div className="font-semibold text-lg mb-2 text-gray-100">Quick Links</div>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-400 hover:text-yellow-400 transition font-medium text-base"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* Column 3: Contact & Social */}
        <div className="flex-1 min-w-[140px]">
          <div className="font-semibold text-lg mb-2 text-gray-100">Contact</div>
          <div className="text-gray-400 text-sm mb-3">
            Email: <a href="mailto:ghatakgsai@gmail.com" className="hover:text-yellow-400 underline">ghatakgsai@gmail.com</a>
            <br />
            Jamshedpur, Jharkhand, India
          </div>
          <div>
            <div className="flex gap-3 items-center mt-2">
              <a
                href="https://www.youtube.com/@ghatakgsai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-red-500 transition"
              >
                <Youtube size={26} />
              </a>
              {/* Add more icons below as needed */}
            </div>
          </div>
        </div>
      </div>
      {/* Footer bottom */}
      <div className="border-t border-gray-800 text-center py-5 px-2 text-xs text-gray-500 bg-gray-950/90">
        <span>
          &copy; {new Date().getFullYear()} Ghatak Sports Academy India™. All rights reserved.
        </span>
        <span className="block mt-1">
          Crafted by <span className="text-yellow-400 font-medium">EllowDigitals</span>
        </span>
      </div>
    </footer>
  );
}
