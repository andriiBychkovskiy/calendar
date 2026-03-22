import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type { TaskPeriodStats } from '@shared/lib/statistics';
import { mergeTaskOptionsForCompare, completionPercent } from '@shared/lib/statistics';
import type { TaskOptionRow } from '@shared/lib/statistics';

interface TaskChartBlockProps {
  primary: TaskPeriodStats;
  secondary?: TaskPeriodStats | null;
  compare: boolean;
  primaryLabel: string;
  secondaryLabel: string;
}

export const TaskChartBlock: React.FC<TaskChartBlockProps> = ({
  primary,
  secondary,
  compare,
  primaryLabel,
  secondaryLabel,
}) => {
  const optionCompare = useMemo(() => {
    if (!compare || !secondary) return [];
    return mergeTaskOptionsForCompare(primary.byOption, secondary.byOption).slice(0, 10);
  }, [primary, secondary, compare]);

  const emptyTasks =
    primary.overall.total === 0 && (!compare || !secondary || secondary.overall.total === 0);
  if (emptyTasks) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        No tasks in this period.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {compare && secondary && optionCompare.length > 0 ? (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Completion % by task
          </Typography>
          <ResponsiveContainer width="100%" height={Math.min(360, 40 + optionCompare.length * 28)}>
            <BarChart
              data={optionCompare}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pctA" name={primaryLabel} fill="#2D9B6F" radius={[0, 4, 4, 0]} />
              <Bar dataKey="pctB" name={secondaryLabel} fill="#94A3B8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : !compare ? (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Completion % by task
          </Typography>
          <ResponsiveContainer width="100%" height={Math.min(320, 40 + primary.byOption.slice(0, 10).length * 26)}>
            <BarChart
              data={primary.byOption.slice(0, 10)}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v: number, _n, p) => {
                  const row = p?.payload as TaskOptionRow;
                  return [`${v}% (${row?.done ?? 0}/${row?.total ?? 0})`, 'Completion'];
                }}
              />
              <Bar dataKey="pct" name="Completion" radius={[0, 4, 4, 0]}>
                {primary.byOption.slice(0, 10).map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : null}
    </Box>
  );
};

interface TaskListBlockProps {
  primary: TaskPeriodStats;
  secondary?: TaskPeriodStats | null;
  compare: boolean;
  primaryLabel: string;
  secondaryLabel: string;
}

export const TaskListBlock: React.FC<TaskListBlockProps> = ({
  primary,
  secondary,
  compare,
  primaryLabel,
  secondaryLabel,
}) => {
  const optCompare = useMemo(() => {
    if (!compare || !secondary) return [];
    return mergeTaskOptionsForCompare(primary.byOption, secondary.byOption);
  }, [primary, secondary, compare]);

  const emptyTasks =
    primary.overall.total === 0 && (!compare || !secondary || secondary.overall.total === 0);
  if (emptyTasks) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        No tasks in this period.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: compare && secondary ? '1fr 1fr' : '1fr',
          gap: 1.5,
        }}
      >
        <SummaryCard
          title={primaryLabel}
          pct={primary.overall.pct}
          done={primary.overall.done}
          total={primary.overall.total}
        />
        {compare && secondary ? (
          <SummaryCard
            title={secondaryLabel}
            pct={secondary.overall.pct}
            done={secondary.overall.done}
            total={secondary.overall.total}
          />
        ) : null}
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        By task
      </Typography>
      {!compare || !secondary
        ? primary.byOption.map((o) => (
            <Box key={o.key} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: o.color }}>
                  {o.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {o.pct}% · {o.done}/{o.total}
                </Typography>
              </Box>
              <LinearBar value={o.pct} color={o.color} />
            </Box>
          ))
        : optCompare.map((o) => (
            <Box key={o.key} sx={{ mb: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                {o.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {primaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {o.pctA}% · {o.doneA}/{o.totalA}
                    </Typography>
                  </Box>
                  <LinearBar value={o.pctA} color="#2D9B6F" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {secondaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {o.pctB}% · {o.doneB}/{o.totalB}
                    </Typography>
                  </Box>
                  <LinearBar value={o.pctB} color="#334155" />
                </Box>
              </Box>
            </Box>
          ))}

      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 1 }}>
        By group
      </Typography>
      {!compare || !secondary
        ? primary.byGroup.map((g) => (
            <Box key={g.groupId} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {g.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {g.pct}% · {g.done}/{g.total}
                </Typography>
              </Box>
              <LinearBar value={g.pct} color="#334155" />
            </Box>
          ))
        : mergeGroupsForCompare(primary.byGroup, secondary.byGroup).map((g) => (
            <Box key={g.groupId} sx={{ mb: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                {g.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {primaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {g.pctA}% · {g.doneA}/{g.totalA}
                    </Typography>
                  </Box>
                  <LinearBar value={g.pctA} color="#2D9B6F" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {secondaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {g.pctB}% · {g.doneB}/{g.totalB}
                    </Typography>
                  </Box>
                  <LinearBar value={g.pctB} color="#94A3B8" />
                </Box>
              </Box>
            </Box>
          ))}
    </Box>
  );
};

function mergeGroupsForCompare(
  a: TaskPeriodStats['byGroup'],
  b: TaskPeriodStats['byGroup']
): Array<{
  groupId: string;
  title: string;
  pctA: number;
  pctB: number;
  doneA: number;
  totalA: number;
  doneB: number;
  totalB: number;
}> {
  const keys = new Set<string>([...a.map((x) => x.groupId), ...b.map((x) => x.groupId)]);
  return [...keys].map((groupId) => {
    const ra = a.find((x) => x.groupId === groupId);
    const rb = b.find((x) => x.groupId === groupId);
    const doneA = ra?.done ?? 0;
    const totalA = ra?.total ?? 0;
    const doneB = rb?.done ?? 0;
    const totalB = rb?.total ?? 0;
    return {
      groupId,
      title: ra?.title ?? rb?.title ?? groupId,
      pctA: completionPercent(doneA, totalA),
      pctB: completionPercent(doneB, totalB),
      doneA,
      totalA,
      doneB,
      totalB,
    };
  });
}

function SummaryCard({
  title,
  pct,
  done,
  total,
}: {
  title: string;
  pct: number;
  done: number;
  total: number;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {pct}%
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {done} / {total} done
      </Typography>
      <LinearBar value={pct} color="#2D9B6F" />
    </Box>
  );
}

function LinearBar({ value, color }: { value: number; color: string }) {
  return (
    <Box
      sx={{
        height: 8,
        borderRadius: 999,
        bgcolor: 'grey.100',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, value))}%`,
          bgcolor: color,
          borderRadius: 999,
          transition: 'width 0.2s ease',
        }}
      />
    </Box>
  );
}
