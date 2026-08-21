import { z } from 'zod';
export const createBookingSchema = { body: z.object({ houseId: z.preprocess((val) => Number(val), z.number()), message: z.string().optional(), checkInDate: z.string().datetime().optional() }) };
export const updateBookingStatusSchema = { params: z.object({ id: z.preprocess((val) => Number(val), z.number()) }), body: z.object({ status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED']) }) };
export const getBookingSchema = { params: z.object({ id: z.preprocess((val) => Number(val), z.number()) }) };
export type CreateBookingInput = z.infer<typeof createBookingSchema.body>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema.body>;
