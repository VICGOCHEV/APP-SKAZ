const modules = import.meta.glob<{ default: string }>(
  '@/assets/banners/*.{png,jpg,jpeg,webp}',
  { eager: true },
);

const map: Record<string, string> = {};
for (const key of Object.keys(modules)) {
  const match = key.match(/\/([^/]+)\.(png|jpg|jpeg|webp)$/i);
  if (match) map[match[1].toLowerCase()] = modules[key].default;
}

export function bannerPhoto(name: string): string | null {
  return map[name.toLowerCase()] ?? null;
}
