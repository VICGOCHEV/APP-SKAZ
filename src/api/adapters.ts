import type {
  ApiAddress,
  ApiAttachment,
  ApiBanner,
  ApiCart,
  ApiCartItem,
  ApiCategory,
  ApiModifierGroup,
  ApiNutrition,
  ApiOrder,
  ApiProduct,
  ApiUser,
} from './schema';
import type {
  Address,
  Banner,
  CartItem,
  Category,
  Dish,
  Modifier,
  Nutrients,
  Order,
  OrderStatus,
  PaymentMethod,
  User,
} from '@/types';

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
 * Categories whose products are sold per-portion-of-N-grams (price scales by weight).
 * Lowercased substring match against category name.
 */
const WEIGHTED_CATEGORY_HINTS = ['мангал', 'шашлык', 'кебаб'];

/** Product-name patterns that mean "priced per portion" (across any category). */
const WEIGHTED_NAME_HINTS = ['на углях', 'гриль'];

/** Max base portion (g) we treat as weighted — bigger = a fixed-size platter. */
const WEIGHTED_MAX_BASE_PORTION_G = 250;

/**
 * True if product is sold by weight (price scales linearly with grams).
 *
 * Two signals:
 *  - category contains "мангал/шашлык/кебаб" (covers all мясо на мангале)
 *  - product name contains "на углях" or "гриль" (covers grilled sides:
 *    помидор/баклажан/перец/цукини/шампиньоны/картофель на углях)
 */
export function isWeightedProduct(p: ApiProduct): boolean {
  const baseWeight = p.variations?.[0]?.weight ?? 0;
  if (!baseWeight || baseWeight > WEIGHTED_MAX_BASE_PORTION_G) return false;

  const cats = (p.categories ?? []).map((c) => (c.name ?? '').toLowerCase());
  if (cats.some((n) => WEIGHTED_CATEGORY_HINTS.some((hint) => n.includes(hint)))) {
    return true;
  }

  const name = (p.name ?? '').toLowerCase();
  return WEIGHTED_NAME_HINTS.some((hint) => name.includes(hint));
}

