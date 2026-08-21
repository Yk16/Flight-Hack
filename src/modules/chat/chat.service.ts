import prisma from '../../shared/database/prisma';

export class ChatService {
    /**
     * Get historical messages for a room
     */
    async getRoomMessages(roomId: string, limit = 50, cursor?: number) {
        const messages = await prisma.message.findMany({
            where: { roomId },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        // We return ordered desc to get latest, but array should be inverted for chat UI
        return messages.reverse();
    }

    /**
     * Save a new message
     */
    async saveMessage(senderId: number, roomId: string, content: string) {
        const message = await prisma.message.create({
            data: {
                senderId,
                roomId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return message;
    }

    /**
     * Get user's active chat rooms (custom logic based on messages sent/received)
     */
    async getUserRooms(userId: number) {
        // Find distinct room IDs where user sent or is intended part of (requires roomId convention)
        // E.g. roomId = `chat_<userId1>_<userId2>` or we just query for distinct.
        // For simplicity, find rooms where user sent messages
        const rooms = await prisma.message.findMany({
            where: { senderId: userId },
            select: { roomId: true },
            distinct: ['roomId'],
        });
        return rooms.map(r => r.roomId);
    }
}

export const chatService = new ChatService();