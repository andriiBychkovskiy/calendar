import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { CalendarGrid } from './CalendarGrid';
import type { ProgressMap } from '@shared/types';

interface MonthSectionProps {
  year: number;
  month: number;
  progressMap: ProgressMap;
  onAddTask: (date: Date) => void;
  onDayView: (date: Date) => void;
  onDeleteDay: (date: Date) => void;
  onCopyDay: (date: Date) => void;
}

export const MonthSection: React.FC<MonthSectionProps> = ({
  year,
  month,
  progressMap,
  onAddTask,
  onDayView,
  onDeleteDay,
  onCopyDay,
}) => {
  const monthDate = new Date(year, month - 1, 1);

  return (
    <Box data-month-key={`${year}-${month}`}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: '#FAFBFC',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}
        >
          {format(monthDate, 'MMMM yyyy')}
        </Typography>
      </Box>

      <CalendarGrid
        year={year}
        month={month}
        progressMap={progressMap}
        onAddTask={onAddTask}
        onDayView={onDayView}
        onDeleteDay={onDeleteDay}
        onCopyDay={onCopyDay}
        showWeekdayHeader={false}
      />
    </Box>
  );
};
