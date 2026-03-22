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
 * Fixed outer frame + object-fit + equal inset so different PNG paddings
 * don’t make one state (e.g. happy) look larger than another in the same cell.
 */
export const SmileyIcon: React.FC<SmileyIconProps> = ({ state, size = '66%' }) => (
  <Box
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
      alt={state}
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
