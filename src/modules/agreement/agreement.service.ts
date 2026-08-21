import prisma from '../../shared/database/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors';
import { CreateAgreementInput, UpdateAgreementStatusInput } from './agreement.schema';
import { AccountStatus } from '../../shared/types/enums';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class AgreementService {
    /**
     * Create an agreement (DRAFT state) and optionally generate PDF
     */
    async createAgreement(userId: number, input: CreateAgreementInput) {
        const { bookingId, rentAmount, depositAmount, startDate, endDate, terms } = input;

        // Verify booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { house: true, user: true },
        });

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Verify the owner's account status
        const owner = await prisma.user.findUnique({
            where: { id: booking.house.ownerId },
            select: { status: true },
        });

        if (!owner || owner.status !== AccountStatus.VERIFIED) {
            throw new ForbiddenError('House owner must be verified to create rental agreements.');
        }

        // Only the owner of the house can create the agreement
        if (booking.house.ownerId !== userId) {
            throw new ForbiddenError('Only the house owner can create the rental agreement');
        }

        if (booking.status !== 'ACCEPTED') {
            throw new ConflictError('Cannot create agreement unless booking is ACCEPTED');
        }

        const agreement = await prisma.agreement.create({
            data: {
                bookingId,
                tenantId: booking.userId,
                ownerId: booking.house.ownerId,
                houseId: booking.houseId,
                rentAmount,
                depositAmount,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                terms,
                status: 'DRAFT',
            },
        });

        // Generate PDF
        const pdfPath = this.generatePDF(agreement.id, booking, input);

        return await prisma.agreement.update({
            where: { id: agreement.id },
            data: { documentUrl: pdfPath },
        });
    }

    /**
     * Get agreement by ID
     */
    async getAgreement(userId: number, agreementId: number) {
        const agreement = await prisma.agreement.findUnique({
            where: { id: agreementId },
        });

        if (!agreement) {
            throw new NotFoundError('Agreement not found');
        }

        if (agreement.tenantId !== userId && agreement.ownerId !== userId) {
            throw new ForbiddenError('You do not have permission to view this agreement');
        }

        return agreement;
    }

    /**
     * Update Agreement Status (Draft -> Signed -> Active)
     */
    async updateStatus(userId: number, agreementId: number, status: string) {
        const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });

        if (!agreement) {
            throw new NotFoundError('Agreement not found');
        }

        if (agreement.ownerId !== userId && agreement.tenantId !== userId) {
            throw new ForbiddenError('You do not have permission to update this agreement');
        }

        // Add additional logic: maybe only tenant can sign, or both need to sign.
        // For simplicity, if either updates it to SIGNED/ACTIVE, it changes.

        return await prisma.agreement.update({
            where: { id: agreementId },
            data: { status },
        });
    }

    private generatePDF(agreementId: number, booking: any, input: CreateAgreementInput): string {
        const uploadDir = path.join(process.cwd(), 'uploads', 'agreements');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `agreement-${agreementId}.pdf`;
        const filePath = path.join(uploadDir, fileName);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text('Rental Agreement', { align: 'center' }).moveDown();
        doc.fontSize(12).text(`Property: ${booking.house.title}, ${booking.house.addressLine1}, ${booking.house.city}`);
        doc.text(`Tenant: ${booking.user.name || ''} ${booking.user.name || ''} (${booking.user.email})`);
        doc.text(`Monthly Rent: Rs. ${input.rentAmount}`);
        doc.text(`Security Deposit: Rs. ${input.depositAmount}`);
        doc.text(`Start Date: ${new Date(input.startDate).toDateString()}`);
        doc.text(`End Date: ${new Date(input.endDate).toDateString()}`);
        doc.moveDown();
        doc.text('Terms & Conditions:');
        doc.text(input.terms || 'Standard rental terms apply.');
        doc.moveDown(2);
        doc.text('Tenant Signature: ___________________          Owner Signature: ___________________');

        doc.end();

        // Return a relative URL path that could be served statically
        return `/uploads/agreements/${fileName}`;
    }
}

export const agreementService = new AgreementService();