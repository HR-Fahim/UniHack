export type MealType = 'Marketplace' | 'Rescue';
export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Flagged';
export type MealStatus = 'Active' | 'SoldOut' | 'Cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  university: string;
  campus: string;
  avgRating: number;
  strikeCount: number;
  isBannedFromPosting: boolean;
  createdAt: string;
  role: 'customer' | 'cooker' | 'admin';
}

export interface MealListing {
  id: string;
  cookId: string;
  cookName: string;
  title: string;
  description: string;
  ingredients: string;
  allergens: string;
  imageUrl: string;
  type: MealType;
  priceCents: number;
  servingsAvailable: number;
  pickupLocationText: string;
  pickupLat: number;
  pickupLng: number;
  status: MealStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  mealId: string;
  mealTitle: string;
  buyerId: string;
  cookId: string;
  quantity: number;
  mealPriceCents: number;
  buyerFeeCents: number;
  makerFeeCents: number;
  totalPaidCents: number;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  cookId: string;
  buyerId: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface MealRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  title: string;
  description: string;
  budgetCents: number;
  status: 'Pending' | 'Accepted' | 'Cooking' | 'Ready' | 'Completed' | 'Cancelled';
  cookId?: string;
  cookName?: string;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  completedAt?: string;
}
