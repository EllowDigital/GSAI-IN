
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkItemProps extends React.PropsWithChildren<{
  href: string;
  name: string;
  className: string;
  onClick?: () => void;
}> {}

export function NavLinkItem({ href, name, className, onClick, children }: NavLinkItemProps) {
  const content = children || name;

  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {content}
    </a>
  );
}
