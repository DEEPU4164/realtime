/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSoldOut?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  timestamp: string;
}

export const CATEGORIES = [
  "All",
  "Tiffins",
  "Special Combos",
  "Soups",
  "Veg Starters",
  "Non Veg Starters",
  "Non Veg Biryani",
  "Veg Biryani",
  "Veg Fried Rice",
  "Non Veg Fried Rice",
  "Veg Curries",
  "Non Veg Curries",
  "Others"
] as const;

export interface RestaurantSettings {
  whatsappNumber: string;
  businessEmail: string;
  operatingHours: string;
  restaurantAddress: string;
  isAcceptingOrders: boolean;
}

