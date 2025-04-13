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

    this.orderLines.push(new OrderLine(this.id, productId, price, quantity));
  }

  totalPrice(): number {
    return this.orderLines.reduce(
      (total, line) => total + line.totalPrice(),
      0,
    );
  }
}

class OrderLine {
  constructor(
    private readonly id: string,
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
}
