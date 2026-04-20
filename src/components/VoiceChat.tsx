"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
];

type PeerState = {
  pc: RTCPeerConnection;
  audioEl: HTMLAudioElement;
  candidateQueue: RTCIceCandidateInit[];
  makingOffer: boolean;
};

export function VoiceChat({ roomId }: { roomId: string }) {
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(true);

  const myId = useRef(`v-${Math.random().toString(36).slice(2, 10)}`);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, PeerState>());
  const esRef = useRef<EventSource | null>(null);
  const connectedRef = useRef(false);

  /* ── send WebRTC signal via API ──────────────────────────────── */
  const sendSignal = useCallback(
    async (to: string, type: string, data: unknown) => {
      try {
        await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: roomId,
            from: myId.current,
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

  /* ── remove a peer connection ────────────────────────────────── */
  const removePeer = useCallback((id: string) => {
    const p = peersRef.current.get(id);
    if (!p) return;
    p.pc.close();
    p.audioEl.srcObject = null;
    p.audioEl.remove();
    peersRef.current.delete(id);
  }, []);

  /* ── create RTCPeerConnection for a remote peer ──────────────── */
  const createPC = useCallback(
    (remoteId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing.pc;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Attach local tracks
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          pc.addTrack(track, streamRef.current);
        }
      }

      // Create audio element for remote audio
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.setAttribute("playsinline", "");
      // Temporarily muted to satisfy autoplay, unmuted once we get audio
      audioEl.muted = true;
      document.body.appendChild(audioEl);

      pc.ontrack = (e) => {
        const remoteStream = e.streams[0] ?? new MediaStream([e.track]);
        audioEl.srcObject = remoteStream;
        // Unmute and play — should succeed because stream has audio
        audioEl.muted = false;
        audioEl.play().catch(() => {
          // Autoplay still blocked — retry on next user gesture
          const resume = () => {
            audioEl.muted = false;
            audioEl.play().catch(() => {});
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume, { once: true });
        });
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          removePeer(remoteId);
        }
      };

      const state: PeerState = { pc, audioEl, candidateQueue: [], makingOffer: false };
      peersRef.current.set(remoteId, state);
      return pc;
    },
    [sendSignal, removePeer]
  );

  /* ── send an offer to a specific peer ────────────────────────── */
  const sendOfferTo = useCallback(
    async (remoteId: string) => {
      const pc = createPC(remoteId);
      const state = peersRef.current.get(remoteId)!;
      state.makingOffer = true;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal(remoteId, "offer", {
          type: pc.localDescription!.type,
          sdp: pc.localDescription!.sdp,
        });
      } finally {
        state.makingOffer = false;
      }
    },
    [createPC, sendSignal]
  );

  /* ── flush queued ICE candidates ─────────────────────────────── */
  const flushCandidates = useCallback(async (state: PeerState) => {
    for (const c of state.candidateQueue) {
      try {
        await state.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        /* stale */
      }
    }
    state.candidateQueue = [];
  }, []);

  /* ── teardown ────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    for (const [id] of peersRef.current) removePeer(id);
    peersRef.current.clear();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    connectedRef.current = false;
    setConnected(false);
    setMuted(true);
  }, [removePeer]);

  /* ── connect to signaling + get mic ──────────────────────────── */
  const connect = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return; // mic denied
    }

    // Start unmuted (user just clicked to speak)
    connectedRef.current = true;
    setConnected(true);
    setMuted(false);

    const es = new EventSource(
      `/api/voice?room=${encodeURIComponent(roomId)}&peer=${myId.current}`
    );
    esRef.current = es;

    /* ── existing peers in room → send offers to all ── */
    es.addEventListener("peers", async (e) => {
      const ids: string[] = JSON.parse(e.data);
      for (const remoteId of ids) {
        await sendOfferTo(remoteId);
      }
    });

    /* ── new peer joined → we also send them an offer ── */
    es.addEventListener("peer-joined", async (e) => {
      const remoteId: string = JSON.parse(e.data);
      await sendOfferTo(remoteId);
    });

    es.addEventListener("peer-left", (e) => {
      removePeer(JSON.parse(e.data));
    });

    /* ── WebRTC signaling relay ── */
    es.addEventListener("signal", async (e) => {
      const { from, type, data } = JSON.parse(e.data);
      const pc = createPC(from);
      const state = peersRef.current.get(from)!;

      try {
        if (type === "offer") {
          // Handle glare: if we're also making an offer, use polite peer logic
          const offerCollision = state.makingOffer || pc.signalingState !== "stable";
          // The peer with the "smaller" ID is polite (yields)
          const polite = myId.current < from;

          if (offerCollision && !polite) {
            // Impolite peer ignores the incoming offer
            return;
          }

          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushCandidates(state);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(from, "answer", {
            type: pc.localDescription!.type,
            sdp: pc.localDescription!.sdp,
          });
        } else if (type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushCandidates(state);
        } else if (type === "ice-candidate") {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data));
          } else {
            state.candidateQueue.push(data);
          }
        }
      } catch (err) {
        console.error("WebRTC signal error:", err);
      }
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) cleanup();
    };
  }, [roomId, createPC, sendOfferTo, sendSignal, removePeer, flushCandidates, cleanup]);

  /* ── toggle: first click connects, subsequent clicks mute/unmute */
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

  /* ── UI — single mute/unmute toggle ──────────────────────────── */
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
