import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:py-8 py-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand mb-2 sm:block hidden">EventSync</h3>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto sm:block hidden">
            Event Management Platform for DJs and Their Clients
          </p>
          <div className="text-sm text-gray-400">
            © 2025 EventSync. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
