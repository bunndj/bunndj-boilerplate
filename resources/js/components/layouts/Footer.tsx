import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand mb-2">Bunn DJ Planning</h3>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
            Professional wedding event management platform for DJs. Plan, organize, and execute
            perfect wedding celebrations.
          </p>
          <div className="text-sm text-gray-400">
            © 2025 Bunn DJ Planning. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
