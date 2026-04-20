import { photoByIndex } from '@/lib/productPhotos';
import type { Category } from '@/types';

export const categories: Category[] = [
  { id: 'salads', name: 'салаты', order: 1, photoUrl: photoByIndex(0) },
  { id: 'cold', name: 'холодные закуски', order: 2, photoUrl: photoByIndex(1) },
  { id: 'hot', name: 'горячие закуски', order: 3, photoUrl: photoByIndex(2) },
  { id: 'soups', name: 'первые блюда', order: 4, photoUrl: photoByIndex(3) },
  { id: 'fish', name: 'рыбные блюда', order: 5, photoUrl: photoByIndex(4) },
  { id: 'mains', name: 'вторые блюда', order: 6, photoUrl: photoByIndex(5) },
  { id: 'kebabs', name: 'шашлыки', order: 7, photoUrl: photoByIndex(6) },
  { id: 'sides', name: 'гарниры', order: 8, photoUrl: photoByIndex(7) },
  { id: 'bakery', name: 'выпечка', order: 9, photoUrl: photoByIndex(8) },
  { id: 'sauces', name: 'соусы', order: 10, photoUrl: photoByIndex(9) },
  { id: 'desserts', name: 'десерты', order: 11, photoUrl: photoByIndex(10) },
];
