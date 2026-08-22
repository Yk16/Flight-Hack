import { Router } from 'express';
import { chatController } from './chat.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { getMessagesSchema } from './chat.schema';

const router = Router();

router.use(authenticate);

// Get user's active conversations
router.get('/rooms', chatController.getMyRooms);

// Get messages for a specific room
router.get(
    '/:roomId/messages',
    validateRequest(getMessagesSchema),
    chatController.getMessages
);

// Edit a message
router.put('/messages/:messageId', chatController.editMessage);

// Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Mark room as read
router.post('/:roomId/read', chatController.markAsRead);

export default router;