import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface MustPlayTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const MustPlayTab: React.FC<MustPlayTabProps> = ({ songs, onChange }) => {
  return <MusicTab songs={songs} onChange={onChange} limit={60} categoryName="Must Play" />;
};

export default MustPlayTab;
