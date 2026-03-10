import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, Typography, Button, IconButton,
  Checkbox, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { format } from 'date-fns';
import { taskApi } from '@shared/api/task.api';
import { useTaskStore } from '@entities/task/store';
import type { ChecklistItem, Task } from '@shared/types';
import { InlineDatePicker } from './InlineDatePicker';

// ─── Utilities ────────────────────────────────────────────────────────────────

const toDateUTC = (date: Date): string => `${format(date, 'yyyy-MM-dd')}T12:00:00.000Z`;

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'create' | 'view' | 'copy';
type DraftItem = Omit<ChecklistItem, '_id'>;

export interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  mode?: ModalMode;
}

// ─── Shared sx constants (defined outside to avoid per-render recreation) ─────

const SX = {
  deleteBtn:   { color: 'primary.main', '&:hover': { opacity: 0.7 } },
  deleteBtnIcon: { fontSize: 16 },
  addItemBtn:  { color: 'primary.main', fontWeight: 500, px: 0.5, mb: 1, '&:hover': { background: 'transparent', opacity: 0.8 } },
  actions:     { px: 3, pb: 3, pt: 2, gap: 1 },
  closeBtn:    { flex: 1, py: 1, borderColor: 'divider', color: 'text.primary' },
  primaryBtn:  { flex: 1, py: 1 },
  textInput:   { fontSize: '0.875rem', '& input::placeholder': { color: '#94A3B8' } },
  pickerDropdown: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10,
    background: '#fff', border: '1px solid', borderColor: 'divider',
    borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
  },
} as const;

// ─── DatePickerField sub-component ────────────────────────────────────────────

