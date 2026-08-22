import { Prisma } from '@prisma/client';
import { HouseStatus, HouseType, FurnishingStatus } from '../../shared/types/enums';
import prisma from '../../shared/database/prisma';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateHouseInput, UpdateHouseInput, HouseListQuery } from './housing.schema';

// Arrays are stored as JSON strings in the database
const toJson = (arr: string[]) => JSON.stringify(arr);

export class HousingService {
    /**
     * Create a new house listing
     */
    async createHouse(ownerId: number, input: CreateHouseInput) {
        const house = await prisma.house.create({
            data: {
                ownerId,
                title: input.title,
                description: input.description,
                type: input.type as HouseType,
                addressLine1: input.addressLine1,
                addressLine2: input.addressLine2,
                city: input.city,
                state: input.state,
                pincode: input.pincode,
                latitude: input.latitude,
                longitude: input.longitude,
                rent: input.rent,
                deposit: input.deposit,
                maintenanceCharges: input.maintenanceCharges,
                bedrooms: input.bedrooms,
                bathrooms: input.bathrooms,
                area: input.area,
                floor: input.floor,
                totalFloors: input.totalFloors,
                furnishing: input.furnishing as FurnishingStatus,
                amenities: toJson(input.amenities ?? []) as any,
                images: toJson(input.images ?? []) as any,
                preferredTenants: toJson(input.preferredTenants ?? []) as any,
                petsAllowed: input.petsAllowed,
                availableFrom: input.availableFrom ? new Date(input.availableFrom) : new Date(),
            },
            include: {
                owner: {
                    select: { id: true, name: true, avatar: true, trustScore: true },
                },
            },
        });

        return house;
    }

    /**
     * Get house by ID
     */
    async getHouseById(houseId: number, incrementView: boolean = false) {
        const house = await prisma.house.findUnique({
            where: { id: houseId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        trustScore: true,
                        phone: true,
                        aadhaarVerified: true,
                    },
                },
            },
        });

        if (!house) {
            throw new NotFoundError('House not found');
        }

        // Increment view count
        if (incrementView) {
            await prisma.house.update({
                where: { id: houseId },
                data: { viewCount: { increment: 1 } },
            });
        }

        return house;
    }

    /**
     * Update house listing
     */
    async updateHouse(houseId: number, ownerId: number, input: UpdateHouseInput) {
        const house = await prisma.house.findUnique({ where: { id: houseId } });

        if (!house) {
            throw new NotFoundError('House not found');
        }

        if (house.ownerId !== ownerId) {
            throw new ForbiddenError('You can only update your own listings');
        }

        const updateData: Prisma.HouseUpdateInput = {};

        // Map input fields to update data
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.type !== undefined) updateData.type = input.type as HouseType;
        if (input.addressLine1 !== undefined) updateData.addressLine1 = input.addressLine1;
        if (input.addressLine2 !== undefined) updateData.addressLine2 = input.addressLine2;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.state !== undefined) updateData.state = input.state;
        if (input.pincode !== undefined) updateData.pincode = input.pincode;
        if (input.latitude !== undefined) updateData.latitude = input.latitude;
        if (input.longitude !== undefined) updateData.longitude = input.longitude;
        if (input.rent !== undefined) updateData.rent = input.rent;
        if (input.deposit !== undefined) updateData.deposit = input.deposit;
        if (input.maintenanceCharges !== undefined) updateData.maintenanceCharges = input.maintenanceCharges;
        if (input.bedrooms !== undefined) updateData.bedrooms = input.bedrooms;
        if (input.bathrooms !== undefined) updateData.bathrooms = input.bathrooms;
        if (input.area !== undefined) updateData.area = input.area;
        if (input.floor !== undefined) updateData.floor = input.floor;
        if (input.totalFloors !== undefined) updateData.totalFloors = input.totalFloors;
        if (input.furnishing !== undefined) updateData.furnishing = input.furnishing as FurnishingStatus;
        if (input.amenities !== undefined) updateData.amenities = toJson(input.amenities) as any;
        if (input.images !== undefined) updateData.images = toJson(input.images) as any;
        if (input.preferredTenants !== undefined) updateData.preferredTenants = toJson(input.preferredTenants) as any;
        if (input.petsAllowed !== undefined) updateData.petsAllowed = input.petsAllowed;
        if (input.status !== undefined) updateData.status = input.status as HouseStatus;
        if (input.availableFrom !== undefined) updateData.availableFrom = new Date(input.availableFrom);

        const updatedHouse = await prisma.house.update({
            where: { id: houseId },
            data: updateData,
            include: {
                owner: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });

        return updatedHouse;
    }

    /**
     * Delete house listing
     */
    async deleteHouse(houseId: number, ownerId: number) {
        const house = await prisma.house.findUnique({ where: { id: houseId } });

        if (!house) {
            throw new NotFoundError('House not found');
        }

        if (house.ownerId !== ownerId) {
            throw new ForbiddenError('You can only delete your own listings');
        }

        await prisma.house.delete({ where: { id: houseId } });

        return { message: 'House listing deleted successfully' };
    }

    /**
     * List houses with filters and pagination
     */
    async listHouses(query: HouseListQuery) {
        const {
            page,
            limit,
            city,
            state,
            type,
            furnishing,
            status,
            minRent,
            maxRent,
            minBedrooms,
            maxBedrooms,
            petsAllowed,
            sortBy,
            sortOrder,
            search,
        } = query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.HouseWhereInput = {};
        if (status) where.status = status as HouseStatus;

        if (city) where.city = { contains: city };
        if (state) where.state = { contains: state };
        if (type) where.type = type as HouseType;
        if (furnishing) where.furnishing = furnishing as FurnishingStatus;
        if (petsAllowed !== undefined) where.petsAllowed = petsAllowed;

        // Price range
        if (minRent !== undefined || maxRent !== undefined) {
            where.rent = {};
            if (minRent !== undefined) where.rent.gte = minRent;
            if (maxRent !== undefined) where.rent.lte = maxRent;
        }

        // Bedroom range
        if (minBedrooms !== undefined || maxBedrooms !== undefined) {
            where.bedrooms = {};
            if (minBedrooms !== undefined) where.bedrooms.gte = minBedrooms;
            if (maxBedrooms !== undefined) where.bedrooms.lte = maxBedrooms;
        }

        // Search in title and description
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { city: { contains: search } },
            ];
        }

        // Build orderBy
        const orderBy: Prisma.HouseOrderByWithRelationInput = {
            [sortBy]: sortOrder,
        };

        const [houses, total] = await Promise.all([
            prisma.house.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    owner: {
                        select: { id: true, name: true, avatar: true, trustScore: true },
                    },
                },
            }),
            prisma.house.count({ where }),
        ]);

        return {
            houses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get houses owned by a specific owner
     */
    async getOwnerHouses(ownerId: number, query: HouseListQuery) {
        const { page, limit, status, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.HouseWhereInput = { ownerId };
        if (status) where.status = status as HouseStatus;

        const [houses, total] = await Promise.all([
            prisma.house.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            trustScore: true,
                            phone: true,
                            aadhaarVerified: true,
                        },
                    },
                },
            }),
            prisma.house.count({ where }),
        ]);

        return {
            houses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Increment inquiry count (when user contacts owner)
     */
    async incrementInquiry(houseId: number) {
        await prisma.house.update({
            where: { id: houseId },
            data: { inquiryCount: { increment: 1 } },
        });
    }
}

export const housingService = new HousingService();
