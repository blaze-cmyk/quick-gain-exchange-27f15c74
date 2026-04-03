import { corsHeaders } from '@supabase/supabase-js/cors'

const TIINGO_API_KEY = Deno.env.get('TIINGO_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'forex' // 'forex' or 'crypto'

    let apiUrl: string
    if (type === 'crypto') {
      const tickers = url.searchParams.get('tickers') || ''
      apiUrl = `https://api.tiingo.com/tiingo/crypto/top?tickers=${tickers}&token=${TIINGO_API_KEY}`
    } else {
      const tickers = url.searchParams.get('tickers') || ''
      apiUrl = `https://api.tiingo.com/tiingo/fx/top?tickers=${tickers}&token=${TIINGO_API_KEY}`
    }

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
