"use client";

import { useState, useRef, useEffect } from "react";

// ── Minimal WebRTC voice chat test page ──
// Uses ONLY BroadcastChannel for signaling (no server needed for same-browser test)
// Open this page in TWO tabs with the same room name, click Connect in both

const STUN: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
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
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    iceQueue.current = [];
    setState("idle");
    setMicOk(false);
    setRemoteAudio(false);
  };

  useEffect(() => () => cleanup(), []);

  const connect = async () => {
    cleanup();
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
    log("Opening BroadcastChannel for signaling...");

    const bc = new BroadcastChannel(`voice-test-${room}`);
    bcRef.current = bc;

    const createPC = (isOfferer: boolean) => {
      if (pcRef.current) return pcRef.current;

      log(`Creating PeerConnection (I am ${isOfferer ? "OFFERER" : "ANSWERER"})`);
      const pc = new RTCPeerConnection({ iceServers: STUN });
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
        if (e.candidate) {
          log(`Sending ICE candidate: ${e.candidate.candidate.slice(0, 50)}...`);
          bc.postMessage({ from: myId.current, type: "ice", data: e.candidate.toJSON() });
        } else {
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
          log("❌ Connection FAILED");
          setState("idle");
        }
      };

      pc.onsignalingstatechange = () => {
        log(`Signaling state: ${pc.signalingState}`);
      };

      return pc;
    };

    // Track known peers to avoid re-negotiation loops
    const knownPeers = new Set<string>();

    // Handle incoming messages
    bc.onmessage = async (e) => {
      const msg = e.data;
      if (msg.from === myId.current) return; // ignore own messages

      if (msg.type === "hello" || msg.type === "hello-ack") {
        // Already know this peer — ignore
        if (knownPeers.has(msg.from)) return;
        knownPeers.add(msg.from);

        log(`Peer ${msg.from} discovered via ${msg.type}`);

        // If they said hello (not ack), reply with ack so they discover us (no loop)
        if (msg.type === "hello") {
          bc.postMessage({ from: myId.current, type: "hello-ack" });
        }

        // Deterministic: lower ID is the offerer
        if (myId.current < msg.from) {
          const pc = createPC(true);
          setState("connecting");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            log(`Sending OFFER (sdp length: ${offer.sdp?.length})`);
            bc.postMessage({ from: myId.current, type: "offer", data: { type: offer.type, sdp: offer.sdp } });
          } catch (err) {
            log(`❌ Create offer failed: ${err}`);
          }
        } else {
          createPC(false); // pre-create, wait for their offer
          log("Waiting for offer from peer...");
        }
        return;
      }

      if (msg.type === "offer") {
        log(`Received OFFER from ${msg.from} (sdp length: ${msg.data.sdp?.length})`);
        const pc = createPC(false);
        setState("connecting");

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
          log("Remote description set (offer)");

          // Flush queued ICE candidates
          for (const c of iceQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          iceQueue.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          log(`Sending ANSWER (sdp length: ${answer.sdp?.length})`);
          bc.postMessage({ from: myId.current, type: "answer", data: { type: answer.type, sdp: answer.sdp } });
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
          await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
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
            await pc.addIceCandidate(new RTCIceCandidate(msg.data));
          } catch { /* stale */ }
        } else {
          iceQueue.current.push(msg.data);
          log("Queued ICE candidate (no remote description yet)");
        }
      }
    };

    // Announce presence
    log("Sending hello...");
    bc.postMessage({ from: myId.current, type: "hello" });
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Voice Chat Test</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        Open this page in TWO browser tabs. Enter the same room name. Click Connect in both.
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
