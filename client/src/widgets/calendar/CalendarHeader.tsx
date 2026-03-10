import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onAddTask: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year, month, onPrev, onNext, onAddTask,
}) => {
  const date = new Date(year, month - 1, 1);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2.5,
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.01em' }}
      >
        Calendar
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          onClick={onPrev}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            width: 32,
            height: 32,
            color: 'text.secondary',
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            minWidth: 130,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            {format(date, 'MMMM yyyy')}
          </Typography>
        </Box>

        <IconButton
          onClick={onNext}
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            width: 32,
            height: 32,
            color: 'text.secondary',
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={onAddTask}
        sx={{ borderRadius: 10, px: 2.5, py: 1 }}
      >
        Add task
      </Button>
    </Box>
  );
};
