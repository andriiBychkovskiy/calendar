import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { format } from 'date-fns';
import { taskApi } from '@shared/api/task.api';
import { useTaskStore } from '@entities/task/store';
import { useOptionsStore } from '@entities/options/store';
import type { ChecklistItem } from '@shared/types';
import { InlineDatePicker } from './InlineDatePicker';
import { TasksAccordion } from './TasksAccordion';
import { ExpensesAccordion } from './ExpensesAccordion';
import { ItemSelectionDialog } from './ItemSelectionDialog';

const toDateUTC = (date: Date): string => `${format(date, 'yyyy-MM-dd')}T12:00:00.000Z`;

type ModalMode = 'create' | 'view' | 'copy';

export interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  mode?: ModalMode;
  onOpenOptions?: (tab: 'task' | 'expense') => void;
}

const SX = {
  pickerDropdown: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10,
    background: '#fff', border: '1px solid', borderColor: 'divider',
    borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
  },
  actions: { px: 3, pb: 3, pt: 2, gap: 1 },
  closeBtn: { flex: 1, py: 1, borderColor: 'divider', color: 'text.primary' },
  primaryBtn: { flex: 1, py: 1 },
} as const;

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, defaultDate, mode = 'create', onOpenOptions }) => {
  const addTask       = useTaskStore((s) => s.addTask);
  const patchTask     = useTaskStore((s) => s.patchTask);
  const silentRefetch = useTaskStore((s) => s.silentRefetch);
  const allTasks      = useTaskStore((s) => s.tasks);
  const { taskOptions, expensesOptions } = useOptionsStore();

  const [dueDate, setDueDate]         = useState<Date>(defaultDate ?? new Date());
  const [taskItems, setTaskItems]     = useState<ChecklistItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ChecklistItem[]>([]);
  const [primaryTaskId, setPrimaryTaskId] = useState<string | null>(null);
  const [extraTaskIds, setExtraTaskIds]   = useState<string[]>([]);
  const [isDirty, setIsDirty]             = useState(false);

  const [showDatePicker, setShowDatePicker]     = useState(false);
  const [applying, setApplying]                 = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting]                 = useState(false);
  // null = closed, 'task'/'expense' = open for that type
  const [selectionOpen, setSelectionOpen] = useState<'task' | 'expense' | null>(null);
  const [noOptionsDialogType, setNoOptionsDialogType] = useState<'task' | 'expense' | null>(null);

  const hasNoTaskOptions = taskOptions.groups.every((g) => g.tasks.length === 0);
  const hasNoExpenseOptions = expensesOptions.groups.every((g) => g.expenses.length === 0);

  useEffect(() => {
    if (!open) return;

    setShowDatePicker(false);
    setError('');

    const dateKey = defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '';
    const dayTasks = allTasks.filter((t) => t.dueDate.split('T')[0] === dateKey);
    const mergedChecklist = dayTasks.flatMap((t) => t.checklist);

    if (mode === 'copy') {
      setTaskItems(mergedChecklist.filter((i) => i.type !== 'expense').map((i) => ({ ...i, completed: false })));
      setExpenseItems([]);
      const next = new Date(defaultDate ?? new Date());
      next.setDate(next.getDate() + 1);
      setDueDate(next);
      setPrimaryTaskId(null);
      setExtraTaskIds([]);
    } else if (mode === 'view') {
      setTaskItems(mergedChecklist.filter((i) => i.type !== 'expense'));
      setExpenseItems(mergedChecklist.filter((i) => i.type === 'expense'));
      setPrimaryTaskId(dayTasks[0]?._id ?? null);
      setExtraTaskIds(dayTasks.slice(1).map((t) => t._id));
      setDueDate(defaultDate ?? new Date());
    } else {
      setTaskItems([]);
      setExpenseItems([]);
      setDueDate(defaultDate ?? new Date());
      setPrimaryTaskId(null);
      setExtraTaskIds([]);
    }
    setIsDirty(false);
  // allTasks snapshot on open only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate, mode]);

  // ─── Task helpers ──────────────────────────────────────────────────────────

  const toggleTask = (idx: number) => {
    setTaskItems((prev) => prev.map((item, i) => (i === idx ? { ...item, completed: !item.completed } : item)));
    setIsDirty(true);
  };

  const removeTask = (idx: number) => {
    setTaskItems((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const addTasksFromOptions = (selected: Array<{ id: string; value: string }>) => {
    setTaskItems((prev) => [
      ...prev,
      ...selected.map((opt) => ({ text: opt.value, completed: false, type: 'task' as const, optionId: opt.id })),
    ]);
    setIsDirty(true);
  };

  // ─── Expense helpers ───────────────────────────────────────────────────────

  const updateExpenseAmount = (idx: number, amount: number | undefined) => {
    setExpenseItems((prev) => prev.map((item, i) => (i === idx ? { ...item, amount } : item)));
    setIsDirty(true);
  };

  const removeExpense = (idx: number) => {
    setExpenseItems((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const addExpensesFromOptions = (selected: Array<{ id: string; value: string }>) => {
    setExpenseItems((prev) => [
      ...prev,
      ...selected.map((opt) => ({ text: opt.value, completed: false, type: 'expense' as const, optionId: opt.id })),
    ]);
    setIsDirty(true);
  };

  // ─── API handlers ──────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const fullChecklist = [...taskItems, ...expenseItems];
    if (fullChecklist.length === 0) {
      setError('Select at least one task or expense.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const created = await taskApi.createTask({ dueDate: toDateUTC(dueDate), checklist: fullChecklist });
      addTask(created);
      onClose();
    } catch {
      setError('Failed to create. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const fullChecklist = [...taskItems, ...expenseItems];
      if (primaryTaskId) {
        const updated = await taskApi.updateTask(primaryTaskId, { checklist: fullChecklist });
        patchTask(updated);
        if (extraTaskIds.length > 0) {
          await Promise.all(extraTaskIds.map((id) => taskApi.deleteTask(id)));
          await silentRefetch();
        }
      } else if (fullChecklist.length > 0) {
        const created = await taskApi.createTask({ dueDate: toDateUTC(defaultDate ?? new Date()), checklist: fullChecklist });
        addTask(created);
      }
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const handleCopyList = async () => {
    setApplying(true);
    try {
      if (taskItems.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const checklist = taskItems.map(({ _id, ...rest }) => ({ ...rest, completed: false }));
        const created = await taskApi.createTask({ dueDate: toDateUTC(dueDate), checklist });
        addTask(created);
      }
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const handleDeleteList = async () => {
    setDeleting(true);
    try {
      const allIds = [primaryTaskId, ...extraTaskIds].filter(Boolean) as string[];
      await Promise.all(allIds.map((id) => taskApi.deleteTask(id)));
      await silentRefetch();
      setConfirmDeleteOpen(false);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  // Tasks can only be added once per option; expenses can be added multiple times
  const selectedTaskOptionIds = new Set(taskItems.map((i) => i.optionId).filter(Boolean) as string[]);

  const taskGroups = taskOptions.groups.map((g) => ({
    id: g.id, title: g.title,
    items: g.tasks.map((t) => ({ id: t.id, value: t.value })),
  }));

  const expenseGroups = expensesOptions.groups.map((g) => ({
    id: g.id, title: g.title,
    items: g.expenses.map((e) => ({ id: e.id, value: e.value })),
  }));

  const modalTitle =
    mode === 'view' && defaultDate ? format(defaultDate, 'MMMM d, yyyy') :
    mode === 'copy'               ? 'Copy Task list' :
    'Add Task';

  // ─── Date picker field ─────────────────────────────────────────────────────

  const DateField = (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 500 }}>
        Due date
      </Typography>
      <Box
        onClick={() => setShowDatePicker((v) => !v)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid', borderColor: showDatePicker ? 'primary.main' : 'divider',
          borderRadius: 2, px: 1.5, py: 1, cursor: 'pointer', userSelect: 'none',
          '&:hover': { borderColor: '#CBD5E1' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{format(dueDate, 'MMMM d, yyyy')}</Typography>
        </Box>
        <Box sx={{ color: 'text.secondary' }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
      </Box>
      {showDatePicker && (
        <Box sx={SX.pickerDropdown}>
          <InlineDatePicker value={dueDate} onChange={(d) => { setDueDate(d); setShowDatePicker(false); }} />
        </Box>
      )}
    </Box>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          {modalTitle}
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, pb: 0, px: 3, overflow: 'visible', ...(showDatePicker && { pb: '240px', transition: 'padding-bottom 0.2s' }) }}>
          {(mode === 'create' || mode === 'copy') && DateField}

          <TasksAccordion
            mode={mode}
            items={taskItems}
            onToggle={mode === 'view' ? toggleTask : undefined}
            onRemove={removeTask}
            onAddClick={() => hasNoTaskOptions ? setNoOptionsDialogType('task') : setSelectionOpen('task')}
          />

          {mode !== 'copy' && (
            <ExpensesAccordion
              mode={mode}
              items={expenseItems}
              onUpdateAmount={updateExpenseAmount}
              onRemove={removeExpense}
              onAddClick={() => hasNoExpenseOptions ? setNoOptionsDialogType('expense') : setSelectionOpen('expense')}
            />
          )}

          {error && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        {mode === 'create' && (
          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={SX.primaryBtn}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Task'}
            </Button>
          </DialogActions>
        )}

        {mode === 'copy' && (
          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Cancel</Button>
            <Button variant="contained" onClick={handleCopyList} disabled={applying || taskItems.length === 0} sx={SX.primaryBtn}>
              {applying ? <CircularProgress size={18} color="inherit" /> : 'Copy list'}
            </Button>
          </DialogActions>
        )}

        {mode === 'view' && (
          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Close</Button>
            <Button
              variant="outlined"
              onClick={() => setConfirmDeleteOpen(true)}
              sx={{ flex: 1, py: 1, borderColor: 'error.light', color: 'error.main', '&:hover': { background: 'rgba(211,47,47,0.04)', borderColor: 'error.main' } }}
            >
              Delete
            </Button>
            <Button variant="contained" onClick={handleApply} disabled={!isDirty || applying} sx={SX.primaryBtn}>
              {applying ? <CircularProgress size={18} color="inherit" /> : 'Apply'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>Delete Task list?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this day's list? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmDeleteOpen(false)} sx={SX.closeBtn}>Close</Button>
          <Button variant="contained" color="error" onClick={handleDeleteList} disabled={deleting} sx={SX.primaryBtn}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <ItemSelectionDialog
        open={selectionOpen !== null}
        onClose={() => setSelectionOpen(null)}
        title={selectionOpen === 'task' ? 'Select tasks' : 'Select expenses'}
        groups={selectionOpen === 'task' ? taskGroups : expenseGroups}
        alreadySelectedIds={selectionOpen === 'task' ? selectedTaskOptionIds : new Set()}
        onConfirm={selectionOpen === 'task' ? addTasksFromOptions : addExpensesFromOptions}
      />

      <Dialog
        open={noOptionsDialogType !== null}
        onClose={() => setNoOptionsDialogType(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>No options available</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You need to create options before adding a task or expense.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={() => setNoOptionsDialogType(null)} sx={SX.closeBtn}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const tab = noOptionsDialogType ?? 'task';
              setNoOptionsDialogType(null);
              onClose();
              onOpenOptions?.(tab);
            }}
            sx={SX.primaryBtn}
          >
            Go to Options
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
