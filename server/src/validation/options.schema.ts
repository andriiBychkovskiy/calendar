import { z } from 'zod';

const optionSchema = z.object({
  id:    z.string().min(1).max(100),
  value: z.string().min(1).max(500).trim(),
});

const taskGroupSchema = z.object({
  id:    z.string().min(1).max(100),
  title: z.string().min(1).max(200).trim(),
  tasks: z.array(optionSchema).max(200),
});

const expanseGroupSchema = z.object({
  id:       z.string().min(1).max(100),
  title:    z.string().min(1).max(200).trim(),
  expanses: z.array(optionSchema).max(200),
});

export const updateOptionsSchema = z.object({
  taskGroups:    z.array(taskGroupSchema).max(50),
  expanseGroups: z.array(expanseGroupSchema).max(50),
  currency:      z.string().min(1).max(10),
});
