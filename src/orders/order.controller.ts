import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrder } from './commands';
import { Order } from './queries';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrder: CreateOrder): Promise<void> {
    await this.orderService.create(createOrder);
  }

  @Patch(':id')
  async addProductToOrder(
    @Param('id') orderId: string,
    @Body() addProductToOrder: CreateOrder,
  ): Promise<void> {
    await this.orderService.addProductToOrder(orderId, addProductToOrder);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Order> {
    return this.orderService.getById(id);
  }
}
