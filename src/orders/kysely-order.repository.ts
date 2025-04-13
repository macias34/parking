import { OrderRepository } from './order.repository';
import { Order } from './order';
import { Injectable } from '@nestjs/common';
import { Database } from '../common';

@Injectable()
export class KyselyOrderRepository implements OrderRepository {
  constructor(private readonly db: Database) {}

  async create(order: Order): Promise<void> {
    const { id, orderLines } = order._state;

    await this.db
      .insertInto('order')
      .values({
        id,
      })
      .execute();

    await this.db.insertInto('order_line').values(orderLines).execute();
  }
}
