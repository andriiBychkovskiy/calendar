import { z } from 'zod';

const checklistItemSchema = z.object({
  text: z.string().min(1).max(500).trim(),
  completed: z.boolean().default(false),
  type: z.enum(['task', 'expanse']).default('task'),
  optionId: z.string().max(100).optional(),
  amount: z.number().min(0).max(1_000_000_000).optional(),
});

export const createTaskSchema = z.object({
  dueDate: z.string().min(1, 'dueDate is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'dueDate must be a valid date string' }
  ),
  checklist: z.array(checklistItemSchema).max(200).default([]),
});

export const updateTaskSchema = z
  .object({
    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'dueDate must be a valid date string' })
      .optional(),
    checklist: z.array(checklistItemSchema).max(200).optional(),
  })
  .refine((data) => data.dueDate !== undefined || data.checklist !== undefined, {
    message: 'At least one of dueDate or checklist must be provided',
  });
