import React from 'react';
import type { SmileyState } from '../../types';

interface SmileyIconProps {
  state: SmileyState;
  size?: number | string;
}

const smileyUrls: Record<SmileyState, string> = {
  sad:          new URL('./sad.svg',           import.meta.url).href,
  slightly:     new URL('./slightly.svg',     import.meta.url).href,
  neutral:      new URL('./neutral.svg',       import.meta.url).href,
  happy:        new URL('./happy.svg',         import.meta.url).href,
  celebratory:  new URL('./ celebratory.svg',  import.meta.url).href,
};

export const SmileyIcon: React.FC<SmileyIconProps> = ({ state, size = '66%' }) => (
  <img
    src={smileyUrls[state]}
    alt={state}
    style={{ display: 'block', width: size, height: size }}
  />
);
