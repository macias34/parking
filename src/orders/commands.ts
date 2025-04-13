import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const OrderLine = z
  .object({
    productId: z.string().uuid(),
    price: z.number(),
    quantity: z.number(),
  })
  .strict();

export class CreateOrder extends createZodDto(
  z
    .object({
      orderLines: z.array(OrderLine),
    })
    .strict(),
) {}

export class AddProductToOrder extends createZodDto(
  z
    .object({
      orderLines: z.array(OrderLine),
    })
    .strict(),
) {}
