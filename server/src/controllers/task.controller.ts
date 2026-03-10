import { Response } from 'express';
import { Task } from '../models/Task.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    const userId = req.userId;

    let filter: Record<string, unknown> = { userId };

    if (year && month) {
      const y = parseInt(year as string, 10);
      const m = parseInt(month as string, 10) - 1;
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dueDate, checklist } = req.body;
    if (!dueDate) {
      res.status(400).json({ message: 'dueDate is required' });
      return;
    }

    const task = await Task.create({
      userId: req.userId,
      dueDate: new Date(dueDate),
      checklist: checklist || [],
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
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
    res.status(500).json({ message: 'Server error', error: err });
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
    res.status(500).json({ message: 'Server error', error: err });
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
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const tasks = await Task.find({
      userId: req.userId,
      dueDate: { $gte: start, $lte: end },
    });

    const progressMap: Record<string, { total: number; completed: number }> = {};

    for (const task of tasks) {
      const dateKey = task.dueDate.toISOString().split('T')[0];
      if (!progressMap[dateKey]) {
        progressMap[dateKey] = { total: 0, completed: 0 };
      }
      if (task.checklist.length === 0) {
        progressMap[dateKey].total += 1;
      } else {
        progressMap[dateKey].total += task.checklist.length;
        progressMap[dateKey].completed += task.checklist.filter((c) => c.completed).length;
      }
    }

    const result: Record<string, number> = {};
    for (const [date, { total, completed }] of Object.entries(progressMap)) {
      result[date] = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
