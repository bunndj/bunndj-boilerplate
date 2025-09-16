import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  /** Whether to wrap the logo in a Link component */
  linkTo?: string;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the image */
  imageClassName?: string;
  /** Alt text for the logo */
  alt?: string;
  /** Click handler for the logo */
  onClick?: () => void;
  /** Whether to show hover effects */
  showHoverEffect?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  linkTo = '/dashboard',
  className = '',
  imageClassName = '',
  alt = 'EventSync Logo',
  onClick,
  showHoverEffect = true,
}) => {
  const defaultImageClasses = `w-auto object-contain transition-all duration-300 ${
    showHoverEffect ? 'hover:opacity-80 group-hover:scale-105' : ''
  }`;

  const logoContent = (
    <>
      {/* Mobile Logo - Hidden on desktop */}
      <img
        src="/assets/logo_mobile.png"
        alt={alt}
        className={`${defaultImageClasses} ${imageClassName} h-8 sm:hidden`}
      />
      
      {/* Desktop Logo - Hidden on mobile */}
      <img
        src="/assets/logo.png"
        alt={alt}
        className={`${defaultImageClasses} ${imageClassName} hidden sm:block h-8 sm:h-10`}
        style={{ aspectRatio: '160/51' }}
      />
    </>
  );

  const containerClasses = `flex items-center ${showHoverEffect ? 'group' : ''} ${className}`;

  if (linkTo) {
    return (
      <Link to={linkTo} className={containerClasses} onClick={onClick}>
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={containerClasses} onClick={onClick}>
      {logoContent}
    </div>
  );
};

export default Logo;
