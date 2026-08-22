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
     * POST /api/v1/chat/messages
     */
    sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const { roomId, content, replyToId, replyToText } = req.body;
        const message = await chatService.saveMessage(req.user!.userId, roomId, content, replyToId, replyToText);
        successResponse(res, message, 'Message sent successfully', 201);
    });

    /**
     * GET /api/v1/chat/rooms
     */
    getMyRooms = asyncHandler(async (req: Request, res: Response) => {
        const rooms = await chatService.getUserConversations(req.user!.userId);
        successResponse(res, rooms);
    });

    /**
     * PUT /api/v1/chat/messages/:messageId
     */
    editMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const { content } = req.body;
        const updated = await chatService.editMessage(req.user!.userId, Number(messageId), content);
        successResponse(res, updated);
    });

    /**
     * DELETE /api/v1/chat/messages/:messageId
     */
    deleteMessage = asyncHandler(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const deleted = await chatService.deleteMessage(req.user!.userId, Number(messageId));
        successResponse(res, deleted);
    });

    /**
     * POST /api/v1/chat/:roomId/read
     */
    markAsRead = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const result = await chatService.markMessagesAsRead(req.user!.userId, roomId);
        successResponse(res, result);
    });

    /**
     * DELETE /api/v1/chat/rooms/:roomId/messages
     */
    clearRoom = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const result = await chatService.clearRoomHistory(req.user!.userId, roomId);
        successResponse(res, result, 'Chat history cleared successfully');
    });
}

export const chatController = new ChatController();