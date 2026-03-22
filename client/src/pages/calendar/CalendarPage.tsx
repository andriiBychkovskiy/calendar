import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { CalendarHeader } from '@widgets/calendar/CalendarHeader';
import { MonthSection } from '@widgets/calendar/MonthSection';
import { AddTaskModal } from '@features/add-task/AddTaskModal';
import { OptionsModal } from '@features/options/OptionsModal';
import { StatisticsModal } from '@features/statistics/StatisticsModal';
import { useTaskStore } from '@entities/task/store';
import { useAuthStore } from '@entities/user/store';
import { useOptionsStore } from '@entities/options/store';
import { authApi } from '@shared/api/auth.api';
import { taskApi } from '@shared/api/task.api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { WEEKDAY_LABELS_SHORT } from '@shared/lib/calendarWeek';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loadedMonths,
    progressMap,
    hasEntriesMap,
    expensesMap,
    loading,
    loadingMore,
    error,
    tasks,
    fetchTasks,
    appendNextMonth,
    silentRefetch,
  } = useTaskStore();
  const { user, clearAuth } = useAuthStore();
  const loadOptions = useOptionsStore((s) => s.loadOptions);
  const taskOptions = useOptionsStore((s) => s.taskOptions);
  const expensesOptions = useOptionsStore((s) => s.expensesOptions);
  const currency = useOptionsStore((s) => s.currency);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'copy'>('create');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsInitialTab, setOptionsInitialTab] = useState<0 | 1>(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteDate, setDeleteDate] = useState<Date | null>(null);
  const [deleting, setDeleting] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [visibleMonth, setVisibleMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const statisticsReferenceDate = useMemo(
    () => new Date(visibleMonth.year, visibleMonth.month - 1, 15),
    [visibleMonth.year, visibleMonth.month]
  );

  useEffect(() => {
    void fetchTasks();
    void loadOptions();
  }, [fetchTasks, loadOptions]);

  useEffect(() => {
    if (loading) return;

    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!sentinel || !scrollContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          appendNextMonth();
        }
      },
      { root: scrollContainer, rootMargin: '300px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, appendNextMonth]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || loading) return;

    const updateVisibleMonth = () => {
      const containerTop = container.getBoundingClientRect().top;
      let current = loadedMonths[0];

      for (const { year, month } of loadedMonths) {
        const el = container.querySelector<HTMLElement>(
          `[data-month-key="${year}-${month}"]`
        );
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top;
        if (elTop <= containerTop + 10) {
          current = { year, month };
        } else {
          break;
        }
      }

      setVisibleMonth(current);
    };

    container.addEventListener('scroll', updateVisibleMonth, { passive: true });
    return () => container.removeEventListener('scroll', updateVisibleMonth);
  }, [loading, loadedMonths]);

  const handleScrollToToday = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const el = container.querySelector<HTMLElement>(`[data-month-key="${key}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddTask = (date?: Date) => {
    setSelectedDate(date || new Date());
    setModalMode('create');
    setModalOpen(true);
  };

  const handleDayView = (date: Date) => {
    setSelectedDate(date);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleCopyDay = (date: Date) => {
    setSelectedDate(date);
    setModalMode('copy');
    setModalOpen(true);
  };

  const handleDeleteDay = (date: Date) => {
    setDeleteDate(date);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDate) return;
    setDeleting(true);
    try {
      const dateKey = format(deleteDate, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.dueDate.split('T')[0] === dateKey);
      await Promise.all(dayTasks.map((t) => taskApi.deleteTask(t._id)));
      await silentRefetch();
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenOptions = (tab: 0 | 1 = 0) => {
    setOptionsInitialTab(tab);
    setOptionsOpen(true);
  };

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: '#F1F3F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 980,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, alignItems: 'center', gap: 1 }}>
          {user && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.name}
            </Typography>
          )}
          <Tooltip title="Logout">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* One scroll region so weekday columns share width with the grid (scrollbar no longer misaligns header vs cells). */}
          <Box
            ref={scrollContainerRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarGutter: 'stable',
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ px: 3, pt: 3, pb: 0 }}>
                <CalendarHeader
                  visibleYear={visibleMonth.year}
                  visibleMonth={visibleMonth.month}
                  onAddTask={() => handleAddTask()}
                  onScrollToToday={handleScrollToToday}
                  onOpenOptions={() => handleOpenOptions()}
                  onOpenStatistics={() => setStatisticsOpen(true)}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                }}
              >
                {WEEKDAY_LABELS_SHORT.map((day) => (
                  <Box key={day} sx={{ py: 1.25, textAlign: 'center', minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 500,
                        color: 'primary.main',
                        fontSize: { xs: '0.8125rem', sm: '1rem' },
                        letterSpacing: '0.02em',
                      }}
                    >
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={32} sx={{ color: 'primary.main' }} />
              </Box>
            ) : error ? (
              <Box sx={{ p: 4 }}>
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={fetchTasks}>
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
              </Box>
            ) : (
              <>
                {loadedMonths.map(({ year, month }) => (
                  <MonthSection
                    key={`${year}-${month}`}
                    year={year}
                    month={month}
                    progressMap={progressMap}
                    hasEntriesMap={hasEntriesMap}
                    expensesMap={expensesMap}
                    onAddTask={handleAddTask}
                    onDayView={handleDayView}
                    onDeleteDay={handleDeleteDay}
                    onCopyDay={handleCopyDay}
                  />
                ))}

                <Box
                  ref={sentinelRef}
                  sx={{
                    py: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 64,
                  }}
                >
                  {loadingMore && (
                    <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        mode={modalMode as 'create' | 'view' | 'copy'}
        onOpenOptions={(tab) => handleOpenOptions(tab === 'task' ? 0 : 1)}
      />

      <OptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        initialTab={optionsInitialTab}
      />

      <StatisticsModal
        open={statisticsOpen}
        onClose={() => setStatisticsOpen(false)}
        tasks={tasks}
        taskOptions={taskOptions}
        expensesOptions={expensesOptions}
        currencyCode={currency}
        referenceDate={statisticsReferenceDate}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Task list?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete the Task list? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ flex: 1, py: 1, borderColor: 'divider', color: 'text.primary' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ flex: 1, py: 1 }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
