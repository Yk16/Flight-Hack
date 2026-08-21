import prisma from '../../shared/database/prisma';
import {
    NotFoundError,
    ValidationError,
    ForbiddenError,
    ConflictError,
} from '../../shared/errors';
import {
    CreateBookingInput,
    UpdateBookingStatusInput,
} from './booking.schema';

export class BookingService {
    /**
     * User requests to book a house
     */
    async createBooking(userId: number, input: CreateBookingInput) {
        const { houseId, message, checkInDate } = input;

        // Verify house exists and is available
        const house = await prisma.house.findUnique({
            where: { id: houseId },
        });

        if (!house) {
            throw new NotFoundError('House not found');
        }

        if (house.status !== 'AVAILABLE') {
            throw new ConflictError('House is not currently available for booking');
        }

        if (house.ownerId === userId) {
            throw new ForbiddenError('You cannot book your own house');
        }

        // Check if user already has an active booking request for this house
        const existingBooking = await prisma.booking.findFirst({
            where: {
                houseId,
                userId,
                status: { in: ['REQUESTED', 'ACCEPTED'] },
            },
        });

        if (existingBooking) {
            throw new ConflictError('You already have an active request or accepted booking for this house');
        }

        const booking = await prisma.booking.create({
            data: {
                houseId,
                userId,
                message,
                checkInDate: checkInDate ? new Date(checkInDate) : null,
                status: 'REQUESTED',
            },
            include: {
                house: {
                    select: {
                        title: true,
                        addressLine1: true,
                        city: true,
                    },
                },
            },
        });

        return booking;
    }

    /**
     * Get a specific booking
     */
    async getBooking(userId: number, bookingId: number) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                house: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Only tenant or owner can view the booking
        if (booking.userId !== userId && booking.house.ownerId !== userId) {
            throw new ForbiddenError('You do not have permission to view this booking');
        }

        return booking;
    }

    /**
     * Update booking status (Owner accepts/rejects, User cancels)
     */
    async updateBookingStatus(userId: number, bookingId: number, input: UpdateBookingStatusInput) {
        const { status } = input;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { house: true },
        });

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        const isOwner = booking.house.ownerId === userId;
        const isTenant = booking.userId === userId;

        if (!isOwner && !isTenant) {
            throw new ForbiddenError('You do not have permission to update this booking');
        }

        // Validate state transitions
        if (status === 'ACCEPTED' || status === 'REJECTED') {
            if (!isOwner) {
                throw new ForbiddenError(`Only the property owner can mark a booking as ${status}`);
            }
            if (booking.status !== 'REQUESTED') {
                throw new ConflictError(`Cannot transition booking from ${booking.status} to ${status}`);
            }
        }

        if (status === 'CANCELLED') {
            if (!isTenant && !isOwner) {
                throw new ForbiddenError('You cannot cancel this booking');
            }
            if (booking.status === 'REJECTED' || booking.status === 'CANCELLED') {
                throw new ConflictError(`Booking is already ${booking.status}`);
            }
        }

        // Update the booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: {
                house: {
                    select: { id: true, title: true, status: true },
                },
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Optionally, if accepted, update house status to somewhat "RESERVED" or "RENTED"
        // It's up to business logic if ACCEPTED means the house is no longer AVAILABLE
        // We will leave house status as is until the Agreement is active, or we could change it here.

        return updatedBooking;
    }

    /**
     * Get bookings for a tenant
     */
    async getTenantBookings(userId: number) {
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                house: {
                    select: {
                        id: true,
                        title: true,
                        addressLine1: true,
                        city: true,
                        rent: true,
                        deposit: true,
                        images: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return { bookings };
    }

    /**
     * Get bookings for an owner's houses
     */
    async getOwnerBookings(ownerId: number) {
        const bookings = await prisma.booking.findMany({
            where: {
                house: { ownerId },
            },
            include: {
                house: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return { bookings };
    }
}

export const bookingService = new BookingService();