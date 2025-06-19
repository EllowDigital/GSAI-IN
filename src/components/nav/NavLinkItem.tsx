
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkItemProps
  extends React.PropsWithChildren<{
    href: string;
    name: string;
    className: string;
    onClick?: () => void;
    role?: string;
    tabIndex?: number;
  }> {}

export function NavLinkItem({
  href,
  name,
  className,
  onClick,
  children,
  role,
  tabIndex,
}: NavLinkItemProps) {
  const content = children || name;

  // Handle internal routes (starting with /)
  if (href.startsWith('/')) {
    return (
      <Link 
        to={href} 
        className={className} 
        onClick={onClick}
        role={role}
        tabIndex={tabIndex}
        aria-label={`Navigate to ${name}`}
      >
        {content}
      </Link>
    );
  }

  // Handle anchor links and external links with smooth scrolling
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <a 
      href={href} 
      className={className} 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={`Navigate to ${name} section`}
    >
      {content}
    </a>
  );
}
