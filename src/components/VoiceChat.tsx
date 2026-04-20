"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function VoiceChat({ roomId }: { roomId: string }) {
  const [status, setStatus] = useState<"off" | "connecting" | "live" | "muted">("off");

  // All mutable state lives in refs to avoid stale-closure issues
  const myId = useRef(`p${Math.random().toString(36).slice(2, 10)}`);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const audiosRef = useRef(new Map<string, HTMLAudioElement>());
  const bcRef = useRef<BroadcastChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const announceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);
  const knownRef = useRef(new Set<string>());
  const iceQueueRef = useRef(new Map<string, RTCIceCandidateInit[]>());

  // Ref-based signal handler — always points to the latest version
  const handleRef = useRef<((msg: { from: string; to?: string; type: string; data?: unknown }) => Promise<void>) | null>(null);

  const log = (...args: unknown[]) => {
    console.log(`%c[Voice:${myId.current}]`, "color:#0099ff;font-weight:bold", ...args);
  };

  // ── Send signal via BOTH BroadcastChannel (instant) and API (cross-device) ──
  const emit = (to: string, type: string, data?: unknown) => {
    const msg = { from: myId.current, to, type, data };
    bcRef.current?.postMessage(msg);
    fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signal", room: roomId, peer: myId.current, to, type, data }),
    }).catch(() => {});
  };

  // ── Clean up a single peer ──
  const cleanPeer = (id: string) => {
    peersRef.current.get(id)?.close();
    peersRef.current.delete(id);
    const audio = audiosRef.current.get(id);
    if (audio) { audio.srcObject = null; audio.remove(); }
    audiosRef.current.delete(id);
    iceQueueRef.current.delete(id);
    knownRef.current.delete(id);
  };

  // ── Create RTCPeerConnection for a remote peer ──
  const ensurePC = (remoteId: string): RTCPeerConnection => {
    if (peersRef.current.has(remoteId)) return peersRef.current.get(remoteId)!;

    log("Creating PC for", remoteId);
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));
    }

    // Audio element for remote sound
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.volume = 1;
    document.body.appendChild(audio);
    audiosRef.current.set(remoteId, audio);

    pc.ontrack = (e) => {
      log("🔊 ontrack from", remoteId, "kind:", e.track.kind);
      audio.srcObject = e.streams[0] || new MediaStream([e.track]);
      audio.play().catch(() => {
        document.addEventListener("click", () => audio.play().catch(() => {}), { once: true });
      });
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) emit(remoteId, "ice-candidate", e.candidate.toJSON());
    };

    pc.onconnectionstatechange = () => {
      log("PC", remoteId, "→", pc.connectionState);
      if (pc.connectionState === "connected") setStatus((s) => (s === "muted" ? "muted" : "live"));
      if (pc.connectionState === "failed" || pc.connectionState === "closed") cleanPeer(remoteId);
    };

    pc.oniceconnectionstatechange = () => {
      log("ICE", remoteId, "→", pc.iceConnectionState);
    };

    peersRef.current.set(remoteId, pc);
    return pc;
  };

  // ── Process a single signal message ──
  const processSignal = async (msg: { from: string; to?: string; type: string; data?: unknown }) => {
    if (!activeRef.current) return;
    if (msg.from === myId.current) return;
    if (msg.to && msg.to !== myId.current) return;

    const { from, type, data } = msg;

    if (type === "announce") {
      if (knownRef.current.has(from)) return;
      knownRef.current.add(from);
      log("Discovered peer", from, "| I'm offerer:", myId.current < from);

      if (myId.current < from) {
        // I'm the offerer
        const pc = ensurePC(from);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          emit(from, "offer", { type: offer.type, sdp: offer.sdp });
          log("Sent OFFER to", from);
        } catch (err) {
          log("Offer error:", err);
        }
      } else {
        ensurePC(from); // pre-create, wait for their offer
      }
      return;
    }

    if (type === "offer") {
      log("Got OFFER from", from);
      knownRef.current.add(from);
      const pc = ensurePC(from);

      if (pc.connectionState === "connected") return; // already connected

      if (pc.signalingState === "have-local-offer") {
        if (myId.current < from) { log("Ignoring offer (I'm offerer)"); return; }
        await pc.setLocalDescription({ type: "rollback" });
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));

      for (const c of iceQueueRef.current.get(from) || []) {
        try { await pc.addIceCandidate(c); } catch { /* stale */ }
      }
      iceQueueRef.current.delete(from);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      emit(from, "answer", { type: answer.type, sdp: answer.sdp });
      log("Sent ANSWER to", from);
      return;
    }

    if (type === "answer") {
      log("Got ANSWER from", from);
      const pc = peersRef.current.get(from);
      if (!pc || pc.signalingState !== "have-local-offer") {
        log("Ignoring answer (state:", pc?.signalingState, ")");
        return;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));

      for (const c of iceQueueRef.current.get(from) || []) {
        try { await pc.addIceCandidate(c); } catch { /* stale */ }
      }
      iceQueueRef.current.delete(from);
      return;
    }

    if (type === "ice-candidate") {
      const pc = peersRef.current.get(from);
      if (pc?.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit)); } catch { /* stale */ }
      } else {
        if (!iceQueueRef.current.has(from)) iceQueueRef.current.set(from, []);
        iceQueueRef.current.get(from)!.push(data as RTCIceCandidateInit);
      }
    }
  };

  // Keep ref pointing at the latest processSignal
  handleRef.current = processSignal;

  // ── Connect (first click) ──
  const connect = async () => {
    if (activeRef.current) return;
    log("Connecting...");
    setStatus("connecting");

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      log("Mic acquired, tracks:", streamRef.current.getTracks().length);
    } catch (err) {
      log("Mic denied:", err);
      setStatus("off");
      return;
    }

    activeRef.current = true;
    setStatus("live");

    // BroadcastChannel — instant same-browser signaling
    const bc = new BroadcastChannel(`voice-${roomId}`);
    bcRef.current = bc;
    bc.onmessage = (e) => handleRef.current?.(e.data);

    // Announce on BC immediately
    bc.postMessage({ from: myId.current, type: "announce" });
    log("Announced on BroadcastChannel");

    // Re-announce every 2s for late joiners
    announceTimerRef.current = setInterval(() => {
      bc.postMessage({ from: myId.current, type: "announce" });
    }, 2000);

    // API polling — cross-device signaling backup
    const pollApi = async () => {
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "poll", room: roomId, peer: myId.current }),
        });
        if (!res.ok) return;
        const { peers, signals } = await res.json();

        // Process queued signals from API
        for (const sig of signals) {
          await handleRef.current?.(sig);
        }

        // Discover new peers from API peer list
        for (const peerId of peers) {
          if (!knownRef.current.has(peerId)) {
            await handleRef.current?.({ from: peerId, type: "announce" });
          }
        }
      } catch { /* retry next poll */ }
    };

    await pollApi();
    pollTimerRef.current = setInterval(pollApi, 1500);
    log("Polling started");
  };

  // ── Disconnect ──
  const disconnect = () => {
    activeRef.current = false;
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    if (announceTimerRef.current) { clearInterval(announceTimerRef.current); announceTimerRef.current = null; }
    if (bcRef.current) { bcRef.current.close(); bcRef.current = null; }

    for (const id of peersRef.current.keys()) cleanPeer(id);
    peersRef.current.clear();
    audiosRef.current.clear();
    iceQueueRef.current.clear();
    knownRef.current.clear();

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("off");
  };

  // Log mount + cleanup on unmount
  useEffect(() => {
    log("VoiceChat MOUNTED for room:", roomId);
    return () => {
      log("VoiceChat UNMOUNTING");
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Click handler ──
  const handleClick = () => {
    if (status === "off") { connect(); return; }
    if (status === "live") {
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = false; });
      setStatus("muted");
      return;
    }
    if (status === "muted") {
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = true; });
      setStatus("live");
    }
  };

  return (
    <button
      onClick={handleClick}
      title={
        status === "off" ? "Click to enable mic" :
        status === "connecting" ? "Connecting..." :
        status === "muted" ? "Click to unmute" : "Click to mute"
      }
      className={`h-[30px] w-[30px] rounded-full flex items-center justify-center transition-colors ${
        status === "off"
          ? "bg-[#f5f5f5] text-[#898989] hover:bg-[#eee]"
          : status === "muted"
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            : status === "connecting"
              ? "bg-yellow-500/10 text-yellow-500 animate-pulse"
              : "bg-[#0099ff]/10 text-[#0099ff] hover:bg-[#0099ff]/20"
      }`}
    >
      {status === "live" ? <Mic size={14} /> : <MicOff size={14} />}
    </button>
  );
}
