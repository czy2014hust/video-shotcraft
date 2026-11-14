import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';

const PALETTE = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a', '#9be38a', '#c39bf0', '#6fd3e8'];
const CX = 460;
const CY = 520;
const R = 188;

const BARS = [
  { name: 'NVLink + SHARP 交换机内归约', time: '≈11 ms', width: 11 / 400, tone: 'signal' as const },
  { name: 'NVLink 柜内 · 900 GB/s 单向', time: '≈22 ms', width: 22 / 400, tone: 'copper' as const },
  { name: '若全走 400G 网络 · 50 GB/s', time: '≈400 ms', width: 1, tone: 'slow' as const },
];

export const CostShot: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = fade(frame, 12, 24);
  const formula = fade(frame, 260, 22);
  const bars = fade(frame, 420, 20);

  return (
    <Stage chapter="10" name="通信要多久" tag="α–β MODEL · IDEALIZED">
      <div style={{ position: 'absolute', left: 150, top: 140, opacity: ring }}>
        <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700 }}>Ring AllReduce</div>
        <div style={{ marginTop: 6, fontSize: 32, color: INK2 }}>ReduceScatter + AllGather · 示意 8 卡</div>
      </div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: ring }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill={SIGNAL} />
          </marker>
        </defs>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={COPPER} strokeWidth={2} opacity={0.35} strokeDasharray="4 10" />
        {Array.from({ length: 8 }, (_, i) => {
          const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
          const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 8;
          const pad = 0.22;
          const travel = rise(frame, 40 + i * 10, 70);
          const mid = (a0 + a1) / 2;
          const am = a0 + pad + (mid - a0 - pad) * travel;
          const sx = CX + R * Math.cos(a0 + pad);
          const sy = CY + R * Math.sin(a0 + pad);
          const ex = CX + R * Math.cos(a1 - pad);
          const ey = CY + R * Math.sin(a1 - pad);
          const cx = CX + R * Math.cos(am);
          const cy = CY + R * Math.sin(am);
          return (
            <g key={i}>
              <path d={`M${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}`} fill="none" stroke={SIGNAL} strokeWidth={3} markerEnd="url(#arr)" opacity={0.85} />
              <rect x={cx - 13} y={cy - 13} width={26} height={26} rx={5} fill={PALETTE[i]} transform={`rotate(${(am * 180) / Math.PI + 90} ${cx} ${cy})`} />
            </g>
          );
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
          const x = CX + R * Math.cos(a);
          const y = CY + R * Math.sin(a);
          return (
            <g key={`g${i}`}>
              <rect x={x - 46} y={y - 46} width={92} height={92} rx={14} fill="#1d140e" stroke={COPPER_HI} strokeWidth={2.2} />
              {Array.from({ length: 8 }, (__, k) => {
                const filled = (k + 8 - i) % 8 < 3;
                return (
                  <rect
                    key={k}
                    x={x - 34 + (k % 4) * 17.5}
                    y={y - 30 + Math.floor(k / 4) * 22}
                    width={14}
                    height={16}
                    rx={2}
                    fill={filled ? PALETTE[k] : '#2b1c12'}
                  />
                );
              })}
              <text x={x} y={y + 34} textAnchor="middle" fill={INK2} fontFamily={MONO} fontSize={18}>
                GPU{i}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 150, top: 800, fontSize: 32, color: INK2, opacity: ring }}>
        每卡收发 ≈ <span style={{ fontFamily: MONO, color: INK }}>2(N−1)/N × S</span>
      </div>

      <div style={{ position: 'absolute', left: 980, top: 150, opacity: formula }}>
        <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 700, letterSpacing: '-0.02em' }}>
          T ≈ <span style={{ color: INK2 }}>α</span> + <span style={{ color: COPPER_HI }}>S / B</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 32, color: INK2 }}>
          <span style={{ fontFamily: MONO, color: INK }}>α</span> 固定延迟 · <span style={{ fontFamily: MONO, color: INK }}>S</span> 数据量 ·{' '}
          <span style={{ fontFamily: MONO, color: INK }}>B</span> 链路带宽
        </div>
      </div>

      <div style={{ position: 'absolute', left: 980, top: 420, width: 840, opacity: bars }}>
        <div style={{ fontSize: 32, color: INK2, marginBottom: 22 }}>
          <Num size={32}>10 GB</Num> 梯度 · <Num size={32}>72</Num> 卡 AllReduce · 理想值
        </div>
        {BARS.map((bar, index) => {
          const t = index === 2 ? rise(frame, BEAT.costLock - 24, 24) : rise(frame, 460 + index * 36, 24);
          const color = bar.tone === 'signal' ? SIGNAL : bar.tone === 'copper' ? COPPER_HI : INK2;
          return (
            <div key={bar.name} style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontSize: 32, color: bar.tone === 'slow' ? INK2 : INK }}>{bar.name}</div>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color, opacity: t }}>{bar.time}</div>
              </div>
              <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(1.2, bar.width * t * 100)}%`,
                    height: '100%',
                    borderRadius: 9,
                    background:
                      bar.tone === 'slow'
                        ? `repeating-linear-gradient(90deg, ${SLOW} 0 14px, #3a4148 14px 20px)`
                        : color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 980, top: 800, fontSize: 32, color: INK3, opacity: bars }}>只算带宽项</div>
    </Stage>
  );
};
