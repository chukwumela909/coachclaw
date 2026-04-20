"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const POLL_INTERVAL = 1000;

type PeerState = {
  pc: RTCPeerConnection;
  audioEl: HTMLAudioElement;
  candidateQueue: RTCIceCandidateInit[];
};

export function VoiceChat({ roomId }: { roomId: string }) {
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(true);

  const myId = useRef(`v-${Math.random().toString(36).slice(2, 10)}`);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, PeerState>());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedRef = useRef(false);
  const knownPeersRef = useRef(new Set<string>());

  /* ── send a signal to a remote peer via API ──────────────────── */
  const sendSignal = useCallback(
    async (to: string, type: string, data: unknown) => {
      try {
        await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signal",
            room: roomId,
            peer: myId.current,
            to,
            type,
            data,
          }),
        });
      } catch {
        /* network hiccup */
      }
    },
    [roomId]
  );

  /* ── remove a peer ───────────────────────────────────────────── */
  const removePeer = useCallback((id: string) => {
    const p = peersRef.current.get(id);
    if (!p) return;
    p.pc.close();
    p.audioEl.srcObject = null;
    p.audioEl.remove();
    peersRef.current.delete(id);
    knownPeersRef.current.delete(id);
  }, []);

  /* ── create RTCPeerConnection for a remote peer ──────────────── */
  const createPC = useCallback(
    (remoteId: string): PeerState => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local audio tracks
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          pc.addTrack(track, streamRef.current);
        }
      }

      // Audio element for remote audio
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.muted = false;
      audioEl.volume = 1;
      audioEl.setAttribute("playsinline", "");
      document.body.appendChild(audioEl);

      // When we receive remote audio
      pc.ontrack = (e) => {
        console.log(`[VoiceChat] ontrack from ${remoteId}, streams: ${e.streams.length}`);
        const remoteStream = e.streams[0] ?? new MediaStream([e.track]);
        audioEl.srcObject = remoteStream;
        audioEl.play().catch(() => {
          // Retry on next user interaction
          const resume = () => {
            audioEl.play().catch(() => {});
            document.removeEventListener("click", resume);
            document.removeEventListener("touchstart", resume);
          };
          document.addEventListener("click", resume, { once: true });
          document.addEventListener("touchstart", resume, { once: true });
        });
      };

      // Send ICE candidates to remote peer
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[VoiceChat] ICE state for ${remoteId}: ${pc.iceConnectionState}`);
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        console.log(`[VoiceChat] Connection state for ${remoteId}: ${s}`);
        // Only remove on terminal states — "disconnected" is transient and self-heals
        if (s === "failed" || s === "closed") {
          removePeer(remoteId);
        }
      };

      const state: PeerState = {
        pc,
        audioEl,
        candidateQueue: [],
      };
      peersRef.current.set(remoteId, state);
      return state;
    },
    [sendSignal, removePeer]
  );

  /* ── send offer to a peer ────────────────────────────────────── */
  const sendOfferTo = useCallback(
    async (remoteId: string) => {
      const state = createPC(remoteId);
      try {
        const offer = await state.pc.createOffer();
        await state.pc.setLocalDescription(offer);
        await sendSignal(remoteId, "offer", {
          type: state.pc.localDescription!.type,
          sdp: state.pc.localDescription!.sdp,
        });
        console.log(`[VoiceChat] Sent offer to ${remoteId}`);
      } catch (err) {
        console.error("[VoiceChat] Failed to create offer:", err);
      }
    },
    [createPC, sendSignal]
  );

  /* ── process a received signal ───────────────────────────────── */
  const handleSignal = useCallback(
    async (signal: { from: string; type: string; data: unknown }) => {
      const { from, type, data } = signal;
      const state = createPC(from);
      const { pc } = state;

      try {
        if (type === "offer") {
          console.log(`[VoiceChat] Received offer from ${from}`);
          // If we already have a local offer and we're the offerer (lower ID),
          // ignore the incoming offer — we expect an answer instead.
          if (pc.signalingState === "have-local-offer" && myId.current < from) {
            console.log(`[VoiceChat] Ignoring offer from ${from} — I'm the offerer`);
            return;
          }

          // If we had our own pending offer but we're the answerer, rollback
          if (pc.signalingState === "have-local-offer") {
            await pc.setLocalDescription({ type: "rollback" });
          }

          await pc.setRemoteDescription(
            new RTCSessionDescription(data as RTCSessionDescriptionInit)
          );
          // Flush queued ICE candidates
          for (const c of state.candidateQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch {
              /* stale candidate */
            }
          }
          state.candidateQueue = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(from, "answer", {
            type: pc.localDescription!.type,
            sdp: pc.localDescription!.sdp,
          });
          console.log(`[VoiceChat] Sent answer to ${from}`);
        } else if (type === "answer") {
          console.log(`[VoiceChat] Received answer from ${from}`);
          if (pc.signalingState !== "have-local-offer") {
            console.log(`[VoiceChat] Ignoring answer — not in have-local-offer state`);
            return;
          }
          await pc.setRemoteDescription(
            new RTCSessionDescription(data as RTCSessionDescriptionInit)
          );
          // Flush queued ICE candidates
          for (const c of state.candidateQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch {
              /* stale candidate */
            }
          }
          state.candidateQueue = [];
        } else if (type === "ice-candidate") {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(
              new RTCIceCandidate(data as RTCIceCandidateInit)
            );
          } else {
            state.candidateQueue.push(data as RTCIceCandidateInit);
          }
        }
      } catch (err) {
        console.error("[VoiceChat] Signal error:", err);
      }
    },
    [createPC, sendSignal]
  );

  /* ── poll the signaling server ───────────────────────────────── */
  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "poll",
          room: roomId,
          peer: myId.current,
        }),
      });

      if (!res.ok) return;

      const { peers, signals } = (await res.json()) as {
        peers: string[];
        signals: { from: string; type: string; data: unknown }[];
      };

      // Process incoming signals FIRST (before sending new offers)
      for (const signal of signals) {
        knownPeersRef.current.add(signal.from);
        await handleSignal(signal);
      }

      // Detect new peers — only the LOWER id sends the offer
      for (const peerId of peers) {
        if (!knownPeersRef.current.has(peerId)) {
          knownPeersRef.current.add(peerId);
          if (myId.current < peerId) {
            // I have the lower ID, so I'm the offerer
            console.log(`[VoiceChat] Discovered peer ${peerId}, sending offer (I'm offerer)`);
            await sendOfferTo(peerId);
          } else {
            // I have the higher ID, just create the PC and wait for their offer
            console.log(`[VoiceChat] Discovered peer ${peerId}, waiting for their offer`);
            createPC(peerId);
          }
        }
      }

      // Remove peers that disappeared
      const currentPeers = new Set(peers);
      for (const known of Array.from(knownPeersRef.current)) {
        if (!currentPeers.has(known)) {
          removePeer(known);
        }
      }
    } catch {
      /* network error, retry next poll */
    }
  }, [roomId, sendOfferTo, removePeer, handleSignal, createPC]);

  /* ── cleanup ─────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    for (const [id] of peersRef.current) removePeer(id);
    peersRef.current.clear();
    knownPeersRef.current.clear();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    connectedRef.current = false;
    setConnected(false);
    setMuted(true);
  }, [removePeer]);

  /* ── connect: get mic + start polling ────────────────────────── */
  const connect = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      return; // mic denied
    }

    connectedRef.current = true;
    setConnected(true);
    setMuted(false);

    // Start polling for peers and signals
    await poll(); // immediate first poll
    pollingRef.current = setInterval(poll, POLL_INTERVAL);
  }, [poll]);

  /* ── click handler ───────────────────────────────────────────── */
  const handleClick = useCallback(async () => {
    if (!connectedRef.current) {
      await connect();
      return;
    }
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    setMuted(next);
  }, [connect, muted]);

  /* cleanup on unmount */
  useEffect(() => () => cleanup(), [cleanup]);

  /* ── UI ──────────────────────────────────────────────────────── */
  return (
    <button
      onClick={handleClick}
      title={!connected ? "Enable mic" : muted ? "Unmute" : "Mute"}
      className={`h-[30px] w-[30px] rounded-full flex items-center justify-center transition-colors ${
        !connected
          ? "bg-[#f5f5f5] text-[#898989] hover:bg-[#eee]"
          : muted
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : "bg-[#0099ff]/10 text-[#0099ff] hover:bg-[#0099ff]/20"
      }`}
    >
      {connected && !muted ? <Mic size={14} /> : <MicOff size={14} />}
    </button>
  );
}
