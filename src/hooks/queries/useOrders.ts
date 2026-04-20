import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  getOrderById,
  getOrderHistory,
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
    },
  });
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
