import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from './order';
import { uuid } from '../common';
import { OrderMapper } from './order.mapper';
import { AddProductToOrder, CreateOrder } from './commands';
import * as queries from './queries';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderMapper: OrderMapper,
  ) {}

  async create({ orderLines }: CreateOrder): Promise<void> {
    const order = new Order(uuid());

    orderLines.forEach((line) =>
      order.add(line.productId, line.quantity, line.price),
    );

    await this.orderRepository.create(order);
  }

  async addProductToOrder(
    orderId: string,
    { orderLines }: AddProductToOrder,
  ): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    orderLines.forEach((line) =>
      order.add(line.productId, line.quantity, line.price),
    );

    await this.orderRepository.update(order);
  }

  async getById(id: string): Promise<queries.Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.orderMapper.toDto(order);
  }
}
