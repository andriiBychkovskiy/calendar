import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  visibleYear: number;
  visibleMonth: number;
  onAddTask: () => void;
  onScrollToToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  visibleYear,
  visibleMonth,
  onAddTask,
  onScrollToToday,
}) => {
  const visibleDate = new Date(visibleYear, visibleMonth - 1, 1);
  const now = new Date();
  const isCurrentMonth =
    visibleYear === now.getFullYear() && visibleMonth === now.getMonth() + 1;

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

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 2,
          py: 0.75,
          minWidth: 140,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {format(visibleDate, 'MMMM yyyy')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onScrollToToday}
          disabled={isCurrentMonth}
          sx={{
            borderRadius: 10,
            px: 2.5,
            py: 1,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            '&.Mui-disabled': { opacity: 0.4 },
          }}
        >
          Today
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={onAddTask}
          sx={{ borderRadius: 10, px: 2.5, py: 1 }}
        >
          Add task
        </Button>
      </Box>
    </Box>
  );
};
