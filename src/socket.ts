import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { JWTPayload } from './shared/middleware/auth.middleware';
import { chatService } from './modules/chat/chat.service';

export const setupSocket = (server: HttpServer) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
    });

    // Authentication Middleware for Sockets
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid or expired token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user.userId;
        console.log(`[Socket] User connected: ${userId} (Socket ID: ${socket.id})`);

        // Join room
        socket.on('join_room', (roomId: string) => {
            socket.join(roomId);
            console.log(`[Socket] User ${userId} joined room ${roomId}`);
        });

        // Leave room
        socket.on('leave_room', (roomId: string) => {
            socket.leave(roomId);
            console.log(`[Socket] User ${userId} left room ${roomId}`);
        });

        // Typing indicator
        socket.on('typing', (data: { roomId: string; isTyping: boolean; userName?: string }) => {
            socket.to(data.roomId).emit('user_typing', {
                userId,
                userName: data.userName || 'User',
                isTyping: data.isTyping,
            });
        });

        // Send and persist message (with reply support)
        socket.on('send_message', async (data: { roomId: string; content: string; replyToId?: number; replyToText?: string }) => {
            const { roomId, content, replyToId, replyToText } = data;

            try {
                const message = await chatService.saveMessage(userId, roomId, content, replyToId, replyToText);

                // Broadcast to everyone in the room (including sender for acknowledgment)
                io.to(roomId).emit('receive_message', message);
            } catch (error) {
                console.error(`[Socket] Error saving message from user ${userId}:`, error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Edit message
        socket.on('edit_message', async (data: { roomId: string; messageId: number; content: string }) => {
            try {
                const updated = await chatService.editMessage(userId, data.messageId, data.content);
                io.to(data.roomId).emit('message_edited', updated);
            } catch (error) {
                socket.emit('error', { message: 'Failed to edit message' });
            }
        });

        // Delete message
        socket.on('delete_message', async (data: { roomId: string; messageId: number }) => {
            try {
                const deleted = await chatService.deleteMessage(userId, data.messageId);
                io.to(data.roomId).emit('message_deleted', deleted);
            } catch (error) {
                socket.emit('error', { message: 'Failed to delete message' });
            }
        });

        // Read receipt / Seen
        socket.on('mark_read', async (data: { roomId: string }) => {
            try {
                await chatService.markMessagesAsRead(userId, data.roomId);
                socket.to(data.roomId).emit('messages_read', { roomId: data.roomId, readBy: userId });
            } catch (error) {
                // Ignore
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${userId} (Socket ID: ${socket.id})`);
        });
    });

    return io;
};