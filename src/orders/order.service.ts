import { Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from './order';

export interface CreateOrder {
  orderLines: {
    productId: string;
    price: number;
    quantity: number;
  }[];
}

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create({ orderLines }: CreateOrder): Promise<void> {
    const order = new Order('123');

    orderLines.forEach((line) =>
      order.add(line.productId, line.quantity, line.price),
    );

    await this.orderRepository.create(order);
  }
}