/** Build N-portion presets in `baseWeight` increments (1× … 10×). */
function buildWeightPresets(baseWeight: number): number[] {
  if (!baseWeight) return [];
  return [1, 2, 3, 4, 5, 6, 8, 10].map((mult) => Math.round(baseWeight * mult));
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
 *
 * Weighted logic:
 *  - products in "мясо на мангале" with portion ≤ 250g are sold per-portion;
 *    user picks weight via slider and we multiply price linearly. Cart sends
 *    quantity = weight / baseWeight portions to the backend.
 */
export function productToDish(p: ApiProduct): Dish {
  const firstVariation = p.variations?.[0];
  const nutrition = firstVariation?.nutritions?.[0];
  const { calories, nutrients } = mapNutrition(nutrition);
  const firstCategory = p.categories?.[0];

  const rawPrice = firstVariation?.price ?? p.price;
  const price = Math.round(num(rawPrice));
  const baseWeight = firstVariation?.weight ? Math.round(firstVariation.weight) : 0;
  const weighted = isWeightedProduct(p);

  const isAvailable = p.remaining === null || p.remaining === undefined ? true : num(p.remaining) > 0;

  return {
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    composition: '',
    photoUrl: pickPhoto(p.attachments, '900'),
    categoryId: firstCategory?.id ?? 'uncategorized',
    cuisineId: 'east',
    isWeighted: weighted,
    price,
    baseWeight,
    weightPresets: weighted ? buildWeightPresets(baseWeight) : [],
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

/**
 * Map a single CartItemData → frontend CartItem.
 * `serverId` carries the backend cart_item_id so we can target it later
 * for removal or modifier edits.
 *
 * For weighted products (e.g. shashlik) the backend tracks integer portions;
 * we expose total grams as `weight` so the UI can show the slider, with
 * `quantity` kept at 1 (the line is one weighted portion of N grams).
 */
export function apiCartItemToCartItem(item: ApiCartItem): CartItem {
  const portions = Math.max(1, Math.round(num(item.quantity, 1)));
  const baseWeight = item.product?.variations?.[0]?.weight ?? 0;
  const weighted = item.product ? isWeightedProduct(item.product) : false;

  return {
    serverId: item.id,
    dishId: item.product?.id ?? '',
    quantity: weighted ? 1 : portions,
    weight: weighted && baseWeight ? Math.round(baseWeight * portions) : undefined,
    modifiers: (item.modifiers ?? [])
      .map((m) => m.modifier?.id)
      .filter((id): id is string => Boolean(id)),
    price: Math.round(num(item.total)),
  };
}

/** Map full CartData → list of CartItems (server `total` is recomputable from items). */
export function apiCartToCartItems(cart: ApiCart | null | undefined): CartItem[] {
  if (!cart?.items?.length) return [];
  return cart.items.map(apiCartItemToCartItem);
}

/** Backend payment enum → frontend PaymentMethod. */
function apiPaymentToPayment(p: ApiOrder['payment'] | undefined): PaymentMethod {
  switch (p?.payment) {
    case 'CARD':
    case 'SBP':
      return 'card_online';
    case 'CASH':
      return 'cash';
    default:
      return 'card_online';
  }
}

/**
 * Backend doesn't expose a structured `status` field on OrderData yet —
 * we default freshly-fetched orders to 'accepted' until iiko status mapping
 * is wired up. Caller can override based on payment-callback responses.
 */
export function apiOrderToOrder(o: ApiOrder): Order {
  const items: CartItem[] = (o.items ?? []).map((it) => {
    const baseWeight = it.product?.variations?.[0]?.weight ?? 0;
    const weighted = it.product ? isWeightedProduct(it.product) : false;
    const portions = Math.max(1, Math.round(num(it.quantity, 1)));
    const rawPrice = num(it.product?.variations?.[0]?.price ?? it.product?.price);
    return {
      dishId: it.product?.id ?? '',
      quantity: weighted ? 1 : portions,
      weight: weighted && baseWeight ? Math.round(baseWeight * portions) : undefined,
      modifiers: (it.modifiers ?? [])
        .map((m) => m.product?.id)
        .filter((id): id is string => Boolean(id)),
      price: Math.round(rawPrice * portions),
    };
  });

  // Server returns "DD-MM-YYYY HH:mm:ss" — convert to ISO if possible.
  const iso = (() => {
    const m = (o.created ?? '').match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return o.created ?? new Date().toISOString();
    const [, d, mo, y, h, mi, s] = m;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`).toISOString();
  })();

  const status: OrderStatus = 'accepted';

  return {
    id: o.id,
    items,
    total: Math.round(num(o.total)),
    delivery: o.address ? 'delivery' : 'pickup',
    address: o.address
      ? { id: `srv-${o.id}`, line: o.address }
      : undefined,
    time: 'asap',
    payment: apiPaymentToPayment(o.payment),
    status,
    createdAt: iso,
  };
}

const BANNER_TONES: Banner['tone'][] = ['red', 'green', 'ink'];

/**
 * Backend BannerData → frontend Banner. Picks an image from the banner's
 * own attachment when present, falling back to the linked product's photo.
 * The linked-resource determines the deeplink: a product banner opens its
 * dish sheet; a category banner opens that category in the menu.
 */
export function apiBannerToBanner(b: ApiBanner, index = 0): Banner {
  const productPhoto = pickPhoto(b.product?.attachments, '900');
  const imageUrl =
    resolveAttachmentUrl(b.attachment?.path) ?? productPhoto ?? null;

  const title = b.title?.trim() || b.product?.name || b.category?.name || '';
  const kicker = b.type?.label?.toLowerCase() ?? '';

  const deeplink = b.product
    ? `/dish/${b.product.id}`
    : b.category
      ? `/menu/east/${b.category.id}`
      : '/';

  return {
    id: b.id,
    imageUrl,
    kicker,
    title,
    cta: b.product ? 'смотреть блюдо' : b.category ? 'открыть раздел' : 'подробнее',
    deeplink,
    tone: BANNER_TONES[index % BANNER_TONES.length],
  };
}

/**
 * Backend AddressData → frontend Address. Builds a display `line` from
 * street + house (apartment goes to `flat`, not `line`, so the form can
 * round-trip cleanly).
 */
export function apiAddressToAddress(a: ApiAddress): Address {
  const street = (a.street ?? '').trim();
  const house = (a.house ?? '').trim();
  const line = [street, house].filter(Boolean).join(', ');
  return {
    id: a.id,
    line,
    street,
    house,
    entrance: a.entrance,
    floor: a.floor,
    flat: a.apartment,
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
