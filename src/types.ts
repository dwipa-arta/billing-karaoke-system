/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  password?: string;
}

export enum RoomStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
}

export enum RoomType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  VIP = 'vip',
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  status: RoomStatus;
  currentSessionId?: string;
  lastHeartbeat?: number; // timestamp for online status
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  purchasePrice?: number;
  category: 'drink' | 'food' | 'other';
  stock: number;
  unit?: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  note?: string;
  refNo?: string;
  performedBy: string;
}

export interface Session {
  id: string;
  roomId: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp (for fixed duration)
  actualEndTime?: number; // timestamp (when finished)
  totalDurationMinutes?: number;
  fixedDurationMinutes?: number;
  ratePerHour: number;
  totalCost?: number;
  customerName?: string;
  status: 'active' | 'completed' | 'cancelled';
  orders?: OrderItem[];
}

export interface RoomRate {
  type: RoomType;
  ratePerHour: number;
}
