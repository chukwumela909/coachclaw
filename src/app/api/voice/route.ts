export const dynamic = "force-dynamic";

/* ── In-memory signaling store (survives HMR via globalThis) ───── */
type PeerEntry = {
  lastSeen: number;
  signals: { from: string; type: string; data: unknown }[];
};

// room → peer → entry — persisted on globalThis so Turbopack HMR doesn't wipe it
const globalForVoice = globalThis as unknown as {
  __voiceRooms?: Map<string, Map<string, PeerEntry>>;
};
const rooms = (globalForVoice.__voiceRooms ??= new Map());

const PEER_TIMEOUT = 15_000; // remove peers not seen for 15s

function getRoom(roomId: string): Map<string, PeerEntry> {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId)!;
}

function pruneStale(room: Map<string, PeerEntry>, roomId: string) {
  const now = Date.now();
  for (const [id, entry] of room) {
    if (now - entry.lastSeen > PEER_TIMEOUT) {
      room.delete(id);
    }
  }
  if (room.size === 0) rooms.delete(roomId);
}

/* ── Single POST endpoint with action field ────────────────────── */
export async function POST(req: Request) {
  const body = await req.json();
  const { action, room: roomId, peer: peerId } = body;

  if (!roomId || !peerId) {
    return Response.json({ error: "Missing room or peer" }, { status: 400 });
  }

  const room = getRoom(roomId);
  pruneStale(room, roomId);

  /* ── POLL: register/heartbeat + get peer list + drain signals ── */
  if (action === "poll") {
    // Upsert peer
    if (!room.has(peerId)) {
      room.set(peerId, { lastSeen: Date.now(), signals: [] });
    }
    const entry = room.get(peerId)!;
    entry.lastSeen = Date.now();

    // Drain pending signals
    const signals = entry.signals.splice(0);

    // Get other peer IDs
    const peers = Array.from(room.keys()).filter((id) => id !== peerId);

    return Response.json({ peers, signals });
  }

  /* ── SIGNAL: queue a WebRTC signal for a target peer ─────────── */
  if (action === "signal") {
    const { to, type, data } = body;
    if (!to || !type) {
      return Response.json({ error: "Missing to or type" }, { status: 400 });
    }

    const target = room.get(to);
    if (!target) {
      return Response.json({ error: "Peer not found" }, { status: 404 });
    }

    // Cap queue size to prevent memory issues
    if (target.signals.length < 200) {
      target.signals.push({ from: peerId, type, data });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
