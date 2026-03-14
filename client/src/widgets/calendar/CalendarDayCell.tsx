import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { isToday, isSameMonth, format } from 'date-fns';
import { SmileyIcon } from '@shared/ui/SmileyIcon/SmileyIcon';
import { getSmileyState } from '@shared/types';

const COLORS = {
  todayBg: '#F0FDF7',
  todayCircle: '#2D9B6F',
  smileyHover: 'rgba(45,155,111,0.07)',
  addHoverBg: '#F1F5F9',
  addHoverBorder: '#CBD5E1',
  outOfMonthBg: '#FAFAFA',
} as const;

interface CalendarDayCellProps {
  day: Date;
  viewDate: Date;
  colIndex: number;
  progress: number | undefined;
  hasEntries: boolean;
  dayExpenses: number;
  currencySymbol: string;
  onAddTask: () => void;
  onDayView: () => void;
  onDeleteDay: () => void;
  onCopyDay: () => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day, viewDate, colIndex, progress, hasEntries, dayExpenses, currencySymbol,
  onAddTask, onDayView, onDeleteDay, onCopyDay,
}) => {
  const inMonth = isSameMonth(day, viewDate);
  const today = isToday(day);
  const hasProgress = progress !== undefined;
  const smiley = hasProgress ? getSmileyState(progress) : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteDay();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyDay();
  };

  return (
    <Box
      sx={{
        minHeight: 88,
        p: 0.5,
        borderRight: colIndex < 6 ? '1px solid' : 'none',
        borderColor: 'divider',
        background: today ? COLORS.todayBg : inMonth ? '#fff' : COLORS.outOfMonthBg,
        opacity: inMonth ? 1 : 0.5,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr auto',
        cursor: 'default',
        transition: 'background 0.15s',
        '&:hover .add-btn': { opacity: 1 },
        '&:hover .del-btn': { opacity: 1 },
        '&:hover .copy-btn': { opacity: 1 },
      }}
    >
      {/* Top-left: date number */}
      <Box
        sx={{
          gridArea: '1 / 1',
          alignSelf: 'start',
          justifySelf: 'start',
          width: { xs: today ? 20 : 22, sm: 26 },
          height: { xs: today ? 20 : 22, sm: 26 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: today ? COLORS.todayCircle : 'transparent',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: today ? '0.6875rem' : '0.75rem', sm: '0.8125rem' },
            fontWeight: today ? 600 : 400,
            color: today ? '#fff' : inMonth ? 'text.primary' : 'text.disabled',
            lineHeight: 1,
          }}
        >
          {format(day, 'd')}
        </Typography>
      </Box>

      {/* Top-right: delete button */}
      {hasEntries && (
        <IconButton
          className="del-btn"
          size="small"
          onClick={handleDelete}
          sx={{
            gridArea: '1 / 2',
            alignSelf: 'start',
            justifySelf: 'end',
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

      {/* Middle: smiley — spans both columns */}
      {smiley && (
        <Box
          onClick={onDayView}
          sx={{
            gridArea: '2 / 1 / span 1 / span 2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background 0.15s',
            '&:hover': { background: COLORS.smileyHover },
          }}
        >
          <Box sx={{ width: { xs: 26, sm: 40 }, height: { xs: 26, sm: 40 } }}>
            <SmileyIcon state={smiley} size="100%" />
          </Box>
        </Box>
      )}

      {/* Bottom-left: copy button */}
      {hasProgress && (
        <IconButton
          className="copy-btn"
          size="small"
          onClick={handleCopy}
          sx={{
            gridArea: '3 / 1',
            alignSelf: 'end',
            justifySelf: 'start',
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

      {/* Bottom-right: expenses or add button */}
      {dayExpenses > 0 ? (
        <Typography
          variant="caption"
          sx={{
            gridArea: '3 / 2',
            alignSelf: 'end',
            justifySelf: 'end',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'primary.main',
            lineHeight: 1,
            pb: 0.25,
          }}
        >
          {currencySymbol}{dayExpenses % 1 === 0 ? dayExpenses : dayExpenses.toFixed(2)}
        </Typography>
      ) : !hasEntries ? (
        <IconButton
          className="add-btn"
          size="small"
          onClick={onAddTask}
          sx={{
            gridArea: '3 / 2',
            alignSelf: 'end',
            justifySelf: 'end',
            opacity: { xs: 1, sm: 0 },
            width: 22,
            height: 22,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            color: 'text.secondary',
            transition: 'opacity 0.15s',
            '&:hover': { background: COLORS.addHoverBg, borderColor: COLORS.addHoverBorder },
          }}
        >
          <AddIcon sx={{ fontSize: 14 }} />
        </IconButton>
      ) : null}
    </Box>
  );
};
