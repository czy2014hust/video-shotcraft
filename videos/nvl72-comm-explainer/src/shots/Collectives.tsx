import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';

/**
 * Four collectives, 4 s each. In every beat the same 5 GPUs start from a
 * "before" strip, coloured blocks physically fly GPU→GPU (arc + accelerating
 * stagger), destination slots light up on arrival, and the right-hand card
 * keeps the per-GPU account: sent / received / what each card ends with.
 * AllReduce is two flights: shards converge on Σ, the summed block flies back.
 */
const PHASE = 120;
const N = 5;
const COLORS = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a'];
const GX = (i: number) => 205 + i * 228; // GPU box centre x (diagram area)
const GY = 560; // GPU box centre y
const SLOT = (gpu: number, k: number) => ({ x: GX(gpu) - 62 + k * 31, y: GY - 38 });
const SUM = { x: 661, y: 300 };

type Flight = { from: number; to: number; color: number; slot: number; start: number; viaSum?: 'up' | 'down' };

const stagger = (list: Flight[], base: number, step: number) => list.map((f, i) => ({ ...f, start: base + i * step }));

const buildFlights = (phase: number): Flight[] => {
  if (phase === 0)
    return stagger([1, 2, 3, 4].map((to) => ({ from: 0, to, color: 0, slot: 0, start: 0 })), 16, 7);
  if (phase === 1) {
    const out: Flight[] = [];
    for (let s = 0; s < N; s++) for (let d = 0; d < N; d++) if (d !== s) out.push({ from: s, to: d, color: s, slot: s, start: 0 });
    return stagger(out, 14, 2.2);
  }
  if (phase === 2) {
    const up: Flight[] = [];
    for (let s = 0; s < N; s++) up.push({ from: s, to: s, color: s, slot: s, start: 0, viaSum: 'up' });
    const down: Flight[] = [];
    for (let d = 0; d < N; d++) down.push({ from: d, to: d, color: -1, slot: 0, start: 0, viaSum: 'down' });
    return [...stagger(up, 14, 4), ...stagger(down, 66, 4)];
  }
  const out: Flight[] = [];
  for (let s = 0; s < N; s++) for (let d = 0; d < N; d++) if (d !== s) out.push({ from: s, to: d, color: s, slot: s, start: 0 });
  return stagger(out, 14, 2.2);
};

/** Is slot k of gpu g filled at this point? -1 = summed result block. */
const slotState = (phase: number, flights: Flight[], local: number, g: number, k: number): number | null => {
  if (phase === 0) {
    if (g === 0) return k === 0 ? 0 : null;
    const f = flights.find((x) => x.to === g);
    return k === 0 && f && rise(local, f.start, 26) > 0.92 ? 0 : null;
  }
  if (phase === 1 || phase === 3) {
    if (k === g) return g;
    const f = flights.find((x) => x.to === g && x.slot === k);
    return f && rise(local, f.start, 26) > 0.92 ? f.color : null;
  }
  // AllReduce: own shard first, then every slot is replaced by the summed block.
  const down = flights.find((x) => x.viaSum === 'down' && x.to === g);
  if (down && rise(local, down.start, 26) > 0.92) return -1;
  return k === g ? g : null;
};

const MODES = [
  {
    en: 'Broadcast', zh: '广播', color: COLORS[0],
    def: '一份数据，从一张卡复制到所有卡',
    rows: [['源卡发出', '同 1 份 × 4 人'], ['每张卡收进', '1 份'], ['结束时', '人手一份原件']],
    before: '只有 GPU0 有数据', after: '每卡都有这一份',
  },
  {
    en: 'AllGather', zh: '聚合', color: SIGNAL,
    def: '每卡出一块，所有卡把碎块拼成完整一份',
    rows: [['每卡发出', '自己那块 × 4 人'], ['每卡收进', '(N−1)/N × S'], ['结束时', '每卡拼齐完整 S']],
    before: '每卡只有自己那块', after: '每卡都有全部 5 块',
  },
  {
    en: 'AllReduce', zh: '全部归约', color: '#8fb4ff',
    def: '先把所有卡的数加起来，再把总和发回每卡',
    rows: [['每卡发出', '约 2(N−1)/N × S'], ['每卡收进', '约 2(N−1)/N × S'], ['结束时', '每卡得到全局总和 Σ']],
    before: '每卡有自己的梯度', after: '每卡拿到同一个总和',
  },
  {
    en: 'All-to-All', zh: '全交换', color: '#e58aa8',
    def: '每卡给每卡发一块，给每个人的内容都不一样',
    rows: [['每卡发出', '(N−1)/N × S，各不相同'], ['每卡收进', '(N−1)/N × S'], ['结束时', '每卡收齐别人给自己的块']],
    before: '每卡攒着给 5 个人的块', after: '块按收件人重新分好',
  },
];

