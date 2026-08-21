import { z } from 'zod';

export const createListingSchema = { 
  body: z.object({ 
    type: z.enum(['MAID', 'COOK', 'LAUNDRY', 'FURNITURE', 'APPLIANCE']), 
    title: z.string().min(3), 
    description: z.string().optional(), 
    price: z.number().int().min(0), 
    pricingModel: z.enum(['PER_MONTH', 'PER_JOB', 'ONE_TIME']).default('PER_MONTH'), 
    images: z.array(z.string()).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }) 
};

export const bookServiceSchema = { 
  body: z.object({ 
    listingId: z.preprocess((val) => Number(val), z.number()), 
    startDate: z.string().datetime().optional(), 
    endDate: z.string().datetime().optional(), 
    totalAmount: z.number().int().min(0) 
  }) 
};

export const verifyServiceProviderSchema = {
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional()
  })
};

export type CreateListingInput = z.infer<typeof createListingSchema.body>;
export type BookServiceInput = z.infer<typeof bookServiceSchema.body>;
export type VerifyServiceProviderInput = z.infer<typeof verifyServiceProviderSchema.body>;
