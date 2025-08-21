import React from 'react';
import type { TabPanelProps } from '@/types';

const IntroductionsTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What time are introductions?
        </label>
        <input
          type="time"
          value={data.introductionsTime}
          onChange={e => onChange('introductionsTime', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parents entrance song
          </label>
          <input
            type="text"
            value={data.parentsEntranceSong}
            onChange={e => onChange('parentsEntranceSong', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Song title and artist"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wedding party intro song
          </label>
          <input
            type="text"
            value={data.weddingPartyIntroSong}
            onChange={e => onChange('weddingPartyIntroSong', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Song title and artist"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couple intro song</label>
        <input
          type="text"
          value={data.coupleIntroSong}
          onChange={e => onChange('coupleIntroSong', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Song title and artist"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wedding party introductions
        </label>
        <textarea
          value={data.weddingPartyIntroductions}
          onChange={e => onChange('weddingPartyIntroductions', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="List wedding party members and their relationships..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Special dances</label>
        <p className="text-xs text-gray-500 mb-2">Type N/A if we aren&apos;t doing that dance</p>
        <textarea
          value={data.specialDances}
          onChange={e => onChange('specialDances', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="First dance, father-daughter, mother-son, etc..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Any other notes?</label>
        <textarea
          value={data.otherNotes}
          onChange={e => onChange('otherNotes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any other special notes for introductions..."
        />
      </div>
    </div>
  );
};

export default IntroductionsTab;
