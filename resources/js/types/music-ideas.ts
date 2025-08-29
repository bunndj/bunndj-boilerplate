// Music Ideas Types
export interface Song {
  song_title: string;
  artist?: string;
  client_visible_title?: string;
}

export interface MusicIdeasFormData {
  must_play: Song[];
  play_if_possible: Song[];
  dedication: Song[];
  play_only_if_requested: Song[];
  do_not_play: Song[];
  guest_request: Song[];
}

export interface MusicIdeasData {
  music_ideas: MusicIdeasFormData | null;
  notes: string | null;
  total_songs: number;
}

export interface MusicCategory {
  id: keyof MusicIdeasFormData;
  label: string;
  clientVisibleTitle: string;
  limit: number | null;
  description?: string;
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: 'must_play',
    label: 'Must Play',
    clientVisibleTitle: 'Must Play',
    limit: 60,
    description: 'Songs that must be played during the event',
  },
  {
    id: 'play_if_possible',
    label: 'Play If Possible',
    clientVisibleTitle: 'Play If Possible',
    limit: 30,
    description: 'Songs to play if time and atmosphere allow',
  },
  {
    id: 'dedication',
    label: 'Dedication',
    clientVisibleTitle: 'Dedication',
    limit: 10,
    description: 'Special dedication songs',
  },
  {
    id: 'play_only_if_requested',
    label: 'Play Only If Requested',
    clientVisibleTitle: 'Play Only If Requested',
    limit: 5,
    description: 'Songs only to be played if specifically requested by guests',
  },
  {
    id: 'do_not_play',
    label: 'Do Not Play',
    clientVisibleTitle: 'Do Not Play',
    limit: 10,
    description: 'Songs that should never be played',
  },
  {
    id: 'guest_request',
    label: 'Guest Request',
    clientVisibleTitle: 'Guest Request',
    limit: null,
    description: 'Songs requested by guests (unlimited)',
  },
];
