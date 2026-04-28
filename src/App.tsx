/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Settings, 
  LayoutDashboard, 
  BarChart3, 
  Mic2,
  Plus,
  Play,
  Square,
  History,
  X,
  CreditCard,
  DoorOpen,
  TrendingUp,
  DollarSign,
  UserCircle,
  ShieldCheck,
  ShieldAlert,
  Shield,
  LogOut,
  Wifi,
  WifiOff,
  ChevronDown,
  Save,
  Check,
  Trash2,
  Package,
  Search,
  List,
  ArrowUpDown,
  Activity,
  FileText,
  PlusCircle,
  ChevronRight,
  Download,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { Room, RoomStatus, RoomType, Session, RoomRate, User, UserRole, InventoryItem, OrderItem, InventoryLog } from './types';
import { INITIAL_ROOMS, DEFAULT_RATES, INITIAL_INVENTORY } from './constants';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Super Admin', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', password: 'admin' },
  { id: '2', name: 'Manager Room', role: UserRole.MANAGER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager', password: 'manager' },
  { id: '3', name: 'Kasir Sift 1', role: UserRole.CASHIER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cashier', password: 'kasir' },
];

// --- Utility Helpers ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Components ---

const Header = ({ currentUser, onLogout }: { currentUser: User; onLogout: () => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Mic2 className="text-black w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">HACHIKO</h1>
          <p className="text-[8px] text-white/40 font-mono tracking-[0.2em] uppercase leading-none">Entertainment Center</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] text-white/40 font-mono">{new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <div className="flex items-center gap-2">
            {currentUser.role === UserRole.ADMIN && <ShieldCheck size={10} className="text-red-400" />}
            {currentUser.role === UserRole.MANAGER && <Shield size={10} className="text-blue-400" />}
            {currentUser.role === UserRole.CASHIER && <ShieldAlert size={10} className="text-emerald-400" />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{currentUser.role}</span>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 pl-4 border-l border-white/10 hover:bg-white/5 py-1 px-2 rounded-lg transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{currentUser.name}</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <ChevronDown size={14} className={cn("text-white/40 transition-transform", showMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                >
                  <div className="px-4 py-3 border-b border-white/5 sm:hidden">
                    <p className="text-sm font-bold">{currentUser.name}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{currentUser.role}</p>
                  </div>
                  <button 
                    onClick={() => {
                      onLogout();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Keluar / Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hachiko_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hachiko_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('hachiko_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [loginPassword, setLoginPassword] = useState('');
  const [attemptingUser, setAttemptingUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('hachiko_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hachiko_inventory', JSON.stringify(inventory));
  }, [inventory]);
  
  const handleSaveSettings = () => {
    localStorage.setItem('hachiko_users', JSON.stringify(users));
    localStorage.setItem('hachiko_rooms', JSON.stringify(rooms));
    localStorage.setItem('hachiko_inventory', JSON.stringify(inventory));
    setShowSavedToast(true);
    
    // Memberikan waktu 1.5 detik agar user bisa melihat pesan sukses sebelum kembali ke dashboard
    setTimeout(() => {
      setShowSavedToast(false);
      setView('dashboard');
    }, 1500);
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Item Baru',
      price: 0,
      category: 'drink',
      stock: 0,
      unit: 'Pcs'
    };
    setInventory(prev => [...prev, newItem]);
  };

  const removeInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptSession, setReceiptSession] = useState<Session | null>(null);

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
    setReceiptSession(null);
    setView('dashboard');
  };

  useEffect(() => {
    if (showReceiptModal) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showReceiptModal]);

  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [mgmtCategoryFilter, setMgmtCategoryFilter] = useState<string>('all');
  const [mgmtSearchQuery, setMgmtSearchQuery] = useState('');
  const [inventorySubMenu, setInventorySubMenu] = useState<'master' | 'transaction' | 'monitoring' | 'report'>('master');
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([
    {
      id: 'log1',
      itemId: 'p1',
      itemName: 'Aqua 600ml',
      type: 'in',
      quantity: 50,
      date: new Date(Date.now() - 86400000).toISOString(),
      performedBy: 'Admin',
      note: 'Stok awal'
    },
    {
      id: 'log2',
      itemId: 'p3',
      itemName: 'Teh Botol Sosro 450ml',
      type: 'out',
      quantity: 5,
      date: new Date(Date.now() - 3600000).toISOString(),
      performedBy: 'Admin',
      note: 'Rusak/Pecah'
    }
  ]);

  // Add Item Modal State
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    price: 0,
    purchasePrice: 0,
    category: 'drink' as 'drink' | 'food' | 'other',
    unit: 'Pcs',
    stock: 0
  });

  const saveNewInventoryItem = () => {
    if (!newItemForm.name) return;

    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItemForm
    };

    setInventory(prev => [...prev, newItem]);
    
    // Log the initial stock if any
    if (newItemForm.stock > 0) {
      const log: InventoryLog = {
        id: Math.random().toString(36).substr(2, 9),
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'in',
        quantity: newItemForm.stock,
        date: new Date().toISOString(),
        performedBy: currentUser.name,
        note: 'Stok awal saat pendaftaran item'
      };
      setInventoryLogs(prev => [log, ...prev]);
    }

    setShowAddItemModal(false);
    setNewItemForm({ name: '', price: 0, purchasePrice: 0, category: 'drink', unit: 'Pcs', stock: 0 });
  };

  // Transaction form state
  const [txItemId, setTxItemId] = useState('');
  const [txType, setTxType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [txQty, setTxQty] = useState<number>(0);
  const [txRefNo, setTxRefNo] = useState('');
  const [txNote, setTxNote] = useState('');

  const handleInventoryTransaction = () => {
    if (!txItemId || txQty <= 0) return;

    const item = inventory.find(i => i.id === txItemId);
    if (!item) return;

    // Update Stock
    let newStock = item.stock;
    if (txType === 'in') newStock += txQty;
    else if (txType === 'out') newStock = Math.max(0, newStock - txQty);
    else if (txType === 'adjustment') newStock = txQty;

    setInventory(prev => prev.map(i => i.id === txItemId ? { ...i, stock: newStock } : i));

    // Add Log
    const newLog: InventoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: txItemId,
      itemName: item.name,
      type: txType,
      quantity: txQty,
      date: new Date().toISOString(),
      performedBy: currentUser.name,
      refNo: txRefNo,
      note: txNote
    };

    setInventoryLogs(prev => [newLog, ...prev]);

    // Reset Form
    setTxQty(0);
    setTxNote('');
    setTxRefNo('');
  };

  // Fetch data from server on init
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, sessionsRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/sessions')
        ]);
        
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (roomsData.length > 0) setRooms(roomsData);
        }
        
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // Save to localStorage (user) and Server (rooms/sessions) on change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hachiko_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hachiko_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const syncRooms = async () => {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rooms)
      });
    };
    if (rooms.length > 0) syncRooms();
  }, [rooms]);

  useEffect(() => {
    const syncSessions = async () => {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessions)
      });
    };
    syncSessions();
  }, [sessions]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Heartbeat Simulation (For Demo)
  useEffect(() => {
    if (rooms.length === 0) return;
    const simulation = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * rooms.length);
      const room = rooms[randomIndex];
      fetch(`/api/rooms/${room.id}/heartbeat`, { method: 'POST' });
    }, 5000); // Send heartbeat for a random room every 5s
    return () => clearInterval(simulation);
  }, [rooms]);

  const activeSessions = useMemo(() => sessions.filter(s => s.status === 'active'), [sessions]);
  const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId), [activeRoomId, rooms]);
  const activeSession = useMemo(() => 
    sessions.find(s => s.roomId === activeRoomId && s.status === 'active'), 
    [activeRoomId, sessions]
  );

  const [customRate, setCustomRate] = useState<number | null>(null);
  const [isPriceUnlocked, setIsPriceUnlocked] = useState(false);
  const [overridePassword, setOverridePassword] = useState('');
  const [overrideError, setOverrideError] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<OrderItem[]>([]);
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Initialize custom rate and reset pending orders when opening a room
  useEffect(() => {
    if (activeRoomId && !activeSession) {
      const room = rooms.find(r => r.id === activeRoomId);
      if (room) {
        const standardRate = DEFAULT_RATES.find(r => r.type === room.type)?.ratePerHour || 0;
        setCustomRate(standardRate);
      }
      setIsPriceUnlocked(false);
      setOverridePassword('');
      setOverrideError(false);
      setPendingOrders([]);
    } else {
      setCustomRate(null);
      setPendingOrders([]);
    }
  }, [activeRoomId, activeSession, rooms]);

  const addToPendingOrder = (item: InventoryItem) => {
    // Stock Validation
    const currentStock = item.stock;
    
    setPendingOrders(prev => {
      const existing = prev.find(p => p.id === item.id);
      const currentQty = existing ? existing.quantity : 0;
      
      if (currentQty >= currentStock) {
        alert(`Stok tidak mencukupi! Sisa stok ${item.name}: ${currentStock}`);
        return prev;
      }

      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromPendingOrder = (itemId: string) => {
    setPendingOrders(prev => {
      const existing = prev.find(p => p.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.id !== itemId);
    });
  };

  const addOrderToActiveSession = (item: InventoryItem) => {
    if (!activeSession) return;
    
    // Stock Validation
    const currentStock = item.stock;
    const existingInSession = (activeSession.orders || []).find(o => o.id === item.id);
    const sessionQty = existingInSession ? existingInSession.quantity : 0;

    if (sessionQty >= currentStock) {
      alert(`Stok tidak mencukupi! Sisa stok ${item.name}: ${currentStock}`);
      return;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        const orders = s.orders || [];
        const existing = orders.find(o => o.id === item.id);
        const newOrders = existing 
          ? orders.map(o => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o)
          : [...orders, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        return { ...s, orders: newOrders };
      }
      return s;
    }));
  };

  const handleGrantOverride = () => {
    // Check if password matches any admin or manager
    const authorizedUser = users.find(u => 
      (u.role === UserRole.ADMIN || u.role === UserRole.MANAGER) && 
      u.password === overridePassword
    );

    if (authorizedUser) {
      setIsPriceUnlocked(true);
      setOverridePassword('');
      setOverrideError(false);
    } else {
      setOverrideError(true);
    }
  };

  const handleStartSession = (roomId: string, duration?: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const rate = customRate !== null ? customRate : (DEFAULT_RATES.find(r => r.type === room.type)?.ratePerHour || 0);
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      roomId,
      startTime: Date.now(),
      endTime: duration ? Date.now() + duration * 60 * 60 * 1000 : undefined,
      fixedDurationMinutes: duration ? duration * 60 : undefined,
      ratePerHour: rate,
      status: 'active',
      customerName: `Tamu ${roomId}`,
      orders: pendingOrders.length > 0 ? [...pendingOrders] : undefined
    };

    setSessions(prev => [...prev, newSession]);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: RoomStatus.ACTIVE, currentSessionId: newSession.id } : r));
    setActiveRoomId(null);
  };

  const handleEndSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const actualEndTime = Date.now();
    const durationMs = actualEndTime - session.startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Room Cost
    const billedHours = Math.max(1, Math.round(durationHours));
    const roomCost = billedHours * session.ratePerHour;
    
    // Orders Cost
    const ordersCost = (session.orders || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalCost = roomCost + ordersCost;

    // Deduct stock from inventory
    if (session.orders && session.orders.length > 0) {
      const newLogs: InventoryLog[] = [];
      
      setInventory(prev => prev.map(invItem => {
        const order = session.orders?.find(o => o.id === invItem.id);
        if (order) {
          // Create log for automatic sale
          newLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            itemId: invItem.id,
            itemName: invItem.name,
            type: 'out',
            quantity: order.quantity,
            date: new Date().toISOString(),
            performedBy: 'System (Sales)',
            refNo: `BILL-${session.id.slice(0, 4).toUpperCase()}`,
            note: `Penjualan Room ${session.roomId}`
          });
          return { ...invItem, stock: Math.max(0, invItem.stock - order.quantity) };
        }
        return invItem;
      }));

      if (newLogs.length > 0) {
        setInventoryLogs(prev => [...newLogs, ...prev]);
      }
    }

    setSessions(prev => prev.map(s => s.id === sessionId ? { 
      ...s, 
      status: 'completed', 
      actualEndTime,
      totalCost,
      totalDurationMinutes: Math.round(durationMs / (1000 * 60))
    } : s));

    const updatedSession = sessions.find(s => s.id === sessionId);
    if (updatedSession) {
      setReceiptSession({
        ...updatedSession,
        status: 'completed',
        actualEndTime,
        totalCost,
        totalDurationMinutes: Math.round(durationMs / (1000 * 60))
      });
      setShowReceiptModal(true);
    }
    
    setRooms(prev => prev.map(r => r.id === session.roomId ? { ...r, status: RoomStatus.AVAILABLE, currentSessionId: undefined } : r));
    setActiveRoomId(null);
  };

  const calculateCurrentCost = (session: Session) => {
    const elapsedMs = currentTime - session.startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // Room Cost
    const billedHours = Math.max(1, Math.round(elapsedHours));
    const roomCost = billedHours * session.ratePerHour;
    
    // Orders Cost
    const ordersCost = (session.orders || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return roomCost + ordersCost;
  };

  const getRemainingTime = (session: Session) => {
    if (!session.endTime) return null;
    const remaining = session.endTime - currentTime;
    return remaining;
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('id-ID', { weekday: 'short' });
    }).reverse();

    // Simulated data for previous days + real current data
    const baseRevenue = [1200000, 1500000, 900000, 2100000, 1800000, 2500000];
    const currentRevenue = sessions
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => acc + (s.totalCost || 0), 0);

    const fullData = [...baseRevenue, currentRevenue];
    return last7Days.map((name, i) => ({
      name,
      total: fullData[fullData.length - 7 + i] || 0,
    }));
  }, [sessions]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Mic2 className="text-black w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">HACHIKO</h1>
            <p className="text-white/40 text-xs uppercase tracking-[0.3em]">Sistem Manajemen</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {!attemptingUser ? (
              <div className="space-y-4">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold text-center mb-4">Akses Sistem Hachiko</p>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/40 group-hover:text-white/60 transition-colors z-10">
                    <ChevronDown size={18} />
                  </div>
                  <select 
                    value=""
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value);
                      if (user) setAttemptingUser(user);
                    }}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pt-6 pl-5 pr-12 text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:border-white/40 transition-all hover:bg-white/5 relative z-0"
                  >
                    <option value="" disabled className="bg-black">-- Pilih Akun User --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="bg-black py-4">
                        {user.name} - {user.role}
                      </option>
                    ))}
                  </select>
                  <label className="absolute top-2 left-5 text-[9px] text-white/20 uppercase font-bold tracking-widest pointer-events-none">User Profile</label>
                </div>

                <div className="pt-4 flex flex-col items-center gap-2">
                  <div className="flex -space-x-2">
                    {users.map((u) => (
                      <div key={u.id} className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-[#111]">
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover opacity-60" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-white/10 uppercase font-mono tracking-tighter italic">Multi-user environment active</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setAttemptingUser(null);
                    setLoginPassword('');
                    setLoginError(false);
                  }}
                  className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-2"
                >
                  ← KEMBALI KE PILIHAN AKUN
                </button>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img src={attemptingUser.avatar} alt={attemptingUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{attemptingUser.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{attemptingUser.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input 
                    type="password" 
                    placeholder="Masukkan Password"
                    autoFocus
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (loginPassword === attemptingUser.password) {
                          setCurrentUser(attemptingUser);
                          setAttemptingUser(null);
                          setLoginPassword('');
                        } else {
                          setLoginError(true);
                        }
                      }
                    }}
                    className={cn(
                      "w-full bg-white/5 border rounded-xl py-3 px-4 text-center text-lg tracking-[0.5em] font-mono focus:outline-none transition-all",
                      loginError ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] shake" : "border-white/10 focus:border-white/30"
                    )}
                  />
                  {loginError && (
                    <p className="text-[10px] text-red-500 text-center font-bold uppercase tracking-tighter">Password Salah! Silakan coba lagi.</p>
                  )}
                </div>

                <button 
                  onClick={() => {
                    if (loginPassword === attemptingUser.password) {
                      setCurrentUser(attemptingUser);
                      setAttemptingUser(null);
                      setLoginPassword('');
                    } else {
                      setLoginError(true);
                    }
                  }}
                  className="w-full h-12 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  Login System
                </button>
              </div>
            )}
          </div>
          
          <p className="text-[10px] text-white/20 text-center">Versi 2.4.0 • Edisi Perusahaan</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <Header currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 lg:w-56 border-r border-white/5 bg-black/50 flex flex-col p-3 gap-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 p-2.5 lg:px-4 rounded-lg transition-all ${view === 'dashboard' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden lg:block font-semibold text-sm">Dashboard</span>
          </button>
          
          {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
            <button 
              onClick={() => setView('history')}
              className={`flex items-center gap-3 p-2.5 lg:px-4 rounded-lg transition-all ${view === 'history' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5'}`}
            >
              <History size={18} />
              <span className="hidden lg:block font-semibold text-sm">Laporan</span>
            </button>
          )}

          {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
            <button 
              onClick={() => setView('settings')}
              className={`flex items-center gap-3 p-2.5 lg:px-4 rounded-lg transition-all ${view === 'settings' ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5'}`}
            >
              <Settings size={18} />
              <span className="hidden lg:block font-semibold text-sm">Pengaturan</span>
            </button>
          )}

          <div className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                  setCurrentUser(null);
                }
              }}
              className="w-full flex items-center gap-3 p-2.5 lg:px-4 rounded-lg transition-all text-red-400/60 hover:bg-red-400/10 hover:text-red-400"
            >
              <LogOut size={18} />
              <span className="hidden lg:block font-semibold text-sm">Keluar</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {view === 'dashboard' && (
            <div className="max-w-full mx-auto space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white/90">DASHBOARD</h2>
                  <p className="text-xs text-white/40">Pemantauan ruangan secara real-time.</p>
                </div>
                
                <div className="flex flex-1 max-w-md relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-white/40 transition-colors">
                    <History size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari ruangan..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="bg-[#111] px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[11px] font-medium text-white/70">{rooms.filter(r => r.status === RoomStatus.AVAILABLE).length} Siap</span>
                  </div>
                  <div className="bg-[#111] px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-[11px] font-medium text-white/70">{rooms.filter(r => r.status === RoomStatus.ACTIVE).length} Aktif</span>
                  </div>
                </div>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                  {rooms
                    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((room) => {
                    const session = sessions.find(s => s.roomId === room.id && s.status === 'active');
                    const isOccupied = room.status === RoomStatus.ACTIVE;
                    const isOnline = room.lastHeartbeat && (currentTime - room.lastHeartbeat < 30000); // 30s threshold
                    
                    return (
                      <motion.div
                        key={room.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setActiveRoomId(room.id)}
                        className={cn(
                          "bg-[#111] border rounded-xl p-4 shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] border-2",
                          isOccupied ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-white/5',
                          !isOnline && !isOccupied && 'opacity-60'
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 inline-block uppercase tracking-wider font-bold">{room.type}</span>
                              <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                isOccupied ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"
                              )}>
                                <div className={cn(
                                  "w-1 h-1 rounded-full",
                                  isOccupied ? "bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]" : "bg-emerald-500"
                                )}></div>
                                {isOccupied ? 'Aktif' : 'Ready'}
                              </div>
                            </div>
                            
                            {/* Online Indicator */}
                            <div className={cn(
                              "flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest",
                              isOnline ? "text-blue-400" : "text-white/20"
                            )}>
                              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                              {isOnline ? 'Online' : 'Offline'}
                            </div>

                            <h3 className="text-lg font-bold">{room.name}</h3>
                          </div>
                          {isOccupied ? (
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                              <Square size={16} fill="currentColor" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <DoorOpen size={16} />
                            </div>
                          )}
                        </div>

                        {isOccupied && session ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase tracking-widest">
                              <span>Waktu {session.endTime ? 'Tersisa' : 'Berjalan'}</span>
                              <Clock size={10} />
                            </div>
                            <div className={cn(
                                "text-2xl font-mono font-medium",
                                session.endTime && (getRemainingTime(session) || 0) < 600000 ? "text-red-500 animate-pulse" : "text-white"
                            )}>
                              {session.endTime 
                                ? formatTime(Math.max(0, getRemainingTime(session) || 0))
                                : formatTime(currentTime - session.startTime)
                              }
                            </div>
                            <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                              <div className="text-[10px] text-white/40 mb-0.5">Bill (Jam Berjalan)</div>
                              <div className="text-md font-bold text-emerald-400">{formatCurrency(calculateCurrentCost(session))}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-1 flex flex-col items-center text-white/10 group-hover:text-white/40 transition-colors">
                            <Plus size={20} strokeWidth={1.5} />
                            <span className="text-[9px] font-medium uppercase tracking-widest mt-0.5">Sewa</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {view === 'history' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Rekapitulasi</h2>
                  <p className="text-white/40">Analisis pendapatan dan riwayat sesi karaoke.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Total Sewa (Room)</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(sessions.filter(s => s.status === 'completed').reduce((sum, s) => {
                        const ordersVal = (s.orders || []).reduce((oSum, o) => oSum + (o.price * o.quantity), 0);
                        return sum + (s.totalCost || 0) - ordersVal;
                      }, 0))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Total Belanja (Menu)</div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatCurrency(sessions.filter(s => s.status === 'completed').reduce((sum, s) => {
                        return sum + (s.orders || []).reduce((oSum, o) => oSum + (o.price * o.quantity), 0);
                      }, 0))}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
                    <div className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold mb-1">Total Pendapatan</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + (s.totalCost || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="premium-card">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Tren Pendapatan (7 Hari Terakhir)</h3>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">NILAI DALAM IDR (K)</div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff40', fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#ffffff40', fontSize: 10 }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' } as any}
                        formatter={(value) => formatCurrency(value as number)}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === chartData.length - 1 ? '#10b981' : '#ffffff20'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="premium-card !p-0 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <History size={16} /> Riwayat Sesi
                   </h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
                    <tr>
                      <th className="px-6 py-4">Room</th>
                      <th className="px-6 py-4">Check-in</th>
                      <th className="px-6 py-4">Sewa (Room)</th>
                      <th className="px-6 py-4">Belanja (Menu)</th>
                      <th className="px-6 py-4 text-right">Total Tagihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sessions.filter(s => s.status === 'completed').map((session) => {
                      const ordersTotal = (session.orders || []).reduce((sum, o) => sum + (o.price * o.quantity), 0);
                      const roomTotal = (session.totalCost || 0) - ordersTotal;
                      
                      return (
                        <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium">{rooms.find(r => r.id === session.roomId)?.name}</div>
                            <div className="text-[10px] text-white/20 italic">{session.customerName}</div>
                          </td>
                          <td className="px-6 py-4 text-white/60 text-sm">{new Date(session.startTime).toLocaleTimeString()}</td>
                          <td className="px-6 py-4">
                            <div className="text-white font-mono text-sm">{formatCurrency(roomTotal)}</div>
                            <div className="text-[9px] text-white/40">{session.totalDurationMinutes} min @ {formatCurrency(session.ratePerHour)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn("font-mono text-sm", ordersTotal > 0 ? "text-emerald-400" : "text-white/20")}>
                              {formatCurrency(ordersTotal)}
                            </div>
                            {ordersTotal > 0 && (
                              <div className="text-[9px] text-white/40">{(session.orders || []).length} item terpilih</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-white text-base">{formatCurrency(session.totalCost || 0)}</div>
                          </td>
                        </tr>
                      );
                    })}
                    {sessions.filter(s => s.status === 'completed').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-white/20 italic">Belum ada transaksi selesai.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Low Stock Alert Bar */}
              {inventory.filter(item => item.stock <= 10).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between mb-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-500">Peringatan Stok Rendah</h4>
                      <p className="text-xs text-red-500/60 font-medium">Terdapat {inventory.filter(item => item.stock <= 10).length} item dengan stok kurang dari 10 unit.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setInventoryCategoryFilter('all');
                      setShowLowStockOnly(true);
                      const el = document.getElementById('inventory-table');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-red-400 transition-colors"
                  >
                    Lihat Detail
                  </button>
                </motion.div>
              )}

              {/* Inventory Stock Status */}
              <div id="inventory-table" className="premium-card !p-0 overflow-hidden mb-8">
                <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="space-y-1">
                    <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <Package size={16} /> Daftar Menu & Stok Inventory
                    </h3>
                    <p className="text-[10px] text-white/40">Total {inventory.length} menu terdaftar | Nilai aset: {formatCurrency(inventory.reduce((sum, item) => sum + (item.price * item.stock), 0))}</p>
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Low Stock Toggle */}
                    <button 
                      onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2",
                        showLowStockOnly 
                          ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      )}
                    >
                      <ShieldAlert size={12} />
                      Stok Menipis
                    </button>

                    {/* Category Dropdown */}
                    <div className="relative w-full md:w-40">
                      <select 
                        value={inventoryCategoryFilter}
                        onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/40 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="drink">Minuman</option>
                        <option value="food">Makanan</option>
                        <option value="other">Lainnya</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20" />
                    </div>

                    <div className="relative group w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={14} />
                      <input 
                        type="text" 
                        placeholder="Cari Menu..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 transition-all font-medium"
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
                      <tr>
                        <th className="px-6 py-4">Nama Barang</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Harga Satuan</th>
                        <th className="px-6 py-4">Unit</th>
                        <th className="px-6 py-4 text-right">Stok Tersedia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {inventory
                        .filter(item => {
                          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = inventoryCategoryFilter === 'all' || item.category === inventoryCategoryFilter;
                          const matchesLowStock = !showLowStockOnly || item.stock <= 10;
                          return matchesSearch && matchesCategory && matchesLowStock;
                        })
                        .map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-white">{item.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                              item.category === 'drink' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              item.category === 'food' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            )}>
                              {item.category === 'drink' ? 'Minuman' : item.category === 'food' ? 'Makanan' : 'Lainnya'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/70 text-sm font-mono">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4 text-white/40 text-[10px] font-bold uppercase">{item.unit || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={cn(
                                "font-bold font-mono text-lg",
                                item.stock <= 5 ? "text-red-500" : 
                                item.stock <= 15 ? "text-yellow-500" : 
                                "text-emerald-500"
                              )}>
                                {item.stock}
                              </span>
                              {item.stock <= 5 && (
                                <span className="text-[8px] text-red-500 font-bold uppercase tracking-tighter animate-pulse">Stok Menipis!</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Recapitulation */}
              <div className="space-y-8 pb-20">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-white/20">Rekapitulasi Penjualan Detail</h2>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue Summary Card */}
                  <div className="premium-card">
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Ringkasan Pendapatan</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] text-white/20 uppercase mb-1">Total Penjualan Ruangan</div>
                        <div className="text-xl font-mono font-bold text-white">{formatCurrency(sessions.reduce((sum, s) => {
                          const ordersVal = (s.orders || []).reduce((oSum, o) => oSum + (o.price * o.quantity), 0);
                          return sum + (s.totalCost || 0) - ordersVal;
                        }, 0))}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/20 uppercase mb-1">Total Penjualan Produk</div>
                        <div className="text-xl font-mono font-bold text-emerald-400">{formatCurrency(sessions.reduce((sum, s) => {
                          return sum + (s.orders || []).reduce((oSum, o) => oSum + (o.price * o.quantity), 0);
                        }, 0))}</div>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <div className="text-[9px] text-white/20 uppercase mb-1">Total Pendapatan Kotor</div>
                        <div className="text-3xl font-mono font-bold text-white">{formatCurrency(sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0))}</div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Card */}
                  <div className="premium-card">
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Statistik Operasional</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[8px] text-white/40 uppercase mb-1">Total Sesi</div>
                        <div className="text-2xl font-mono font-bold text-white">{sessions.length}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[8px] text-white/40 uppercase mb-1">Produk Terjual</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">{sessions.reduce((sum, s) => sum + (s.orders || []).reduce((oSum, o) => oSum + o.quantity, 0), 0)}</div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <div className="text-[8px] text-emerald-500/60 uppercase mb-2 font-bold tracking-widest">Item Terlaris</div>
                      {(() => {
                        const salesMap: Record<string, {name: string, qty: number}> = {};
                        sessions.forEach(s => {
                          (s.orders || []).forEach(o => {
                            if (!salesMap[o.id]) salesMap[o.id] = { name: o.name, qty: 0 };
                            salesMap[o.id].qty += o.quantity;
                          });
                        });
                        const topItem = Object.values(salesMap).sort((a, b) => b.qty - a.qty)[0];
                        return topItem ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-500 truncate mr-2">{topItem.name}</span>
                            <span className="text-xs font-mono font-bold text-emerald-500/60">{topItem.qty} pcs</span>
                          </div>
                        ) : (
                          <div className="text-xs text-white/20 italic">Belum ada data</div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Orders Detail Card (Small List) */}
                  <div className="premium-card overflow-hidden !p-0">
                    <div className="px-6 py-4 border-b border-white/5">
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Detail Penjualan Produk</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-[10px]">
                        <thead className="bg-black/40 text-white/20">
                          <tr>
                            <th className="px-4 py-2 text-left">Item</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {(() => {
                            const salesMap: Record<string, {name: string, qty: number, total: number}> = {};
                            sessions.forEach(s => {
                              (s.orders || []).forEach(o => {
                                if (!salesMap[o.id]) salesMap[o.id] = { name: o.name, qty: 0, total: 0 };
                                salesMap[o.id].qty += o.quantity;
                                salesMap[o.id].total += o.quantity * o.price;
                              });
                            });
                            return Object.values(salesMap).sort((a, b) => b.total - a.total).map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-2 text-white/60">{item.name}</td>
                                <td className="px-4 py-2 text-center font-mono">{item.qty}</td>
                                <td className="px-4 py-2 text-right font-mono text-emerald-400">{formatCurrency(item.total)}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {view === 'settings' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
            <div className="max-w-4xl mx-auto space-y-10 pb-20">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Pengaturan Tarif</h2>
                  <span className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Admin Only</span>
                </div>
                {currentUser.role === UserRole.ADMIN ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEFAULT_RATES.map((rate) => (
                      <div key={rate.type} className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <Mic2 className="text-white/40" size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold uppercase text-xs tracking-widest">{rate.type} Room</h4>
                            <p className="text-[10px] text-white/40">Tarif / Jam</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold">{formatCurrency(rate.ratePerHour)}</div>
                          <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all">
                            <Settings size={14} className="text-white/40" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-2xl flex flex-col items-center text-center gap-4">
                    <ShieldAlert className="text-red-500" size={48} strokeWidth={1} />
                    <div>
                      <h4 className="font-bold">Akses Dibatasi</h4>
                      <p className="text-sm text-white/40">Hanya Super Admin yang dapat mengubah struktur tarif.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Manajemen Ruangan</h2>
                  <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Admin & Manager</span>
                </div>

                {/* Add Room Form */}
                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Tambah Ruangan Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Nama Ruangan (e.g. Room 11)" 
                      id="new-room-name"
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/40"
                    />
                    <select 
                      id="new-room-type"
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/40 appearance-none"
                    >
                      {Object.values(RoomType).map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        const nameInput = document.getElementById('new-room-name') as HTMLInputElement;
                        const typeSelect = document.getElementById('new-room-type') as HTMLSelectElement;
                        if (nameInput.value) {
                          const newRoom: Room = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: nameInput.value,
                            type: typeSelect.value as RoomType,
                            status: RoomStatus.AVAILABLE
                          };
                          setRooms(prev => [...prev, newRoom]);
                          nameInput.value = '';
                        }
                      }}
                      className="bg-white text-black font-bold py-2 rounded-xl text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Tambah Ruangan
                    </button>
                  </div>
                </div>

                {/* Room List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rooms.map((room) => {
                    const isActive = room.status === RoomStatus.ACTIVE;
                    return (
                      <div key={room.id} className="bg-[#111] border border-white/5 p-3 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                            isActive ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"
                          )}>
                            {room.name.match(/\d+/)?.[0] || room.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{room.name}</div>
                            <div className="text-[10px] text-white/40 uppercase font-mono">{room.type}</div>
                          </div>
                        </div>
                        {!isActive && (
                          <button 
                            onClick={() => {
                              if (confirm(`Hapus ${room.name}?`)) {
                                setRooms(prev => prev.filter(r => r.id !== room.id));
                              }
                            }}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-white/20"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User & Password Management */}
              {currentUser.role === UserRole.ADMIN && (
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Manajemen User & Profile</h2>
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Master Admin</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {users.map((u) => (
                      <div key={u.id} className="bg-[#111] border border-white/5 p-6 rounded-3xl space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                          <div className="relative group">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            </div>
                            <div className={cn(
                              "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center p-1",
                              u.role === UserRole.ADMIN ? "bg-red-500" :
                              u.role === UserRole.MANAGER ? "bg-blue-500" :
                              "bg-emerald-500"
                            )}>
                              <ShieldCheck size={10} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{u.name}</h4>
                            <span className={cn(
                              "text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block",
                              u.role === UserRole.ADMIN ? "bg-red-500/20 text-red-500" :
                              u.role === UserRole.MANAGER ? "bg-blue-500/20 text-blue-500" :
                              "bg-emerald-500/20 text-emerald-500"
                            )}>
                              {u.role}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Nama User</label>
                            <input 
                              type="text" 
                              value={u.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setUsers(prev => prev.map(user => user.id === u.id ? { ...user, name: newName } : user));
                              }}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/40"
                              placeholder="Masukkan Nama"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Password Login</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={u.password || ''}
                                onChange={(e) => {
                                  const newPassword = e.target.value;
                                  setUsers(prev => prev.map(user => user.id === u.id ? { ...user, password: newPassword } : user));
                                }}
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-white/40 tracking-widest"
                                placeholder="PIN / Password"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">URL Foto (Avatar)</label>
                            <input 
                              type="text" 
                              value={u.avatar}
                              onChange={(e) => {
                                const newAvatar = e.target.value;
                                setUsers(prev => prev.map(user => user.id === u.id ? { ...user, avatar: newAvatar } : user));
                              }}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-white/40 truncate"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Management Section */}
              {currentUser.role === UserRole.ADMIN && (
                <div className="space-y-8 pt-10 border-t border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight">Manajemen Inventory</h2>
                      <p className="text-xs text-white/40">Sistem kontrol stok, transaksi, dan pelaporan barang</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-xl">
                      {[
                        { id: 'master', label: 'Data Master', icon: List },
                        { id: 'transaction', label: 'Transaksi', icon: ArrowUpDown },
                        { id: 'monitoring', label: 'Kontrol', icon: Activity },
                        { id: 'report', label: 'Laporan', icon: FileText },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setInventorySubMenu(tab.id as any)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                            inventorySubMenu === tab.id 
                              ? "bg-emerald-500 text-black shadow-lg" 
                              : "text-white/40 hover:text-white/60 hover:bg-white/5"
                          )}
                        >
                          <tab.icon size={12} />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB-MENU CONTENT */}
                  {inventorySubMenu === 'master' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex flex-1 items-center gap-3">
                          <div className="relative flex-1 max-w-sm group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="Cari nama item..." 
                              value={mgmtSearchQuery}
                              onChange={(e) => setMgmtSearchQuery(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                          </div>

                          <div className="relative w-40">
                            <select 
                              value={mgmtCategoryFilter}
                              onChange={(e) => setMgmtCategoryFilter(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/40 transition-all font-bold appearance-none cursor-pointer pr-10"
                            >
                              <option value="all">SEMUA KATEGORI</option>
                              <option value="drink">MINUMAN</option>
                              <option value="food">MAKANAN</option>
                              <option value="other">LAINNYA</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20" />
                          </div>
                          
                          <p className="text-[10px] text-white/40 font-medium hidden lg:block">
                            {inventory.filter(item => 
                              (mgmtCategoryFilter === 'all' || item.category === mgmtCategoryFilter) &&
                              (item.name.toLowerCase().includes(mgmtSearchQuery.toLowerCase()))
                            ).length} SKU
                          </p>
                        </div>
    
                        <button 
                          onClick={() => setShowAddItemModal(true)}
                          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-black hover:bg-emerald-400 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
                        >
                          <Plus size={16} />
                          TAMBAH ITEM BARU
                        </button>
                      </div>
    
                      <div className="grid grid-cols-1 gap-4">
                        {inventory
                          .filter(item => 
                            (mgmtCategoryFilter === 'all' || item.category === mgmtCategoryFilter) &&
                            (item.name.toLowerCase().includes(mgmtSearchQuery.toLowerCase()))
                          )
                          .map((item) => (
                          <div key={item.id} className="bg-[#111] border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:border-white/10 transition-all">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Nama Barang</label>
                          <input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, name: newName } : inv));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white/40 outline-none"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Kategori</label>
                          <select 
                            value={item.category}
                            onChange={(e) => {
                              const newCat = e.target.value as any;
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, category: newCat } : inv));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white/40 outline-none"
                          >
                            <option value="drink">Minuman</option>
                            <option value="food">Makanan</option>
                            <option value="other">Lainnya</option>
                          </select>
                        </div>

                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Unit</label>
                          <input 
                            type="text" 
                            value={item.unit || ''}
                            placeholder="Unit"
                            onChange={(e) => {
                              const newUnit = e.target.value;
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, unit: newUnit } : inv));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white/40 outline-none"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest text-emerald-400">Harga Beli</label>
                          <input 
                            type="number" 
                            value={item.purchasePrice || ''}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, purchasePrice: newPrice } : inv));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:border-emerald-500/50 outline-none text-emerald-400"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest text-orange-400">Harga Jual</label>
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, price: newPrice } : inv));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:border-orange-500/50 outline-none text-orange-400"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Stok</label>
                          <input 
                            type="number" 
                            value={item.stock}
                            onChange={(e) => {
                              const newStock = Number(e.target.value);
                              setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stock: newStock } : inv));
                            }}
                            className={cn(
                              "w-full bg-black/50 border rounded-lg px-3 py-2 text-sm font-mono outline-none",
                              item.stock <= 10 ? "border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "border-white/10"
                            )}
                          />
                        </div>

                        <div className="md:col-span-1 flex justify-end">
                          <button 
                            onClick={() => removeInventoryItem(item.id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                            title="Hapus Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inventorySubMenu === 'transaction' && (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                        <ArrowUpDown size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Input Transaksi Stok Baru</h3>
                        <p className="text-[10px] text-white/40 font-medium">Catat mutasi barang masuk, keluar, atau koreksi stok.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-4 space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Pilih Item Barang</label>
                        <select 
                          value={txItemId}
                          onChange={(e) => setTxItemId(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none cursor-pointer transition-all"
                        >
                          <option value="">Pilih Item...</option>
                          {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (Sisa: {item.stock} {item.unit})</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Tipe Mutasi</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'in', label: 'Masuk', color: 'text-emerald-400' },
                            { id: 'out', label: 'Keluar', color: 'text-red-400' },
                            { id: 'adjustment', label: 'Adj', color: 'text-blue-400' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTxType(t.id as any)}
                              className={cn(
                                "py-3 rounded-xl border text-[9px] font-bold uppercase transition-all",
                                txType === t.id 
                                  ? "bg-white/10 border-white/20 text-white" 
                                  : "bg-transparent border-white/5 text-white/20 hover:border-white/10"
                              )}
                            >
                              <span className={txType === t.id ? t.color : ""}>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Jumlah</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={txQty || ''}
                            onChange={(e) => setTxQty(Number(e.target.value))}
                            placeholder="0" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500/50 outline-none transition-all" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-bold uppercase">
                            {inventory.find(i => i.id === txItemId)?.unit || 'Unit'}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">No. Referensi / Faktur</label>
                        <input 
                          type="text" 
                          value={txRefNo}
                          onChange={(e) => setTxRefNo(e.target.value)}
                          placeholder="Contoh: INV/2024/001" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all uppercase" 
                        />
                      </div>

                      <div className="md:col-span-9 space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Keterangan / Catatan Tambahan</label>
                        <input 
                          type="text" 
                          value={txNote}
                          onChange={(e) => setTxNote(e.target.value)}
                          placeholder="Tambahkan catatan jika diperlukan (Supplier, Kondisi, dll)" 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all" 
                        />
                      </div>

                      <div className="md:col-span-3 flex items-end">
                        <button 
                          onClick={handleInventoryTransaction}
                          disabled={!txItemId || txQty <= 0}
                          className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/10 transition-all text-xs shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                        >
                          SUBMIT TRANSAKSI
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="premium-card !p-0 overflow-hidden">
                    <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Jurnal Log Mutasi Barang
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Masuk
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Keluar
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-[#050505] text-[10px] text-white/20 uppercase tracking-widest sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-8 py-4">Waktu & Ref</th>
                            <th className="px-8 py-4">Nama Barang</th>
                            <th className="px-8 py-4 text-center">Tipe</th>
                            <th className="px-8 py-4 text-right">Qty</th>
                            <th className="px-8 py-4">Keterangan</th>
                            <th className="px-8 py-4">Operator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs text-white/60 font-medium">
                          {inventoryLogs.length > 0 ? inventoryLogs.map(log => (
                            <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-5">
                                <div className="text-white/80 font-mono text-[10px] mb-0.5">{new Date(log.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                <div className="text-[9px] text-white/30 uppercase font-bold">{log.refNo || 'TANPA REF'}</div>
                              </td>
                              <td className="px-8 py-5">
                                <div className="text-white font-bold">{log.itemName}</div>
                                <div className="text-[9px] text-white/30 uppercase tracking-wider">{inventory.find(i => i.id === log.itemId)?.category || '-'}</div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border",
                                  log.type === 'in' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" :
                                  log.type === 'out' ? "bg-red-500/5 text-red-500 border-red-500/20" :
                                  "bg-blue-500/5 text-blue-500 border-blue-500/20"
                                )}>
                                  {log.type === 'in' ? 'STOCK-IN' : log.type === 'out' ? 'STOCK-OUT' : 'ADJUST'}
                                </span>
                              </td>
                              <td className={cn(
                                "px-8 py-5 text-right font-mono text-sm font-bold",
                                log.type === 'in' ? "text-emerald-400" : log.type === 'out' ? "text-red-400" : "text-blue-400"
                              )}>
                                {log.type === 'out' ? '-' : log.type === 'in' ? '+' : ''}{log.quantity}
                              </td>
                              <td className="px-8 py-5">
                                <div className="max-w-[200px] truncate text-white/40 italic text-[11px]">
                                  {log.note || '-'}
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-bold text-white/40 border border-white/10 uppercase">
                                    {log.performedBy[0]}
                                  </div>
                                  <span className="text-[10px] uppercase font-bold text-white/30">{log.performedBy}</span>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="px-8 py-20 text-center text-white/20 italic uppercase tracking-[0.2em] text-[10px]">
                                Belum ada data transaksi mutasi barang.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {inventorySubMenu === 'monitoring' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nilai Aset (Jual)</h3>
                        <Activity size={14} className="text-white/20" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-white mb-2">
                        {formatCurrency(inventory.reduce((sum, i) => sum + (i.price * i.stock), 0))}
                      </div>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Total Nilai Pasar</p>
                    </div>

                    <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Modal Tertanam</h3>
                        <ChevronRight size={14} className="text-white/20" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-white mb-2">
                        {formatCurrency(inventory.reduce((sum, i) => sum + ((i.purchasePrice || 0) * i.stock), 0))}
                      </div>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Total Harga Beli</p>
                    </div>

                    <div className="bg-[#111] border border-emerald-500/10 p-6 rounded-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Estimasi Profit</h3>
                        <TrendingUp size={14} className="text-emerald-500/40" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-emerald-500 mb-2">
                        {formatCurrency(inventory.reduce((sum, i) => sum + (i.price - (i.purchasePrice || 0)) * i.stock, 0))}
                      </div>
                      <p className="text-[9px] text-emerald-500/20 uppercase tracking-widest font-bold">Margin Potensial</p>
                    </div>

                    <div className="bg-[#111] border border-red-500/10 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Kritis</h3>
                        <ShieldAlert size={14} className="text-red-500/40" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-red-500 mb-2">{inventory.filter(i => i.stock <= 10).length}</div>
                      <p className="text-[9px] text-red-500/40 uppercase tracking-widest font-bold">Item Stok Rendah</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="premium-card h-[350px]">
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">Analisis Margin per Kategori (%)</h4>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={['drink', 'food', 'other'].map(cat => {
                            const items = inventory.filter(i => i.category === cat);
                            const totalRev = items.reduce((sum, i) => sum + (i.price * i.stock), 0);
                            const totalCost = items.reduce((sum, i) => sum + ((i.purchasePrice || 0) * i.stock), 0);
                            const margin = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;
                            return {
                              name: cat === 'drink' ? 'Minuman' : cat === 'food' ? 'Makanan' : 'Lainnya',
                              margin: Math.round(margin)
                            };
                          })}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#ffffff20" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                            />
                            <YAxis 
                              stroke="#ffffff20" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip 
                              cursor={{fill: '#ffffff05'}}
                              contentStyle={{ 
                                backgroundColor: '#111', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontSize: '10px'
                              }}
                            />
                            <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                              {['drink', 'food', 'other'].map((_, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#f97316', '#a855f7'][index]} fillOpacity={0.8} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="premium-card">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Item dengan Margin Tertinggi</h4>
                        <div className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Profit per Unit</div>
                      </div>
                      <div className="space-y-3">
                        {[...inventory]
                          .sort((a, b) => (b.price - (b.purchasePrice || 0)) - (a.price - (a.purchasePrice || 0)))
                          .slice(0, 6)
                          .map(item => {
                            const margin = item.price - (item.purchasePrice || 0);
                            const marginPercent = item.price > 0 ? (margin / item.price) * 100 : 0;
                            return (
                              <div key={item.id} className="group relative">
                                <div className="flex items-center justify-between text-[11px] bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 transition-all">
                                  <div>
                                    <span className="text-white font-medium block">{item.name}</span>
                                    <span className="text-[9px] text-white/30 uppercase mt-1 inline-block">Margin: {marginPercent.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono text-emerald-400 font-bold">{formatCurrency(margin)}</div>
                                    <div className="text-[9px] text-white/20 uppercase">per {item.unit || 'unit'}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {inventorySubMenu === 'report' && (
                <div className="space-y-6">
                  <div className="premium-card !p-0 overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest">Financial Inventory Report</h3>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Laporan komprehensif aset & profitabilitas</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10">
                        <Download size={12} /> export report (pdf)
                      </button>
                    </div>
                    <div className="p-8 space-y-10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Total Unit Stok</div>
                            <div className="text-3xl font-mono font-bold text-white">{inventory.reduce((sum, i) => sum + i.stock, 0)} <span className="text-xs text-white/20 tracking-normal font-sans">pcs</span></div>
                            <div className="mt-1 text-[9px] text-emerald-500 uppercase font-bold">+12.5% vs last month</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Average Margin</div>
                            <div className="text-3xl font-mono font-bold text-white">
                              {Math.round(inventory.reduce((sum, i) => sum + (i.price > 0 ? ((i.price - (i.purchasePrice || 0)) / i.price) : 0), 0) / (inventory.length || 1) * 100)}%
                            </div>
                            <div className="mt-1 text-[9px] text-white/20 uppercase font-bold">Gross Margin Rata-rata</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Potensi Pendapatan</div>
                            <div className="text-3xl font-mono font-bold text-white">{formatCurrency(inventory.reduce((sum, i) => sum + (i.price * i.stock), 0))}</div>
                            <div className="mt-1 text-[9px] text-white/20 uppercase font-bold">Nilai Jual Seluruh Stok</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Potensi Laba Kotor</div>
                            <div className="text-3xl font-mono font-bold text-emerald-400">{formatCurrency(inventory.reduce((sum, i) => sum + (i.price - (i.purchasePrice || 0)) * i.stock, 0))}</div>
                            <div className="mt-1 text-[9px] text-emerald-500/40 uppercase font-bold tracking-widest">Optimized Asset</div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-10">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                           <FileText size={14} /> Breakdown per Kategori Produk
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {['drink', 'food', 'other'].map(cat => {
                            const items = inventory.filter(i => i.category === cat);
                            const valSell = items.reduce((sum, i) => sum + (i.price * i.stock), 0);
                            const valBuy = items.reduce((sum, i) => sum + ((i.purchasePrice || 0) * i.stock), 0);
                            const profit = valSell - valBuy;

                            return (
                              <div key={cat} className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                                <div className="text-[10px] text-white font-bold uppercase mb-4 flex items-center justify-between">
                                  <span>{cat === 'drink' ? 'Minuman (Beverages)' : cat === 'food' ? 'Makanan (Appetizers)' : 'Lain-lain (Accessories)'}</span>
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    cat === 'drink' ? "bg-blue-500" : cat === 'food' ? "bg-orange-500" : "bg-purple-500"
                                  )}></div>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between text-xs items-end">
                                    <span className="text-white/20">Item SKU:</span>
                                    <span className="text-white font-mono font-bold">{items.length} Type</span>
                                  </div>
                                  <div className="flex justify-between text-xs items-end">
                                    <span className="text-white/20">Nilai Jual:</span>
                                    <span className="text-white font-mono">{formatCurrency(valSell)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs items-end">
                                    <span className="text-white/20">Nilai Beli:</span>
                                    <span className="text-white/60 font-mono italic">{formatCurrency(valBuy)}</span>
                                  </div>
                                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">Est. Profit:</span>
                                    <span className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(profit)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white uppercase tracking-tight">Kesehatan Inventory: Optimal</h5>
                            <p className="text-[10px] text-white/40">Seluruh data stok sesuai dengan database master dan mutasi terakhir.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mb-1">Terakhir diperbarui</p>
                          <p className="text-xs font-mono text-white/60">{new Date().toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Inventory Item Modal */}
          <AnimatePresence>
            {showAddItemModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowAddItemModal(false)}
                   className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95, y: 20 }}
                   className="bg-[#111] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10"
                >
                  <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Tambah Data Master Baru</h3>
                      <p className="text-xs text-white/40">Input detail item inventory ke sistem.</p>
                    </div>
                    <button onClick={() => setShowAddItemModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Nama Lengkap Item</label>
                      <input 
                        type="text" 
                        autoFocus
                        value={newItemForm.name}
                        onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contoh: Coca Cola Zero 330ml"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 focus:bg-black/60 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Kategori</label>
                        <select 
                          value={newItemForm.category}
                          onChange={(e) => setNewItemForm(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none cursor-pointer"
                        >
                          <option value="drink">Minuman (Drink)</option>
                          <option value="food">Makanan (Food)</option>
                          <option value="other">Lainnya (Other)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Satuan (Unit)</label>
                        <input 
                          type="text" 
                          value={newItemForm.unit}
                          onChange={(e) => setNewItemForm(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="Btl / Pcs / Bks"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Harga Beli (Rp)</label>
                        <input 
                          type="number" 
                          value={newItemForm.purchasePrice || ''}
                          onChange={(e) => setNewItemForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Harga Jual (Rp)</label>
                        <input 
                          type="number" 
                          value={newItemForm.price || ''}
                          onChange={(e) => setNewItemForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Stok Awal</label>
                        <input 
                          type="number" 
                          value={newItemForm.stock || ''}
                          onChange={(e) => setNewItemForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          placeholder="0"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => setShowAddItemModal(false)}
                        className="flex-1 py-3.5 rounded-xl text-xs font-bold uppercase text-white/40 hover:bg-white/5 transition-all"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={saveNewInventoryItem}
                        disabled={!newItemForm.name}
                        className="flex-[2] bg-emerald-500 text-black py-3.5 rounded-xl text-xs font-bold uppercase hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/10 transition-all shadow-lg"
                      >
                        Simpan Data Master
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

              {/* Save Button */}
              <div className="pt-10 flex justify-center pb-20">
                <button 
                  onClick={handleSaveSettings}
                  className="group flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                >
                  <Save size={20} />
                  Simpan Semua Pengaturan
                </button>
              </div>

              {/* Toast Notification */}
              <AnimatePresence>
                {showSavedToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[100]"
                  >
                    <Check size={18} />
                    <span className="font-bold text-sm uppercase tracking-widest">Pengaturan Berhasil Disimpan</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Control Modal */}
      <AnimatePresence>
        {activeRoomId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveRoomId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-pill bg-white/10 text-white/60">{activeRoom?.type}</span>
                    {activeSession && <span className="status-pill bg-red-500 text-white">AKTIF</span>}
                  </div>
                  <h3 className="text-2xl font-bold">{activeRoom?.name}</h3>
                </div>
                <button onClick={() => setActiveRoomId(null)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X />
                </button>
              </div>

              <div className="p-6">
                {activeSession ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1 font-bold">
                          {activeSession.endTime ? 'Sisa Waktu' : 'Waktu Mulai'}
                        </div>
                        <div className={cn(
                          "text-md font-medium",
                          activeSession.endTime && (getRemainingTime(activeSession) || 0) < 600000 ? "text-red-500" : ""
                        )}>
                          {activeSession.endTime 
                            ? formatTime(Math.max(0, getRemainingTime(activeSession) || 0))
                            : new Date(activeSession.startTime).toLocaleTimeString()
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1 font-bold">Harga / Jam</div>
                        <div className="text-md font-medium italic">{formatCurrency(activeSession.ratePerHour)}</div>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between text-[9px] text-white/40 uppercase tracking-widest mb-4">
                        <span>Detail Tagihan</span>
                        <CreditCard size={12} />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Biaya Ruangan</span>
                          <span className="font-mono">{formatCurrency(calculateCurrentCost(activeSession) - (activeSession.orders || []).reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                        </div>
                        {(activeSession.orders || []).length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1">
                            {(activeSession.orders || []).map((order) => (
                              <div key={order.id} className="flex justify-between text-[10px]">
                                <span className="text-white/40">{order.name} x{order.quantity}</span>
                                <span className="font-mono text-white/60">{formatCurrency(order.price * order.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-3xl font-mono font-bold text-emerald-400 pt-2 border-t border-white/10">
                        {formatCurrency(calculateCurrentCost(activeSession))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20" />
                          <input 
                            type="text" 
                            placeholder="Cari menu..."
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1 pl-7 pr-2 text-[10px] focus:outline-none focus:border-white/20"
                          />
                        </div>
                        <select 
                          value={orderCategoryFilter}
                          onChange={(e) => setOrderCategoryFilter(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white/60 focus:outline-none focus:border-white/40 appearance-none cursor-pointer pr-5"
                        >
                          <option value="all">Semua</option>
                          <option value="drink">Minuman</option>
                          <option value="food">Makanan</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {inventory
                          .filter(item => 
                            (orderCategoryFilter === 'all' || item.category === orderCategoryFilter) &&
                            (item.name.toLowerCase().includes(orderSearchQuery.toLowerCase()))
                          )
                          .map((item) => (
                          <button
                            key={item.id}
                            disabled={item.stock <= 0}
                            onClick={() => addOrderToActiveSession(item)}
                            className={cn(
                              "relative p-2 text-left bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all overflow-hidden",
                              item.stock <= 0 && "opacity-40 grayscale cursor-not-allowed"
                            )}
                          >
                            <div className="text-[10px] font-bold truncate">{item.name}</div>
                            <div className="text-[9px] text-white/40">{formatCurrency(item.price)}</div>
                            <div className="mt-1 text-[8px] text-white/20 italic">Stok: {item.stock}</div>
                            {item.stock <= 5 && item.stock > 0 && (
                              <div className="absolute top-0 right-0 px-1 bg-red-500 text-[8px] font-bold text-white uppercase animate-pulse">Low</div>
                            )}
                            {item.stock <= 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] font-bold uppercase tracking-widest">Habis</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          const elapsedMs = currentTime - activeSession.startTime;
                          const elapsedHours = elapsedMs / (1000 * 60 * 60);
                          const billedHours = Math.max(1, Math.round(elapsedHours));
                          const roomCost = billedHours * activeSession.ratePerHour;
                          const ordersCost = (activeSession.orders || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          
                          setReceiptSession({
                            ...activeSession,
                            actualEndTime: currentTime,
                            totalCost: roomCost + ordersCost,
                            totalDurationMinutes: Math.round(elapsedMs / (1000 * 60))
                          });
                          setShowReceiptModal(true);
                        }}
                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Printer size={16} />
                        Nota
                      </button>
                      <button 
                        onClick={() => handleEndSession(activeSession.id)}
                        className="flex-[2] h-12 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
                      >
                        <Square size={16} fill="currentColor" />
                        Selesai & Bayar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Rate Control */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Harga per Jam</label>
                        {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || isPriceUnlocked) && (
                          <div className="flex items-center gap-1 text-[8px] text-emerald-500 font-mono">
                            <ShieldCheck size={10} /> {isPriceUnlocked && !(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) ? 'OVERRIDE KASIR (AKTIF)' : 'TEROTORISASI EDIT'}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30 text-xs font-mono">
                          Rp
                        </div>
                        <input 
                          type="number" 
                          value={customRate || 0}
                          onChange={(e) => setCustomRate(Number(e.target.value))}
                          disabled={!(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || isPriceUnlocked)}
                          className={cn(
                            "w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-white/40 transition-all",
                            !(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || isPriceUnlocked) && "opacity-60 cursor-not-allowed border-white/5"
                          )}
                        />

                        {!(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || isPriceUnlocked) && (
                          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-widest">
                              <Shield size={12} /> Persetujuan Dibutuhkan
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="password" 
                                placeholder="PIN Admin/Manager"
                                value={overridePassword}
                                onChange={(e) => {
                                  setOverridePassword(e.target.value);
                                  setOverrideError(false);
                                }}
                                className={cn(
                                  "flex-1 bg-black/40 border rounded-lg px-4 py-2 text-xs font-mono focus:outline-none transition-all",
                                  overrideError ? "border-red-500/50" : "border-white/10 focus:border-white/30"
                                )}
                              />
                              <button 
                                onClick={handleGrantOverride}
                                className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/20 px-4 py-2 rounded-lg text-[10px] font-bold transition-all transition-all"
                              >
                                UNLOCK
                              </button>
                            </div>
                            {overrideError && (
                              <p className="text-[8px] text-red-500 font-bold uppercase tracking-tighter">Password Salah atau Tidak Memiliki Akses!</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Selection Section */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Pesanan Tambahan</label>
                          {pendingOrders.length > 0 && (
                            <span className="text-[10px] text-emerald-500 font-bold">{pendingOrders.length} Item</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20" />
                            <input 
                              type="text" 
                              placeholder="Cari menu..."
                              value={orderSearchQuery}
                              onChange={(e) => setOrderSearchQuery(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-7 pr-2 text-[10px] focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <select 
                            value={orderCategoryFilter}
                            onChange={(e) => setOrderCategoryFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] text-white/60 focus:outline-none focus:border-white/40 appearance-none cursor-pointer pr-5"
                          >
                            <option value="all">Semua</option>
                            <option value="drink">Minuman</option>
                            <option value="food">Makanan</option>
                            <option value="other">Lainnya</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {inventory
                          .filter(item => 
                            (orderCategoryFilter === 'all' || item.category === orderCategoryFilter) &&
                            (item.name.toLowerCase().includes(orderSearchQuery.toLowerCase()))
                          )
                          .map((item) => (
                          <button
                            key={item.id}
                            disabled={item.stock <= 0}
                            onClick={() => addToPendingOrder(item)}
                            className={cn(
                              "group relative p-3 text-left bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all",
                              item.stock <= 0 && "opacity-40 grayscale cursor-not-allowed border-white/5 bg-transparent"
                            )}
                          >
                            <div className="text-xs font-bold mb-1 truncate">{item.name}</div>
                            <div className="text-[10px] text-emerald-400 font-mono italic">{formatCurrency(item.price)}</div>
                            <div className="mt-1 text-[8px] text-white/20 italic">Stok: {item.stock}</div>
                            
                            {pendingOrders.find(p => p.id === item.id) && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                                {pendingOrders.find(p => p.id === item.id)?.quantity}
                              </div>
                            )}

                            {item.stock <= 0 && (
                              <div className="absolute inset-x-0 bottom-0 py-1 bg-white/5 text-[8px] text-center font-bold uppercase tracking-widest text-white/40">Kosong</div>
                            )}
                          </button>
                        ))}
                      </div>

                      {pendingOrders.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 space-y-2">
                          <div className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-bold">Ringkasan Pesanan</div>
                          {pendingOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between">
                              <span className="text-[10px]">{order.name} x{order.quantity}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono">{formatCurrency(order.price * order.quantity)}</span>
                                <button 
                                  onClick={() => removeFromPendingOrder(order.id)}
                                  className="text-red-500/40 hover:text-red-500 p-1"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hrs) => (
                        <button 
                          key={hrs}
                          onClick={() => handleStartSession(activeRoomId!, hrs)}
                          className="py-2.5 rounded-lg border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs"
                        >
                          {hrs} Jam
                        </button>
                      ))}
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/5"></div>
                      <span className="relative z-10 bg-[#111] px-3 text-[9px] text-white/20 uppercase tracking-widest block w-fit mx-auto font-bold">Pilihan Lain</span>
                    </div>

                    <button 
                      onClick={() => handleStartSession(activeRoomId)}
                      className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Play size={16} fill="currentColor" />
                      Mulai Tanpa Batas (Open-Ended)
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && receiptSession && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={handleCloseReceipt}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white text-black w-full max-w-sm rounded-lg overflow-hidden shadow-2xl relative z-10 font-mono p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center space-y-1 mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter">HACHIKO BAR & KARAOKE</h2>
                <p className="text-[10px] font-bold">Jl. Udayana No.38, Baler Bale Agung, Kec. Negara, Kabupaten Jembrana, Bali 82218</p>
                <p className="text-[10px]">Telp: 081999394030</p>
              </div>

              <div className="border-t border-b border-black border-dashed py-3 mb-4 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>NO. TRM :</span>
                  <span>#{receiptSession.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>TANGGAL :</span>
                  <span>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>WAKTU :</span>
                  <span>{new Date().toLocaleTimeString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROOM :</span>
                  <span className="font-bold">{rooms.find(r => r.id === receiptSession.roomId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>OPERATOR :</span>
                  <span>{currentUser.name.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-[10px] font-black border-b border-black border-dotted mb-2 pb-1 uppercase">Sewa Room</div>
                  <div className="text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span>Check In:</span>
                      <span>{new Date(receiptSession.startTime).toLocaleTimeString('id-ID')}</span>
                    </div>
                    {receiptSession.actualEndTime && (
                      <div className="flex justify-between">
                        <span>Check Out:</span>
                        <span>{new Date(receiptSession.actualEndTime).toLocaleTimeString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold">
                      <span>Durasi:</span>
                      <span>{receiptSession.totalDurationMinutes || 0} Menit</span>
                    </div>
                    <div className="flex justify-between text-right pt-1">
                      <span className="flex-1 text-left text-[9px]">Biaya Ruangan:</span>
                      <span className="font-black">
                        {formatCurrency((receiptSession.totalCost || 0) - (receiptSession.orders || []).reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {receiptSession.orders && receiptSession.orders.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black border-b border-black border-dotted mb-2 pb-1 uppercase">Pesanan F&B</div>
                    <div className="space-y-2">
                      {receiptSession.orders.map(order => (
                        <div key={order.id} className="text-[10px]">
                          <div className="flex justify-between">
                            <span>{order.name}</span>
                            <span>{formatCurrency(order.price * order.quantity)}</span>
                          </div>
                          <div className="text-[8px] text-gray-500">{order.quantity} x {formatCurrency(order.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-black pt-3 space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span>GRAND TOTAL</span>
                  <span>{formatCurrency(receiptSession.totalCost || 0)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>PAJAK (10%)</span>
                  <span>{formatCurrency((receiptSession.totalCost || 0) * 0.1)}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t-2 border-black border-double pt-2 mt-2">
                  <span>TOTAL AKHIR</span>
                  <span>{formatCurrency((receiptSession.totalCost || 0) * 1.1)}</span>
                </div>
              </div>

              <div className="text-center mt-10 space-y-2">
                <p className="text-[10px] font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                <p className="text-[8px]">Kritik & Saran: hachiko-karaoke.com</p>
                <div className="flex flex-col gap-2 pt-4 no-print">
                   <button 
                     onClick={() => window.print()}
                     className="w-full bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Printer size={14} /> REPRINT RECEIPT
                   </button>
                   <button 
                     onClick={handleCloseReceipt}
                     className="w-full bg-emerald-500 text-black px-6 py-2.5 rounded-xl text-[10px] font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      SELESAI & KEMBALI
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
