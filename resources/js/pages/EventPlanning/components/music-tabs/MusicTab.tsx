import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Song } from '@/types';

interface MusicTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
  limit?: number | null;
  categoryName: string;
}

const MusicTab: React.FC<MusicTabProps> = ({ songs, onChange, limit, categoryName }) => {
  const [newSong, setNewSong] = useState<Song>({
    song_title: '',
    artist: '',
    client_visible_title: '',
  });

  const addSong = () => {
    if (!newSong.song_title.trim()) return;

    // Check limit
    if (limit && songs.length >= limit) {
      alert(`You can only add up to ${limit} songs in the ${categoryName} category.`);
      return;
    }

    const songToAdd: Song = {
      song_title: newSong.song_title.trim(),
      artist: newSong.artist?.trim() || '',
      client_visible_title: newSong.client_visible_title?.trim() || newSong.song_title.trim(),
    };

    onChange([...songs, songToAdd]);
    setNewSong({ song_title: '', artist: '', client_visible_title: '' });
  };

  const removeSong = (index: number) => {
    const updatedSongs = songs.filter((_, i) => i !== index);
    onChange(updatedSongs);
  };

  const updateSong = (index: number, field: keyof Song, value: string) => {
    const updatedSongs = songs.map((song, i) => (i === index ? { ...song, [field]: value } : song));
    onChange(updatedSongs);
  };

  const isAtLimit = limit && songs.length >= limit;

  return (
    <div className="space-y-6">
      {/* Current Songs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Current Songs ({songs.length}
            {limit ? `/${limit}` : ''})
          </h3>
          {isAtLimit && <span className="text-sm text-red-600 font-medium">Limit reached</span>}
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎵</div>
            <p>No songs added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((song, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      value={song.song_title}
                      onChange={e => updateSong(index, 'song_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter song title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Artist</label>
                    <input
                      type="text"
                      value={song.artist || ''}
                      onChange={e => updateSong(index, 'artist', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter artist name"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Client Visible Title
                      </label>
                      <input
                        type="text"
                        value={song.client_visible_title || ''}
                        onChange={e => updateSong(index, 'client_visible_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Title shown to client"
                      />
                    </div>
                    <button
                      onClick={() => removeSong(index)}
                      className="self-center sm:self-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove song"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Song Form */}
      {!isAtLimit && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Song</h3>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Song Title *</label>
                <input
                  type="text"
                  value={newSong.song_title}
                  onChange={e => setNewSong({ ...newSong, song_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter song title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Artist</label>
                <input
                  type="text"
                  value={newSong.artist || ''}
                  onChange={e => setNewSong({ ...newSong, artist: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter artist name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client Visible Title
                </label>
                <input
                  type="text"
                  value={newSong.client_visible_title || ''}
                  onChange={e => setNewSong({ ...newSong, client_visible_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Title shown to client"
                />
              </div>
            </div>
            <button
              onClick={addSong}
              disabled={!newSong.song_title.trim()}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Add Song
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicTab;
