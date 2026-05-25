import { TOKEN_ADDRESSES } from '../config/tokens.js'

const SUPPORTED_TOKENS = Object.keys(TOKEN_ADDRESSES)
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY

// ─── GROQ AI PARSER ─────────────────────────────────────────────────────────
async function parseWithGroq(text) {
  if (!GROQ_KEY) throw new Error('No Groq key')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a DeFi swap intent parser. Read the user message carefully and extract the EXACT swap details.

SUPPORTED TOKENS ONLY: ETH, USDC, USDT, DAI, WBTC

TOKEN ALIASES — resolve these before output:
- "ethereum", "ether", "eth" → ETH
- "bitcoin", "btc", "wrapped bitcoin", "wbtc" → WBTC
- "usdc", "usd coin", "stable coin", "stablecoin", "stable" → USDC
- "usdt", "tether" → USDT
- "dai" → DAI

AMOUNT WORDS — resolve these to numbers:
- "half", "half a", "half an" → 0.5
- "a", "one", "an" → 1
- "two", "couple" → 2
- "three" → 3
- "quarter", "a quarter" → 0.25
- "ten" → 10
- "hundred", "a hundred" → 100
- "thousand" → 1000

DIRECTION:
- fromToken = what the user is GIVING / SELLING / CONVERTING FROM
- toToken = what the user WANTS / BUYING / CONVERTING TO
- "convert X into Y" → fromToken=X, toToken=Y
- "swap X to Y" → fromToken=X, toToken=Y
- "get Y with X" → fromToken=X, toToken=Y
- "exchange X for Y" → fromToken=X, toToken=Y

Return ONLY this JSON — no explanation, no extra fields:
{
  "amount": "0.5",
  "fromToken": "ETH",
  "toToken": "USDC"
}

STRICT RULES:
- amount must be a numeric string matching EXACTLY what the user said
- NEVER default amount to "1" if the user said something different
- NEVER swap fromToken and toToken — direction matters
- fromToken and toToken must never be identical`,
        },
        {
          role: 'user',
          content: `Parse this swap request: "${text}"`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Groq: ${err.error?.message || response.status}`)
  }

  const data = await response.json()
  const raw = data.choices[0].message.content

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Groq returned invalid JSON')
  }

  // Validate amount — reject if it came back as "1" but user clearly said something else
  const userLower = text.toLowerCase()
  const wordAmounts = {
    'half': '0.5', 'half a': '0.5', 'half an': '0.5',
    'quarter': '0.25', 'a quarter': '0.25',
    'two': '2', 'three': '3', 'ten': '10',
    'hundred': '100', 'a hundred': '100',
  }
  for (const [word, val] of Object.entries(wordAmounts)) {
    if (userLower.includes(word)) {
      parsed.amount = val
      break
    }
  }

  // Validate tokens
  if (!SUPPORTED_TOKENS.includes(parsed.fromToken)) parsed.fromToken = 'ETH'
  if (!SUPPORTED_TOKENS.includes(parsed.toToken))   parsed.toToken   = 'USDC'
  if (parsed.fromToken === parsed.toToken)           parsed.toToken   = parsed.fromToken === 'ETH' ? 'USDC' : 'ETH'
  if (!parsed.amount || isNaN(parseFloat(parsed.amount))) parsed.amount = '1'

  return parsed
}

// ─── REGEX FALLBACK ──────────────────────────────────────────────────────────
function parseWithRegex(text) {
  const input = text.toLowerCase().trim()

  // Resolve word-based amounts FIRST before any other processing
  const wordAmountMap = [
    [/\bhalf\s+an?\b/,    '0.5'],
    [/\ba\s+half\b/,      '0.5'],
    [/\bhalf\b/,          '0.5'],
    [/\ba\s+quarter\b/,   '0.25'],
    [/\bquarter\b/,       '0.25'],
    [/\ba\s+thousand\b/,  '1000'],
    [/\bthousand\b/,      '1000'],
    [/\ba\s+hundred\b/,   '100'],
    [/\bhundred\b/,       '100'],
    [/\bten\b/,           '10'],
    [/\bthree\b/,         '3'],
    [/\btwo\b/,           '2'],
    [/\bone\b/,           '1'],
    [/\ban?\b/,           '1'],
  ]

  let amount = null
  for (const [pattern, val] of wordAmountMap) {
    if (pattern.test(input)) { amount = val; break }
  }

  // Resolve token aliases
  const aliasMap = {
    'half an ethereum': 'half an eth',
    'half a ethereum': 'half an eth',
    'wrapped bitcoin': 'wbtc', bitcoin: 'wbtc', btc: 'wbtc',
    ethereum: 'eth', ether: 'eth',
    'usd coin': 'usdc',
    'stable coin': 'usdc', stablecoin: 'usdc', stable: 'usdc',
    tether: 'usdt',
  }
  let normalised = input
  for (const [alias, sym] of Object.entries(aliasMap)) {
    normalised = normalised.replaceAll(alias, sym)
  }

  // Numeric amount — look for number adjacent to a token name first
  if (!amount) {
    for (const token of SUPPORTED_TOKENS) {
      const m = normalised.match(new RegExp(`(\\d+\\.?\\d*)\\s*${token.toLowerCase()}`))
      if (m) { amount = m[1]; break }
    }
  }
  // Last resort — first number in string
  if (!amount) {
    const m = normalised.match(/(\d+\.?\d*)/)
    amount = m ? m[1] : '1'
  }

  // Split at directional keyword
  const splitMatch = normalised.match(/\b(to|into|for|→|►)\b/)
  const splitIdx   = splitMatch ? splitMatch.index : -1
  const beforeTo   = splitIdx !== -1 ? normalised.slice(0, splitIdx) : normalised
  const afterTo    = splitIdx !== -1 ? normalised.slice(splitIdx)    : ''

  // fromToken — look in BEFORE segment
  let fromToken = 'ETH'
  for (const token of SUPPORTED_TOKENS) {
    if (beforeTo.includes(token.toLowerCase())) { fromToken = token; break }
  }

  // toToken — look in AFTER segment
  let toToken = 'USDC'
  for (const token of SUPPORTED_TOKENS) {
    if (afterTo.includes(token.toLowerCase())) { toToken = token; break }
  }

  // Handle "get Y with X" pattern — reversed direction
  const getWithMatch = normalised.match(/get\s+(\w+)\s+with/)
  if (getWithMatch) {
    const wantedToken = SUPPORTED_TOKENS.find(t => t.toLowerCase() === getWithMatch[1])
    if (wantedToken) {
      toToken = wantedToken
      // fromToken stays as detected or default ETH
    }
  }

  if (fromToken === toToken) toToken = fromToken === 'ETH' ? 'USDC' : 'ETH'

  return { amount, fromToken, toToken }
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function parseIntent(text) {
  const clean = (text || '').trim()
  if (!clean) return { amount: '1', fromToken: 'ETH', toToken: 'USDC', raw: text, usedAI: false }

  let result
  try {
    result = await parseWithGroq(clean)
    result.usedAI = true
  } catch (err) {
    console.warn('Groq parse failed, using regex fallback:', err.message)
    result = parseWithRegex(clean)
    result.usedAI = false
  }

  return { ...result, raw: clean }
}

export function describeIntent(parsed) {
  return `Swap ${parsed.amount} ${parsed.fromToken} → ${parsed.toToken}`
}