import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;
  let lastCheckedTime = Date.now();

  // Polling local memory queue for any new updates
  const intervalId = setInterval(() => {
    if (isClosed) return;

    const completions = global.workoutCompletions || [];
    const newCompletions = completions.filter(c => c.timestamp > lastCheckedTime);

    if (newCompletions.length > 0) {
      newCompletions.forEach(comp => {
        try {
          writer.write(encoder.encode(`data: ${JSON.stringify(comp)}\n\n`));
        } catch (e) {
          isClosed = true;
          clearInterval(intervalId);
        }
      });
      lastCheckedTime = Date.now();
    }
  }, 1500);

  // Remove interval and close connection when the request is aborted
  request.signal.addEventListener('abort', () => {
    isClosed = true;
    clearInterval(intervalId);
    try {
      writer.close();
    } catch (e) {}
  });

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
