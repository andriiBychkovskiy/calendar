import { Response } from 'express';
import { Options } from '../models/Options.model';
import { AuthRequest } from '../middleware/auth.middleware';

const defaultOptions = {
  taskGroups: [],
  expenseGroups: [],
  currency: 'USD',
  tasksIsTextColored: false,
  expensesIsTextColored: false,
};

export const getOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const options = await Options.findOne({ userId: req.userId });
    res.json(options ?? defaultOptions);
  } catch {
    res.status(500).json({ message: 'Failed to load options' });
  }
};

export const updateOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskGroups, expenseGroups, currency, tasksIsTextColored, expensesIsTextColored } = req.body;
    const update: Record<string, unknown> = { taskGroups, expenseGroups, currency };
    if (typeof tasksIsTextColored === 'boolean') update.tasksIsTextColored = tasksIsTextColored;
    if (typeof expensesIsTextColored === 'boolean') update.expensesIsTextColored = expensesIsTextColored;
    await Options.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true }
    );
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to save options' });
  }
};
