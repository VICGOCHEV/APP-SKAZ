import { mockDelay, USE_MOCKS } from './client';
import { dishes as mockDishes } from '@/mocks/dishes';
import type { Dish } from '@/types';

export async function getDishes(): Promise<Dish[]> {
  if (USE_MOCKS) return mockDelay(mockDishes, 300);
  throw new Error('Real /dishes endpoint not wired yet');
}

export async function getDishById(id: string): Promise<Dish> {
  if (USE_MOCKS) {
    const dish = mockDishes.find((d) => d.id === id);
    if (!dish) throw new Error(`Блюдо ${id} не найдено`);
    return mockDelay(dish, 200);
  }
  throw new Error('Real /dishes/:id endpoint not wired yet');
}

export async function getDishesByCategory(categoryId: string): Promise<Dish[]> {
  if (USE_MOCKS) {
    return mockDelay(
      mockDishes.filter((d) => d.categoryId === categoryId),
      250,
    );
  }
  throw new Error('Real /dishes endpoint not wired yet');
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
  throw new Error('Real /dishes/search endpoint not wired yet');
}
