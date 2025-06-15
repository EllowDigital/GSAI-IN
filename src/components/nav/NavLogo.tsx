
import React from 'react';
import { Link } from 'react-router-dom';

export function NavLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 xs:gap-3 font-black text-base xs:text-lg md:text-xl tracking-wider text-red-700 select-none"
    >
      <img
        src="/assets/img/logo.webp"
        alt="Ghatak Sports Academy India™ official logo"
        loading="eager"
        className="w-9 h-9 xs:w-10 xs:h-10 rounded-full border-2 border-yellow-400 shadow-sm"
      />
      <span className="hidden xs:inline font-extrabold text-base xs:text-lg tracking-tighter">GSAI</span>
      <span className="hidden md:inline text-gray-900 font-bold text-sm md:text-base lg:text-xl ml-1 xs:ml-2 pl-2 md:pl-3 border-l border-yellow-300 tracking-tight">
        Ghatak Sports Academy India
      </span>
    </Link>
  );
}
