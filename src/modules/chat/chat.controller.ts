import { Request, Response } from 'express';
import { chatService } from './chat.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class ChatController {
    /**
     * GET /api/v1/chat/:roomId/messages
     */
    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const { limit, cursor } = req.query as any;

        const messages = await chatService.getRoomMessages(roomId, limit, cursor);
        successResponse(res, messages);
    });

    /**
     * GET /api/v1/chat/rooms
     */
    getMyRooms = asyncHandler(async (req: Request, res: Response) => {
        const rooms = await chatService.getUserRooms(req.user!.userId);
        successResponse(res, rooms);
    });
}

export const chatController = new ChatController();