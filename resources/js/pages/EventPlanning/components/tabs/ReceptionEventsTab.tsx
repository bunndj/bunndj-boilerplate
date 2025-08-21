import React from 'react';
import type { TabPanelProps } from '@/types';

const ReceptionEventsTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dinner music style</label>
          <select
            value={data.dinnerMusic}
            onChange={e => onChange('dinnerMusic', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select dinner music style</option>
            <option value="soft-contemporary">Soft Contemporary</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="acoustic">Acoustic</option>
            <option value="instrumental">Instrumental</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dinner style</label>
          <select
            value={data.dinnerStyle}
            onChange={e => onChange('dinnerStyle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select dinner style</option>
            <option value="plated">Plated</option>
            <option value="buffet">Buffet</option>
            <option value="family-style">Family Style</option>
            <option value="stations">Food Stations</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Welcome by</label>
          <input
            type="text"
            value={data.welcomeBy}
            onChange={e => onChange('welcomeBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Who will give the welcome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blessing by</label>
          <input
            type="text"
            value={data.blessingBy}
            onChange={e => onChange('blessingBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Who will give the blessing"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Toasts</label>
        <textarea
          value={data.toasts}
          onChange={e => onChange('toasts', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Who will be giving toasts and in what order..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reception notes</label>
        <p className="text-xs text-gray-500 mb-2">
          Type N/A if anything below does not apply to your reception.
        </p>
        <textarea
          value={data.receptionNotes}
          onChange={e => onChange('receptionNotes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional reception notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe your exit</label>
        <p className="text-xs text-gray-500 mb-2">
          (sparkler/bubbles/inside/outside, who is handing out sparklers... etc)
        </p>
        <textarea
          value={data.exitDescription}
          onChange={e => onChange('exitDescription', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the grand exit..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Any other comments?</label>
        <textarea
          value={data.otherComments}
          onChange={e => onChange('otherComments', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any other comments or special requests..."
        />
      </div>
    </div>
  );
};

export default ReceptionEventsTab;
