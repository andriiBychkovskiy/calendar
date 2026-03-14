import { Response } from 'express';
import { Options } from '../models/Options.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const options = await Options.findOne({ userId: req.userId });
    res.json(options ?? { taskGroups: [], expanseGroups: [], currency: 'USD' });
  } catch {
    res.status(500).json({ message: 'Failed to load options' });
  }
};

export const updateOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskGroups, expanseGroups, currency } = req.body;
    await Options.findOneAndUpdate(
      { userId: req.userId },
      { taskGroups, expanseGroups, currency },
      { upsert: true }
    );
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to save options' });
  }
};
