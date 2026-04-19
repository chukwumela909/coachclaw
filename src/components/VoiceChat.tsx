"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type PeerState = {
  pc: RTCPeerConnection;
  audioEl: HTMLAudioElement;
  candidateQueue: RTCIceCandidateInit[];
};

export function VoiceChat({ roomId }: { roomId: string }) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(true); // start muted

  const myId = useRef(`v-${Math.random().toString(36).slice(2, 10)}`);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, PeerState>());
  const esRef = useRef<EventSource | null>(null);

  /* ── helpers ──────────────────────────────────────────────────── */
  const updateCount = useCallback(() => {
    // no-op, kept for createPC signature
  }, []);

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

  const removePeer = useCallback(
    (id: string) => {
      const p = peersRef.current.get(id);
      if (!p) return;
      p.pc.close();
      p.audioEl.srcObject = null;
      p.audioEl.remove();
      peersRef.current.delete(id);
      updateCount();
    },
    [updateCount]
  );

  const createPC = useCallback(
    (remoteId: string): RTCPeerConnection => {
      // Reuse existing connection if present
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing.pc;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);

      // Local audio → remote
      streamRef.current
        ?.getTracks()
        .forEach((t) => pc.addTrack(t, streamRef.current!));

      // Remote audio → speaker
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        audioEl.play().catch(() => {});
      };

      // ICE trickle
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal(remoteId, "ice-candidate", e.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          removePeer(remoteId);
        }
      };

      peersRef.current.set(remoteId, { pc, audioEl, candidateQueue: [] });
      updateCount();
      return pc;
    },
    [sendSignal, removePeer, updateCount]
  );

  /* ── flush queued ICE candidates after remote description set ── */
  const flushCandidates = useCallback(async (state: PeerState) => {
    for (const c of state.candidateQueue) {
      try {
        await state.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        /* stale candidate */
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

    setJoined(false);
    setMuted(true);
  }, [removePeer]);

  /* ── join ─────────────────────────────────────────────────────── */
  const joinCall = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      return; // mic denied
    }

    // Start muted
    streamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = false;
    });

    setJoined(true);

    const es = new EventSource(
      `/api/voice?room=${encodeURIComponent(roomId)}&peer=${myId.current}`
    );
    esRef.current = es;

    /* existing peers → we initiate */
    es.addEventListener("peers", async (e) => {
      const ids: string[] = JSON.parse(e.data);
      for (const remoteId of ids) {
        const pc = createPC(remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(remoteId, "offer", {
          type: offer.type,
          sdp: offer.sdp,
        });
      }
    });

    /* new peer arrived — they will send us an offer */
    es.addEventListener("peer-joined", () => {
      /* handled in "signal" */
    });

    es.addEventListener("peer-left", (e) => {
      removePeer(JSON.parse(e.data));
    });

    /* WebRTC signaling */
    es.addEventListener("signal", async (e) => {
      const { from, type, data } = JSON.parse(e.data);
      const pc = createPC(from);
      const state = peersRef.current.get(from)!;

      try {
        if (type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushCandidates(state);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(from, "answer", {
            type: answer.type,
            sdp: answer.sdp,
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
  }, [roomId, createPC, sendSignal, removePeer, flushCandidates, cleanup]);

  /* ── mute toggle ─────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    if (!streamRef.current) return;
    const next = !muted;
    streamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    setMuted(next);
  }, [muted]);

  /* unmount cleanup */
  useEffect(() => () => cleanup(), [cleanup]);

  /* auto-join voice on mount */
  useEffect(() => {
    joinCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── UI — single mute/unmute toggle ──────────────────────────── */
  if (!joined) return null;

  return (
    <button
      onClick={toggleMute}
      title={muted ? "Unmute" : "Mute"}
      className={`h-[30px] w-[30px] rounded-full flex items-center justify-center transition-colors ${
        muted
          ? "bg-[#f5f5f5] text-[#898989] hover:bg-[#eee]"
          : "bg-[#0099ff]/10 text-[#0099ff] hover:bg-[#0099ff]/20"
      }`}
    >
      {muted ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  );
}
