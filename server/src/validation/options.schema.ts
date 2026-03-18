import { z } from 'zod';

const optionSchema = z.object({
  id:    z.string().min(1).max(100),
  value: z.string().min(1).max(500).trim(),
  color: z.string().max(50).optional(),
});

const taskGroupSchema = z.object({
  id:    z.string().min(1).max(100),
  title: z.string().min(1).max(200).trim(),
  tasks: z.array(optionSchema).max(200),
});

const expenseGroupSchema = z.object({
  id:       z.string().min(1).max(100),
  title:    z.string().min(1).max(200).trim(),
  expenses: z.array(optionSchema).max(200),
});

export const updateOptionsSchema = z.object({
  taskGroups:            z.array(taskGroupSchema).max(50),
  expenseGroups:         z.array(expenseGroupSchema).max(50),
  currency:              z.string().min(1).max(10),
  tasksIsTextColored:    z.boolean().optional(),
  expensesIsTextColored: z.boolean().optional(),
});
