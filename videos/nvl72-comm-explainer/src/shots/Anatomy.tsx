import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, cubic, fade, rise } from '../theme';

const SWITCHES = 18;
const GX = 620;
const GY = 250;
const GS = 210;
const SX = 1180;
const S0 = 168;
const SSTEP = 36;
const SH = 22;

const linkStarts = () => {
  const starts: number[] = [];
  let t = 28;
  for (let i = 0; i < SWITCHES; i++) {
    starts.push(t);
    t += Math.max(4, 12 - Math.floor(i * 0.5));
  }
  return starts;
};
const STARTS = linkStarts();

export const AnatomyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const gpuIn = fade(frame, 8, 24);
  const numbers = fade(frame, BEAT.anatomyLinks + 16, 24);
  const domain = fade(frame, BEAT.anatomyAll, 24);

  return (
    <Stage chapter="06" name="拆开 NVL72" tag="示意图">
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="link" x1="0" x2="1">
            <stop offset="0" stopColor={COPPER_HI} />
            <stop offset="1" stopColor={SIGNAL} />
          </linearGradient>
        </defs>
        {Array.from({ length: SWITCHES }, (_, i) => {
          const sy = S0 + i * SSTEP + SH / 2;
          const oy = GY + 24 + (i * (GS - 48)) / (SWITCHES - 1);
          const t = rise(frame, STARTS[i], 16);
          const d = `M${GX + GS} ${oy} C ${GX + GS + 180} ${oy}, ${SX - 160} ${sy}, ${SX} ${sy}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="url(#link)"
              strokeWidth={2.4}
              strokeDasharray={640}
              strokeDashoffset={640 * (1 - t)}
            />
          );
        })}
        {Array.from({ length: SWITCHES }, (_, i) => {
          const y = S0 + i * SSTEP;
          const on = rise(frame, STARTS[i], 14);
          return (
            <g key={i} opacity={on}>
              <rect x={SX} y={y} width={150} height={SH} rx={4} fill="#0f1b18" stroke={SIGNAL} strokeWidth={1.4} />
              {Array.from({ length: 5 }, (__, p) => (
                <rect key={p} x={SX + 12 + p * 26} y={y + 7} width={14} height={8} rx={1} fill={SIGNAL} opacity={0.45} />
              ))}
            </g>
          );
        })}
        {[2, 7, 12, 16].map((i, k) => {
          const sy = S0 + i * SSTEP + SH / 2;
          const oy = GY + 24 + (i * (GS - 48)) / (SWITCHES - 1);
          const tt = ((frame * 0.012 + k * 0.22) % 1);
          return (
            <circle
              key={i}
              cx={cubic(GX + GS, GX + GS + 160, SX - 140, SX, tt)}
              cy={cubic(oy, oy, sy, sy, tt)}
              r={5}
              fill={SIGNAL}
              opacity={gpuIn}
            />
          );
        })}
        <rect x={GX - 8} y={GY - 8} width={GS + 16} height={GS + 16} rx={20} fill="none" stroke={COPPER_HI} opacity={0.35 * gpuIn} />
        <rect x={GX} y={GY} width={GS} height={GS} rx={16} fill="#1d140e" stroke={COPPER_HI} strokeWidth={2.5} opacity={gpuIn} />
        <rect x={GX + 36} y={GY + 48} width={58} height={114} rx={6} fill="#2b1c12" stroke={COPPER} opacity={gpuIn} />
        <rect x={GX + 114} y={GY + 48} width={58} height={114} rx={6} fill="#2b1c12" stroke={COPPER} opacity={gpuIn} />
        <text x={GX + GS / 2} y={GY + GS + 40} textAnchor="middle" fill={INK} fontFamily={MONO} fontSize={32} fontWeight={700} opacity={gpuIn}>
          Blackwell GPU
        </text>
      </svg>

      <div style={{ position: 'absolute', left: 80, top: 150, width: 500, opacity: gpuIn }}>
        <Spec k="18" v="个计算托盘" d="每托盘 2 颗 Grace + 4 块 GPU" />
        <Spec k="9" v="个交换托盘" d="每托盘 2 颗 NVSwitch" />
        <div style={{ marginTop: 18, fontSize: 32, color: INK2 }}>
          合计 <span style={{ color: INK, fontFamily: MONO, fontWeight: 700 }}>72</span> GPU ·{' '}
          <span style={{ color: SIGNAL, fontFamily: MONO, fontWeight: 700 }}>18</span> 颗交换芯片
        </div>
      </div>

      <div style={{ position: 'absolute', left: 1080, top: 118, fontSize: 32, color: INK2, opacity: gpuIn }}>
        一块 GPU 的 18 条 NVLink，每条去一颗不同的交换芯片 →
      </div>
      <div style={{ position: 'absolute', left: 1360, top: 168, opacity: domain }}>
        <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, color: SIGNAL, lineHeight: 1 }}>18</div>
        <div style={{ fontSize: 32, fontWeight: 500, marginTop: 6 }}>颗交换芯片</div>
        <div style={{ fontSize: 32, color: INK2, marginTop: 4 }}>每颗连全部 72 卡</div>
      </div>

      <div style={{ position: 'absolute', left: 80, top: 560, width: 520, opacity: numbers }}>
        <div style={{ fontSize: 32, color: INK2 }}>每块 GPU · 18 × 100 GB/s</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 92, color: COPPER_HI, lineHeight: 1.05 }}>
          1.8<span style={{ fontSize: 40, marginLeft: 10 }}>TB/s 双向</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 36, color: INK }}>
          72 卡 All-to-All 聚合 <Num size={40} color={SIGNAL}>130 TB/s</Num>
        </div>
        <div style={{ marginTop: 6, fontSize: 32, color: INK3 }}>
          AllReduce 聚合 <span style={{ color: SIGNAL, fontFamily: MONO, fontWeight: 700 }}>260 TB/s</span>
        </div>
      </div>
    </Stage>
  );
};

const Spec: React.FC<{ k: string; v: string; d: string }> = ({ k, v, d }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: 40, fontWeight: 500 }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, color: COPPER_HI, marginRight: 10 }}>{k}</span>
      {v}
    </div>
    <div style={{ fontSize: 32, color: INK2, marginTop: 2 }}>{d}</div>
  </div>
);
