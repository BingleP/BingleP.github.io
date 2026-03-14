// BonziBUDDY Gemini Proxy — Cloudflare Worker
// API key is stored as a secret: wrangler secret put GEMINI_API_KEY
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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] },
          ],
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Return the raw Gemini error so it's visible during debugging
      return new Response(JSON.stringify({ error: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
