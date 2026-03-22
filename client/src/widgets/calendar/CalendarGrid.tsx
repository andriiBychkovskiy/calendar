import { Box, Typography } from '@mui/material';
import { useOptionsStore } from '@entities/options/store';
import { CURRENCIES } from '@entities/options/currencies';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { WEEKDAY_LABELS_SHORT, weekStartsMonday } from '@shared/lib/calendarWeek';
import { CalendarDayCell } from './CalendarDayCell';
import type { ProgressMap } from '@shared/types';

interface CalendarGridProps {
  year: number;
  month: number;
  progressMap: ProgressMap;
  hasEntriesMap: Record<string, boolean>;
  expensesMap: Record<string, number>;
  onAddTask: (date: Date) => void;
  onDayView: (date: Date) => void;
  onDeleteDay: (date: Date) => void;
  onCopyDay: (date: Date) => void;
  showWeekdayHeader?: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year, month, progressMap, hasEntriesMap, expensesMap,
  onAddTask, onDayView, onDeleteDay, onCopyDay, showWeekdayHeader = true,
}) => {
  const currencyCode = useOptionsStore((s) => s.currency);
  const currencySymbol = (CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0]).symbol;

  const viewDate = new Date(year, month - 1, 1);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), weekStartsMonday),
    end: endOfWeek(endOfMonth(viewDate), weekStartsMonday),
  });
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  return (
    <Box sx={{ width: '100%' }}>
      {showWeekdayHeader && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {WEEKDAY_LABELS_SHORT.map((day) => (
            <Box key={day} sx={{ py: 1.25, textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: 'primary.main',
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {weeks.map((week, wi) => (
        <Box
          key={format(week[0], 'yyyy-MM-dd')}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: wi < weeks.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {week.map((day, di) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return (
              <CalendarDayCell
                key={dateKey}
                day={day}
                viewDate={viewDate}
                colIndex={di}
                progress={progressMap[dateKey]}
                hasEntries={!!hasEntriesMap[dateKey]}
                dayExpenses={expensesMap[dateKey] ?? 0}
                currencySymbol={currencySymbol}
                onAddTask={() => onAddTask(day)}
                onDayView={() => onDayView(day)}
                onDeleteDay={() => onDeleteDay(day)}
                onCopyDay={() => onCopyDay(day)}
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
