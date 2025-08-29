import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface GuestRequestTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const GuestRequestTab: React.FC<GuestRequestTabProps> = ({ songs, onChange }) => {
  return <MusicTab songs={songs} onChange={onChange} limit={null} categoryName="Guest Request" />;
};

export default GuestRequestTab;
