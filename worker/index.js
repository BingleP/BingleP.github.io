// BonziBUDDY Groq Proxy — Cloudflare Worker
// API key is stored as a secret: wrangler secret put GROQ_API_KEY
// Never put the actual key value in this file or anywhere in the repo.

const ALLOWED_ORIGINS = ['https://kerrick.ca', 'https://binglep.github.io'];

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
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
