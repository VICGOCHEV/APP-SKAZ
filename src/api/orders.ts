import { apiClient, mockDelay, USE_MOCKS } from './client';
import { apiCartToCartItems, apiOrderToOrder } from './adapters';
import type {
  Address,
  CartItem,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
} from '@/types';
import type {
  ApiCreateAddressInline,
  ApiCreateOrderRequest,
  ApiCreateOrderResponse,
  ApiOrder,
  ApiOrderPaymentMethod,
  ApiOrderType,
} from './schema';

let mockOrderSeq = 1001;
const mockOrders: Order[] = [];

export type CreateOrderInput = {
  items: CartItem[];
  total: number;
  delivery: DeliveryMethod;
  address?: Address;
  /** Optional saved-address id (preferred for authed users). */
  addressId?: string;
  time: 'asap' | string;
  payment: PaymentMethod;
  comment?: string;
  promoCode?: string;
  /** Required when posting as a guest. */
  name?: string;
  phone?: string;
};

export type CreateOrderResult = {
  /** Server-side order id, when known immediately (CASH, or extracted from URL). */
  orderId?: string;
  /** External payment URL (CARD/SBP) — frontend should redirect. */
  paymentUrl?: string;
};

/** Frontend → backend payment enum. */
function toApiPayment(p: PaymentMethod): ApiOrderPaymentMethod {
  if (p === 'cash' || p === 'card_courier') return 'CASH';
  return 'CARD';
}

/** Frontend → backend order type. delivery → courier, pickup → client. */
function toApiOrderType(d: DeliveryMethod): ApiOrderType {
  return d === 'pickup' ? 'DELIVERY_BY_CLIENT' : 'DELIVERY_BY_COURIER';
}

/** Pull an inline-address payload from a frontend Address. */
function inlineFromAddress(addr: Address | undefined): ApiCreateAddressInline | undefined {
  if (!addr) return undefined;
  // address.line is "<street>, <house>" — split once on the last comma.
  const idx = addr.line.lastIndexOf(',');
  const street = idx > 0 ? addr.line.slice(0, idx).trim() : addr.line.trim();
  const house = idx > 0 ? addr.line.slice(idx + 1).trim() : '';
  return {
    street,
    house,
    entrance: addr.entrance,
    floor: addr.floor,
    apartment: addr.flat,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult & { order?: Order }> {
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
    await mockDelay(undefined, 700);
    return { orderId: order.id, order };
  }

  const body: ApiCreateOrderRequest = {
    payment: toApiPayment(input.payment),
    type: toApiOrderType(input.delivery),
    comment: input.comment,
  };
  if (input.addressId) {
    body.address_id = input.addressId;
  } else if (input.delivery === 'delivery') {
    body.address = inlineFromAddress(input.address);
  }
  if (input.name) body.name = input.name;
  if (input.phone) body.phone = input.phone;

  const { data } = await apiClient.post<ApiCreateOrderResponse>('/orders', body);
  // Backend returns either a payment URL or a bare order id.
  if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
    // Try to extract trailing UUID-like segment as a probable order id.
    const match = data.match(/[0-9a-f-]{32,}/i);
    return { paymentUrl: data, orderId: match?.[0] };
  }
  return { orderId: typeof data === 'string' ? data : undefined };
}

export async function getOrderById(id: string): Promise<Order> {
  if (USE_MOCKS) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Заказ ${id} не найден`);
    return mockDelay(order, 150);
  }
  const { data } = await apiClient.get<ApiOrder>(`/orders/${encodeURIComponent(id)}`);
  return apiOrderToOrder(data);
}

export async function getOrderHistory(): Promise<Order[]> {
  if (USE_MOCKS) return mockDelay([...mockOrders], 200);
  const { data } = await apiClient.get<ApiOrder[]>('/orders');
  return (data ?? []).map(apiOrderToOrder);
}

/**
 * Repeat an order — backend returns the resulting CartData; we forward to caller
 * so it can prime the cart query and navigate to /cart.
 */
export async function repeatOrder(id: string): Promise<CartItem[]> {
  if (USE_MOCKS) return mockDelay([], 200);
  const { data } = await apiClient.post(`/orders/${encodeURIComponent(id)}`);
  return apiCartToCartItems(data);
}

/** Mock-only — backend status is read from /orders/{id}.status (not a separate endpoint). */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  if (USE_MOCKS) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Заказ ${id} не найден`);
    order.status = status;
    return mockDelay(order, 150);
  }
  // No-op in real mode — status updates come from the backend on /orders/{id} polling.
  return getOrderById(id);
}

/** Notify backend of payment outcome from the provider's redirect-back URL. */
export async function notifyPaymentSuccess(orderId: string): Promise<void> {
  if (USE_MOCKS) return;
  await apiClient.post(`/payments/${encodeURIComponent(orderId)}/success`);
}

export async function notifyPaymentFailed(orderId: string): Promise<void> {
  if (USE_MOCKS) return;
  await apiClient.post(`/payments/${encodeURIComponent(orderId)}/failed`);
}
