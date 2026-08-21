import { z } from 'zod';
export const getMessagesSchema = {
    params: z.object({
        roomId: z.string().min(1),
    }),
    query: z.object({
        limit: z.string().optional().transform((v) => (v ? parseInt(v) : 50)),
        cursor: z.string().optional()
    })
};
export type GetMessagesQuery = z.infer<typeof getMessagesSchema.query>;
export type GetMessagesParams = z.infer<typeof getMessagesSchema.params>;
