import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  getOrderById,
  getOrderHistory,
  notifyPaymentFailed,
  notifyPaymentSuccess,
  repeatOrder,
  updateOrderStatus,
  type CreateOrderInput,
} from '@/api/orders';
import { queryKeys } from './queryKeys';

export function useOrderHistory() {
  return useQuery({
    queryKey: queryKeys.orderHistory,
    queryFn: getOrderHistory,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.order(id) : queryKeys.order(''),
    queryFn: () => getOrderById(id!),
    enabled: Boolean(id),
    refetchInterval: 5000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orderHistory });
      // Cart was consumed by /orders POST — drop the cached server cart so
      // the next CartScreen mount refetches.
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useRepeatOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repeatOrder(id),
    onSuccess: (cartItems) => {
      qc.setQueryData(queryKeys.cart, cartItems);
    },
  });
}

export function useNotifyPaymentSuccess() {
  return useMutation({ mutationFn: (orderId: string) => notifyPaymentSuccess(orderId) });
}

export function useNotifyPaymentFailed() {
  return useMutation({ mutationFn: (orderId: string) => notifyPaymentFailed(orderId) });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof updateOrderStatus>[1] }) =>
      updateOrderStatus(id, status),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      void qc.invalidateQueries({ queryKey: queryKeys.orderHistory });
    },
  });
}
