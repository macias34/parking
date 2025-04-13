import { uuid } from '../common';

export class Order {
  private readonly orderLines: OrderLine[] = [];
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
