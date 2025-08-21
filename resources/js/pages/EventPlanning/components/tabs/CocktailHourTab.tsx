import React from 'react';
import type { TabPanelProps } from '@/types';

const CocktailHourTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <input
          type="checkbox"
          id="cocktailHourMusic"
          checked={data.cocktailHourMusic}
          onChange={e => onChange('cocktailHourMusic', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="cocktailHourMusic" className="text-sm font-medium text-gray-700">
          Are we providing cocktail hour music?
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Where is cocktail hour located?
          </label>
          <input
            type="text"
            value={data.cocktailHourLocation}
            onChange={e => onChange('cocktailHourLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cocktail hour location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What style of music for cocktail hour?
          </label>
          <select
            value={data.cocktailMusic}
            onChange={e => onChange('cocktailMusic', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select music style</option>
            <option value="jazz">Jazz</option>
            <option value="acoustic">Acoustic</option>
            <option value="classical">Classical</option>
            <option value="contemporary">Contemporary</option>
            <option value="lounge">Lounge</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cocktail hour notes</label>
        <textarea
          value={data.cocktailNotes}
          onChange={e => onChange('cocktailNotes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional cocktail hour notes..."
        />
      </div>
    </div>
  );
};

export default CocktailHourTab;
