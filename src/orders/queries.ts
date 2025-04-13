import { z } from 'zod';

export const Order = z
  .object({
    id: z.string(),
    orderLines: z.array(
      z.object({
        id: z.string(),
        productId: z.string(),
        price: z.number(),
        quantity: z.number(),
        totalPrice: z.number(),
      }),
    ),
    totalPrice: z.number(),
  })
  .strict();

export type Order = z.infer<typeof Order>;
