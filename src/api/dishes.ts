import { apiClient, mockDelay, USE_MOCKS } from './client';
import { productToDish } from './adapters';
import { dishes as mockDishes } from '@/mocks/dishes';
import type { ApiProduct } from './schema';
import type { Dish } from '@/types';

export async function getDishes(): Promise<Dish[]> {
  if (USE_MOCKS) return mockDelay(mockDishes, 300);
  const { data } = await apiClient.get<ApiProduct[]>('/products');
  return (data ?? []).map(productToDish);
}

export async function getDishById(id: string): Promise<Dish> {
  if (USE_MOCKS) {
    const dish = mockDishes.find((d) => d.id === id);
    if (!dish) throw new Error(`Блюдо ${id} не найдено`);
    return mockDelay(dish, 200);
  }
  const { data } = await apiClient.get<ApiProduct>(`/products/${id}`);
  return productToDish(data);
}

export async function getDishesByCategory(categoryId: string): Promise<Dish[]> {
  if (USE_MOCKS) {
    return mockDelay(
      mockDishes.filter((d) => d.categoryId === categoryId),
      250,
    );
  }
  const { data } = await apiClient.get<ApiProduct[]>(`/products/category/${categoryId}`);
  return (data ?? []).map(productToDish);
}

export async function searchDishes(query: string): Promise<Dish[]> {
  const q = query.trim().toLowerCase();
  if (!q) return getDishes();
  if (USE_MOCKS) {
    return mockDelay(
      mockDishes.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.composition.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q),
      ),
      250,
    );
  }
  // GET with a JSON body is non-standard but matches the OpenAPI spec's
  // FilterProductRequest. Axios does send the `data` field on GET.
  const { data } = await apiClient.request<ApiProduct[]>({
    method: 'GET',
    url: '/products',
    data: { title: q },
  });
  return (data ?? []).map(productToDish);
}
