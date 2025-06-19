
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkItemProps
  extends React.PropsWithChildren<{
    href: string;
    name: string;
    className: string;
    onClick?: () => void;
  }> {}

export function NavLinkItem({
  href,
  name,
  className,
  onClick,
  children,
}: NavLinkItemProps) {
  const content = children || name;

  // Handle internal routes (starting with /)
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  // Handle anchor links and external links
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

  return (
    <a href={href} className={className} onClick={handleClick}>
      {content}
    </a>
  );
}
