import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, MONO, SIGNAL, cubic, fade, mulberry32, slide } from '../theme';

type Cable = { d: string; pts: { x: number; y: number }[] };

const buildCables = (): Cable[] => {
  const rand = mulberry32(11);
  const cx = 1500;
  const cables: Cable[] = [];
  for (let i = 0; i < 64; i++) {
    const u = i / 63 - 0.5;
    const topX = cx + u * 760 + (rand() - 0.5) * 22;
    const botX = cx + u * 700 + (rand() - 0.5) * 22;
    const midX = cx + u * 130;
    const pts: { x: number; y: number }[] = [];
    for (let s = 0; s <= 20; s++) {
      const t = s / 20;
      pts.push({ x: cubic(topX, topX, midX, midX, t), y: cubic(-30, 280, 360, 540, t) });
    }
    for (let s = 1; s <= 20; s++) {
      const t = s / 20;
      pts.push({ x: cubic(midX, midX, botX, botX, t), y: cubic(540, 720, 800, 1120, t) });
    }
    cables.push({
      d: `M${topX} -30 C ${topX} 280, ${midX} 360, ${midX} 540 S ${botX} 800, ${botX} 1120`,
      pts,
    });
  }
  return cables;
};

const CABLES = buildCables();
const PACKET_INDEX = [4, 17, 28, 41, 52, 60];

export const OPEN_DEFAULTS = {
  kicker: '大模型训练与推理',
  heroNum: '72',
  heroRest: '块 GPU',
  line: '像一块 GPU 一样工作',
  sub: '以 GB200 NVL72 为例',
};

export const OpenShot: React.FC<Partial<typeof OPEN_DEFAULTS>> = (props) => {
  const copy = { ...OPEN_DEFAULTS, ...props };
  const frame = useCurrentFrame();
  const title = fade(frame, 36, BEAT.openTitle - 36);
  const titleY = slide(frame, 36, BEAT.openTitle - 36, 28);
  const lineIn = fade(frame, 124, 24);
  const subIn = fade(frame, 156, 22);
  const statsIn = fade(frame, 178, 22);

  return (
    <Stage chapter="01" name="通信全景" tag="GB200 NVL72">
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="cu" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6f3f22" stopOpacity="0" />
            <stop offset="0.3" stopColor={COPPER} stopOpacity="0.85" />
            <stop offset="0.5" stopColor={COPPER_HI} stopOpacity="1" />
            <stop offset="0.7" stopColor={COPPER} stopOpacity="0.85" />
            <stop offset="1" stopColor="#6f3f22" stopOpacity="0" />
          </linearGradient>
        </defs>
        {CABLES.map((cable, index) => (
          <path
            key={index}
            d={cable.d}
            fill="none"
            stroke="url(#cu)"
            strokeWidth={1.1 + (index % 5) * 0.35}
            opacity={0.28 + (index % 7) * 0.08}
          />
        ))}
        {[430, 540, 650].map((y, index) => (
          <rect
            key={y}
            x={1500 - (index === 1 ? 86 : 100)}
            y={y - 6}
            width={index === 1 ? 172 : 200}
            height={12}
            rx={6}
            fill="#1a1410"
            stroke={COPPER_HI}
            strokeWidth={1.4}
          />
        ))}
        {PACKET_INDEX.map((cableIndex, index) => {
          const pts = CABLES[cableIndex].pts;
          const travel = (frame * 0.55 + index * 7) % (pts.length - 1);
          const i0 = Math.floor(travel);
          const t = travel - i0;
          const p0 = pts[i0];
          const p1 = pts[Math.min(pts.length - 1, i0 + 1)];
          return (
            <circle
              key={cableIndex}
              cx={p0.x + (p1.x - p0.x) * t}
              cy={p0.y + (p1.y - p0.y) * t}
              r={5.5}
              fill={SIGNAL}
            />
          );
        })}
      </svg>

      <div style={{ position: 'absolute', left: 96, top: 230, opacity: title, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 36, fontWeight: 500, color: COPPER, letterSpacing: '0.12em' }}>{copy.kicker}</div>
        <div style={{ marginTop: 18, fontSize: 132, fontWeight: 900, lineHeight: 1, color: INK }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, color: COPPER_HI }}>{copy.heroNum}</span>
          <span> {copy.heroRest}</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 500,
          fontSize: 72,
          fontWeight: 800,
          opacity: lineIn,
          transform: `translateY(${(1 - lineIn) * 16}px)`,
        }}
      >
        {copy.line}
      </div>
      <div style={{ position: 'absolute', left: 96, top: 610, fontSize: 36, color: INK2, opacity: subIn }}>{copy.sub}</div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 720,
          display: 'flex',
          gap: 72,
          opacity: statsIn,
        }}
      >
        <Stat value={<><Num size={52}>5,000</Num><span style={{ fontSize: 32, color: INK2 }}>+</span></>} label="根铜缆" />
        <Stat value={<><Num size={52}>≈3.2</Num><span style={{ fontSize: 32, color: INK2 }}> km</span></>} label="铜缆总长" />
        <Stat
          value={<><Num size={52} color={SIGNAL}>130</Num><span style={{ fontSize: 32, color: INK2 }}> TB/s</span></>}
          label="All-to-All 聚合"
        />
      </div>
    </Stage>
  );
};

const Stat: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div>
    <div style={{ color: INK }}>{value}</div>
    <div style={{ marginTop: 4, fontSize: 32, color: INK2 }}>{label}</div>
  </div>
);
