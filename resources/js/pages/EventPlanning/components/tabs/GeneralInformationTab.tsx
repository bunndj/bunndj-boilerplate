import React from 'react';
import type { TabPanelProps } from '@/types';

const GeneralInformationTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mailing Address <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Please write complete mailing address. (Example: 1234 Main St Apt 123, Brooklyn, NY
            11201)
          </p>
          <input
            type="text"
            value={data.mailingAddress}
            onChange={e => onChange('mailingAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Complete mailing address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approximate number of guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.guestCount}
            onChange={e => onChange('guestCount', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Number of guests"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coordinator Email Address
          </label>
          <input
            type="email"
            value={data.coordinatorEmail}
            onChange={e => onChange('coordinatorEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="coordinator@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photographer Email Address
          </label>
          <input
            type="email"
            value={data.photographerEmail}
            onChange={e => onChange('photographerEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="photographer@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Videographer Email Address
          </label>
          <input
            type="email"
            value={data.videographerEmail}
            onChange={e => onChange('videographerEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="videographer@example.com"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isWedding"
            checked={data.isWedding}
            onChange={e => onChange('isWedding', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isWedding" className="text-sm font-medium text-gray-700">
            Is this event a wedding?
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralInformationTab;
