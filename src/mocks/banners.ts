import { bannerPhoto } from '@/lib/bannerPhotos';
import { photoByIndex } from '@/lib/productPhotos';
import type { Banner } from '@/types';

export const banners: Banner[] = [
  {
    id: '1',
    tone: 'red',
    kicker: 'баранина',
    title: 'неделя\nхашламы',
    cta: 'попробовать',
    deeplink: '/dish/14',
    imageUrl: bannerPhoto('hashlama') ?? photoByIndex(7),
  },
  {
    id: '2',
    tone: 'green',
    kicker: '−20% на самовывоз',
    title: 'заберите\nсами',
    cta: 'подробнее',
    deeplink: '/promos',
    imageUrl: photoByIndex(4),
  },
  {
    id: '3',
    tone: 'ink',
    kicker: 'новинка',
    title: 'ночь\nспеций',
    cta: 'открыть',
    deeplink: '/menu/east/kebabs',
    imageUrl: photoByIndex(15),
  },
];
