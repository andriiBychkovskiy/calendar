import React, { useState } from 'react';
import { Box, Popover, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { PRESET_COLORS } from './presetColors';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (color: string) => {
    onChange(color);
    handleClose();
  };

  const handleReset = () => {
    onChange('');
    handleClose();
  };

  return (
    <>
      <Tooltip title="Pick color" placement="top">
        <Box
          component="button"
          onClick={handleOpen}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.55)',
            backgroundColor: value || '#F1F3F5',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.15s',
            '&:hover': { opacity: 0.75 },
          }}
        >
          {!value && <ClearIcon sx={{ fontSize: 8, color: '#94A3B8' }} />}
        </Box>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: { p: 1, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
          <Tooltip title="No color" placement="top">
            <Box
              component="button"
              onClick={handleReset}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#F1F3F5',
                border: '1px solid rgba(0,0,0,0.55)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <ClearIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
            </Box>
          </Tooltip>

          {PRESET_COLORS.map((color) => (
            <Box
              key={color}
              component="button"
              onClick={() => handleSelect(color)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: color,
                cursor: 'pointer',
                padding: 0,
                border: '1px solid',
                borderColor: value === color ? 'rgba(0,0,0,0.55)' : 'transparent',
                outline: 'none',
                transition: 'transform 0.1s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
};
