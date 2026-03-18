import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Box, Typography, IconButton, Tabs, Tab,
  Select, MenuItem, Alert,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useOptionsStore } from '@entities/options/store';
import { CURRENCIES } from '@entities/options/currencies';
import { OptionsSection } from './OptionsSection';

interface OptionsModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 0 | 1;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ open, onClose, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const {
    taskOptions, expensesOptions,
    currency, saveError,
    setCurrency,
    addTaskGroup, updateTaskGroup, removeTaskGroup,
    addTaskOption, updateTaskOption, updateTaskOptionColor, removeTaskOption,
    addExpenseGroup, updateExpenseGroup, removeExpenseGroup,
    addExpenseOption, updateExpenseOption, updateExpenseOptionColor, removeExpenseOption,
  } = useOptionsStore();

  const handleCurrencyChange = (e: SelectChangeEvent) => setCurrency(e.target.value);

  const handleAddTaskGroup = (title: string) => {
    addTaskGroup({ id: crypto.randomUUID(), title, tasks: [] });
  };

  const handleAddTaskOption = (groupId: string, value: string) => {
    addTaskOption(groupId, { id: crypto.randomUUID(), value });
  };

  const handleAddExpenseGroup = (title: string) => {
    addExpenseGroup({ id: crypto.randomUUID(), title, expenses: [] });
  };

  const handleAddExpenseOption = (groupId: string, value: string) => {
    addExpenseOption(groupId, { id: crypto.randomUUID(), value });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Options</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 40 }}
          TabIndicatorProps={{ sx: { height: 2 } }}
        >
          <Tab label="Tasks" sx={{ minHeight: 40, py: 0, fontSize: '0.875rem', fontWeight: 500 }} />
          <Tab label="Expenses" sx={{ minHeight: 40, py: 0, fontSize: '0.875rem', fontWeight: 500 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2.5, pb: 3, px: 3, minHeight: 300, maxHeight: 480, overflowY: 'auto' }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>
            Failed to save options. Please try again.
          </Alert>
        )}
        {activeTab === 0 && (
          <OptionsSection
            title="Task Options"
            itemLabel="task"
            groups={taskOptions.groups.map((g) => ({
              id: g.id,
              title: g.title,
              items: g.tasks.map((t) => ({ id: t.id, value: t.value, color: t.color })),
            }))}
            onAddGroup={handleAddTaskGroup}
            onUpdateGroup={updateTaskGroup}
            onRemoveGroup={removeTaskGroup}
            onAddItem={handleAddTaskOption}
            onUpdateItem={updateTaskOption}
            onUpdateItemColor={updateTaskOptionColor}
            onRemoveItem={removeTaskOption}
          />
        )}

        {activeTab === 1 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Currency
              </Typography>
              <Select
                value={currency}
                onChange={handleCurrencyChange}
                size="small"
                sx={{
                  fontSize: '0.8125rem',
                  minWidth: 200,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                }}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c.code} value={c.code} sx={{ fontSize: '0.8125rem' }}>
                    {c.symbol}&ensp;{c.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <OptionsSection
              title="Expenses Options"
              itemLabel="expense"
              groups={expensesOptions.groups.map((g) => ({
                id: g.id,
                title: g.title,
                items: g.expenses.map((e) => ({ id: e.id, value: e.value, color: e.color })),
              }))}
              onAddGroup={handleAddExpenseGroup}
              onUpdateGroup={updateExpenseGroup}
              onRemoveGroup={removeExpenseGroup}
              onAddItem={handleAddExpenseOption}
              onUpdateItem={updateExpenseOption}
              onUpdateItemColor={updateExpenseOptionColor}
              onRemoveItem={removeExpenseOption}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