interface DatePickerFieldProps {
  value: Date;
  open: boolean;
  onToggle: () => void;
  onChange: (date: Date) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ value, open, onToggle, onChange }) => (
  <Box sx={{ position: 'relative', mb: 2.5 }}>
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid', borderColor: open ? 'primary.main' : 'divider',
        borderRadius: 2, px: 1.5, py: 1,
        cursor: 'pointer', background: '#fff', userSelect: 'none',
        '&:hover': { borderColor: '#CBD5E1' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {format(value, 'MMMM d, yyyy')}
        </Typography>
      </Box>
      <Box sx={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Box>
    </Box>
    {open && (
      <Box sx={SX.pickerDropdown}>
        <InlineDatePicker value={value} onChange={onChange} />
      </Box>
    )}
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, defaultDate, mode = 'create' }) => {
  const addTask       = useTaskStore((s) => s.addTask);
  const patchTask     = useTaskStore((s) => s.patchTask);
  const silentRefetch = useTaskStore((s) => s.silentRefetch);
  const allTasks      = useTaskStore((s) => s.tasks);

  const [internalMode, setInternalMode] = useState<ModalMode>(mode);
  const [dueDate, setDueDate]           = useState<Date>(defaultDate ?? new Date());
  const [checklist, setChecklist]       = useState<DraftItem[]>([{ text: '', completed: false }]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError]       = useState('');

  const [localTasks, setLocalTasks]       = useState<Task[]>([]);
  const [dirtyTaskIds, setDirtyTaskIds]   = useState<Set<string>>(new Set());
  const [newItems, setNewItems]           = useState<DraftItem[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    if (!open) return;

    const dateKey = defaultDate ? format(defaultDate, 'yyyy-MM-dd') : null;

    setInternalMode(mode);
    setDueDate(() => {
      if (mode === 'copy') {
        const next = new Date(defaultDate ?? new Date());
        next.setDate(next.getDate() + 1);
        return next;
      }
      return defaultDate ?? new Date();
    });
    setChecklist([{ text: '', completed: false }]);
    setShowDatePicker(false);
    setError('');
    setLocalTasks(allTasks.filter((t) => t.dueDate.split('T')[0] === dateKey));
    setDirtyTaskIds(new Set());
    setNewItems([]);
  // allTasks intentionally excluded — snapshot once on open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate, mode]);

  // ─── Local-task helpers ───────────────────────────────────────────────────

  const updateLocalTask = (taskId: string, updater: (cl: ChecklistItem[]) => ChecklistItem[]) =>
    setLocalTasks((prev) =>
      prev.map((t) => (t._id !== taskId ? t : { ...t, checklist: updater(t.checklist) }))
    );

  const markDirty = (taskId: string) =>
    setDirtyTaskIds((prev) => new Set(prev).add(taskId));

  const handleToggleItem = (taskId: string, idx: number) => {
    updateLocalTask(taskId, (cl) => cl.map((item, i) => (i === idx ? { ...item, completed: !item.completed } : item)));
    markDirty(taskId);
  };

  const handleRemoveExistingItem = (taskId: string, idx: number) => {
    updateLocalTask(taskId, (cl) => cl.filter((_, i) => i !== idx));
    markDirty(taskId);
  };

  const handleEditExistingItem = (taskId: string, idx: number, text: string) =>
    updateLocalTask(taskId, (cl) => cl.map((item, i) => (i === idx ? { ...item, text } : item)));

  // ─── New-item helpers ─────────────────────────────────────────────────────

  const updateNewItem = (index: number, patch: Partial<DraftItem>) =>
    setNewItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const removeNewItem = (index: number) =>
    setNewItems((prev) => prev.filter((_, i) => i !== index));

  const addNewItem = () =>
    setNewItems((prev) => [...prev, { text: '', completed: false }]);

  // ─── API handlers ─────────────────────────────────────────────────────────

  const handleApply = async () => {
    setApplying(true);
    try {
      const dirty       = localTasks.filter((t) => dirtyTaskIds.has(t._id));
      const filledItems = newItems.filter((item) => item.text.trim() !== '');

      await Promise.all([
        ...dirty.map(async (task) => {
          const updated = await taskApi.updateTask(task._id, { checklist: task.checklist });
          patchTask(updated);
        }),
        ...filledItems.map(async (item) => {
          const created = await taskApi.createTask({
            dueDate: toDateUTC(defaultDate ?? new Date()),
            checklist: [{ text: item.text.trim(), completed: item.completed }],
          });
          addTask(created);
        }),
      ]);
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const handleSubmit = async () => {
    const filled = checklist.filter((item) => item.text.trim() !== '');
    if (filled.length === 0) {
      setError('Add at least one checklist item');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const task = await taskApi.createTask({ dueDate: toDateUTC(dueDate), checklist: filled });
      addTask(task);
      onClose();
    } catch {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyList = async () => {
    setApplying(true);
    try {
      const allItems = [
        ...localTasks.flatMap((t) => t.checklist),
        ...newItems,
      ].filter((item) => item.text.trim() !== '');

      if (allItems.length > 0) {
        const created = await taskApi.createTask({
          dueDate: toDateUTC(dueDate),
          checklist: allItems.map((i) => ({ text: i.text.trim(), completed: false })),
        });
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
      await Promise.all(localTasks.map((t) => taskApi.deleteTask(t._id)));
      await silentRefetch();
      setConfirmDeleteOpen(false);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const handleDateChange = (date: Date) => { setDueDate(date); setShowDatePicker(false); };
  const toggleDatePicker = () => setShowDatePicker((v) => !v);

  const modalTitle =
    internalMode === 'view' && defaultDate ? format(defaultDate, 'MMMM d, yyyy') :
    internalMode === 'copy'                ? 'Copy Task list' :
    'Add Task';

  const applyIsDisabled =
    (dirtyTaskIds.size === 0 && newItems.every((it) => !it.text.trim())) || applying;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'visible' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        {modalTitle}
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Copy mode ──────────────────────────────────────────────────────── */}
      {internalMode === 'copy' ? (
        <>
          <DialogContent sx={{ pt: 1, pb: showDatePicker ? '240px' : 0, px: 3, overflow: 'visible', transition: 'padding-bottom 0.2s' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 500 }}>
              Due date
            </Typography>

            <DatePickerField value={dueDate} open={showDatePicker} onToggle={toggleDatePicker} onChange={handleDateChange} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
              {localTasks.map((task) =>
                task.checklist.map((item, idx) => (
                  <Box key={`${task._id}-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox checked={false} size="small" sx={{ flexShrink: 0 }} disabled />
                    <TextField
                      placeholder="Task"
                      value={item.text}
                      onChange={(e) => handleEditExistingItem(task._id, idx, e.target.value)}
                      fullWidth variant="standard"
                      InputProps={{ disableUnderline: true, sx: SX.textInput }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveExistingItem(task._id, idx)} sx={SX.deleteBtn}>
                      <DeleteOutlineIcon sx={SX.deleteBtnIcon} />
                    </IconButton>
                  </Box>
                ))
              )}
              {newItems.map((item, index) => (
                <Box key={`new-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox checked={false} size="small" sx={{ flexShrink: 0 }} disabled />
                  <TextField
                    placeholder="Task"
                    value={item.text}
                    onChange={(e) => updateNewItem(index, { text: e.target.value })}
                    fullWidth variant="standard"
                    InputProps={{ disableUnderline: true, sx: SX.textInput }}
                  />
                  <IconButton size="small" onClick={() => removeNewItem(index)} sx={SX.deleteBtn}>
                    <DeleteOutlineIcon sx={SX.deleteBtnIcon} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={addNewItem} size="small" sx={SX.addItemBtn}>
              Add item
            </Button>
          </DialogContent>

          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Cancel</Button>
            <Button variant="contained" onClick={handleCopyList} disabled={applying} sx={SX.primaryBtn}>
              {applying ? <CircularProgress size={18} color="inherit" /> : 'Copy list'}
            </Button>
          </DialogActions>
        </>

      /* ── View mode ───────────────────────────────────────────────────────── */
      ) : internalMode === 'view' ? (
        <>
          <DialogContent sx={{ pt: 1, pb: 0, px: 3 }}>
            {localTasks.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 2 }}>
                {localTasks.map((task) => (
                  <Box key={task._id}>
                    {task.checklist.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Checkbox checked={item.completed} onChange={() => handleToggleItem(task._id, idx)} size="small" sx={{ flexShrink: 0 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1, fontSize: '0.875rem',
                            color: item.completed ? 'text.disabled' : 'text.primary',
                            textDecoration: item.completed ? 'line-through' : 'none',
                          }}
                        >
                          {item.text}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveExistingItem(task._id, idx)} sx={SX.deleteBtn}>
                          <DeleteOutlineIcon sx={SX.deleteBtnIcon} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
              {newItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => updateNewItem(index, { completed: !item.completed })}
                    size="small" sx={{ flexShrink: 0 }}
                  />
                  <TextField
                    placeholder="Task"
                    value={item.text}
                    onChange={(e) => updateNewItem(index, { text: e.target.value })}
                    fullWidth variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        ...SX.textInput,
                        color: item.completed ? 'text.disabled' : 'text.primary',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      },
                    }}
                  />
                  <IconButton size="small" onClick={() => removeNewItem(index)} sx={SX.deleteBtn}>
                    <DeleteOutlineIcon sx={SX.deleteBtnIcon} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={addNewItem} size="small" sx={SX.addItemBtn}>
              Add item
            </Button>
          </DialogContent>

          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Close</Button>
            <Button
              variant="outlined"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={localTasks.length === 0}
              sx={{ flex: 1, py: 1, borderColor: 'error.light', color: 'error.main', '&:hover': { background: 'rgba(211,47,47,0.04)', borderColor: 'error.main' } }}
            >
              Delete list
            </Button>
            <Button variant="contained" onClick={handleApply} disabled={applyIsDisabled} sx={SX.primaryBtn}>
              {applying ? <CircularProgress size={18} color="inherit" /> : 'Apply'}
            </Button>
          </DialogActions>

          <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>Delete Task list?</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Are you sure you want to delete the Task list? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
              <Button variant="outlined" onClick={() => setConfirmDeleteOpen(false)} sx={SX.closeBtn}>Close</Button>
              <Button variant="contained" color="error" onClick={handleDeleteList} disabled={deleting} sx={SX.primaryBtn}>
                {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </>

      /* ── Create mode ─────────────────────────────────────────────────────── */
      ) : (
        <>
          <DialogContent sx={{ pt: 1, pb: showDatePicker ? '240px' : 0, px: 3, overflow: 'visible', transition: 'padding-bottom 0.2s' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block', fontWeight: 500 }}>
              Due date
            </Typography>

            <DatePickerField value={dueDate} open={showDatePicker} onToggle={toggleDatePicker} onChange={handleDateChange} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CheckBoxOutlinedIcon sx={{ fontSize: 18, color: 'text.primary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Checklist</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
              {checklist.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => setChecklist((prev) => prev.map((it, i) => (i === index ? { ...it, completed: !it.completed } : it)))}
                    size="small" sx={{ flexShrink: 0 }}
                  />
                  <TextField
                    placeholder="Task"
                    value={item.text}
                    onChange={(e) => setChecklist((prev) => prev.map((it, i) => (i === index ? { ...it, text: e.target.value } : it)))}
                    fullWidth variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        ...SX.textInput,
                        color: item.completed ? 'text.disabled' : 'text.primary',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      },
                    }}
                  />
                  <IconButton size="small" onClick={() => setChecklist((prev) => prev.filter((_, i) => i !== index))} sx={SX.deleteBtn}>
                    <DeleteOutlineIcon sx={SX.deleteBtnIcon} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setChecklist((prev) => [...prev, { text: '', completed: false }])}
              size="small" sx={SX.addItemBtn}
            >
              Add item
            </Button>

            {error && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={SX.actions}>
            <Button variant="outlined" onClick={onClose} sx={SX.closeBtn}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={SX.primaryBtn}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Task'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
