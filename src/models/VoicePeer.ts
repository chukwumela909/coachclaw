import mongoose, { Schema, Model } from "mongoose";

/**
 * VoicePeer — one document per (room, peer) pair.
 *
 * Each peer polls every ~1.5s, which updates `lastSeen` and fetches pending signals.
 * Signals addressed to this peer are pushed into `signals` by other peers and
 * drained on the next poll.
 *
 * Stale peers (no poll for >15s) are removed on each poll.
 */

export interface VoiceSignal {
  from: string;
  type: string;
  data?: unknown;
}

export interface VoicePeerDoc {
  room: string;
  peer: string;
  lastSeen: Date;
  signals: VoiceSignal[];
}

const SignalSchema = new Schema<VoiceSignal>(
  {
    from: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const VoicePeerSchema = new Schema<VoicePeerDoc>(
  {
    room: { type: String, required: true, index: true },
    peer: { type: String, required: true },
    lastSeen: { type: Date, required: true, default: () => new Date() },
    signals: { type: [SignalSchema], default: [] },
  },
  { versionKey: false }
);

VoicePeerSchema.index({ room: 1, peer: 1 }, { unique: true });
// TTL index — Mongo auto-deletes docs 60s after lastSeen
VoicePeerSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 60 });

export const VoicePeer: Model<VoicePeerDoc> =
  (mongoose.models.VoicePeer as Model<VoicePeerDoc>) ||
  mongoose.model<VoicePeerDoc>("VoicePeer", VoicePeerSchema);
