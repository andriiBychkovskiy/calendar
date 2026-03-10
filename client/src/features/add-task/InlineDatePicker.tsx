import React, { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

interface InlineDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const InlineDatePicker: React.FC<InlineDatePickerProps> = ({ value, onChange }) => {
  const [viewDate, setViewDate] = useState<Date>(startOfMonth(value));

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Box sx={{ p: 2, minWidth: 260 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <IconButton size="small" onClick={() => setViewDate(subMonths(viewDate, 1))}>
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {format(viewDate, 'MMMM yyyy')}
        </Typography>
        <IconButton size="small" onClick={() => setViewDate(addMonths(viewDate, 1))}>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          mb: 0.5,
        }}
      >
        {WEEKDAYS_FULL.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontWeight: 500,
              py: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {week.map((day) => {
            const inMonth = isSameMonth(day, viewDate);
            const selected = isSameDay(day, value);
            const today = isToday(day);

            return (
              <Box
                key={day.toISOString()}
                onClick={() => inMonth && onChange(day)}
                sx={{
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inMonth ? 'pointer' : 'default',
                  borderRadius: '50%',
                  mx: '1px',
                  my: '1px',
                  background: selected ? '#2D9B6F' : 'transparent',
                  '&:hover': inMonth && !selected ? { background: '#F1F5F9' } : {},
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: selected ? 600 : today ? 600 : 400,
                    color: selected
                      ? '#fff'
                      : !inMonth
                      ? 'text.disabled'
                      : today
                      ? 'primary.main'
                      : 'text.primary',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ))}

      <Box
        sx={{
          mt: 1,
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          size="small"
          onClick={() => onChange(new Date())}
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            fontSize: '0.8rem',
            px: 1,
            py: 0.25,
            '&:hover': { background: '#F1F5F9', color: 'text.primary' },
          }}
        >
          Today
        </Button>
      </Box>
    </Box>
  );
};
