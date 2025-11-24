import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavLinkItemProps
  extends React.PropsWithChildren<{
    href: string;
    name: string;
    className: string;
    onClick?: () => void;
    role?: string;
    tabIndex?: number;
    style?: React.CSSProperties;
  }> {}

export function NavLinkItem({
  href,
  name,
  className,
  onClick,
  children,
  role,
  tabIndex,
  style,
}: NavLinkItemProps) {
  const content = children || name;
  const location = useLocation();
  const navigate = useNavigate();

  // Handle internal routes (starting with /)
  if (href.startsWith('/')) {
    return (
      <Link
        to={href}
        className={className}
        onClick={onClick}
        role={role}
        tabIndex={tabIndex}
        style={style}
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

      if (location.pathname === '/') {
        // If on homepage, scroll to element
        const element = document.querySelector(href);
        if (element) {
          const offsetTop =
            element.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      } else {
        // If not on homepage, navigate to homepage with hash
        navigate(`/${href}`);
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
      style={style}
      aria-label={`Navigate to ${name} section`}
    >
      {content}
    </a>
  );
}
