// BonziBUDDY Groq Proxy — Cloudflare Worker
// API key is stored as a secret: wrangler secret put GROQ_API_KEY
// Never put the actual key value in this file or anywhere in the repo.

const ALLOWED_ORIGINS = ['https://kerrick.ca', 'https://binglep.github.io'];

const STEAM_VANITY = 'binglepuss';

async function handleSteam(env, corsHeaders) {
  const key = env.STEAM_API_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'Steam API key not configured' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  // Resolve vanity URL to Steam64 ID
  const vanityRes = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${STEAM_VANITY}`);
  const vanityData = await vanityRes.json();
  const steamId = vanityData.response?.steamid;
  if (!steamId) return new Response(JSON.stringify({ error: 'Could not resolve Steam ID' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const [summaryRes, gamesRes, recentRes, badgesRes] = await Promise.all([
    fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`),
    fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}`),
    fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${steamId}&count=3`),
    fetch(`https://api.steampowered.com/IPlayerService/GetBadges/v1/?key=${key}&steamid=${steamId}`),
  ]);

  const [summaryData, gamesData, recentData, badgesData] = await Promise.all([
    summaryRes.json(), gamesRes.json(), recentRes.json(), badgesRes.json(),
  ]);

  const player = summaryData.response.players[0];
  const STATUS = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play'];

  const result = {
    name: player.personaname,
    status: STATUS[player.personastate] ?? 'Offline',
    online: player.personastate > 0,
    country: player.loccountrycode ?? null,
    gameCount: gamesData.response.game_count ?? 0,
    level: badgesData.response.player_level ?? 0,
    recentGames: (recentData.response.games ?? []).map(g => ({
      name: g.name,
      hours: Math.round(g.playtime_forever / 60),
    })),
  };

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' },
  });
}

const SYSTEM_PROMPT =
  'You are BonziBUDDY, a fun and slightly mischievous purple gorilla assistant ' +
  'from the early 2000s internet. Keep responses short (2-3 sentences max), ' +
  'fun, and conversational. Occasionally reference early internet culture, ' +
  'dial-up modems, AIM, Napster, or Windows XP. You love to help but also ' +
  'love to joke around. Never break character.';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/steam') {
      return handleSteam(env, corsHeaders);
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders });
    }

    const { message, history = [] } = body;
    if (!message || typeof message !== 'string') {
      return new Response('Missing message', { status: 400, headers: corsHeaders });
    }

    // Convert history from Gemini format to OpenAI format
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.parts[0].text })),
      { role: 'user', content: message },
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 150,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok || !data.choices?.[0]?.message?.content) {
      return new Response(JSON.stringify({ error: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
