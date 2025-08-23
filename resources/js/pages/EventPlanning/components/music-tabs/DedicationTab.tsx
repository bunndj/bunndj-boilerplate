import React from 'react';
import MusicTab from './MusicTab';
import type { Song } from '@/types';

interface DedicationTabProps {
  songs: Song[];
  onChange: (songs: Song[]) => void;
}

const DedicationTab: React.FC<DedicationTabProps> = ({ songs, onChange }) => {
  return <MusicTab songs={songs} onChange={onChange} limit={10} categoryName="Dedication" />;
};

export default DedicationTab;
