import { OrderRepository } from '../order.repository';
import { Order, OrderLine } from '../order';
import { Injectable } from '@nestjs/common';
import { Database } from '../../common';
import * as schema from '../../common/database/database.types';

@Injectable()
export class KyselyOrderRepository implements OrderRepository {
  constructor(private readonly db: Database) {}

  async create(order: Order): Promise<void> {
    await this.db
      .insertInto('order')
      .values(this.mapFromOrder(order))
      .execute();
    await this.db
      .insertInto('order_line')
      .values(this.mapFromOrderLines(order.orderLines))
      .execute();
  }

  async update(order: Order): Promise<void> {
    await this.db
      .updateTable('order')
      .set(this.mapFromOrder(order))
      .where('id', '=', order.id)
      .execute();

    await this.db
      .deleteFrom('order_line')
      .where('order_line.order_id', '=', order.id)
      .execute();

    await this.db
      .insertInto('order_line')
      .values(this.mapFromOrderLines(order.orderLines))
      .execute();
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.db
      .selectFrom('order')
      .selectAll()
      .where('order.id', '=', id)
      .executeTakeFirst();

    if (!order) {
      return null;
    }

    const orderLines = await this.db
      .selectFrom('order_line')
      .selectAll()
      .where('order_line.order_id', '=', id)
      .execute();

    return this.mapToOrder(order, orderLines);
  }

  private mapToOrder(
    order: schema.Order,
    orderLines: schema.OrderLine[],
  ): Order {
    return new Order(order.id, this.mapToOrderLines(orderLines));
  }

  private mapToOrderLines(orderLine: schema.OrderLine[]): OrderLine[] {
    return orderLine.map(
      (line) =>
        new OrderLine(
          line.id,
          line.order_id,
          line.product_id,
          line.price,
          line.quantity,
        ),
    );
  }

  private mapFromOrder(order: Order): schema.Order {
    return {
      id: order.id,
    };
  }

  private mapFromOrderLines(
    orderLine: Order['orderLines'],
  ): schema.OrderLine[] {
    return orderLine.map((line) => ({
      id: line.id,
      order_id: line.orderId,
      product_id: line.productId,
      price: line.price,
      quantity: line.quantity,
    }));
  }
}
