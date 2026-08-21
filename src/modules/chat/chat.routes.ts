import { Router } from 'express';
import { chatController } from './chat.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { getMessagesSchema } from './chat.schema';

const router = Router();

router.use(authenticate);

// Get my rooms
router.get('/rooms', chatController.getMyRooms);

// Get messages for a specific room
router.get(
    '/:roomId/messages',
    validateRequest(getMessagesSchema),
    chatController.getMessages
);

export default router;