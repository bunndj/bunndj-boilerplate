import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface PlayOnlyIfRequestedTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const PlayOnlyIfRequestedTab: React.FC<PlayOnlyIfRequestedTabProps> = ({ songs, onChange }) => {
  return (
    <MusicTab songs={songs} onChange={onChange} limit={5} categoryName="Play Only If Requested" />
  );
};

export default PlayOnlyIfRequestedTab;
