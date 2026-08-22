import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../constants/config';

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await AsyncStorage.getItem('accessToken');

  socket = io(SOCKET_URL, {
    auth: {
      token: token || '',
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to realtime chat server:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
