/**
 * Payment state management using Zustand
 */

import { create } from "zustand";
import { Transaction, MerchantAnalytics } from "@/types";

interface PaymentStore {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  merchantAnalytics: MerchantAnalytics | null;
  isLoading: boolean;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  setMerchantAnalytics: (analytics: MerchantAnalytics | null) => void;
  setLoading: (isLoading: boolean) => void;

  // Clear all data
  reset: () => void;
}

const initialState = {
  transactions: [],
  selectedTransaction: null,
  merchantAnalytics: null,
  isLoading: false,
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  setMerchantAnalytics: (merchantAnalytics) => set({ merchantAnalytics }),
  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
