import { z } from 'zod';

const OrderLine = z
  .object({
    productId: z.string(),
    price: z.number(),
    quantity: z.number(),
  })
  .strict();

export const CreateOrder = z
  .object({
    orderLines: z.array(OrderLine),
  })
  .strict();

export const AddProductToOrder = z
  .object({
    orderLines: z.array(OrderLine),
  })
  .strict();

export type CreateOrder = z.infer<typeof CreateOrder>;
export type AddProductToOrder = z.infer<typeof AddProductToOrder>;
export type OrderLine = z.infer<typeof OrderLine>;
