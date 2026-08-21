// In a unified access system, specific capabilities dictate permissions

export interface UserCapabilities {
    isAdmin: boolean;
    isOwner: boolean;
    isProvider: boolean;
}

const COMMON_PERMISSIONS = [
    'profile:read',
    'profile:update',
    'houses:read',
    'houses:search',
    'flatmates:read',
    'flatmates:create',
    'agreements:read',
    'agreements:sign',
    'chat:read',
    'chat:send',
    'bookings:create',
    'bookings:read',
    'payments:create',
    'payments:read',
];

const OWNER_PERMISSIONS = [
    'houses:create',
    'houses:update',
    'houses:delete',
    'agreements:create',
    'payments:receive',
];

const PROVIDER_PERMISSIONS = [
    'services:create',
    'services:read',
    'services:update',
    'services:delete',
    'bookings:manage',
    'payments:receive',
];

const ADMIN_PERMISSIONS = [
    'admin:access',
    'users:read',
    'users:update',
    'users:delete',
    'users:verify',
    'houses:moderate',
    'agreements:moderate',
    'payments:moderate',
    'disputes:manage',
    'analytics:read',
];

export const hasPermission = (capabilities: UserCapabilities, permission: string): boolean => {
    if (capabilities.isAdmin && ADMIN_PERMISSIONS.includes(permission)) return true;
    if (capabilities.isOwner && OWNER_PERMISSIONS.includes(permission)) return true;
    if (capabilities.isProvider && PROVIDER_PERMISSIONS.includes(permission)) return true;
    if (COMMON_PERMISSIONS.includes(permission)) return true;
    return false;
};

export const hasAnyPermission = (capabilities: UserCapabilities, permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(capabilities, p));
};

export const hasAllPermissions = (capabilities: UserCapabilities, permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(capabilities, p));
};
