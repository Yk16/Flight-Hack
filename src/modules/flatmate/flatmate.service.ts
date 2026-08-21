import prisma from '../../shared/database/prisma';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { UpdateFlatmateProfileInput, SearchFlatmatesQuery } from './flatmate.schema';

export class FlatmateService {
    /**
     * Get or create a user's flatmate profile
     */
    async getProfile(userId: number) {
        let profile = await prisma.flatmateProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        name: true,
                        gender: true,
                        avatar: true,
                        dateOfBirth: true,
                    },
                },
            },
        });

        if (!profile) {
            // Auto-create empty profile
            profile = await prisma.flatmateProfile.create({
                data: {
                    userId,
                    budget: 0,
                    lifestyle: '[]',
                    lookingFor: '[]',
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            gender: true,
                            avatar: true,
                            dateOfBirth: true,
                        },
                    },
                },
            });
        }

        return {
            ...profile,
            lifestyle: JSON.parse(profile.lifestyle),
            lookingFor: JSON.parse(profile.lookingFor),
        };
    }

    /**
     * Update user's flatmate preferences
     */
    async updateProfile(userId: number, input: UpdateFlatmateProfileInput) {
        let profile = await prisma.flatmateProfile.findUnique({ where: { userId } });

        const dataToUpdate: any = {};
        if (input.budget !== undefined) dataToUpdate.budget = input.budget;
        if (input.lifestyle !== undefined) dataToUpdate.lifestyle = JSON.stringify(input.lifestyle);
        if (input.lookingFor !== undefined) dataToUpdate.lookingFor = JSON.stringify(input.lookingFor);
        if (input.occupation !== undefined) dataToUpdate.occupation = input.occupation;
        if (input.bio !== undefined) dataToUpdate.bio = input.bio;
        if (input.moveInDate !== undefined) dataToUpdate.moveInDate = new Date(input.moveInDate);
        if (input.city !== undefined) dataToUpdate.city = input.city;
        if (input.state !== undefined) dataToUpdate.state = input.state;
        if (input.preferredLocation !== undefined) dataToUpdate.preferredLocation = input.preferredLocation;

        if (!profile) {
            profile = await prisma.flatmateProfile.create({
                data: {
                    userId,
                    budget: input.budget || 0,
                    lifestyle: input.lifestyle ? JSON.stringify(input.lifestyle) : '[]',
                    lookingFor: input.lookingFor ? JSON.stringify(input.lookingFor) : '[]',
                    occupation: input.occupation,
                    bio: input.bio,
                    moveInDate: input.moveInDate ? new Date(input.moveInDate) : undefined,
                    city: input.city,
                    state: input.state,
                    preferredLocation: input.preferredLocation,
                },
            });
        } else {
            profile = await prisma.flatmateProfile.update({
                where: { userId },
                data: dataToUpdate,
            });
        }

        return {
            ...profile,
            lifestyle: JSON.parse(profile.lifestyle),
            lookingFor: JSON.parse(profile.lookingFor),
        };
    }

    /**
     * Update user's flatmate preferences and return compatible matches
     */
    async updateProfileAndFindMatches(userId: number, input: UpdateFlatmateProfileInput) {
        const updatedProfile = await this.updateProfile(userId, input);
        const matches = await this.findMatches(userId, 5); // Return top 5 matches

        return {
            profile: updatedProfile,
            matches,
        };
    }

    /**
     * Browse potential roommates
     */
    async searchFlatmates(userId: number, query: SearchFlatmatesQuery) {
        const { minBudget, maxBudget, lifestyle, city, state, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            // Exclude current user from results
            userId: { not: userId },
        };

        if (minBudget || maxBudget) {
            where.budget = {};
            if (minBudget) where.budget.gte = minBudget;
            if (maxBudget) where.budget.lte = maxBudget;
        }

        // lifestyle filter is stored as a JSON string, so we match on serialized values
        if (lifestyle) {
            const traits = lifestyle.split(',').map(t => t.trim());
            if (traits.length > 0) {
                // Match any trait inside the serialized JSON string
                where.OR = traits.map(trait => ({
                    lifestyle: { contains: `"${trait}"` }
                }));
            }
        }

        if (city) {
            where.city = { equals: city, mode: 'insensitive' };
        }

        if (state) {
            where.state = { equals: state, mode: 'insensitive' };
        }

        const [total, profiles] = await Promise.all([
            prisma.flatmateProfile.count({ where }),
            prisma.flatmateProfile.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            gender: true,
                            occupation: true,
                        },
                    },
                },
            }),
        ]);

        return {
            profiles: profiles.map((p: any) => ({
                ...p,
                lifestyle: JSON.parse(p.lifestyle),
                lookingFor: JSON.parse(p.lookingFor),
            })),
            pagination: { page, limit, total },
        };
    }

    /**
     * Find compatible flatmates for a user based on their profile
     */
    async findMatches(userId: number, limit: number = 10) {
        const userProfile = await prisma.flatmateProfile.findUnique({
            where: { userId },
        });

        if (!userProfile) {
            return [];
        }

        const userLifestyle = JSON.parse(userProfile.lifestyle);
        const userLookingFor = JSON.parse(userProfile.lookingFor);

        const where: any = {
            userId: { not: userId },
        };

        // Location match
        if (userProfile.city) {
            where.city = userProfile.city;
        }
        if (userProfile.state) {
            where.state = userProfile.state;
        }

        // Budget match (within 20% range)
        const budgetRange = 0.2;
        const minBudget = Math.floor(userProfile.budget * (1 - budgetRange));
        const maxBudget = Math.ceil(userProfile.budget * (1 + budgetRange));
        where.budget = {
            gte: minBudget,
            lte: maxBudget,
        };

        // Occupation match (same occupation)
        if (userProfile.occupation) {
            where.occupation = userProfile.occupation;
        }

        // Lifestyle compatibility
        if (userLookingFor.length > 0) {
            // Find profiles that have traits the user is looking for
            where.OR = userLookingFor.map((trait: string) => ({
                lifestyle: { contains: `"${trait}"` }
            }));
        }

        const matches = await prisma.flatmateProfile.findMany({
            where,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        gender: true,
                        occupation: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc', // Most recently updated first
            },
        });

        return matches.map((p: any) => ({
            ...p,
            lifestyle: JSON.parse(p.lifestyle),
            lookingFor: JSON.parse(p.lookingFor),
        }));
    }
}

export const flatmateService = new FlatmateService();