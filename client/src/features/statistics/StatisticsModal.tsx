import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Task, TaskOptions, ExpensesOptions } from '@shared/types';
import {
  getPeriodRange,
  getCompareAnchor,
  formatRangeLabel,
  aggregateTaskPeriod,
  aggregateExpensePeriod,
  type StatisticsPeriod,
  type StatisticsViewMode,
  type ComparePreset,
} from '@shared/lib/statistics';
import { TaskChartBlock, TaskListBlock } from './ui/TaskStatisticsViews';
import { ExpenseChartBlock, ExpenseListBlock } from './ui/ExpenseStatisticsViews';

export interface StatisticsModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  taskOptions: TaskOptions;
  expensesOptions: ExpensesOptions;
  currencyCode: string;
  /** Anchor for the primary week/month/year (e.g. visible calendar month). Defaults to today when opening. */
  referenceDate?: Date;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  open,
  onClose,
  tasks,
  taskOptions,
  expensesOptions,
  currencyCode,
  referenceDate,
}) => {
  const [mainTab, setMainTab] = useState(0);
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const [viewMode, setViewMode] = useState<StatisticsViewMode>('chart');
  const [compare, setCompare] = useState(false);
  const [comparePreset, setComparePreset] = useState<ComparePreset>('previous');
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  useEffect(() => {
    if (open) {
      setAnchorDate(referenceDate ? new Date(referenceDate) : new Date());
    }
  }, [open, referenceDate]);

  const primaryRange = useMemo(() => getPeriodRange(period, anchorDate), [period, anchorDate]);
  const secondaryAnchor = useMemo(
    () => getCompareAnchor(anchorDate, period, comparePreset),
    [anchorDate, period, comparePreset]
  );
  const secondaryRange = useMemo(
    () => getPeriodRange(period, secondaryAnchor),
    [period, secondaryAnchor]
  );

  const primaryLabel = useMemo(() => formatRangeLabel(primaryRange), [primaryRange]);
  const secondaryLabel = useMemo(() => formatRangeLabel(secondaryRange), [secondaryRange]);

  const taskPrimary = useMemo(
    () => aggregateTaskPeriod(tasks, taskOptions, period, primaryRange),
    [tasks, taskOptions, period, primaryRange]
  );
  const taskSecondary = useMemo(
    () => (compare ? aggregateTaskPeriod(tasks, taskOptions, period, secondaryRange) : null),
    [tasks, taskOptions, period, secondaryRange, compare]
  );

  const expPrimary = useMemo(
    () => aggregateExpensePeriod(tasks, expensesOptions, period, primaryRange),
    [tasks, expensesOptions, period, primaryRange]
  );
  const expSecondary = useMemo(
    () => (compare ? aggregateExpensePeriod(tasks, expensesOptions, period, secondaryRange) : null),
    [tasks, expensesOptions, period, secondaryRange, compare]
  );

  const handleViewChange = (e: SelectChangeEvent<StatisticsViewMode>) => {
    setViewMode(e.target.value as StatisticsViewMode);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '92vh' } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pr: 1 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Statistics
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3 }}>
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          sx={{ minHeight: 40 }}
          TabIndicatorProps={{ sx: { height: 2 } }}
        >
          <Tab label="Tasks" sx={{ minHeight: 40, py: 0, fontSize: '0.875rem', fontWeight: 500 }} />
          <Tab label="Expenses" sx={{ minHeight: 40, py: 0, fontSize: '0.875rem', fontWeight: 500 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2, pb: 3, px: 3, overflowY: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <ToggleButtonGroup
            size="small"
            value={period}
            exclusive
            onChange={(_, v: StatisticsPeriod | null) => {
              if (v !== null) setPeriod(v);
            }}
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                textTransform: 'none',
                borderColor: 'divider',
              },
            }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="stats-view-label">Display</InputLabel>
            <Select<StatisticsViewMode>
              labelId="stats-view-label"
              value={viewMode}
              label="Display"
              onChange={handleViewChange}
              sx={{ fontSize: '0.8125rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
            >
              <MenuItem value="chart">Chart</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={compare}
                onChange={(_, c) => setCompare(c)}
                size="small"
                color="primary"
              />
            }
            label={<Typography variant="body2">Compare</Typography>}
            sx={{ ml: 0 }}
          />

          {compare ? (
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="stats-compare-preset">Second period</InputLabel>
              <Select<ComparePreset>
                labelId="stats-compare-preset"
                value={comparePreset}
                label="Second period"
                onChange={(e) => setComparePreset(e.target.value as ComparePreset)}
                sx={{ fontSize: '0.8125rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
              >
                <MenuItem value="previous">
                  Previous {period === 'week' ? 'week' : period === 'month' ? 'month' : 'year'}
                </MenuItem>
                <MenuItem value="previousYear">Same period, last year</MenuItem>
              </Select>
            </FormControl>
          ) : null}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          {primaryLabel}
          {compare ? ` · vs ${secondaryLabel}` : ''}
        </Typography>

        {mainTab === 0 ? (
          viewMode === 'chart' ? (
            <TaskChartBlock
              primary={taskPrimary}
              secondary={taskSecondary}
              compare={compare}
              primaryLabel={primaryLabel}
              secondaryLabel={secondaryLabel}
            />
          ) : (
            <TaskListBlock
              primary={taskPrimary}
              secondary={taskSecondary}
              compare={compare}
              primaryLabel={primaryLabel}
              secondaryLabel={secondaryLabel}
            />
          )
        ) : viewMode === 'chart' ? (
          <ExpenseChartBlock
            primary={expPrimary}
            secondary={expSecondary}
            compare={compare}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
            currencyCode={currencyCode}
          />
        ) : (
          <ExpenseListBlock
            primary={expPrimary}
            secondary={expSecondary}
            compare={compare}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
            currencyCode={currencyCode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
