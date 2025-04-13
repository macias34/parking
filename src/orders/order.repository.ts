import { Order } from './order';

export abstract class OrderRepository {
	abstract create(order: Order): Promise<void>;
}
