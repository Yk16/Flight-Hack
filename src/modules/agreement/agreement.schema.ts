import { z } from 'zod';
export const createAgreementSchema = { body: z.object({ bookingId: z.preprocess((val) => Number(val), z.number()), rentAmount: z.number().positive(), depositAmount: z.number().positive(), startDate: z.string().datetime(), endDate: z.string().datetime(), terms: z.string().optional() }) };
export const updateAgreementStatusSchema = { params: z.object({ id: z.preprocess((val) => Number(val), z.number()) }), body: z.object({ status: z.enum(['SIGNED', 'ACTIVE', 'EXPIRED']) }) };
export type CreateAgreementInput = z.infer<typeof createAgreementSchema.body>;
export type UpdateAgreementStatusInput = z.infer<typeof updateAgreementStatusSchema.body>;
