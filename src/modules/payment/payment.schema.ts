import { z } from 'zod';
export const createOrderSchema = { body: z.object({ amount: z.number().int().min(1), type: z.enum(['RENT', 'DEPOSIT', 'SERVICE']), bookingId: z.preprocess((val) => Number(val), z.number()).optional(), serviceBookingId: z.preprocess((val) => Number(val), z.number()).optional() }) };
export const verifyPaymentSchema = { body: z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string(), paymentId: z.preprocess((val) => Number(val), z.number()) }) };
export type CreateOrderInput = z.infer<typeof createOrderSchema.body>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema.body>;
