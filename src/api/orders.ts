import { mockDelay, USE_MOCKS } from './client';
import type { Address, CartItem, DeliveryMethod, Order, OrderStatus, PaymentMethod } from '@/types';

let mockOrderSeq = 1001;
const mockOrders: Order[] = [];

export type CreateOrderInput = {
  items: CartItem[];
  total: number;
  delivery: DeliveryMethod;
  address?: Address;
  time: 'asap' | string;
  payment: PaymentMethod;
  comment?: string;
  promoCode?: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (USE_MOCKS) {
    const order: Order = {
      id: String(mockOrderSeq++),
      items: input.items,
      total: input.total,
      delivery: input.delivery,
      address: input.address,
      time: input.time,
      payment: input.payment,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    };
    mockOrders.unshift(order);
    return mockDelay(order, 700);
  }
  throw new Error('Real /orders endpoint not wired yet');
}

export async function getOrderById(id: string): Promise<Order> {
  if (USE_MOCKS) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Заказ ${id} не найден`);
    return mockDelay(order, 150);
  }
  throw new Error('Real /orders/:id endpoint not wired yet');
}

export async function getOrderHistory(): Promise<Order[]> {
  if (USE_MOCKS) return mockDelay([...mockOrders], 200);
  throw new Error('Real /orders endpoint not wired yet');
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  if (USE_MOCKS) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Заказ ${id} не найден`);
    order.status = status;
    return mockDelay(order, 150);
  }
  throw new Error('Real /orders/:id status endpoint not wired yet');
}
