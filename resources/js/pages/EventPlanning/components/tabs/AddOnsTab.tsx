import React from 'react';
import type { TabPanelProps } from '@/types';

const AddOnsTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Uplighting Section */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            id="uplighting"
            checked={data.uplighting}
            onChange={e => onChange('uplighting', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="uplighting" className="text-sm font-medium text-gray-700">
            Did you purchase uplighting?
          </label>
        </div>

        {data.uplighting && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What color would you like?
              </label>
              <select
                value={data.uplightingColor}
                onChange={e => onChange('uplightingColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select color</option>
                <option value="warm-white">Warm White</option>
                <option value="cool-white">Cool White</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
                <option value="amber">Amber</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uplighting Notes
              </label>
              <input
                type="text"
                value={data.uplightingNotes}
                onChange={e => onChange('uplightingNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional uplighting notes"
              />
            </div>
          </div>
        )}
      </div>

      {/* Photo Booth Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            id="photoBooth"
            checked={data.photoBooth}
            onChange={e => onChange('photoBooth', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="photoBooth" className="text-sm font-medium text-gray-700">
            Did you purchase a photo booth?
          </label>
        </div>

        {data.photoBooth && (
          <div className="space-y-6 ml-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where are we setting up the booth?
                </label>
                <input
                  type="text"
                  value={data.photoBoothLocation}
                  onChange={e => onChange('photoBoothLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Photo booth location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which logo design would you like?
                </label>
                <select
                  value={data.logoDesign}
                  onChange={e => onChange('logoDesign', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select logo design</option>
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="vintage">Vintage</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What text do you want on the photo?
                </label>
                <input
                  type="text"
                  value={data.photoText}
                  onChange={e => onChange('photoText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Photo text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color schemes for photo frame
                </label>
                <input
                  type="text"
                  value={data.photoColorScheme}
                  onChange={e => onChange('photoColorScheme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Color scheme preferences"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LED ring color
                </label>
                <input
                  type="text"
                  value={data.ledRingColor}
                  onChange={e => onChange('ledRingColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="LED ring color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which backdrop do you want?
                </label>
                <select
                  value={data.backdrop}
                  onChange={e => onChange('backdrop', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select backdrop</option>
                  <option value="sequin">Sequin</option>
                  <option value="floral">Floral</option>
                  <option value="solid">Solid Color</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where would you like the photos emailed post event?
              </label>
              <input
                type="email"
                value={data.photoEmailLocation}
                onChange={e => onChange('photoEmailLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email for photo delivery"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOnsTab;
