import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateOptionsSchema } from '../validation/options.schema';
import { getOptions, updateOptions } from '../controllers/options.controller';

const router = Router();

router.use(authenticate);
router.get('/', getOptions);
router.put('/', validate(updateOptionsSchema), updateOptions);

export default router;
