export type Modifier = {
  id: string;
  name: string;
  priceDelta: number;
  default?: boolean;
};

export type Nutrients = {
  proteins: number;
  fats: number;
  carbs: number;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  composition: string;
  photoUrl: string | null;
  categoryId: string;
  cuisineId: string;
  isWeighted: boolean;
  price: number;
  baseWeight: number;
  weightPresets: number[];
  cookTime: string;
  deliveryTime: string;
  calories: number;
  nutrients: Nutrients;
  modifiers: Modifier[];
  allergens: string[];
  isAvailable: boolean;
};

export type Category = {
  id: string;
  name: string;
  photoUrl: string | null;
  order: number;
};

export type Cuisine = {
  id: string;
  name: string;
  order: number;
};

export type Slide = {
  type: 'image' | 'video';
  url: string;
  cta?: { label: string; deeplink: string };
};

export type Story = {
  id: string;
  previewUrl: string | null;
  label: string;
  slides: Slide[];
  seen: boolean;
  accent?: 'wine' | 'forest' | 'midnight' | 'sand';
  flatLabel?: string;
};

export type Banner = {
  id: string;
  imageUrl: string | null;
  kicker: string;
  title: string;
  cta: string;
  deeplink: string;
  tone: 'red' | 'green' | 'ink';
};

export type Address = {
  id: string;
  line: string;
  entrance?: string;
  floor?: string;
  flat?: string;
  comment?: string;
};

export type CartItem = {
  dishId: string;
  quantity: number;
  weight?: number;
  modifiers: string[];
  price: number;
};

export type OrderStatus =
  | 'accepted'
  | 'cooking'
  | 'ready'
  | 'on_way'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card_online' | 'cash' | 'card_courier';

export type DeliveryMethod = 'delivery' | 'pickup';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  delivery: DeliveryMethod;
  address?: Address;
  time: 'asap' | string;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
};

export type Promo = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  tone: 'red' | 'green' | 'ink' | 'sand';
  code?: string;
  autoApplied: boolean;
  validUntil?: string;
};

export type Environment = 'tg' | 'vk' | 'max' | 'web';

export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bonusPoints: number;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type Tile = {
  id: string;
  kicker: string;
  title: string;
  count?: number;
  tone: 'wine' | 'green' | 'mint' | 'ink' | 'sand' | 'cream' | 'red';
  deeplink: string;
};
