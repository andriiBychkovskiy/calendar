import React from 'react';
import { Box } from '@mui/material';
import type { SmileyState } from '../../types';

interface SmileyIconProps {
  state: SmileyState;
  size?: number | string;
}

const smileyUrls: Record<SmileyState, string> = {
  sad:         new URL('./sad.png',         import.meta.url).href,
  slightly:    new URL('./slightly.png',    import.meta.url).href,
  neutral:     new URL('./neutral.png',     import.meta.url).href,
  happy:       new URL('./happy.png',       import.meta.url).href,
  celebratory: new URL('./celebratory.png', import.meta.url).href,
};

/**
 * Оригинальные цвета из PNG; равный inset + object-fit, чтобы разные ассеты визуально совпадали по кадру.
 */
export const SmileyIcon: React.FC<SmileyIconProps> = ({ state, size = '66%' }) => (
  <Box
    role="img"
    aria-label={state}
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: '7px', sm: '8px' },
    }}
  >
    <Box
      component="img"
      src={smileyUrls[state]}
      alt=""
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'center',
      }}
    />
  </Box>
);
