import { photoByIndex } from '@/lib/productPhotos';
import type { Promo } from '@/types';

export const promos: Promo[] = [
  {
    id: '1',
    title: 'самовывоз −20%',
    description:
      'забирайте заказ сами — скидка 20% на все позиции применится автоматически при оформлении',
    imageUrl: photoByIndex(4),
    tone: 'green',
    autoApplied: true,
    validUntil: '2026-12-31',
  },
  {
    id: '2',
    title: 'шашлык за полцены',
    description:
      'каждый вторник и четверг — −50% на все виды шашлыка. промокод SKAZKA50 при оформлении',
    imageUrl: photoByIndex(15),
    tone: 'red',
    code: 'SKAZKA50',
    autoApplied: false,
  },
  {
    id: '3',
    title: 'пахлава в подарок',
    description:
      'при заказе от 1 500 ₽ пахлава бесплатно. подарок добавится в корзину автоматически',
    imageUrl: photoByIndex(19),
    tone: 'sand',
    autoApplied: true,
  },
];
