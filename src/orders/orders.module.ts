import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { KyselyOrderRepository } from './infrastructure/kysely-order.repository';
import { OrderRepository } from './order.repository';
import { OrderMapper } from './order.mapper';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: OrderRepository,
      useClass: KyselyOrderRepository,
    },
    OrderMapper,
  ],
})
export class OrdersModule {}
