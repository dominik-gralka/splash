import { NextRequest } from 'next/server';
import { getRoom, roomEvents } from '@/lib/game/gameState';

// Server-Sent Events endpoint for real-time room updates
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial room state
      const room = getRoom(roomId);
      if (room) {
        const data = `data: ${JSON.stringify(room)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      // Listen for room updates
      const eventName = `room:${roomId}`;
      const handleUpdate = (room: unknown) => {
        const data = `data: ${JSON.stringify(room)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      roomEvents.on(eventName, handleUpdate);

      // Send heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        roomEvents.off(eventName, handleUpdate);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
