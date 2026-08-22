// Application-wide constants

export const APP_NAME = 'Settlemate';

const API_PORT = 3000;
const API_PREFIX = '/api/v1';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://localhost:${API_PORT}${API_PREFIX}`;
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? `http://localhost:${API_PORT}`;
