// Application-wide constants

export const APP_NAME = 'Settlemate';

const API_PORT = 3000;
const API_PREFIX = '/api/v1';

const _rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? `http://192.168.61.122:${API_PORT}`;
export const API_URL = _rawApiUrl.endsWith(API_PREFIX) ? _rawApiUrl : `${_rawApiUrl}${API_PREFIX}`;
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? `http://192.168.61.122:${API_PORT}`;
