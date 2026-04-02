import React from 'react';
import { Box, Typography, ButtonBase, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  visibleYear: number;
  visibleMonth: number;
  onAddTask: () => void;
  onScrollToToday: () => void;
  onOpenOptions: () => void;
  onOpenStatistics: () => void;
  userName?: string | null;
  onLogout?: () => void;
}

const titleSx = {
  fontWeight: 700,
  color: 'primary.main',
  letterSpacing: '-0.01em',
  fontSize: { xs: '1.75rem', sm: '2.5rem' },
  flexShrink: 0,
} as const;

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  visibleYear,
  visibleMonth,
  onAddTask,
  onScrollToToday,
  onOpenOptions,
  onOpenStatistics,
  userName,
  onLogout,
}) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const visibleDate = new Date(visibleYear, visibleMonth - 1, 1);
  const now = new Date();
  const isCurrentMonth =
    visibleYear === now.getFullYear() && visibleMonth === now.getMonth() + 1;

  const showUser = userName != null && userName !== '' && onLogout != null;

  const logoutButton = showUser ? (
    <Tooltip title={`${userName} — Logout`}>
      <IconButton
        size="small"
        onClick={onLogout}
        aria-label="Logout"
        sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
      >
        <LogoutIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  ) : null;

  const mainToolbar = (
    <>
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
        <Box
          sx={{
            display: isSmUp ? 'flex' : 'none',
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

        <ButtonBase
          onClick={onScrollToToday}
          disabled={isCurrentMonth}
          sx={{
            px: isSmUp ? 2.5 : 1.5,
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

        <ButtonBase
          onClick={onAddTask}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isSmUp ? 0.75 : 0,
            px: isSmUp ? 2.5 : 1.5,
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
              display: isSmUp ? 'inline' : 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Add task
          </Box>
        </ButtonBase>
      </Box>
    </>
  );

  if (!isSmUp) {
    return (
      <Box sx={{ mb: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
            }}
          >
            <Typography variant="h3" component="span" sx={{ ...titleSx, textAlign: 'center' }}>
              Calendar
            </Typography>
            {logoutButton}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexWrap: 'nowrap',
              minWidth: 0,
            }}
          >
            {mainToolbar}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          <Typography variant="h3" sx={{ ...titleSx, textAlign: 'left' }}>
            Calendar
          </Typography>
          {logoutButton}
          {showUser && (
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', maxWidth: 200 }}>
              {userName}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            flexShrink: 0,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          {mainToolbar}
        </Box>
      </Box>
    </Box>
  );
};
