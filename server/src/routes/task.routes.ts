import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validation/task.schema';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDailyProgress,
} from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

// /progress must be registered before /:id to avoid route shadowing
router.get('/progress', getDailyProgress);
router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
