const modules = import.meta.glob<{ default: string }>(
  '@/assets/products/*.png',
  { eager: true },
);

const photos: string[] = Object.keys(modules)
  .sort((a, b) => {
    const na = Number(a.match(/product(\d+)\.png$/)?.[1] ?? 0);
    const nb = Number(b.match(/product(\d+)\.png$/)?.[1] ?? 0);
    return na - nb;
  })
  .map((key) => modules[key].default);

export const productPhotos = photos;

export function photoByIndex(i: number): string {
  if (photos.length === 0) return '';
  return photos[i % photos.length];
}
