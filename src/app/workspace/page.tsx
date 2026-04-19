"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Share2, Copy, Check, Users } from "lucide-react";
import { VoiceChat } from "@/components/VoiceChat";
import "tldraw/tldraw.css";

/* ── License key (auto-detected by tldraw from env, but we pass explicitly too) */
const LICENSE_KEY = process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY;

/* ── Lazy-load tldraw + sync (no SSR) ───────────────────────────── */
const TldrawLocal = dynamic(
  () => import("tldraw").then((mod) => {
    const { Tldraw } = mod;
    return { default: (props: { persistenceKey: string }) => <Tldraw persistenceKey={props.persistenceKey} licenseKey={LICENSE_KEY} /> };
  }),
  { ssr: false }
);

const TldrawMultiplayer = dynamic(
  () =>
    Promise.all([import("tldraw"), import("@tldraw/sync")]).then(
      ([{ Tldraw }, { useSyncDemo }]) => {
        function Multiplayer({ roomId }: { roomId: string }) {
          const store = useSyncDemo({ roomId });
          return <Tldraw store={store} licenseKey={LICENSE_KEY} />;
        }
        return { default: Multiplayer };
      }
    ),
  { ssr: false }
);

/* ── Utility ─────────────────────────────────────────────────────── */
function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

/* ── Loading screen ──────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f8f8f8]">
      <div className="text-[14px] text-[#898989] font-medium animate-pulse">
        Loading workspace…
      </div>
    </div>
  );
}

/* ── Share button ────────────────────────────────────────────────── */
function ShareButton({ roomId }: { roomId: string | null }) {
  const [copied, setCopied] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(roomId);

  const createShareLink = useCallback(() => {
    const id = activeRoomId || generateRoomId();
    setActiveRoomId(id);
    const url = `${window.location.origin}/workspace?room=${id}`;

    // If we're not already in a room, navigate to the room URL
    if (!roomId) {
      window.location.href = url;
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeRoomId, roomId]);

  return (
    <div className="relative">
      <button
        onClick={() => (roomId ? setShowPopover(!showPopover) : createShareLink())}
        className="flex items-center gap-1.5 h-[36px] px-3 rounded-[10px] bg-[#242424] text-white shadow-[var(--shadow-level-2)] hover:bg-[#111111] transition-colors text-[13px] font-medium"
      >
        <Share2 size={14} strokeWidth={2.2} />
        {roomId ? "Sharing" : "Share"}
      </button>

      {showPopover && roomId && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 w-[300px] bg-white rounded-[12px] shadow-[var(--shadow-level-2)] p-3 z-[600]">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-[#0099ff]" />
            <span className="text-[12px] font-semibold text-[#242424]">Live collaboration active</span>
          </div>
          <p className="text-[11px] text-[#898989] mb-3">
            Anyone with this link can view and edit this workspace in real-time.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[34px] px-2.5 rounded-[8px] bg-[#f5f5f5] flex items-center overflow-hidden">
              <span className="text-[11px] text-[#898989] truncate font-mono">
                {typeof window !== "undefined" && `${window.location.origin}/workspace?room=${roomId}`}
              </span>
            </div>
            <button
              onClick={createShareLink}
              className="h-[34px] px-3 rounded-[8px] bg-[#242424] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#111111] transition-colors shrink-0"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <LoadingScreen />;

  return (
    <div className="h-screen w-screen relative">
      {/* Canvas — multiplayer if room param present, otherwise local */}
      {roomId ? (
        <TldrawMultiplayer roomId={roomId} />
      ) : (
        <TldrawLocal persistenceKey="coachclaw-workspace" />
      )}

      {/* Top-right: Mic toggle next to tldraw people menu */}
      {roomId && (
        <div className="fixed top-2.5 right-[120px] z-[500]">
          <VoiceChat roomId={roomId} />
        </div>
      )}

      {/* Bottom-left: Dashboard link */}
      <Link
        href="/dashboard"
        className="fixed bottom-3 left-3 z-[500] flex items-center gap-1.5 h-[36px] px-3 rounded-[10px] bg-white/90 backdrop-blur-sm text-[#242424] shadow-[var(--shadow-level-2)] hover:bg-white transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        <span className="text-[13px] font-medium">Dashboard</span>
      </Link>

      {/* Bottom-right: Share */}
      <div className="fixed bottom-3 right-3 z-[500] flex items-center gap-2">
        {roomId && (
          <div className="flex items-center gap-1.5 h-[36px] px-3 rounded-[10px] bg-[#0099ff]/10 text-[#0099ff] text-[12px] font-medium">
            <div className="w-[6px] h-[6px] rounded-full bg-[#0099ff] animate-pulse" />
            Live
          </div>
        )}
        <ShareButton roomId={roomId} />
      </div>
    </div>
  );
}
