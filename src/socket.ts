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

        // Send and persist message
        socket.on('send_message', async (data: { roomId: string; content: string }) => {
            const { roomId, content } = data;

            try {
                const message = await chatService.saveMessage(userId, roomId, content);

                // Broadcast to everyone in the room
                io.to(roomId).emit('receive_message', message);
            } catch (error) {
                console.error(`[Socket] Error saving message from user ${userId}:`, error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${userId} (Socket ID: ${socket.id})`);
        });
    });

    return io;
};