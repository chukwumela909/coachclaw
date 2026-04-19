export const dynamic = "force-dynamic";

/* ── In-memory peer registry per room ──────────────────────────── */
type PeerInfo = {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  heartbeat: ReturnType<typeof setInterval>;
};

const rooms = new Map<string, Map<string, PeerInfo>>();

function send(peer: PeerInfo, event: string, data: unknown) {
  try {
    peer.controller.enqueue(
      peer.encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  } catch {
    /* controller already closed */
  }
}

function removePeer(
  roomId: string,
  peerId: string,
  room: Map<string, PeerInfo>
) {
  const info = room.get(peerId);
  if (!info) return;
  clearInterval(info.heartbeat);
  try {
    info.controller.close();
  } catch {
    /* already closed */
  }
  room.delete(peerId);
  for (const [, p] of room) {
    send(p, "peer-left", peerId);
  }
  if (room.size === 0) rooms.delete(roomId);
}

/* ── GET  →  SSE stream for peer discovery + signal relay ──────── */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room");
  const peerId = url.searchParams.get("peer");

  if (!roomId || !peerId) {
    return Response.json({ error: "Missing room or peer" }, { status: 400 });
  }

  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  const room = rooms.get(roomId)!;
  const existingPeerIds = Array.from(room.keys());

  let cleaned = false;
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    removePeer(roomId!, peerId!, room);
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15_000);

      const info: PeerInfo = { controller, encoder, heartbeat };

      // Tell the new peer who's already here
      send(info, "peers", existingPeerIds);

      // Tell existing peers someone new arrived
      for (const [, p] of room) {
        send(p, "peer-joined", peerId);
      }

      room.set(peerId, info);
    },
    cancel() {
      cleanup();
    },
  });

  req.signal.addEventListener("abort", cleanup);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

/* ── POST  →  relay a WebRTC signal to a specific peer ─────────── */
export async function POST(req: Request) {
  const body = await req.json();
  const { room: roomId, from, to, type, data } = body;

  if (!roomId || !from || !to || !type) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const room = rooms.get(roomId);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

  const target = room.get(to);
  if (!target)
    return Response.json({ error: "Peer not found" }, { status: 404 });

  send(target, "signal", { from, type, data });
  return Response.json({ ok: true });
}
