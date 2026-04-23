import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type DepositStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export type DepositFailureCategory = 'kyc' | 'region' | 'payment_method' | 'limit' | 'other';

export interface DepositRecord {
  id: string;
  user_id: string;
  fiat_amount: number;
  fiat_currency: string;
  crypto_currency: string | null;
  crypto_amount: number | null;
  status: DepositStatus;
  failure_category: DepositFailureCategory | null;
  failure_reason: string | null;
  credited_amount_usd: number | null;
  credited_at: string | null;
  onramper_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a pending deposit row before launching the Onramper widget,
 * and subscribes to its updates via realtime so the modal can reflect
 * pending → processing → completed/failed live.
 */
export function useDeposit() {
  const { user } = useAuth();
  const [activeDeposit, setActiveDeposit] = useState<DepositRecord | null>(null);

  // Subscribe to changes on the active deposit row
  useEffect(() => {
    if (!activeDeposit?.id) return;

    const channel = supabase
      .channel(`deposit:${activeDeposit.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deposits', filter: `id=eq.${activeDeposit.id}` },
        (payload) => {
          setActiveDeposit(payload.new as DepositRecord);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeDeposit?.id]);

  const createPendingDeposit = useCallback(
    async (input: { fiat_amount: number; fiat_currency: string; crypto_currency: string }) => {
      if (!user) throw new Error('You must be signed in to deposit');

      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          fiat_amount: input.fiat_amount,
          fiat_currency: input.fiat_currency,
          crypto_currency: input.crypto_currency,
          status: 'pending',
          provider: 'onramper',
        })
        .select()
        .single();

      if (error) throw error;
      setActiveDeposit(data as DepositRecord);
      return data as DepositRecord;
    },
    [user],
  );

  const reset = useCallback(() => setActiveDeposit(null), []);

  return { activeDeposit, createPendingDeposit, reset };
}
