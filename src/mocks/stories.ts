import { photoByIndex } from '@/lib/productPhotos';
import type { Story } from '@/types';

export const stories: Story[] = [
  {
    id: '1',
    label: 'новое в меню',
    previewUrl: photoByIndex(0),
    seen: false,
    slides: [
      {
        type: 'image',
        url: photoByIndex(0),
        cta: { label: 'попробовать', deeplink: '/dish/1' },
      },
    ],
  },
  {
    id: '2',
    label: 'хит сезона',
    previewUrl: photoByIndex(6),
    seen: false,
    slides: [
      {
        type: 'image',
        url: photoByIndex(6),
        cta: { label: 'заказать', deeplink: '/dish/7' },
      },
      { type: 'image', url: photoByIndex(7) },
    ],
  },
  {
    id: '3',
    label: 'скидка дня',
    previewUrl: null,
    seen: false,
    accent: 'wine',
    flatLabel: '−20%',
    slides: [
      {
        type: 'image',
        url: photoByIndex(13),
        cta: { label: 'смотреть акции', deeplink: '/promos' },
      },
    ],
  },
  {
    id: '4',
    label: 'шашлык',
    previewUrl: photoByIndex(15),
    seen: true,
    slides: [{ type: 'image', url: photoByIndex(15) }],
  },
  {
    id: '5',
    label: 'подарок',
    previewUrl: null,
    seen: true,
    accent: 'midnight',
    flatLabel: '✦',
    slides: [
      {
        type: 'image',
        url: photoByIndex(19),
        cta: { label: 'узнать как', deeplink: '/promos' },
      },
    ],
  },
];
