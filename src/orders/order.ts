import { uuid } from '../common';

export class Order {
  constructor(
    readonly id: string,
    private _orderLines: OrderLine[] = [],
  ) {}

  add(productId: string, quantity: number, price: number): void {
    const existingOrderLine = this._orderLines.find(
      (line) => line.productId === productId,
    );
    if (existingOrderLine) {
      existingOrderLine.addQuantity(quantity);
      return;
    }

    this._orderLines.push(
      new OrderLine(uuid(), this.id, productId, price, quantity),
    );
  }

  totalPrice(): number {
    return this._orderLines.reduce(
      (total, line) => total + line.totalPrice(),
      0,
    );
  }

  get orderLines(): OrderLine[] {
    return this._orderLines;
  }
}

export class OrderLine {
  constructor(
    readonly id: string,
    readonly orderId: string,
    readonly productId: string,
    readonly price: number,
    private _quantity: number = 0,
  ) {}

  addQuantity(quantity: number): void {
    this._quantity += quantity;
  }

  totalPrice(): number {
    return this._quantity * this.price;
  }

  get quantity(): number {
    return this._quantity;
  }
}
