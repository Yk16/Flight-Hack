import { z } from 'zod';

// ============================================
// ENUMS (matching Prisma)
// ============================================

export const HouseTypeEnum = z.enum([
    'APARTMENT',
    'INDEPENDENT_HOUSE',
    'VILLA',
]);

export const FurnishingStatusEnum = z.enum([
    'FURNISHED',
    'SEMI_FURNISHED',
    'UNFURNISHED',
]);

export const HouseStatusEnum = z.enum([
    'AVAILABLE',
    'RENTED',
    'INACTIVE',
    'UNDER_MAINTENANCE',
]);

// ============================================
// CREATE HOUSE SCHEMA
// ============================================

export const createHouseSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().max(2000).optional(),
    type: HouseTypeEnum,

    // Address
    addressLine1: z.string().min(5).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // Pricing
    rent: z.number().int().positive('Rent must be positive'),
    deposit: z.number().int().nonnegative('Deposit cannot be negative'),
    maintenanceCharges: z.number().int().nonnegative().optional(),

    // Property Details
    bedrooms: z.number().int().min(0).max(20).default(1),
    bathrooms: z.number().int().min(0).max(10).default(1),
    area: z.number().int().positive().optional(),
    floor: z.number().int().min(-2).max(100).optional(),
    totalFloors: z.number().int().min(1).max(100).optional(),

    // Features
    furnishing: FurnishingStatusEnum.default('UNFURNISHED'),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string().url()).max(20).default([]),

    // Preferences
    preferredTenants: z.array(z.string()).default([]),
    petsAllowed: z.boolean().default(false),

    // Availability
    availableFrom: z.string().datetime().optional(),
});

// ============================================
// UPDATE HOUSE SCHEMA
// ============================================

export const updateHouseSchema = createHouseSchema.partial().extend({
    status: HouseStatusEnum.optional(),
});

// ============================================
// QUERY SCHEMAS
// ============================================

export const houseListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),

    // Filters
    city: z.string().optional(),
    state: z.string().optional(),
    type: HouseTypeEnum.optional(),
    furnishing: FurnishingStatusEnum.optional(),
    status: HouseStatusEnum.optional(),

    // Price range
    minRent: z.coerce.number().int().nonnegative().optional(),
    maxRent: z.coerce.number().int().positive().optional(),

    // Property filters
    minBedrooms: z.coerce.number().int().min(0).optional(),
    maxBedrooms: z.coerce.number().int().max(20).optional(),
    petsAllowed: z.coerce.boolean().optional(),

    // Sorting
    sortBy: z.enum(['rent', 'createdAt', 'area', 'bedrooms']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),

    // Search
    search: z.string().optional(),
});

export const houseIdParamSchema = z.object({
    id: z.coerce.number().int().positive('Invalid house ID'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateHouseInput = z.infer<typeof createHouseSchema>;
export type UpdateHouseInput = z.infer<typeof updateHouseSchema>;
export type HouseListQuery = z.infer<typeof houseListQuerySchema>;
