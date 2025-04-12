import { OrderRepository } from './order-repository';
import { Order } from './order';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KyselyOrderRepository implements OrderRepository {
	create(order: Order): Promise<void> {
		return Promise.resolve(undefined);
	}

}
