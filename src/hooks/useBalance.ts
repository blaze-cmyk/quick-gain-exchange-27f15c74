import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Returns the user's live USD balance. Uses Supabase Realtime so the value
 * updates automatically when the webhook credits a deposit.
 */
export function useBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchBalance = async () => {
      const { data } = await supabase
        .from('balances')
        .select('usd_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (active) {
        setBalance(Number(data?.usd_balance ?? 0));
        setLoading(false);
      }
    };

    fetchBalance();

    const channel = supabase
      .channel(`balance:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'balances', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { usd_balance?: number } | null)?.usd_balance;
          if (next !== undefined) setBalance(Number(next));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { balance, loading };
}
