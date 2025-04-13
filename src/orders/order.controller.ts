import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrder, OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrder: CreateOrder): Promise<void> {
    await this.orderService.create(createOrder);
  }
}
