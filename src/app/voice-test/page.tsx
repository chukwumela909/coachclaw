"use client";

import { useState, useRef, useEffect } from "react";

// ── Voice chat test page ──
// Supports BOTH same-browser (BroadcastChannel) AND cross-device (API polling)
// Open in TWO tabs or on TWO devices with the same room name

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // Free TURN relay for NAT traversal across different networks
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export default function VoiceTestPage() {
  const [room, setRoom] = useState("test-room");
  const [logs, setLogs] = useState<string[]>([]);
  const [state, setState] = useState("idle"); // idle | getting-mic | waiting | connecting | connected
  const [micOk, setMicOk] = useState(false);
  const [remoteAudio, setRemoteAudio] = useState(false);

  const myId = useRef(`u${Math.random().toString(36).slice(2, 6)}`);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownPeersRef = useRef(new Set<string>());
  const remoteIdRef = useRef<string | null>(null);
  const roomRef = useRef("");

  const log = (msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log(line);
    setLogs((prev) => [...prev.slice(-50), line]);
  };

  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    bcRef.current?.close();
    bcRef.current = null;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    iceQueue.current = [];
    knownPeersRef.current.clear();
    remoteIdRef.current = null;
    setState("idle");
    setMicOk(false);
    setRemoteAudio(false);
  };

  useEffect(() => () => cleanup(), []);

  // ── Send signal via both BroadcastChannel + API ──
  const emitSignal = (to: string, type: string, data?: unknown) => {
    const msg = { from: myId.current, to, type, data };
    // Same-browser instant delivery
    bcRef.current?.postMessage(msg);
    // Cross-device via API
    fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signal", room: roomRef.current, peer: myId.current, to, type, data }),
    }).catch(() => {});
  };

  const connect = async () => {
    cleanup();
    roomRef.current = room;
    log(`My ID: ${myId.current}`);
    log("Getting microphone...");
    setState("getting-mic");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      setMicOk(true);
      log(`✅ Mic acquired! Tracks: ${stream.getTracks().map((t) => `${t.kind}:${t.readyState}`).join(", ")}`);
    } catch (err) {
      log(`❌ Mic denied: ${err}`);
      setState("idle");
      return;
    }

    setState("waiting");

    const createPC = (isOfferer: boolean) => {
      if (pcRef.current) return pcRef.current;

      log(`Creating PeerConnection (I am ${isOfferer ? "OFFERER" : "ANSWERER"})`);
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      // Add mic tracks to connection
      stream.getTracks().forEach((t) => {
        log(`Adding track: ${t.kind} enabled=${t.enabled}`);
        pc.addTrack(t, stream);
      });

      // Remote audio element
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.volume = 1;
      document.body.appendChild(audio);
      audioRef.current = audio;

      pc.ontrack = (e) => {
        log(`🔊 RECEIVED REMOTE TRACK: kind=${e.track.kind} readyState=${e.track.readyState}`);
        const remoteStream = e.streams[0] || new MediaStream([e.track]);
        audio.srcObject = remoteStream;
        audio.play()
          .then(() => {
            log("✅ Audio element playing!");
            setRemoteAudio(true);
          })
          .catch((err) => {
            log(`⚠️ Audio play failed: ${err}. Click anywhere to retry.`);
            const retry = () => {
              audio.play().then(() => { log("✅ Audio resumed on click"); setRemoteAudio(true); }).catch(() => {});
              document.removeEventListener("click", retry);
            };
            document.addEventListener("click", retry);
          });
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && remoteIdRef.current) {
          log(`Sending ICE candidate: ${e.candidate.candidate.slice(0, 60)}...`);
          emitSignal(remoteIdRef.current, "ice", e.candidate.toJSON());
        } else if (!e.candidate) {
          log("ICE gathering complete");
        }
      };

      pc.oniceconnectionstatechange = () => {
        log(`ICE state: ${pc.iceConnectionState}`);
      };

      pc.onconnectionstatechange = () => {
        log(`Connection state: ${pc.connectionState}`);
        if (pc.connectionState === "connected") {
          setState("connected");
          log("🎉 CONNECTED! You should hear audio now.");
        }
        if (pc.connectionState === "failed") {
          log("❌ Connection FAILED — may need TURN server");
          setState("idle");
        }
      };

      pc.onsignalingstatechange = () => {
        log(`Signaling state: ${pc.signalingState}`);
      };

      return pc;
    };

    // ── Handle any signal message (from BC or API) ──
    const handleMessage = async (msg: { from: string; to?: string; type: string; data?: unknown }) => {
      if (msg.from === myId.current) return;
      if (msg.to && msg.to !== myId.current) return;

      if (msg.type === "hello" || msg.type === "hello-ack") {
        if (knownPeersRef.current.has(msg.from)) return;
        knownPeersRef.current.add(msg.from);
        remoteIdRef.current = msg.from;

        log(`Peer ${msg.from} discovered via ${msg.type}`);

        if (msg.type === "hello") {
          // Reply with ack (via both channels)
          const ack = { from: myId.current, type: "hello-ack" };
          bcRef.current?.postMessage(ack);
          // Also register via API poll so they see us
        }

        if (myId.current < msg.from) {
          const pc = createPC(true);
          setState("connecting");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            log(`Sending OFFER (sdp length: ${offer.sdp?.length})`);
            emitSignal(msg.from, "offer", { type: offer.type, sdp: offer.sdp });
          } catch (err) {
            log(`❌ Create offer failed: ${err}`);
          }
        } else {
          createPC(false);
          log("Waiting for offer from peer...");
        }
        return;
      }

      if (msg.type === "offer") {
        log(`Received OFFER from ${msg.from} (sdp length: ${(msg.data as { sdp?: string })?.sdp?.length})`);
        remoteIdRef.current = msg.from;
        knownPeersRef.current.add(msg.from);
        const pc = createPC(false);
        setState("connecting");

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
          log("Remote description set (offer)");

          for (const c of iceQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          iceQueue.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          log(`Sending ANSWER (sdp length: ${answer.sdp?.length})`);
          emitSignal(msg.from, "answer", { type: answer.type, sdp: answer.sdp });
        } catch (err) {
          log(`❌ Handle offer failed: ${err}`);
        }
        return;
      }

      if (msg.type === "answer") {
        log(`Received ANSWER from ${msg.from}`);
        const pc = pcRef.current;
        if (!pc) { log("No PC for answer"); return; }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
          log("Remote description set (answer)");

          for (const c of iceQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          iceQueue.current = [];
        } catch (err) {
          log(`❌ Handle answer failed: ${err}`);
        }
        return;
      }

      if (msg.type === "ice") {
        const pc = pcRef.current;
        if (pc?.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.data as RTCIceCandidateInit));
          } catch { /* stale */ }
        } else {
          iceQueue.current.push(msg.data as RTCIceCandidateInit);
          log("Queued ICE candidate (no remote description yet)");
        }
      }
    };

    // ── BroadcastChannel — instant same-browser signaling ──
    log("Opening BroadcastChannel + API polling...");
    const bc = new BroadcastChannel(`voice-test-${room}`);
    bcRef.current = bc;
    bc.onmessage = (e) => handleMessage(e.data);

    // ── API polling — cross-device signaling ──
    let pollCount = 0;
    const pollApi = async () => {
      pollCount++;
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "poll", room: roomRef.current, peer: myId.current }),
        });

        if (!res.ok) {
          log(`❌ API poll #${pollCount} failed: HTTP ${res.status} ${res.statusText}`);
          return;
        }

        const json = await res.json();
        const { peers, signals, storage } = json;

        // Log every poll response so we can debug
        if (pollCount <= 5 || (peers as string[]).length > 0 || (signals as unknown[]).length > 0) {
          log(`API poll #${pollCount}: storage=${storage} peers=[${(peers as string[]).join(",")}] signals=${(signals as unknown[]).length}`);
        }

        // Process signals first
        for (const sig of signals) {
          await handleMessage(sig);
        }

        // Discover new peers from API
        for (const peerId of (peers as string[])) {
          if (!knownPeersRef.current.has(peerId)) {
            log(`🔍 API discovered NEW peer: ${peerId}`);
            await handleMessage({ from: peerId, type: "hello" });
          }
        }
      } catch (err) {
        log(`❌ API poll #${pollCount} error: ${err}`);
      }
    };

    // Announce on both channels
    bc.postMessage({ from: myId.current, type: "hello" });
    log("Sent hello on BroadcastChannel");

    await pollApi(); // immediate first poll
    pollRef.current = setInterval(pollApi, 1500);
    log("API polling started (1.5s interval)");
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Voice Chat Test</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        Open this page in TWO browser tabs (same device) or on TWO devices. Enter the same room name. Click Connect in both.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room name"
          disabled={state !== "idle"}
          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6, flex: 1, fontSize: 14 }}
        />
        {state === "idle" ? (
          <button onClick={connect} style={{ padding: "8px 20px", background: "#0099ff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
            Connect
          </button>
        ) : (
          <button onClick={cleanup} style={{ padding: "8px 20px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
            Disconnect
          </button>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <div>State: <b>{state}</b></div>
        <div>Mic: <b style={{ color: micOk ? "green" : "red" }}>{micOk ? "✅ OK" : "❌ No"}</b></div>
        <div>Remote Audio: <b style={{ color: remoteAudio ? "green" : "red" }}>{remoteAudio ? "✅ Playing" : "❌ No"}</b></div>
        <div>My ID: <b>{myId.current}</b></div>
      </div>

      {/* Log output */}
      <div style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 8, height: 400, overflow: "auto", fontSize: 12, lineHeight: 1.6 }}>
        {logs.length === 0 ? (
          <div style={{ color: "#555" }}>Logs will appear here...</div>
        ) : (
          logs.map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>
    </div>
  );
}
