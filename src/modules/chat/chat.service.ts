import prisma from '../../shared/database/prisma';

export class ChatService {
    /**
     * Get historical messages for a room
     */
    async getRoomMessages(roomId: string, limit = 100, cursor?: number) {
        const messages = await (prisma.message as any).findMany({
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

        return messages.reverse();
    }

    /**
     * Save a new message with optional reply reference
     */
    async saveMessage(senderId: number, roomId: string, content: string, replyToId?: number, replyToText?: string) {
        const message = await (prisma.message as any).create({
            data: {
                senderId,
                roomId,
                content,
                replyToId: replyToId ? Number(replyToId) : null,
                replyToText: replyToText || null,
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
     * Edit an existing message
     */
    async editMessage(userId: number, messageId: number, newContent: string) {
        const existing = await prisma.message.findUnique({ where: { id: messageId } });
        if (!existing || existing.senderId !== userId) {
            throw new Error('Unauthorized or message not found');
        }

        const updated = await (prisma.message as any).update({
            where: { id: messageId },
            data: {
                content: newContent,
                isEdited: true,
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
        return updated;
    }

    /**
     * Delete an existing message (soft delete)
     */
    async deleteMessage(userId: number, messageId: number) {
        const existing = await prisma.message.findUnique({ where: { id: messageId } });
        if (!existing || existing.senderId !== userId) {
            throw new Error('Unauthorized or message not found');
        }

        const deleted = await (prisma.message as any).update({
            where: { id: messageId },
            data: {
                content: 'This message was deleted',
                isDeleted: true,
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
        return deleted;
    }

    /**
     * Mark all messages in room as read
     */
    async markMessagesAsRead(userId: number, roomId: string) {
        await prisma.message.updateMany({
            where: {
                roomId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        return { success: true, roomId };
    }

    /**
     * Get user's active chat conversations with last message & participant info
     */
    async getUserConversations(userId: number) {
        // Find distinct rooms where user participated or is part of
        const messages = await (prisma.message as any).findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { roomId: { contains: `-${userId}-` } },
                    { roomId: { endsWith: `-${userId}` } },
                    { roomId: { startsWith: `chat-${userId}-` } },
                ],
            },
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

        // Group by roomId and pick latest message
        const roomsMap = new Map<string, any>();
        for (const msg of messages) {
            if (!roomsMap.has(msg.roomId)) {
                // Determine other participant ID from roomId convention "chat-id1-id2"
                let otherUserId: number | null = null;
                const parts = msg.roomId.split('-');
                if (parts.length >= 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]))) {
                    const id1 = Number(parts[1]);
                    const id2 = Number(parts[2]);
                    otherUserId = id1 === userId ? id2 : id1;
                }

                roomsMap.set(msg.roomId, {
                    roomId: msg.roomId,
                    lastMessage: msg,
                    otherUserId,
                    unreadCount: 0,
                });
            }
        }

        const results = [];
        for (const [roomId, item] of roomsMap.entries()) {
            let otherUser = null;
            if (item.otherUserId) {
                otherUser = await prisma.user.findUnique({
                    where: { id: item.otherUserId },
                    select: { id: true, name: true, avatar: true, email: true },
                });
            }

            const unreadCount = await prisma.message.count({
                where: {
                    roomId,
                    senderId: { not: userId },
                    isRead: false,
                },
            });

            results.push({
                roomId,
                participantName: otherUser?.name || otherUser?.email?.split('@')[0] || (item.lastMessage?.senderId !== userId ? item.lastMessage?.sender?.name : 'Support'),
                participantAvatar: otherUser?.avatar || null,
                participantId: otherUser?.id || null,
                lastMessage: item.lastMessage,
                unreadCount,
                updatedAt: item.lastMessage?.createdAt,
            });
        }

        return results;
    }
}

export const chatService = new ChatService();