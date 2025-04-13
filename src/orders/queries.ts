import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class Order extends createZodDto(
  z
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
    .strict(),
) {}
