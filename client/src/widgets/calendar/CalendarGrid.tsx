import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
} from 'date-fns';
import { SmileyIcon } from '@shared/ui/SmileyIcon/SmileyIcon';
import { getSmileyState } from '@shared/types';
import type { ProgressMap } from '@shared/types';

interface CalendarGridProps {
  year: number;
  month: number;
  progressMap: ProgressMap;
  onAddTask: (date: Date) => void;
  onDayView: (date: Date) => void;
  onDeleteDay: (date: Date) => void;
  onCopyDay: (date: Date) => void;
  showWeekdayHeader?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year, month, progressMap, onAddTask, onDayView, onDeleteDay, onCopyDay, showWeekdayHeader = true,
}) => {
  const viewDate = new Date(year, month - 1, 1);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
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
          {WEEKDAYS.map((day) => (
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

      {/* Calendar rows */}
      {weeks.map((week, wi) => (
        <Box
          key={wi}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: wi < weeks.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {week.map((day, di) => {
            const inMonth = isSameMonth(day, viewDate);
            const today = isToday(day);
            const dateKey = format(day, 'yyyy-MM-dd');
            const progress = progressMap[dateKey];
            const hasTasks = progress !== undefined;
            const smiley = hasTasks ? getSmileyState(progress) : null;

            return (
              <Box
                key={day.toISOString()}
                sx={{
                  minHeight: 88,
                  p: 1,
                  borderRight: di < 6 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  position: 'relative',
                  background: today ? '#F0FDF7' : inMonth ? '#fff' : '#FAFAFA',
                  opacity: inMonth ? 1 : 0.5,
                  display: 'grid',
                  gridTemplate: '1fr / 1fr',
                  cursor: 'default',
                  transition: 'background 0.15s',
                  '&:hover .add-btn': { opacity: 1 },
                  '&:hover .del-btn': { opacity: 1 },
                  '&:hover .copy-btn': { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    gridArea: '1 / 1',
                    alignSelf: 'start',
                    justifySelf: 'start',
                    width: { xs: today ? 20 : 26, sm: 26 },
                    height: { xs: today ? 20 : 26, sm: 26 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: today ? '#2D9B6F' : 'transparent',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: today ? '0.6875rem' : '0.8125rem', sm: '0.8125rem' },
                      fontWeight: today ? 600 : 400,
                      color: today ? '#fff' : inMonth ? 'text.primary' : 'text.disabled',
                      lineHeight: 1,
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                </Box>

                {smiley && (
                  <Box
                    onClick={() => onDayView(day)}
                    sx={{
                      gridArea: '1 / 1',
                      alignSelf: 'center',
                      justifySelf: 'center',
                      width: { xs: 26, sm: 40 },
                      height: { xs: 26, sm: 40 },
                      display: 'inline-flex',
                      cursor: 'pointer',
                      borderRadius: 1,
                      transition: 'background 0.15s',
                      '&:hover': { background: 'rgba(45,155,111,0.07)' },
                    }}
                  >
                    <SmileyIcon state={smiley} size="100%" />
                  </Box>
                )}

                {hasTasks && (
                  <IconButton
                    className="del-btn"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onDeleteDay(day); }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      opacity: { xs: 1, sm: 0 },
                      width: 20,
                      height: 20,
                      color: 'primary.main',
                      transition: 'opacity 0.15s',
                      '&:hover': { opacity: 0.7, background: 'transparent' },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}

                {hasTasks && (
                  <IconButton
                    className="copy-btn"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onCopyDay(day); }}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      opacity: { xs: 1, sm: 0 },
                      width: 20,
                      height: 20,
                      color: 'primary.main',
                      transition: 'opacity 0.15s',
                      '&:hover': { opacity: 0.7, background: 'transparent' },
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                )}

                {!hasTasks && (
                  <IconButton
                    className="add-btn"
                    size="small"
                    onClick={() => onAddTask(day)}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      opacity: { xs: 1, sm: 0 },
                      width: 22,
                      height: 22,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      color: 'text.secondary',
                      transition: 'opacity 0.15s',
                      '&:hover': { background: '#F1F5F9', borderColor: '#CBD5E1' },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
