import { Router } from 'express';
import { getMe } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/users/me', authenticate, getMe);

export default router;
