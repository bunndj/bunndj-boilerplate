import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showFooter = true, className = '' }) => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <Header title={title} />

      {/* Main Content */}
      <main className={`flex-grow ${className}`}>{children}</main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
