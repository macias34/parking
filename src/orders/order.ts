import { DB } from 'src/common/database/database.types';
import { uuid } from '../common';

export class Order {
  private orderLines: OrderLine[] = [];
  constructor(private readonly id: string) {}

  add(productId: string, quantity: number, price: number): void {
    const existingOrderLine = this.orderLines.find(
      (line) => line.productId === productId,
    );
    if (existingOrderLine) {
      existingOrderLine.addQuantity(quantity);
      return;
    }

    this.orderLines.push(
      new OrderLine(uuid(), this.id, productId, price, quantity),
    );
  }

  totalPrice(): number {
    return this.orderLines.reduce(
      (total, line) => total + line.totalPrice(),
      0,
    );
  }

  get _state() {
    return {
      id: this.id,
      orderLines: this.orderLines.map((line) => line._state),
    };
  }

  static _reconstruct(data: {
    order: DB['order'];
    orderLines: DB['order_line'][];
  }): Order {
    const order = new Order(data.order.id);
    const orderLines: OrderLine[] = data.orderLines.map(
      (line) =>
        new OrderLine(
          line.id,
          line.order_id,
          line.product_id,
          line.price,
          line.quantity,
        ),
    );

    order.orderLines = orderLines;
    return order;
  }
}

class OrderLine {
  constructor(
    private readonly id: string,
    private readonly orderId: string,
    private readonly _productId: string,
    private readonly price: number,
    private quantity: number = 0,
  ) {}

  addQuantity(quantity: number): void {
    this.quantity += quantity;
  }

  totalPrice(): number {
    return this.quantity * this.price;
  }

  get productId(): string {
    return this._productId;
  }

  get _state() {
    return {
      id: this.id,
      order_id: this.orderId,
      product_id: this._productId,
      price: this.price,
      quantity: this.quantity,
    };
  }
}
