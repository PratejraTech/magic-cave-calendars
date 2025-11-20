export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { messages = [], quotes = [], sessionId = 'default' } = body;
  if (!env.OPENAI_API_KEY) {
    return new Response('Missing OPENAI_API_KEY', { status: 500 });
  }

  const quoteText = quotes.map((quote) => `- (${quote.response_type}) ${quote.text}`).join('\n');
  const systemPrompt =
    env.CHAT_SYSTEM_PROMPT ||
    `You are Daddy chatting lovingly with Harper.\n\nHelpful memories:\n${quoteText}`;

  const payload = {
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: `${systemPrompt}\n\nHelpful memories:\n${quoteText}` },
      ...messages.filter((msg) => msg.role !== 'system'),
    ],
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    return new Response(text, { status: response.status });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? '';
  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
