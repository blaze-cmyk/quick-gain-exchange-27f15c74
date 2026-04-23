// supabase/functions/onramper-webhook/index.ts
//
// Receives Onramper transaction events and updates the corresponding
// `deposits` row + credits the user's USD balance on success.
//
// Configure in the Onramper dashboard:
//   URL:    https://<project>.supabase.co/functions/v1/onramper-webhook
//   Secret: stored as ONRAMPER_WEBHOOK_SECRET (HMAC-SHA256 of raw body)
//
// The webhook is public (verify_jwt = false) so Onramper can call it
// without a Supabase JWT — we authenticate via the HMAC signature instead.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-onramper-signature',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ONRAMPER_WEBHOOK_SECRET = Deno.env.get('ONRAMPER_WEBHOOK_SECRET');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ────────────────────────────────────────────────────────────
async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!ONRAMPER_WEBHOOK_SECRET) {
    // No secret configured — for early dev only. Log warning.
    console.warn('[onramper-webhook] ONRAMPER_WEBHOOK_SECRET is not set; skipping signature check');
    return true;
  }
  if (!signature) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(ONRAMPER_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time compare
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

type OnramperStatus = 'new' | 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'paid' | 'canceled';

function mapStatus(s: string): 'pending' | 'processing' | 'completed' | 'failed' | 'expired' {
  const v = s.toLowerCase() as OnramperStatus;
  if (v === 'completed' || v === 'paid') return 'completed';
  if (v === 'failed' || v === 'canceled') return 'failed';
  if (v === 'expired') return 'expired';
  if (v === 'processing' || v === 'pending') return 'processing';
  return 'pending';
}

function categorizeFailure(reason: string | undefined): 'kyc' | 'region' | 'payment_method' | 'limit' | 'other' {
  if (!reason) return 'other';
  const r = reason.toLowerCase();
  if (r.includes('kyc') || r.includes('verification') || r.includes('identity')) return 'kyc';
  if (r.includes('region') || r.includes('country') || r.includes('not available')) return 'region';
  if (r.includes('card') || r.includes('payment') || r.includes('declined')) return 'payment_method';
  if (r.includes('limit') || r.includes('exceed')) return 'limit';
  return 'other';
}

// ── Main handler ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-onramper-signature');

    const valid = await verifySignature(rawBody, signature);
    if (!valid) {
      console.error('[onramper-webhook] Invalid signature');
      return new Response(JSON.stringify({ error: 'invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(rawBody);
    console.log('[onramper-webhook] event received', JSON.stringify(event).slice(0, 500));

    // Onramper payload field names vary by event version. Be defensive.
    const txId: string | undefined =
      event.transactionId ?? event.txId ?? event.id ?? event.data?.transactionId;
    const status: string =
      event.status ?? event.eventType ?? event.data?.status ?? 'pending';
    const partnerContext = event.partnerContext ?? event.metadata ?? event.data?.partnerContext ?? {};
    const depositId: string | undefined = partnerContext.depositId ?? event.partnerOrderId;
    const fiatAmount: number | undefined = Number(
      event.fiatAmount ?? event.inAmount ?? event.data?.fiatAmount,
    ) || undefined;
    const cryptoAmount: number | undefined = Number(
      event.cryptoAmount ?? event.outAmount ?? event.data?.cryptoAmount,
    ) || undefined;
    const cryptoCurrency: string | undefined =
      event.cryptoCurrency ?? event.outCurrency ?? event.data?.cryptoCurrency;
    const failureReason: string | undefined = event.failureReason ?? event.reason ?? event.data?.failureReason;

    if (!depositId) {
      console.error('[onramper-webhook] Missing depositId in partnerContext');
      return new Response(JSON.stringify({ error: 'missing depositId in partnerContext' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mapped = mapStatus(status);

    // Look up deposit (we need user_id for the credit function)
    const { data: deposit, error: lookupErr } = await supabase
      .from('deposits')
      .select('id, user_id, status, fiat_amount, fiat_currency')
      .eq('id', depositId)
      .maybeSingle();

    if (lookupErr || !deposit) {
      console.error('[onramper-webhook] deposit not found', depositId, lookupErr);
      return new Response(JSON.stringify({ error: 'deposit not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mapped === 'completed') {
      // Credit balance atomically (idempotent inside the SQL function)
      const amountUsd = fiatAmount ?? Number(deposit.fiat_amount);
      const { error: rpcErr } = await supabase.rpc('credit_balance', {
        _deposit_id: deposit.id,
        _user_id: deposit.user_id,
        _amount_usd: amountUsd,
        _onramper_transaction_id: txId ?? null,
        _crypto_currency: cryptoCurrency ?? null,
        _crypto_amount: cryptoAmount ?? null,
        _raw_event: event,
      });
      if (rpcErr) {
        console.error('[onramper-webhook] credit_balance failed', rpcErr);
        return new Response(JSON.stringify({ error: rpcErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Plain status update for processing / failed / expired
      const update: Record<string, unknown> = {
        status: mapped,
        onramper_transaction_id: txId ?? null,
        raw_event: event,
      };
      if (mapped === 'failed' || mapped === 'expired') {
        update.failure_category = categorizeFailure(failureReason);
        update.failure_reason = failureReason ?? null;
      }
      const { error: updErr } = await supabase
        .from('deposits')
        .update(update)
        .eq('id', deposit.id);
      if (updErr) {
        console.error('[onramper-webhook] update failed', updErr);
        return new Response(JSON.stringify({ error: updErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, depositId, status: mapped }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[onramper-webhook] unhandled error', err);
    const message = err instanceof Error ? err.message : 'unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
