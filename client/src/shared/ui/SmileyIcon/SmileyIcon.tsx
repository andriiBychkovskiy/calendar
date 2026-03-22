import React from 'react';
import { Box, useTheme } from '@mui/material';
import type { SmileyState } from '../../types';
import type { Theme } from '@mui/material/styles';

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

/** Фиксированный цвет на состояние (без шкалы по progress). */
function colorForState(theme: Theme, state: SmileyState): string {
  const neutral = typeof theme.palette.text.disabled === 'string' ? theme.palette.text.disabled : '#94A3B8';
  const red = typeof theme.palette.error.main === 'string' ? theme.palette.error.main : '#EF4444';
  const sky = '#0EA5E9';
  const orange = '#FB923C';
  const green = typeof theme.palette.primary.main === 'string' ? theme.palette.primary.main : '#2D9B6F';

  const byState: Record<SmileyState, string> = {
    sad: neutral,
    slightly: red,
    neutral: sky,
    happy: orange,
    celebratory: green,
  };
  return byState[state];
}

/**
 * Силуэт через mask + сплошной цвет, привязанный к SmileyState.
 */
export const SmileyIcon: React.FC<SmileyIconProps> = ({ state, size = '66%' }) => {
  const theme = useTheme();
  const url = smileyUrls[state];
  const color = colorForState(theme, state);

  return (
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
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
          WebkitMaskImage: `url(${url})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${url})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          transition: 'background-color 0.2s ease',
        }}
      />
    </Box>
  );
};
