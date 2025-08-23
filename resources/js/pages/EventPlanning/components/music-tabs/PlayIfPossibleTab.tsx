import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface PlayIfPossibleTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const PlayIfPossibleTab: React.FC<PlayIfPossibleTabProps> = ({ songs, onChange }) => {
  return <MusicTab songs={songs} onChange={onChange} limit={30} categoryName="Play If Possible" />;
};

export default PlayIfPossibleTab;
