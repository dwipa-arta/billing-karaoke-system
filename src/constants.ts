/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomType, RoomRate, Room, InventoryItem, Package } from './types';

export const DEFAULT_RATES: RoomRate[] = [
  { type: RoomType.SMALL, ratePerHour: 50000 },
  { type: RoomType.MEDIUM, ratePerHour: 75000 },
  { type: RoomType.LARGE, ratePerHour: 100000 },
  { type: RoomType.VIP, ratePerHour: 150000 },
];

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg1',
    name: 'Paket Chill (Small)',
    description: '2 Jam Room Small + 2 Small Beer + 1 Snacks',
    price: 150000,
    durationHours: 2,
    roomType: RoomType.SMALL,
    items: [
      { itemId: 'p16', quantity: 2 },
      { itemId: 'p4', quantity: 1 }
    ]
  },
  {
    id: 'pkg2',
    name: 'Paket Party (Medium)',
    description: '3 Jam Room Medium + 4 Small Beer + 2 Snacks',
    price: 350000,
    durationHours: 3,
    roomType: RoomType.MEDIUM,
    items: [
      { itemId: 'p16', quantity: 4 },
      { itemId: 'p5', quantity: 2 }
    ]
  },
  {
    id: 'pkg3',
    name: 'Paket Executive (VIP)',
    description: '3 Jam Room VIP + 1 Black Label + 2 Snacks',
    price: 1800000,
    durationHours: 3,
    roomType: RoomType.VIP,
    items: [
      { itemId: 'p20', quantity: 1 },
      { itemId: 'p7', quantity: 2 }
    ]
  },
  {
    id: 'pkg4',
    name: 'Paket Hemat Pelajar',
    description: '1 Jam Room (All Type) + 2 Iced Tea + 1 French Fries',
    price: 85000,
    durationHours: 1,
    roomType: 'all',
    items: [
      { itemId: 'p11', quantity: 2 },
      { itemId: 'p4', quantity: 1 }
    ]
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'p1', name: 'Aqua 600ml', price: 5000, purchasePrice: 3500, category: 'drink', stock: 85, unit: 'Btl' },
  { id: 'p2', name: 'Coca Cola 330ml', price: 8000, purchasePrice: 6000, category: 'drink', stock: 42, unit: 'Can' },
  { id: 'p3', name: 'Teh Botol Sosro 450ml', price: 7000, purchasePrice: 5000, category: 'drink', stock: 12, unit: 'Btl' },
  { id: 'p4', name: 'Original French Fries', price: 20000, purchasePrice: 12000, category: 'food', stock: 35, unit: 'Porsi' },
  { id: 'p5', name: 'Indomie Goreng + Telur', price: 18000, purchasePrice: 10000, category: 'food', stock: 28, unit: 'Porsi' },
  { id: 'p6', name: 'Singkong Goreng Keju', price: 15000, purchasePrice: 8000, category: 'food', stock: 18, unit: 'Porsi' },
  { id: 'p7', name: 'Nasi Goreng Hachiko', price: 25000, purchasePrice: 15000, category: 'food', stock: 15, unit: 'Porsi' },
  { id: 'p8', name: 'Tahu Cabe Garam', price: 15000, purchasePrice: 7000, category: 'food', stock: 22, unit: 'Porsi' },
  { id: 'p9', name: 'Pisang Bakar Coklat', price: 12000, purchasePrice: 6000, category: 'food', stock: 10, unit: 'Porsi' },
  { id: 'p10', name: 'Orange Juice Fresh', price: 12000, purchasePrice: 7000, category: 'drink', stock: 30, unit: 'Gelas' },
  { id: 'p11', name: 'Iced Lemon Tea', price: 10000, purchasePrice: 4000, category: 'drink', stock: 45, unit: 'Gelas' },
  { id: 'p12', name: 'Hot Coffee Arabica', price: 15000, purchasePrice: 8000, category: 'drink', stock: 25, unit: 'Cangkir' },
  { id: 'p13', name: 'Rokok Gudang Garam Filter', price: 28000, purchasePrice: 24000, category: 'smoke', stock: 4, unit: 'Bks' },
  { id: 'p14', name: 'Rokok Sampoerna Mild', price: 32000, purchasePrice: 28000, category: 'smoke', stock: 8, unit: 'Bks' },
  { id: 'p15', name: 'Korek Api Gas', price: 3000, purchasePrice: 1500, category: 'other', stock: 50, unit: 'Pcs' },
  { id: 'p16', name: 'Bir Bintang 330ml', price: 35000, purchasePrice: 28000, category: 'drink', stock: 12, unit: 'Btl' },
  { id: 'p17', name: 'Anker Beer 330ml', price: 30000, purchasePrice: 24000, category: 'drink', stock: 12, unit: 'Btl' },
  { id: 'p18', name: 'Bali Hai Premium 330ml', price: 32000, purchasePrice: 25000, category: 'drink', stock: 12, unit: 'Btl' },
  { id: 'p19', name: 'Johnnie Walker Red Label 750ml', price: 850000, purchasePrice: 700000, category: 'drink', stock: 6, unit: 'Btl' },
  { id: 'p20', name: 'Johnnie Walker Black Label 750ml', price: 1250000, purchasePrice: 1050000, category: 'drink', stock: 6, unit: 'Btl' },
  { id: 'p21', name: "Jack Daniel's Old No. 7 750ml", price: 1100000, purchasePrice: 900000, category: 'drink', stock: 6, unit: 'Btl' },
  { id: 'p22', name: 'Chivas Regal 12 Y.O. 750ml', price: 1350000, purchasePrice: 1150000, category: 'drink', stock: 6, unit: 'Btl' },
];

export const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Room 01', type: RoomType.SMALL, status: 'available' as any },
  { id: '2', name: 'Room 02', type: RoomType.SMALL, status: 'available' as any },
  { id: '3', name: 'Room 03', type: RoomType.SMALL, status: 'available' as any },
  { id: '4', name: 'Room 04', type: RoomType.MEDIUM, status: 'available' as any },
  { id: '5', name: 'Room 05', type: RoomType.MEDIUM, status: 'available' as any },
  { id: '6', name: 'Room 06', type: RoomType.MEDIUM, status: 'available' as any },
  { id: '7', name: 'Room 07', type: RoomType.LARGE, status: 'available' as any },
  { id: '8', name: 'Room 08', type: RoomType.LARGE, status: 'available' as any },
  { id: '9', name: 'VIP 01', type: RoomType.VIP, status: 'available' as any },
  { id: '10', name: 'VIP 02', type: RoomType.VIP, status: 'available' as any },
];
