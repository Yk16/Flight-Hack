// TypeScript Enums replicating the old Prisma Enums

export enum AccountStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    BLOCKED = 'BLOCKED'
}

export enum OTPPurpose {
    LOGIN = 'LOGIN',
    REGISTRATION = 'REGISTRATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    AGREEMENT_SIGN = 'AGREEMENT_SIGN'
}

export enum HouseType {
    APARTMENT = 'APARTMENT',
    INDEPENDENT_HOUSE = 'INDEPENDENT_HOUSE',
    VILLA = 'VILLA'
}

export enum FurnishingStatus {
    FURNISHED = 'FURNISHED',
    SEMI_FURNISHED = 'SEMI_FURNISHED',
    UNFURNISHED = 'UNFURNISHED'
}

export enum HouseStatus {
    AVAILABLE = 'AVAILABLE',
    RENTED = 'RENTED',
    INACTIVE = 'INACTIVE',
    UNDER_MAINTENANCE = 'UNDER_MAINTENANCE'
}
