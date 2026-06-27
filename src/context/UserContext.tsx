import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Asset, Transaction } from '../types';
import { mockUser, mockAssets, mockTransactions, mockBalance } from '../data/mock';

type UserContextType = {
  user: User | null;
  assets: Asset[];
  transactions: Transaction[];
  balance: number;
  thisMonth: { earned: number; spent: number };
  setUser: (u: User) => void;
  addAsset: (a: Omit<Asset, 'id' | 'totalHours'>) => void;
  updateAsset: (id: string, a: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEYS = {
  user: 'ctb_user',
  assets: 'ctb_assets',
  transactions: 'ctb_transactions',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(10);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedAssets = localStorage.getItem(STORAGE_KEYS.assets);
    const storedTransactions = localStorage.getItem(STORAGE_KEYS.transactions);

    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }

    if (storedAssets) {
      try {
        setAssets(JSON.parse(storedAssets));
      } catch (e) {
        console.error('Failed to parse assets:', e);
      }
    } else {
      // Initialize with mock data for demo
      setAssets(mockAssets);
      localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(mockAssets));
    }

    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (e) {
        console.error('Failed to parse transactions:', e);
      }
    } else {
      // Initialize with mock data for demo
      setTransactions(mockTransactions);
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(mockTransactions));
    }

    // Calculate balance
    const earned = mockTransactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.hours, 0);
    const spent = mockTransactions.filter(t => t.type === 'spend').reduce((s, t) => s + t.hours, 0);
    setBalance(10 + earned - spent);
  }, []);

  // Calculate this month stats
  const thisMonth = {
    earned: mockBalance.thisMonth.earned,
    spent: mockBalance.thisMonth.spent,
  };

  const setUser = (u: User) => {
    setUserState(u);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
  };

  const addAsset = (a: Omit<Asset, 'id' | 'totalHours'>) => {
    const newAsset: Asset = {
      ...a,
      id: `a_${Date.now()}`,
      totalHours: 0,
    };
    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);
    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(updatedAssets));
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const updatedAssets = assets.map(a => a.id === id ? { ...a, ...updates } : a);
    setAssets(updatedAssets);
    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(updatedAssets));
  };

  const removeAsset = (id: string) => {
    const updatedAssets = assets.filter(a => a.id !== id);
    setAssets(updatedAssets);
    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(updatedAssets));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: `t_${Date.now()}`,
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updatedTransactions));

    // Update balance
    if (t.type === 'earn') {
      setBalance(prev => prev + t.hours);
    } else {
      setBalance(prev => prev - t.hours);
    }
  };

  const logout = () => {
    setUserState(null);
    setAssets([]);
    setTransactions([]);
    setBalance(10);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.assets);
    localStorage.removeItem(STORAGE_KEYS.transactions);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        assets,
        transactions,
        balance,
        thisMonth,
        setUser,
        addAsset,
        updateAsset,
        removeAsset,
        addTransaction,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
