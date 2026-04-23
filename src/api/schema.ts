/**
 * Minimal subset of backend API types actually used by the frontend.
 * Full OpenAPI spec: see docs/api.yaml (truncated) / backend side.
 *
 * These shapes are hand-maintained rather than codegen'd to keep the
 * integration light. When the backend adds new endpoints, mirror only
 * the fields we need here.
 */

export type ApiAttachment = {
  id: string;
  path: string;
  name?: string;
  type?: string;
  width?: string | number;
};

export type ApiNutrition = {
  fats?: number;
  salt?: number | null;
  carbs?: number;
  sugar?: number | null;
  energy?: number;
  proteins?: number;
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
  price?: string;
  nutritions?: ApiNutrition[];
  restrictions?: ApiRestriction[];
};

export type ApiModifierGroup = {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  restrictions?: ApiRestriction[];
  modifiers?: ApiModifier[] | null;
};

export type ApiProductVariation = {
  id: string;
  size_name?: string;
  size_code?: string;
  weight?: number;
  measurement_unit?: string;
  sku?: string;
  price?: string;
  nutritions?: ApiNutrition[];
  groups?: ApiModifierGroup[] | null;
};

export type ApiCategory = {
  id: string;
  iiko_group_id?: string;
  api_id?: string;
  parent?: ApiCategory | null;
  name: string;
  description?: string;
  color?: string;
  flag?: boolean;
  attachments?: ApiAttachment[];
};

export type ApiProduct = {
  id: string;
  iiko_id?: string;
  remaining?: string;
  name: string;
  description?: string;
  sku?: string;
  price?: string;
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
