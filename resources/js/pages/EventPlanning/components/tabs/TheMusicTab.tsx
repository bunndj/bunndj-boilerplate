import React from 'react';
import type { TabPanelProps } from '@/types';

const TheMusicTab: React.FC<TabPanelProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do you have Spotify playlists you&apos;d like to share with us?
        </label>
        <p className="text-xs text-gray-500 mb-2">Post links below.</p>
        <textarea
          value={data.spotifyPlaylists}
          onChange={e => onChange('spotifyPlaylists', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your Spotify playlists or describe your music preferences..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Are Line Dances OK?</label>
        <p className="text-xs text-gray-500 mb-2">
          (i.e. &quot;Cupid Shuffle&quot;, &quot;Cha Cha Slide&quot;, &quot;Wobble&quot;)
        </p>
        <textarea
          value={data.lineDances}
          onChange={e => onChange('lineDances', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Which line dances would you like? (Cupid Shuffle, Cha Cha Slide, etc.)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is it OK to take requests?
        </label>
        <select
          value={data.takeRequests}
          onChange={e => onChange('takeRequests', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select option</option>
          <option value="yes">Yes, take all appropriate requests</option>
          <option value="filtered">Yes, but filter requests</option>
          <option value="no">No requests please</option>
          <option value="list-only">Only from our provided list</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What other notes should we know about the music?
        </label>
        <textarea
          value={data.musicNotes}
          onChange={e => onChange('musicNotes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any specific songs you must have, don't want, or other music-related notes..."
        />
      </div>
    </div>
  );
};

export default TheMusicTab;
