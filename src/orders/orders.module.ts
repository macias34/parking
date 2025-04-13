import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { KyselyOrderRepository } from './kysely-order.repository';
import { OrderRepository } from './order.repository';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: OrderRepository,
      useClass: KyselyOrderRepository,
    },
  ],
})
export class OrdersModule {}
