import { OrderRepository } from './order.repository';
import { Order } from './order';
import { Injectable } from '@nestjs/common';
import { Database } from '../common';

@Injectable()
export class KyselyOrderRepository implements OrderRepository {
  constructor(private readonly database: Database) {}

  create(order: Order): Promise<void> {
    return Promise.resolve(undefined);
  }
}
