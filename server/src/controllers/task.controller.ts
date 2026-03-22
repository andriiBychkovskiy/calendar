import { Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };

    if (year && month) {
      const y = parseInt(year as string, 10);
      const m = parseInt(month as string, 10) - 1;
      if (isNaN(y) || isNaN(m)) {
        res.status(400).json({ message: 'year and month must be valid numbers' });
        return;
      }
      filter.dueDate = {
        $gte: new Date(y, m, 1),
        $lte: new Date(y, m + 1, 0, 23, 59, 59, 999),
      };
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error('[getTasks]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dueDate, checklist } = req.body;
    const task = await Task.create({
      userId: req.userId,
      dueDate: new Date(dueDate),
      checklist,
    });
    res.status(201).json(task);
  } catch (err) {
    console.error('[createTask]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const { dueDate, checklist } = req.body;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (checklist !== undefined) task.checklist = checklist;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error('[updateTask]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('[deleteTask]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDailyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      res.status(400).json({ message: 'year and month are required' });
      return;
    }

    const y = parseInt(year as string, 10);
    const m = parseInt(month as string, 10) - 1;
    if (isNaN(y) || isNaN(m)) {
      res.status(400).json({ message: 'year and month must be valid numbers' });
      return;
    }
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const rows = await Task.aggregate<{ date: string; percentage: number }>([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          dueDate: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$checklist' },
      // Align with client isTaskChecklistItem / isExpenseChecklistItem
      {
        $match: {
          $expr: {
            $not: {
              $or: [
                { $eq: ['$checklist.type', 'expense'] },
                {
                  $and: [
                    { $ne: ['$checklist.type', 'task'] },
                    { $ne: [{ $ifNull: ['$checklist.amount', null] }, null] },
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dueDate' } },
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$checklist.completed', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0],
          },
        },
      },
    ]);

    const result: Record<string, number> = {};
    for (const { date, percentage } of rows) {
      result[date] = percentage;
    }

    res.json(result);
  } catch (err) {
    console.error('[getDailyProgress]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