export const CollectivesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = Math.min(3, Math.floor(frame / PHASE));
  const local = frame - phase * PHASE;
  const mode = MODES[phase];
  const flights = buildFlights(phase);
  const sumPulse = phase === 2 ? rise(local, 44, 18) : 0;

  return (
    <Stage chapter="08" name="集合通信" tag="示意 · 5 卡">
      {/* tabs */}
      <div style={{ position: 'absolute', left: 80, right: 80, top: 128, display: 'flex', gap: 16 }}>
        {MODES.map((m, i) => {
          const on = i === phase;
          return (
            <div key={m.en} style={{ flex: 1, padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${on ? COPPER_HI : '#2a3138'}`, background: on ? '#24180f' : 'transparent' }}>
              <span style={{ fontFamily: MONO, fontSize: 32, color: on ? COPPER_HI : i < phase ? INK2 : INK3 }}>{m.en}</span>
              <span style={{ fontSize: 32, marginLeft: 12, color: on ? INK : INK3 }}>{m.zh}</span>
            </div>
          );
        })}
      </div>

      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {/* faint direct links */}
        {Array.from({ length: N }, (_, i) =>
          Array.from({ length: N }, (_, j) =>
            j > i ? <line key={`${i}${j}`} x1={GX(i)} y1={GY} x2={GX(j)} y2={GY} stroke="#2a3138" strokeWidth={1.5} opacity={0.5} /> : null,
          ),
        )}
        {phase === 2 ? (
          <g opacity={fade(local, 8, 14)}>
            <circle cx={SUM.x} cy={SUM.y} r={44 + sumPulse * 6} fill="#141a24" stroke="#8fb4ff" strokeWidth={2.5} />
            <text x={SUM.x} y={SUM.y + 16} textAnchor="middle" fill="#8fb4ff" fontSize={52} fontWeight={700}>Σ</text>
            {Array.from({ length: N }, (_, i) => (
              <line key={i} x1={GX(i)} y1={GY - 80} x2={SUM.x} y2={SUM.y + 40} stroke="#8fb4ff" strokeWidth={1.5} opacity={0.35} />
            ))}
          </g>
        ) : null}

        {/* flying blocks */}
        {flights.map((f, i) => {
          const t = rise(local, f.start, 26);
          if (t <= 0 || t >= 1) return null;
          const a = f.viaSum === 'up' ? SLOT(f.from, f.slot) : f.viaSum === 'down' ? SUM : SLOT(f.from, f.slot);
          const b = f.viaSum === 'up' ? SUM : SLOT(f.to, f.slot);
          const x = a.x + (b.x - a.x) * t;
          const y = a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 56;
          return <rect key={i} x={x - 13} y={y - 13} width={26} height={26} rx={5} fill={f.color === -1 ? '#eceef0' : COLORS[f.color]} stroke="#0a0c0e" strokeWidth={2} />;
        })}

        {/* GPUs */}
        {Array.from({ length: N }, (_, g) => (
          <g key={g} opacity={fade(local, 2 + g * 2, 10)}>
            <rect x={GX(g) - 95} y={GY - 78} width={190} height={156} rx={16} fill="#1d140e" stroke={phase === 0 && g === 0 ? COPPER_HI : COPPER} strokeWidth={2} />
            {Array.from({ length: N }, (_, k) => {
              const s = slotState(phase, flights, local, g, k);
              const p = SLOT(g, k);
              return (
                <rect key={k} x={p.x - 13} y={p.y - 16} width={26} height={32} rx={4}
                  fill={s === null ? '#2b1c12' : s === -1 ? '#eceef0' : COLORS[s]} opacity={s === null ? 1 : 0.95} />
              );
            })}
            <text x={GX(g)} y={GY + 52} textAnchor="middle" fill={INK} fontFamily={MONO} fontWeight={700} fontSize={32}>GPU{g}</text>
          </g>
        ))}
      </svg>

      {/* before → after strip */}
      <div style={{ position: 'absolute', left: 110, top: 700, display: 'flex', alignItems: 'center', gap: 18, fontSize: 32 }}>
        <span style={{ color: INK2 }}>{mode.before}</span>
        <span style={{ color: COPPER_HI, fontFamily: MONO }}>→</span>
        <span style={{ color: INK, opacity: fade(local, 78, 16) }}>{mode.after}</span>
      </div>
      <div style={{ position: 'absolute', left: 110, top: 748, fontSize: 32, color: INK3 }}>
        {phase === 3 ? '飞行块的颜色 = 发送方；落进谁的槽，看收件人' : phase === 1 ? '飞行块的颜色 = 这块数据的出处' : phase === 2 ? '白块 = 求和后的结果，回到每张卡' : '同一块橙色数据，复制到每张卡'}
      </div>

      {/* account card */}
      <div style={{ position: 'absolute', left: 1300, top: 250, width: 540, padding: '30px 34px', borderRadius: 18, border: '1.5px solid #2a3138', background: 'rgba(18,22,27,0.92)', opacity: fade(local, 10, 16) }}>
        <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: mode.color }}>{mode.en}</div>
        <div style={{ marginTop: 6, fontSize: 36, fontWeight: 700 }}>{mode.zh}</div>
        <div style={{ marginTop: 8, fontSize: 32, lineHeight: 1.45, color: INK2 }}>{mode.def}</div>
        {mode.rows.map(([k, v], i) => (
          <div key={k} style={{ marginTop: 20, opacity: fade(local, 30 + i * 16, 14) }}>
            <div style={{ fontSize: 32, color: INK3 }}>{k}</div>
            <div style={{ marginTop: 2, fontFamily: MONO, fontSize: 36, fontWeight: 700, color: INK }}>{v}</div>
          </div>
        ))}
        <div style={{ marginTop: 22, fontSize: 32, color: SLOW, opacity: fade(local, 82, 14) }}>
          {phase === 2 ? '训练里每步梯度同步，就是它' : phase === 3 ? 'MoE 专家并行，就是它' : phase === 1 ? '参数分片取权重，就是它' : '发权重、发激活，常用它起步'}
        </div>
      </div>
    </Stage>
  );
};
