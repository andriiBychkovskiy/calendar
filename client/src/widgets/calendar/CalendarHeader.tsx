import React from 'react';
import { Box, Typography, ButtonBase, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  visibleYear: number;
  visibleMonth: number;
  onAddTask: () => void;
  onScrollToToday: () => void;
  onOpenOptions: () => void;
  onOpenStatistics: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  visibleYear,
  visibleMonth,
  onAddTask,
  onScrollToToday,
  onOpenOptions,
  onOpenStatistics,
}) => {
  const visibleDate = new Date(visibleYear, visibleMonth - 1, 1);
  const now = new Date();
  const isCurrentMonth =
    visibleYear === now.getFullYear() && visibleMonth === now.getMonth() + 1;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'center' },
        justifyContent: { xs: 'center', sm: 'space-between' },
        mb: 2.5,
        gap: { xs: 1.5, sm: 1 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          letterSpacing: '-0.01em',
          fontSize: { xs: '1.75rem', sm: '2.5rem' },
          flexShrink: 0,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Calendar
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          gap: 1,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Options button */}
        <Tooltip title="Statistics">
          <IconButton
            onClick={onOpenStatistics}
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              color: 'text.secondary',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'grey.50', color: 'primary.main', borderColor: 'primary.main' },
            }}
          >
            <BarChartOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Options">
          <IconButton
            onClick={onOpenOptions}
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              color: 'text.secondary',
              width: 40,
              height: 40,
              '&:hover': { bgcolor: 'grey.50', color: 'primary.main', borderColor: 'primary.main' },
            }}
          >
            <TuneIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Unified control group */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            height: 40,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Month indicator — desktop only */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              px: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              {format(visibleDate, 'MMMM yyyy')}
            </Typography>
          </Box>

          {/* Today button */}
          <ButtonBase
            onClick={onScrollToToday}
            disabled={isCurrentMonth}
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'background 0.15s, color 0.15s',
              '&:hover': { bgcolor: 'grey.50', color: 'primary.main' },
              '&.Mui-disabled': { color: 'text.disabled', opacity: 0.4 },
            }}
          >
            Today
          </ButtonBase>

          {/* Add task button */}
          <ButtonBase
            onClick={onAddTask}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0, sm: 0.75 },
              px: { xs: 1.5, sm: 2.5 },
              bgcolor: 'primary.main',
              color: '#fff',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <AddIcon sx={{ fontSize: 17 }} />
            <Box
              component="span"
              sx={{
                display: { xs: 'none', sm: 'inline' },
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Add task
            </Box>
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
};
