import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../../shared/database/prisma';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { CreateOrderInput, VerifyPaymentInput } from './payment.schema';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_xxxxxx',
});

export class PaymentService {
    /**
     * Create Razorpay order
     */
    async createOrder(userId: number, input: CreateOrderInput) {
        const { amount, type, bookingId, serviceBookingId } = input;

        // Razorpay works in paise (smallest currency unit)
        const amountInPaise = amount * 100;

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const payment = await prisma.payment.create({
            data: {
                userId,
                type,
                amount,
                currency: 'INR',
                status: 'PENDING',
                providerId: razorpayOrder.id,
                bookingId,
                serviceBookingId,
            },
        });

        return {
            paymentId: payment.id,
            order: razorpayOrder,
        };
    }

    /**
     * Verify payment signature
     */
    async verifyPayment(userId: number, input: VerifyPaymentInput) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = input;

        const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_xxxxxx';
        
        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', key_secret)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'FAILED' },
            });
            throw new ValidationError('Invalid payment signature');
        }

        // Update payment as SUCCESS
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'SUCCESS',
                paymentId: razorpay_payment_id,
            },
        });

        return updatedPayment;
    }

    /**
     * Get user transactions
     */
    async getUserPayments(userId: number) {
        return await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const paymentService = new PaymentService();