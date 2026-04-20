export const dynamic = "force-dynamic";

/* ── In-memory signaling store (survives HMR via globalThis) ───── */
type PeerEntry = {
  lastSeen: number;
  signals: { from: string; type: string; data: unknown }[];
};

// room → peer → entry — persisted on globalThis so Turbopack HMR doesn't wipe it
const globalForVoice = globalThis as unknown as {
  __voiceRooms?: Map<string, Map<string, PeerEntry>>;
  __voiceInstanceId?: string;
};
const rooms = (globalForVoice.__voiceRooms ??= new Map());
const INSTANCE_ID = (globalForVoice.__voiceInstanceId ??=
  `${process.pid}-${Math.random().toString(36).slice(2, 6)}`);

const PEER_TIMEOUT = 15_000;

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

/* ── GET: debug endpoint — visit /api/voice in browser ─────────── */
export async function GET() {
  const debug: Record<string, { peers: string[]; signalCounts: Record<string, number> }> = {};
  for (const [roomId, room] of rooms) {
    const peers: string[] = [];
    const signalCounts: Record<string, number> = {};
    for (const [peerId, entry] of room) {
      peers.push(peerId);
      signalCounts[peerId] = entry.signals.length;
    }
    debug[roomId] = { peers, signalCounts };
  }
  return Response.json({ instance: INSTANCE_ID, rooms: debug, totalRooms: rooms.size });
}

/* ── POST: poll + signal ───────────────────────────────────────── */
export async function POST(req: Request) {
  const body = await req.json();
  const { action, room: roomId, peer: peerId } = body;

  if (!roomId || !peerId) {
    return Response.json({ error: "Missing room or peer" }, { status: 400 });
  }

  const room = getRoom(roomId);
  pruneStale(room, roomId);

  /* ── POLL ── */
  if (action === "poll") {
    if (!room.has(peerId)) {
      room.set(peerId, { lastSeen: Date.now(), signals: [] });
    }
    const entry = room.get(peerId)!;
    entry.lastSeen = Date.now();

    const signals = entry.signals.splice(0);
    const peers = Array.from(room.keys()).filter((id) => id !== peerId);

    console.log(`[Voice API] poll room=${roomId} peer=${peerId.slice(0, 6)} peers=[${peers.map((p) => p.slice(0, 6)).join(",")}] signals=${signals.length}`);

    return Response.json({ instance: INSTANCE_ID, peers, signals });
  }

  /* ── SIGNAL ── */
  if (action === "signal") {
    const { to, type, data } = body;
    if (!to || !type) {
      return Response.json({ error: "Missing to or type" }, { status: 400 });
    }

    const target = room.get(to);
    if (!target) {
      console.log(`[Voice API] signal ${type} target ${to.slice(0, 6)} NOT FOUND in room ${roomId}`);
      return Response.json({ error: "Peer not found" }, { status: 404 });
    }

    if (target.signals.length < 200) {
      target.signals.push({ from: peerId, type, data });
    }

    console.log(`[Voice API] signal ${type} from=${peerId.slice(0, 6)} to=${to.slice(0, 6)}`);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
