'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Mic } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   CoachClaw — 30s Animated Ad
   Tone: Professional | Palette: Dark monochrome + #0099ff
   ═══════════════════════════════════════════════════ */

const DURATIONS = [3000, 4000, 5500, 4000, 4000, 4000, 5500]; // 30s total
const TOTAL = DURATIONS.reduce((a, b) => a + b, 0);

/* ─── Spring presets (Professional tone) ─── */
const smooth = { type: 'spring' as const, stiffness: 120, damping: 20 };
const snappy = { type: 'spring' as const, stiffness: 200, damping: 25 };
const gentle = { type: 'spring' as const, stiffness: 80, damping: 18 };

/* ─── Scene shell with fade in/out ─── */
function Scene({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8"
    >
      {children}
    </motion.div>
  );
}

/* ─── Word-by-word staggered text reveal ─── */
function WordReveal({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  return (
    <span className={`inline-flex flex-wrap justify-center gap-x-[0.3em] ${className}`}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smooth, delay: delay + i * 0.12 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 1 — Logo Reveal
   CoachClaw + expanding accent line + tagline
   ═══════════════════════════════════════════════════ */
function SceneLogo() {
  return (
    <Scene>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...smooth, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="font-[var(--font-cal)] text-[56px] md:text-[72px] font-semibold text-white tracking-tight leading-none">
          CoachClaw
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ ...snappy, delay: 0.8 }}
          className="h-[2px] bg-[#0099ff] mt-6 origin-center"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-[14px] md:text-[16px] text-[#898989] font-light mt-4 tracking-[0.2em] uppercase"
        >
          AI-Powered Learning
        </motion.p>
      </motion.div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 2 — Hook
   Word-by-word reveal of the problem statement
   ═══════════════════════════════════════════════════ */
function SceneHook() {
  return (
    <Scene>
      <WordReveal
        text="Studying shouldn&rsquo;t feel like guessing."
        className="font-[var(--font-cal)] text-[40px] md:text-[64px] font-semibold text-white leading-[1.1] max-w-[900px]"
        delay={0.2}
      />
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 3 — Memory Anchor
   Books converge to center → neural network emerges
   2x animation investment (hero moment)
   ═══════════════════════════════════════════════════ */
function SceneAnchor() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const books = [
    { x: -140, y: -100, r: -15 },
    { x: 0, y: -140, r: 5 },
    { x: 140, y: -100, r: 12 },
    { x: -140, y: 100, r: -8 },
    { x: 0, y: 140, r: -5 },
    { x: 140, y: 100, r: 10 },
  ];

  const nodes = [
    { x: 0, y: 0 },
    { x: -70, y: -50 },
    { x: 70, y: -50 },
    { x: -100, y: 15 },
    { x: 100, y: 15 },
    { x: -50, y: 70 },
    { x: 50, y: 70 },
    { x: 0, y: -90 },
    { x: -40, y: -80 },
    { x: 40, y: -80 },
    { x: -90, y: -30 },
    { x: 90, y: -30 },
  ];

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 2], [1, 7], [1, 8], [2, 7], [2, 9],
    [3, 10], [4, 11], [5, 3], [6, 4],
    [7, 8], [7, 9], [10, 1], [11, 2],
  ];

  return (
    <Scene>
      <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
        {/* Floating book shapes */}
        {books.map((b, i) => (
          <motion.div
            key={`book-${i}`}
            className="absolute left-1/2 top-1/2"
            initial={{ x: b.x - 24, y: b.y - 30, rotate: b.r, opacity: 1 }}
            animate={
              phase >= 1
                ? { x: -24, y: -30, rotate: 0, opacity: 0, scale: 0.2 }
                : { x: b.x - 24, y: b.y - 30, rotate: b.r, opacity: 1, scale: 1 }
            }
            transition={{ ...smooth, delay: phase >= 1 ? i * 0.06 : 0 }}
          >
            <div className="w-[48px] h-[60px] rounded-[4px] bg-white/10 border border-white/20 shadow-lg flex flex-col items-center justify-center gap-1.5">
              <div className="w-7 h-[2px] bg-white/30 rounded-full" />
              <div className="w-7 h-[2px] bg-white/20 rounded-full" />
              <div className="w-5 h-[2px] bg-white/15 rounded-full" />
            </div>
          </motion.div>
        ))}

        {/* Neural network visualization */}
        {phase >= 2 && (
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="-200 -200 400 400"
            >
              {/* Edges */}
              {edges.map(([a, b], i) => (
                <motion.line
                  key={`edge-${i}`}
                  x1={nodes[a].x}
                  y1={nodes[a].y}
                  x2={nodes[b].x}
                  y2={nodes[b].y}
                  stroke="#0099ff"
                  strokeWidth={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                />
              ))}
              {/* Nodes */}
              {nodes.map((n, i) => (
                <motion.circle
                  key={`node-${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={i === 0 ? 10 : 4}
                  fill={i === 0 ? '#0099ff' : 'rgba(255,255,255,0.5)'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.04 }}
                />
              ))}
              {/* Outer glow ring */}
              <motion.circle
                cx={0}
                cy={0}
                r={100}
                fill="none"
                stroke="#0099ff"
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </svg>

            {/* Diffused center glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full blur-[80px] pointer-events-none"
              style={{ background: 'rgba(0, 153, 255, 0.08)' }}
            />
          </>
        )}
      </div>

      {/* Anchor caption */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 16 }}
        transition={{ ...gentle, delay: 0.5 }}
        className="font-[var(--font-cal)] text-[20px] md:text-[24px] font-semibold text-white mt-8"
      >
        Your knowledge, amplified.
      </motion.p>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════
   SCENES 4-6 — Feature Cards
   Alternating slide direction, icon + title + subtitle
   ═══════════════════════════════════════════════════ */
function SceneFeature({
  title,
  subtitle,
  icon,
  index,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  index: number;
}) {
  const fromX = index % 2 === 0 ? -40 : 40;
  return (
    <Scene>
      <div className="flex flex-col items-center text-center max-w-[600px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...snappy, delay: 0.2 }}
          className="w-16 h-16 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center mb-8"
        >
          {icon}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, x: fromX }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smooth, delay: 0.4 }}
          className="font-[var(--font-cal)] text-[36px] md:text-[48px] font-semibold text-white leading-[1.1] mb-4"
        >
          {title}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ ...snappy, delay: 0.7 }}
          className="h-[1px] w-20 bg-[#0099ff] mb-4 origin-center"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...gentle, delay: 0.8 }}
          className="text-[18px] md:text-[20px] font-light text-[#898989] leading-[1.5]"
        >
          {subtitle}
        </motion.p>
      </div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════
   SCENE 7 — CTA
   "Study smarter." + Start Free button + URL
   ═══════════════════════════════════════════════════ */
function SceneCTA() {
  return (
    <Scene>
      <div className="text-center">
        <WordReveal
          text="Study smarter."
          className="font-[var(--font-cal)] text-[56px] md:text-[80px] font-semibold text-white leading-[1.1] mb-8"
          delay={0.3}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smooth, delay: 1.0 }}
        >
          <div className="inline-block bg-[#0099ff] text-white px-8 py-4 rounded-[8px] text-[18px] font-semibold shadow-lg shadow-[#0099ff]/20">
            Start Free &rarr;
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-[14px] text-[#898989] mt-8 font-[var(--font-cal)] tracking-[0.15em]"
        >
          coachclaw.com
        </motion.p>
      </div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN — Orchestrator
   Auto-advancing scene state machine + progress bar
   ═══════════════════════════════════════════════════ */
export default function AdPage() {
  const [scene, setScene] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const finished = scene >= DURATIONS.length;

  // Auto-advance scenes
  useEffect(() => {
    if (finished) return;
    const timer = setTimeout(() => setScene((s) => s + 1), DURATIONS[scene]);
    return () => clearTimeout(timer);
  }, [scene, finished]);

  // Progress tracker
  useEffect(() => {
    if (finished) return;
    const iv = setInterval(() => setElapsed((e) => e + 50), 50);
    return () => clearInterval(iv);
  }, [finished]);

  const replay = () => {
    setScene(0);
    setElapsed(0);
  };

  return (
    <div className="fixed inset-0 bg-[#111111] overflow-hidden select-none">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Scene renderer */}
      <AnimatePresence mode="wait">
        {scene === 0 && <SceneLogo key="s0" />}
        {scene === 1 && <SceneHook key="s1" />}
        {scene === 2 && <SceneAnchor key="s2" />}
        {scene === 3 && (
          <SceneFeature
            key="s3"
            title="AI Study Guides"
            subtitle="Generated from YOUR uploaded resources &mdash; PDFs, notes, links."
            icon={<BookOpen size={28} className="text-white/80" />}
            index={0}
          />
        )}
        {scene === 4 && (
          <SceneFeature
            key="s4"
            title="Adaptive Quizzes"
            subtitle="Questions that evolve with your understanding."
            icon={<Sparkles size={28} className="text-white/80" />}
            index={1}
          />
        )}
        {scene === 5 && (
          <SceneFeature
            key="s5"
            title="Voice AI Coach"
            subtitle="Talk through problems. Don&rsquo;t just read &mdash; converse."
            icon={<Mic size={28} className="text-white/80" />}
            index={2}
          />
        )}
        {scene === 6 && <SceneCTA key="s6" />}
        {finished && (
          <Scene key="end">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={replay}
              className="bg-white/10 text-white px-6 py-3 rounded-[8px] text-[14px] font-medium hover:bg-white/20 transition-colors border border-white/10 cursor-pointer"
            >
              Replay &#8635;
            </motion.button>
          </Scene>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {!finished && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
          <div
            className="h-full bg-[#0099ff]/60 transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.min((elapsed / TOTAL) * 100, 100)}%` }}
          />
        </div>
      )}

      {/* Scene indicator dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {DURATIONS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i === scene
                ? 'bg-[#0099ff]'
                : i < scene
                  ? 'bg-white/30'
                  : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
