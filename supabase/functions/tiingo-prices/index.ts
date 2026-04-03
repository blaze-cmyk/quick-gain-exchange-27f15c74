const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIINGO_API_KEY = Deno.env.get('TIINGO_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'forex'
    const endpoint = url.searchParams.get('endpoint') || 'top' // 'top' or 'candles'

    let apiUrl: string

    if (endpoint === 'candles') {
      // Forex intraday candles
      const ticker = url.searchParams.get('ticker') || 'eurusd'
      const resampleFreq = url.searchParams.get('resampleFreq') || '1min'
      const now = new Date()
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      apiUrl = `https://api.tiingo.com/tiingo/fx/${ticker}/prices?startDate=${startDate}&resampleFreq=${resampleFreq}&token=${TIINGO_API_KEY}`
    } else if (type === 'crypto') {
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
