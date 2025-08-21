import React from 'react';
import type { TabPanelProps } from '@/types';

const CeremonyTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <input
          type="checkbox"
          id="ceremonyCeremonyAudio"
          checked={data.ceremonyCeremonyAudio}
          onChange={e => onChange('ceremonyCeremonyAudio', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="ceremonyCeremonyAudio" className="text-sm font-medium text-gray-700">
          Did you purchase ceremony audio?
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What time does the ceremony start?
          </label>
          <input
            type="time"
            value={data.ceremonyStartTime}
            onChange={e => onChange('ceremonyStartTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Where is the ceremony located?
          </label>
          <input
            type="text"
            value={data.ceremonyLocation}
            onChange={e => onChange('ceremonyLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ceremony location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is the officiant&apos;s name?
          </label>
          <input
            type="text"
            value={data.officiantName}
            onChange={e => onChange('officiantName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Officiant name"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="providingCeremonyMusic"
          checked={data.providingCeremonyMusic}
          onChange={e => onChange('providingCeremonyMusic', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="providingCeremonyMusic" className="text-sm font-medium text-gray-700">
          Are we providing ceremony music?
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guest Arrival / Prelude Music
        </label>
        <select
          value={data.guestArrivalMusic}
          onChange={e => onChange('guestArrivalMusic', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select music type</option>
          <option value="classical">Classical</option>
          <option value="contemporary">Contemporary</option>
          <option value="acoustic">Acoustic</option>
          <option value="instrumental">Instrumental</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ceremony Notes</label>
        <p className="text-xs text-gray-500 mb-2">
          Type N/A if anything below does not apply to your ceremony.
        </p>
        <textarea
          value={data.ceremonyNotes}
          onChange={e => onChange('ceremonyNotes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional ceremony notes..."
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="providingCeremonyMicrophones"
          checked={data.providingCeremonyMicrophones}
          onChange={e => onChange('providingCeremonyMicrophones', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="providingCeremonyMicrophones" className="text-sm font-medium text-gray-700">
          Are we providing ceremony microphones?
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Who needs a mic?</label>
        <select
          value={data.whoNeedsMic}
          onChange={e => onChange('whoNeedsMic', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select who needs microphone</option>
          <option value="officiant">Officiant only</option>
          <option value="couple">Couple only</option>
          <option value="both">Both officiant and couple</option>
          <option value="readers">Readers</option>
          <option value="all">All participants</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ceremony notes for the DJ
        </label>
        <textarea
          value={data.ceremonyDjNotes}
          onChange={e => onChange('ceremonyDjNotes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Special instructions for the DJ..."
        />
      </div>
    </div>
  );
};

export default CeremonyTab;
