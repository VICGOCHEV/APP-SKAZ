import type {
  ApiAttachment,
  ApiCategory,
  ApiModifierGroup,
  ApiNutrition,
  ApiProduct,
  ApiUser,
} from './schema';
import type { Category, Dish, Modifier, Nutrients, User } from '@/types';

/** Parse any number-ish value (string | number | null) to finite number or fallback. */
function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * Resolve attachment path to a usable URL.
 * Absolute URL — use as-is. Relative path — prepend VITE_API_MEDIA_URL
 * (defaults to empty → same-origin / Vite proxy).
 */
export function resolveAttachmentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const mediaBase = (import.meta.env.VITE_API_MEDIA_URL as string | undefined) ?? '';
  return mediaBase + path;
}

/**
 * Pick a photo from attachments, preferring the requested `width` variant.
 * Common widths: 'original' | '1200' | '900' | '600' | '300'.
 * Falls back to the first available if exact size is missing.
 */
export function pickPhoto(
  attachments?: ApiAttachment[],
  preferredWidth: string = '900',
): string | null {
  if (!attachments || attachments.length === 0) return null;
  const byWidth = attachments.find((a) => String(a.width) === preferredWidth);
  const chosen = byWidth ?? attachments[0];
  return resolveAttachmentUrl(chosen.path);
}

function mapNutrition(nutrition?: ApiNutrition | null): {
  calories: number;
  nutrients: Nutrients;
} {
  return {
    calories: Math.round(num(nutrition?.energy)),
    nutrients: {
      proteins: Math.round(num(nutrition?.proteins)),
      fats: Math.round(num(nutrition?.fats)),
      carbs: Math.round(num(nutrition?.carbs)),
    },
  };
}

function mapModifiers(groups?: ApiModifierGroup[] | null): Modifier[] {
  if (!groups) return [];
  const result: Modifier[] = [];
  for (const g of groups) {
    for (const m of g.modifiers ?? []) {
      const byDefault = (m.restrictions?.byDefault ?? 0) > 0;
      result.push({
        id: m.id,
        name: m.name,
        priceDelta: Math.round(num(m.price)),
        default: byDefault || undefined,
      });
    }
  }
  return result;
}

/**
 * Map backend ApiProduct → frontend Dish.
 *
 * Simplifications for MVP:
 *  - picks `variations[0]` for price / weight / nutrients
 *  - variations UI (size picker) — TODO
 *  - composition / allergens / cook-time / delivery-time not in API
 *
 * Availability logic:
 *  - `remaining === null` → stock is NOT tracked in iiko → available
 *  - `remaining <= 0` → explicitly out of stock
 *  - `remaining > 0`  → in stock
 */
export function productToDish(p: ApiProduct): Dish {
  const firstVariation = p.variations?.[0];
  const nutrition = firstVariation?.nutritions?.[0];
  const { calories, nutrients } = mapNutrition(nutrition);
  const firstCategory = p.categories?.[0];

  const rawPrice = firstVariation?.price ?? p.price;
  const price = Math.round(num(rawPrice));

  const isAvailable = p.remaining === null || p.remaining === undefined ? true : num(p.remaining) > 0;

  return {
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    composition: '',
    photoUrl: pickPhoto(p.attachments, '900'),
    categoryId: firstCategory?.id ?? 'uncategorized',
    cuisineId: 'east',
    isWeighted: false,
    price,
    baseWeight: firstVariation?.weight ? Math.round(firstVariation.weight) : 0,
    weightPresets: [],
    cookTime: '',
    deliveryTime: '',
    calories,
    nutrients,
    modifiers: mapModifiers(firstVariation?.groups),
    allergens: [],
    isAvailable,
  };
}

/**
 * Map backend ApiCategory → frontend Category.
 * The `order` field isn't in API; use the list index as fallback.
 */
export function apiCategoryToCategory(c: ApiCategory, index = 0): Category {
  return {
    id: c.id,
    name: c.name ?? '',
    photoUrl: pickPhoto(c.attachments, '300'),
    order: index,
  };
}

/** Map backend ApiUser → frontend User. */
export function apiUserToUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name ?? '',
    email: u.email,
    phone: u.phone,
    avatarUrl: resolveAttachmentUrl(u.avatar) ?? undefined,
    bonusPoints: Math.round(num(u.bonus)),
  };
}
