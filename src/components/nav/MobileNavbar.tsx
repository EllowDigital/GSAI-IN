
import React from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../ui/dropdown-menu';
import { NavLinkItem } from './NavLinkItem';
import { navLinks } from '../../data/navLinks';

interface MobileNavbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function MobileNavbar({ mobileOpen, setMobileOpen }: MobileNavbarProps) {
  return (
    <div className="md:hidden flex items-center">
      <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`p-2 rounded focus:outline-none text-gray-800 hover:bg-yellow-100 transition h-11 w-11 flex items-center justify-center
              ${mobileOpen ? "ring-2 ring-yellow-300" : ""}`}
            aria-label="Open mobile menu"
          >
            {mobileOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="z-[99] w-[92vw] max-w-[350px] bg-white rounded-2xl border border-yellow-300 shadow-2xl mt-3 ml-[-8px] px-0 py-0 overflow-hidden animate-fade-in"
          sideOffset={10}
        >
          <div className="flex items-center gap-3 px-5 pt-6 pb-2 border-b border-yellow-100 bg-white">
            <img
              src="/assets/img/logo.webp"
              alt="GSAI Logo"
              className="w-10 h-10 rounded-full border border-yellow-400"
            />
            <span className="font-extrabold text-lg text-black tracking-tight">GSAI</span>
            <span className="text-sm font-semibold text-yellow-700 ml-4 border-l border-yellow-200 pl-3">
              Ghatak Sports Academy India
            </span>
          </div>
          <div className="flex flex-col py-4 px-6 gap-3 bg-white">
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.name}
                name={link.name}
                href={link.href}
                className="flex items-center gap-3 text-gray-800 font-semibold py-3 px-3 rounded-xl transition-all duration-200 hover:bg-yellow-100 active:bg-yellow-200 text-base"
                onClick={() => setMobileOpen(false)}
              >
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2" />
                  <span>{link.name}</span>
                </>
              </NavLinkItem>
            ))}
            <Link
              to="/admin/login"
              className="flex items-center gap-2 justify-center px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-500 active:bg-yellow-600 transition-all mt-2 text-base"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn className="w-5 h-5" /> Admin Panel
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
