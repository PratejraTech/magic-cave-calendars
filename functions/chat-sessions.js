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

  const { message, timestamp = new Date().toISOString(), sessionId = 'default' } = body;
  if (!message) {
    return new Response('Missing message', { status: 400 });
  }

  try {
    const kvKey = `session:${sessionId}`;
    const existing = await env.CHAT_SESSIONS.get(kvKey, 'json');
    const nextHistory = Array.isArray(existing) ? existing : [];
    nextHistory.push({ timestamp, message });
    await env.CHAT_SESSIONS.put(kvKey, JSON.stringify(nextHistory.slice(-200)));
    return new Response(JSON.stringify({ status: 'stored' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(`Failed to log message: ${error}`, { status: 500 });
  }
}
