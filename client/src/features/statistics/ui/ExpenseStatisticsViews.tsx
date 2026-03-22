import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ExpensePeriodStats } from '@shared/lib/statistics';
import { mergeExpenseCategoriesForCompare } from '@shared/lib/statistics';
import { formatCurrencyAmount } from '../lib/formatCurrency';

const CHART_H = 220;

interface ExpenseChartBlockProps {
  primary: ExpensePeriodStats;
  secondary?: ExpensePeriodStats | null;
  compare: boolean;
  primaryLabel: string;
  secondaryLabel: string;
  currencyCode: string;
}

export const ExpenseChartBlock: React.FC<ExpenseChartBlockProps> = ({
  primary,
  secondary,
  compare,
  primaryLabel,
  secondaryLabel,
  currencyCode,
}) => {
  const pieData = useMemo(
    () =>
      primary.byCategory.map((c) => ({
        key: c.key,
        label: c.label,
        amount: c.amount,
        color: c.color,
      })),
    [primary.byCategory]
  );

  const catCompare = useMemo(() => {
    if (!compare || !secondary) return [];
    return mergeExpenseCategoriesForCompare(primary.byCategory, secondary.byCategory).slice(0, 12);
  }, [primary, secondary, compare]);

  const fmt = (n: number) => formatCurrencyAmount(currencyCode, n);

  const noData =
    primary.totalSpent <= 0 && (secondary == null || secondary.totalSpent <= 0);
  if (noData) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        No expenses in this period.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {!compare ? (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
            Distribution by category
          </Typography>
          <ResponsiveContainer width="100%" height={CHART_H + 24}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                paddingAngle={1}
              >
                {pieData.map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : null}

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          Totals by category
        </Typography>
        <ResponsiveContainer width="100%" height={Math.min(360, 40 + Math.max(primary.byCategory.length, catCompare.length) * 28)}>
          {!compare || !secondary ? (
            <BarChart
              data={primary.byCategory.slice(0, 12)}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => fmt(v)} />
              <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {primary.byCategory.slice(0, 12).map((e) => (
                  <Cell key={e.key} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={catCompare} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => fmt(v)} />
              <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 10, fill: '#64748B' }} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="amountA" name={primaryLabel} fill="#2D9B6F" radius={[0, 4, 4, 0]} />
              <Bar dataKey="amountB" name={secondaryLabel} fill="#334155" radius={[0, 4, 4, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

interface ExpenseListBlockProps {
  primary: ExpensePeriodStats;
  secondary?: ExpensePeriodStats | null;
  compare: boolean;
  primaryLabel: string;
  secondaryLabel: string;
  currencyCode: string;
}

export const ExpenseListBlock: React.FC<ExpenseListBlockProps> = ({
  primary,
  secondary,
  compare,
  primaryLabel,
  secondaryLabel,
  currencyCode,
}) => {
  const fmt = (n: number) => formatCurrencyAmount(currencyCode, n);
  const catCmp = useMemo(() => {
    if (!compare || !secondary) return [];
    return mergeExpenseCategoriesForCompare(primary.byCategory, secondary.byCategory);
  }, [primary, secondary, compare]);

  const groupCmp = useMemo(() => {
    if (!compare || secondary == null) return [];
    const keys = new Set<string>([...primary.byGroup.map((g) => g.groupId), ...secondary.byGroup.map((g) => g.groupId)]);
    return [...keys].map((groupId) => {
      const ra = primary.byGroup.find((x) => x.groupId === groupId);
      const rb = secondary.byGroup.find((x) => x.groupId === groupId);
      return {
        groupId,
        title: ra?.title ?? rb?.title ?? groupId,
        amountA: ra?.amount ?? 0,
        amountB: rb?.amount ?? 0,
        pctA: ra?.pctOfTotal ?? 0,
        pctB: rb?.pctOfTotal ?? 0,
      };
    });
  }, [primary, secondary, compare]);

  const noData =
    primary.totalSpent <= 0 && (secondary == null || secondary.totalSpent <= 0);
  if (noData) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        No expenses in this period.
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
        <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {primaryLabel} — total
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {fmt(primary.totalSpent)}
          </Typography>
        </Box>
        {compare && secondary ? (
          <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {secondaryLabel} — total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {fmt(secondary.totalSpent)}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        By category
      </Typography>
      {!compare || !secondary
        ? primary.byCategory.map((c) => (
            <Box key={c.key} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: c.color }}>
                  {c.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {fmt(c.amount)} · {c.pctOfTotal}%
                </Typography>
              </Box>
              <ExpenseLinearBar value={c.pctOfTotal} color={c.color} />
            </Box>
          ))
        : catCmp.map((c) => (
            <Box key={c.key} sx={{ mb: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                {c.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {primaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fmt(c.amountA)}
                    </Typography>
                  </Box>
                  <ExpenseLinearBar
                    value={primary.totalSpent > 0 ? (c.amountA / primary.totalSpent) * 100 : 0}
                    color="#2D9B6F"
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {secondaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fmt(c.amountB)}
                    </Typography>
                  </Box>
                  <ExpenseLinearBar
                    value={secondary && secondary.totalSpent > 0 ? (c.amountB / secondary.totalSpent) * 100 : 0}
                    color="#334155"
                  />
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
                  {fmt(g.amount)} · {g.pctOfTotal}%
                </Typography>
              </Box>
              <ExpenseLinearBar value={g.pctOfTotal} color="#334155" />
            </Box>
          ))
        : groupCmp.map((g) => (
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
                      {fmt(g.amountA)} · {g.pctA}%
                    </Typography>
                  </Box>
                  <ExpenseLinearBar value={g.pctA} color="#2D9B6F" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {secondaryLabel}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fmt(g.amountB)} · {g.pctB}%
                    </Typography>
                  </Box>
                  <ExpenseLinearBar value={g.pctB} color="#334155" />
                </Box>
              </Box>
            </Box>
          ))}
    </Box>
  );
};

function ExpenseLinearBar({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'grey.100', overflow: 'hidden' }}>
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
