import { Injectable } from '@nestjs/common';
import { Order } from './order';
import * as queries from './queries';

@Injectable()
export class OrderMapper {
  toDto(order: Order): queries.Order {
    const candidateDto = {
      id: order.id,
      orderLines: order.orderLines.map((line) => ({
        id: line.id,
        productId: line.productId,
        quantity: line.quantity,
        price: line.price,
        totalPrice: line.totalPrice(),
      })),
      totalPrice: order.totalPrice(),
    };

    return candidateDto;
  }
}
