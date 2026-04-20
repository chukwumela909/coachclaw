import { connectDB } from "@/lib/db/mongoose";
import { VoicePeer, VoiceSignal } from "@/models/VoicePeer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PEER_TIMEOUT_MS = 15_000;

export async function GET() {
  try {
    await connectDB();
    const cutoff = new Date(Date.now() - PEER_TIMEOUT_MS);
    await VoicePeer.deleteMany({ lastSeen: { $lt: cutoff } });
    const all = await VoicePeer.find({}, { room: 1, peer: 1, signals: 1, _id: 0 }).lean();
    const debug: Record<string, { peers: string[]; signalCounts: Record<string, number> }> = {};
    for (const doc of all) {
      const r = debug[doc.room] ?? (debug[doc.room] = { peers: [], signalCounts: {} });
      r.peers.push(doc.peer);
      r.signalCounts[doc.peer] = doc.signals.length;
    }
    return Response.json({ storage: "mongodb", rooms: debug, totalRooms: Object.keys(debug).length });
  } catch (err) {
    return Response.json({ error: "DB error", message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: { action?: string; room?: string; peer?: string; to?: string; type?: string; data?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { action, room, peer } = body;
  if (!room || !peer) return Response.json({ error: "Missing room or peer" }, { status: 400 });

  try { await connectDB(); } catch (err) {
    return Response.json({ error: "DB connection failed", message: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - PEER_TIMEOUT_MS);

  if (action === "poll") {
    const doc = await VoicePeer.findOneAndUpdate(
      { room, peer },
      { $set: { lastSeen: new Date(), signals: [] } },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    ).lean();
    const signals: VoiceSignal[] = doc?.signals ?? [];
    await VoicePeer.deleteMany({ room, lastSeen: { $lt: cutoff } });
    const others = await VoicePeer.find(
      { room, peer: { $ne: peer }, lastSeen: { $gte: cutoff } },
      { peer: 1, _id: 0 }
    ).lean();
    return Response.json({ storage: "mongodb", peers: others.map((p) => p.peer), signals });
  }

  if (action === "signal") {
    const { to, type, data } = body;
    if (!to || !type) return Response.json({ error: "Missing to or type" }, { status: 400 });
    const result = await VoicePeer.updateOne(
      { room, peer: to, lastSeen: { $gte: cutoff } },
      { $push: { signals: { $each: [{ from: peer, type, data }], $slice: -200 } } }
    );
    if (result.matchedCount === 0) return Response.json({ error: "Peer not found" }, { status: 404 });
    return Response.json({ ok: true });
  }

  if (action === "leave") {
    await VoicePeer.deleteOne({ room, peer });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}