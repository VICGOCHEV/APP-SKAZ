/**
 * Minimal subset of backend API types actually used by the frontend.
 * Matches the shape returned by staging backend (skazka-vostoka.vtheory.ru),
 * which diverges slightly from the nominal OpenAPI spec:
 *   - `restrictions` is a single object, not an array
 *   - `variation.nutritions` is an array, but `modifier.nutrition` is a single object
 *   - product has no top-level `price` — always via `variations[0].price`
 *   - `remaining: null` means "stock not tracked" (→ available)
 *   - attachments contain multiple size variants: original | 1200 | 900 | 600 | 300
 */

export type ApiAttachmentWidth = 'original' | '1200' | '900' | '600' | '300' | string;

export type ApiAttachment = {
  id: string;
  path: string;
  name?: string;
  type?: string | null;
  width?: ApiAttachmentWidth;
};

export type ApiNutrition = {
  fats?: number | null;
  salt?: number | null;
  carbs?: number | null;
  sugar?: number | null;
  energy?: number | null;
  proteins?: number | null;
  saturatedFattyAcid?: number | null;
};

export type ApiRestriction = {
  byDefault?: number;
  maxQuantity?: number;
  minQuantity?: number;
  freeQuantity?: number;
  hideIfDefaultQuantity?: boolean;
};

export type ApiModifier = {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: string | number;
  nutrition?: ApiNutrition | null;
  restrictions?: ApiRestriction;
};

export type ApiModifierGroup = {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  restrictions?: ApiRestriction;
  modifiers?: ApiModifier[] | null;
};

export type ApiProductVariation = {
  id: string;
  size_name?: string;
  size_code?: string;
  weight?: number;
  measure_unit?: string;
  measurement_unit?: string;
  sku?: string;
  price?: string | number;
  nutritions?: ApiNutrition[];
  groups?: ApiModifierGroup[] | null;
};

export type ApiCategory = {
  id: string;
  iiko_group_id?: string;
  api_id?: string;
  parent?: ApiCategory | null;
  name: string;
  description?: string | null;
  color?: string | null;
  flag?: boolean | null;
  attachments?: ApiAttachment[];
};

export type ApiProduct = {
  id: string;
  iiko_id?: string;
  remaining?: string | number | null;
  name: string;
  description?: string;
  sku?: string;
  price?: string | number;
  variations?: ApiProductVariation[];
  categories?: ApiCategory[];
  attachments?: ApiAttachment[];
  recommended?: ApiProductWithoutRecommended[];
};

export type ApiProductWithoutRecommended = Omit<ApiProduct, 'categories' | 'recommended'>;

export type ApiBannerType = 'MAIN' | 'ADDITIONAL' | 'CATALOG';

export type ApiBanner = {
  id: string;
  title?: string;
  description?: string;
  type?: { type: ApiBannerType; label: string };
  position?: number;
  background?: string;
  product?: ApiProduct | null;
  category?: ApiCategory | null;
  attachment?: ApiAttachment | null;
};

export type ApiAddress = {
  id: string;
  street: string;
  house: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
};

export type ApiUserRole = {
  role: string;
  label: string;
};

export type ApiUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bonus?: number;
  role?: ApiUserRole;
  avatar?: string;
  addresses?: ApiAddress[];
};

export type ApiOrderPayment = {
  payment: 'CARD' | 'CASH' | 'SBP';
  label: string;
};

export type ApiOrderItemModifier = {
  product: ApiModifier;
  quantity: number;
};

export type ApiOrderItem = {
  product: ApiProduct;
  quantity: number;
  modifiers?: ApiOrderItemModifier[];
};

export type ApiOrder = {
  id: string;
  address?: string;
  phone: string;
  name: string;
  payment: ApiOrderPayment;
  total: number;
  items: ApiOrderItem[];
  created: string;
};

export type ApiLoginResponse = {
  access_token: string;
  token_type: 'bearer' | string;
  expires_in: number;
};
