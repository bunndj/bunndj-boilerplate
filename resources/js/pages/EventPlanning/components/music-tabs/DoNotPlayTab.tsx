import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface DoNotPlayTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const DoNotPlayTab: React.FC<DoNotPlayTabProps> = ({ songs, onChange }) => {
  return <MusicTab songs={songs} onChange={onChange} limit={10} categoryName="Do Not Play" />;
};

export default DoNotPlayTab;
