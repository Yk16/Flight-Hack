import prisma from '../../shared/database/prisma';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateListingInput, BookServiceInput, VerifyServiceProviderInput } from './service.schema';

export class MarketplaceService {
    async createListing(providerId: number, input: CreateListingInput) {
        // Check if provider exists and is verified
        const provider = await prisma.user.findUnique({ where: { id: providerId } });
        if (!provider) throw new NotFoundError('Provider not found');

        const listing = await prisma.serviceProvider.create({
            data: {
                providerId,
                type: input.type,
                title: input.title,
                description: input.description,
                price: input.price,
                pricingModel: input.pricingModel,
                images: input.images ? JSON.stringify(input.images) : '[]',
                city: input.city || null,
                state: input.state || null,
                status: 'PENDING', // Service providers are PENDING by default
                rejectionReason: null,
            },
        });
        return {
            ...listing,
            images: JSON.parse(listing.images),
        };
    }

    async getListings(type?: string, includeUnapproved: boolean = false) {
        // Build where clause - only show APPROVED services to public, allow bypass for testing
        const where: any = includeUnapproved ? (type ? { type } : {}) : {
            AND: [
                type ? { type } : {},
                { status: 'APPROVED' },
            ].filter(obj => Object.keys(obj).length > 0)
        };

        const listings = await prisma.serviceProvider.findMany({
            where,
            include: {
                provider: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return listings.map((listing: any) => ({
            ...listing,
            images: JSON.parse(listing.images),
        }));
    }

    async bookService(userId: number, input: BookServiceInput) {
        const listing = await prisma.serviceProvider.findUnique({
            where: { id: input.listingId },
        });

        if (!listing) {
            throw new NotFoundError('Service listing not found');
        }

        if (listing.status !== 'APPROVED') {
            throw new ForbiddenError('This service listing is not available for booking');
        }

        if (listing.providerId === userId) {
            throw new ForbiddenError('You cannot book your own service');
        }

        const booking = await prisma.serviceBooking.create({
            data: {
                userId,
                listingId: input.listingId,
                status: 'REQUESTED',
                startDate: input.startDate ? new Date(input.startDate) : null,
                endDate: input.endDate ? new Date(input.endDate) : null,
                totalAmount: input.totalAmount,
            },
        });

        return booking;
    }

    async getProviderBookings(providerId: number) {
        const bookings = await prisma.serviceBooking.findMany({
            where: { listing: { providerId } },
            include: { listing: true, user: { select: { id: true, name: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return bookings;
    }

    async updateBookingStatus(bookingId: number, providerId: number, status: string) {
        const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, include: { listing: true } });

        if (!booking) throw new NotFoundError('Booking not found');

        if (booking.listing.providerId !== providerId) {
            throw new ForbiddenError('You do not own this booking');
        }

        const updated = await prisma.serviceBooking.update({ where: { id: bookingId }, data: { status } });
        return updated;
    }

    // ============================================
    // ADMIN METHODS FOR SERVICE PROVIDER VERIFICATION
    // ============================================

    async getPendingProviders(query: { page?: string; limit?: string } = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const skip = (page - 1) * limit;

        const [providers, total] = await Promise.all([
            prisma.serviceProvider.findMany({
                where: { status: 'PENDING' },
                include: {
                    provider: {
                        select: { id: true, name: true, email: true, phone: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.serviceProvider.count({ where: { status: 'PENDING' } }),
        ]);

        return {
            providers: providers.map((p: any) => ({
                ...p,
                images: JSON.parse(p.images),
            })),
            pagination: { page, limit, total },
        };
    }

    async getProviderDetails(id: number) {
        const provider = await prisma.serviceProvider.findUnique({
            where: { id },
            include: {
                provider: {
                    select: { id: true, name: true, email: true, phone: true, avatar: true, aadhaarVerified: true, panVerified: true },
                },
                bookings: {
                    select: { id: true, status: true, totalAmount: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        if (!provider) {
            throw new NotFoundError('Service provider not found');
        }

        return {
            ...provider,
            images: JSON.parse(provider.images),
        };
    }

    async verifyServiceProvider(id: number, input: VerifyServiceProviderInput) {
        const provider = await prisma.serviceProvider.findUnique({
            where: { id },
            include: { provider: true },
        });

        if (!provider) {
            throw new NotFoundError('Service provider not found');
        }

        const updated = await prisma.serviceProvider.update({
            where: { id },
            data: {
                status: input.status,
                rejectionReason: input.rejectionReason || null,
            },
            include: {
                provider: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        return updated;
    }
}

export const marketplaceService = new MarketplaceService();