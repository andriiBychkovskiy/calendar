import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton, Typography, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { CalendarHeader } from '@widgets/calendar/CalendarHeader';
import { CalendarGrid } from '@widgets/calendar/CalendarGrid';
import { AddTaskModal } from '@features/add-task/AddTaskModal';
import { useTaskStore } from '@entities/task/store';
import { useAuthStore } from '@entities/user/store';
import { authApi } from '@shared/api/auth.api';
import { taskApi } from '@shared/api/task.api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentYear, currentMonth, progressMap, loading, tasks, setMonth, fetchTasks, silentRefetch } = useTaskStore();
  const { user, clearAuth } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'copy'>('create');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteDate, setDeleteDate] = useState<Date | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePrev = () => {
    const d = new Date(currentYear, currentMonth - 2, 1);
    setMonth(d.getFullYear(), d.getMonth() + 1);
  };

  const handleNext = () => {
    const d = new Date(currentYear, currentMonth, 1);
    setMonth(d.getFullYear(), d.getMonth() + 1);
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

  const handleLogout = async () => {
    await authApi.logout();
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F1F3F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 980 }}>
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
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ p: 3, pb: 0 }}>
            <CalendarHeader
              year={currentYear}
              month={currentMonth}
              onPrev={handlePrev}
              onNext={handleNext}
              onAddTask={() => handleAddTask()}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ color: 'primary.main' }} />
            </Box>
          ) : (
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              progressMap={progressMap}
              onAddTask={handleAddTask}
              onDayView={handleDayView}
              onDeleteDay={handleDeleteDay}
              onCopyDay={handleCopyDay}
            />
          )}
        </Paper>
      </Box>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        mode={modalMode as 'create' | 'view' | 'copy'}
      />

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>Delete Task list?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete the Task list? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteConfirmOpen(false)} sx={{ flex: 1, py: 1, borderColor: 'divider', color: 'text.primary' }}>
            Close
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting} sx={{ flex: 1, py: 1 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
